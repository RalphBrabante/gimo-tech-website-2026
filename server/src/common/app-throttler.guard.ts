import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { clientIp, isInternalRenderRequest } from './client-ip';

/** Rate limits per real visitor, and never limits the site's own server-side page renders. */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(request: Record<string, any>): Promise<string> {
    return clientIp(request as Request);
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (await super.shouldSkip(context)) return true;
    return isInternalRenderRequest(context.switchToHttp().getRequest<Request>());
  }
}
