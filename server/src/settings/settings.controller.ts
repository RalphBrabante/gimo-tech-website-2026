import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/auth.service';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';
import { SettingsService } from './settings.service';

type AuthenticatedRequest = Request & { authenticatedUser: AuthenticatedUser };

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}
  @Get()
  async get() {
    const settings = await this.settings.get();
    return {
      currencyCode: settings.currencyCode,
      freeShippingThresholdCents: settings.freeShippingThresholdCents
    };
  }
}

@Controller('api/internal/settings')
@UseGuards(InternalAuthGuard)
export class InternalSettingsController {
  constructor(private readonly settings: SettingsService) {}
  @Get() get() { return this.settings.get(); }
  @Patch() update(@Body() input: UpdateAppSettingsDto, @Req() request: AuthenticatedRequest) { return this.settings.update(input, request.authenticatedUser.id); }
}
