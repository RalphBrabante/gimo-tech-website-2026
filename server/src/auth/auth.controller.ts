import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InternalAuthGuard } from './internal-auth.guard';
import type { AuthenticatedUser } from './auth.service';

type AuthenticatedRequest = Request & { authenticatedUser: AuthenticatedUser };

const SESSION_COOKIE = 'gimo_internal_session';
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() credentials: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const { user, token } = await this.auth.login(credentials);
    response.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: EIGHT_HOURS_MS
    });

    return { authenticated: true, user };
  }

  @Get('session')
  session(@Req() request: Request) {
    const user = this.auth.userFromRequest(request);
    return { authenticated: true, user };
  }

  @Get('profile')
  @UseGuards(InternalAuthGuard)
  profile(@Req() request: AuthenticatedRequest) {
    return this.auth.profile(request.authenticatedUser.id);
  }

  @Patch('profile')
  @UseGuards(InternalAuthGuard)
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() input: UpdateProfileDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.auth.updateProfile(request.authenticatedUser.id, input);
    this.setSessionCookie(response, result.token);
    return result.user;
  }

  @Post('password-reset/request')
  @HttpCode(202)
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  async requestPasswordReset(@Body() input: RequestPasswordResetDto) {
    await this.auth.requestPasswordReset(input.identifier);
    return { accepted: true, message: 'If a recovery email is configured for that account, a reset link has been sent.' };
  }

  @Post('password-reset')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  async resetPassword(@Body() input: ResetPasswordDto): Promise<void> {
    await this.auth.resetPassword(input.token, input.password);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  }

  private setSessionCookie(response: Response, token: string): void {
    response.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: EIGHT_HOURS_MS
    });
  }
}
