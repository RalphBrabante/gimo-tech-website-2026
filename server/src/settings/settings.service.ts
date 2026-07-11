import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';
import { AppSettingsEntity } from './entities/app-settings.entity';
import { AppSettings } from './models/app-settings.model';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(AppSettingsEntity) private readonly settings: Repository<AppSettingsEntity>) {}

  async get(): Promise<AppSettings> {
    return this.toModel(await this.getEntity());
  }

  async update(input: UpdateAppSettingsDto, userId: number): Promise<AppSettings> {
    const settings = await this.getEntity();
    if (input.currencyCode !== undefined) settings.currencyCode = input.currencyCode;
    if (input.storeName !== undefined) settings.storeName = input.storeName.trim();
    if (input.supportEmail !== undefined) settings.supportEmail = input.supportEmail?.trim().toLowerCase() ?? null;
    if (input.freeShippingThresholdCents !== undefined) settings.freeShippingThresholdCents = input.freeShippingThresholdCents;
    settings.updatedByUserId = userId;
    return this.toModel(await this.settings.save(settings));
  }

  private async getEntity(): Promise<AppSettingsEntity> {
    const settings = await this.settings.findOneBy({ id: 1 });
    if (settings) return settings;
    return this.settings.save(this.settings.create({ id: 1, currencyCode: 'USD', storeName: 'Gimo Tech Supplies' }));
  }

  private toModel(entity: AppSettingsEntity): AppSettings {
    return { currencyCode: entity.currencyCode, storeName: entity.storeName, supportEmail: entity.supportEmail, freeShippingThresholdCents: entity.freeShippingThresholdCents, updatedAt: entity.updatedAt };
  }
}
