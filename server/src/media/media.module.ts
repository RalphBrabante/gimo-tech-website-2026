import { Module } from '@nestjs/common';
import { InternalMediaController } from './internal-media.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InternalMediaController]
})
export class MediaModule {}
