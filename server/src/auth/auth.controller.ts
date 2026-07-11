import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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
}
