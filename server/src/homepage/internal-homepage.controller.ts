import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { HomepageService } from './homepage.service';

type AuthenticatedRequest = Request & { authenticatedUser: AuthenticatedUser };

@Controller('api/internal/homepage')
@UseGuards(InternalAuthGuard)
export class InternalHomepageController {
  constructor(private readonly homepage: HomepageService) {}

  @Get()
  getAll() {
    return this.homepage.getAll();
  }

  @Patch(':sectionKey')
  update(@Param('sectionKey') sectionKey: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.homepage.updateSection(sectionKey, body, request.authenticatedUser.id);
  }
}
