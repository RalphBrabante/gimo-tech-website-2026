import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { sign, verify, type JwtPayload } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthMailService } from './auth-mail.service';

export interface AuthenticatedUser {
  id: number;
  username: string;
}

const DUMMY_PASSWORD_HASH = '$2b$12$OjOn.pajkJq.Aa0es7gE5er3Lh4HSqaPGAnFZIlcGFSSTyPBo2fey';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly config: ConfigService,
    private readonly mail: AuthMailService
  ) {}

  async login(credentials: LoginDto): Promise<{ user: AuthenticatedUser; token: string }> {
    const username = credentials.username.trim();
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();

    const passwordMatches = await compare(
      credentials.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH
    );

    if (!user || !passwordMatches) {
      if (user) {
        const failedLoginAttempts = Math.min(user.failedLoginAttempts + 1, 5);
        const passwordResetRequired = failedLoginAttempts >= 5;
        await this.users.update(user.id, { failedLoginAttempts, passwordResetRequired });
        if (passwordResetRequired && user.email && !user.passwordResetRequired) {
          await this.issuePasswordReset(user).catch(() => this.logger.warn(`Automatic password reset email failed for user ${user.id}.`));
        }
        if (passwordResetRequired) throw new ForbiddenException('Password reset required before this account can sign in.');
      }
      throw new UnauthorizedException('Invalid username or password.');
    }

    if (user.passwordResetRequired) {
      throw new ForbiddenException('Password reset required before this account can sign in.');
    }

    const authenticatedUser = { id: user.id, username: user.username };
    const token = this.signSession(authenticatedUser);

    await this.users.update(user.id, { lastLoginAt: new Date(), failedLoginAttempts: 0 });
    return { user: authenticatedUser, token };
  }

  async profile(userId: number): Promise<{ id: number; username: string; email: string | null; passwordChangedAt: Date | null }> {
    const user = await this.users.findOneBy({ id: userId, isActive: true });
    if (!user) throw new UnauthorizedException('Authentication required.');
    return { id: user.id, username: user.username, email: user.email, passwordChangedAt: user.passwordChangedAt };
  }

  async updateProfile(userId: number, input: UpdateProfileDto): Promise<{ user: AuthenticatedUser & { email: string | null }; token: string }> {
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.id = :userId', { userId }).andWhere('user.isActive = true').getOne();
    if (!user || !(await compare(input.currentPassword, user.passwordHash))) throw new UnauthorizedException('The current password is incorrect.');
    if (input.username === undefined && input.email === undefined && input.newPassword === undefined) throw new BadRequestException('Provide a username, email, or new password to update.');

    const username = input.username?.trim();
    const email = input.email?.trim().toLowerCase();
    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const existing = await this.users.createQueryBuilder('user').where('LOWER(user.username) = LOWER(:username)', { username }).andWhere('user.id != :userId', { userId }).getOne();
      if (existing) throw new ConflictException('That username is already in use.');
      user.username = username;
    }
    if (email && email !== user.email?.toLowerCase()) {
      const existing = await this.users.createQueryBuilder('user').where('LOWER(user.email) = LOWER(:email)', { email }).andWhere('user.id != :userId', { userId }).getOne();
      if (existing) throw new ConflictException('That email address is already in use.');
      user.email = email;
    }
    if (input.newPassword) {
      if (await compare(input.newPassword, user.passwordHash)) throw new BadRequestException('The new password must be different from the current password.');
      user.passwordHash = await hash(input.newPassword, 12);
      user.passwordChangedAt = new Date();
      user.failedLoginAttempts = 0;
      user.passwordResetRequired = false;
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
    }
    await this.users.save(user);
    const authenticatedUser = { id: user.id, username: user.username };
    return { user: { ...authenticatedUser, email: user.email }, token: this.signSession(authenticatedUser) };
  }

  async requestPasswordReset(identifier: string): Promise<void> {
    const normalized = identifier.trim().toLowerCase();
    const user = await this.users.createQueryBuilder('user')
      .where('(LOWER(user.username) = :identifier OR LOWER(user.email) = :identifier)', { identifier: normalized })
      .andWhere('user.isActive = true')
      .getOne();
    if (!user?.email) return;
    await this.issuePasswordReset(user).catch(() => this.logger.warn(`Requested password reset email failed for user ${user.id}.`));
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const tokenHash = this.hashResetToken(token);
    const user = await this.users.createQueryBuilder('user')
      .addSelect(['user.passwordResetTokenHash', 'user.passwordResetExpiresAt', 'user.passwordHash'])
      .where('user.passwordResetTokenHash = :tokenHash', { tokenHash })
      .andWhere('user.isActive = true')
      .getOne();
    if (!user?.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() <= Date.now()) throw new BadRequestException('This password reset link is invalid or has expired.');
    if (await compare(password, user.passwordHash)) throw new BadRequestException('Choose a password you have not just used.');
    await this.users.update(user.id, {
      passwordHash: await hash(password, 12),
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      passwordResetRequired: false,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    });
  }

  verifySession(token: string | undefined): AuthenticatedUser {
    if (!token) {
      throw new UnauthorizedException('Authentication required.');
    }

    try {
      const payload = verify(token, this.config.getOrThrow<string>('AUTH_SECRET'), {
        issuer: 'gimo-tech-api',
        audience: 'gimo-tech-internal'
      }) as JwtPayload;

      if (!payload.sub || typeof payload.username !== 'string') {
        throw new Error('Invalid session payload');
      }

      return { id: Number(payload.sub), username: payload.username };
    } catch {
      throw new UnauthorizedException('Authentication required.');
    }
  }

  userFromRequest(request: Request): AuthenticatedUser {
    const cookie = request.headers.cookie
      ?.split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith('gimo_internal_session='));

    return this.verifySession(
      cookie ? decodeURIComponent(cookie.slice('gimo_internal_session='.length)) : undefined
    );
  }

  private signSession(user: AuthenticatedUser): string {
    return sign({ username: user.username }, this.config.getOrThrow<string>('AUTH_SECRET'), {
      subject: String(user.id), issuer: 'gimo-tech-api', audience: 'gimo-tech-internal', expiresIn: '8h'
    });
  }

  private async issuePasswordReset(user: UserEntity): Promise<void> {
    if (!user.email) return;
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.users.update(user.id, { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt });
    const baseUrl = this.config.get<string>('PUBLIC_BASE_URL', 'https://gimosupplies.com').replace(/\/$/, '');
    const resetUrl = `${baseUrl}/internal/reset-password/?token=${encodeURIComponent(token)}`;
    try {
      await this.mail.sendPasswordReset(user.email, user.username, resetUrl);
    } catch (error) {
      await this.users.update(user.id, { passwordResetTokenHash: null, passwordResetExpiresAt: null });
      throw error;
    }
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
