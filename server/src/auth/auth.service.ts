import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { sign, verify, type JwtPayload } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

export interface AuthenticatedUser {
  id: number;
  username: string;
}

const DUMMY_PASSWORD_HASH = '$2b$12$OjOn.pajkJq.Aa0es7gE5er3Lh4HSqaPGAnFZIlcGFSSTyPBo2fey';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly config: ConfigService
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
      throw new UnauthorizedException('Invalid username or password.');
    }

    const authenticatedUser = { id: user.id, username: user.username };
    const token = sign(
      { username: user.username },
      this.config.getOrThrow<string>('AUTH_SECRET'),
      {
        subject: String(user.id),
        issuer: 'gimo-tech-api',
        audience: 'gimo-tech-internal',
        expiresIn: '8h'
      }
    );

    await this.users.update(user.id, { lastLoginAt: new Date() });
    return { user: authenticatedUser, token };
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
}
