import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type AuthenticatedUser } from './auth.service';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { authenticatedUser?: AuthenticatedUser }>();
    request.authenticatedUser = this.auth.userFromRequest(request);
    return true;
  }
}
