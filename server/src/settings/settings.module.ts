import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AppSettingsEntity } from './entities/app-settings.entity';
import { InternalSettingsController, SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppSettingsEntity]), AuthModule],
  controllers: [SettingsController, InternalSettingsController],
  providers: [SettingsService]
})
export class SettingsModule {}
