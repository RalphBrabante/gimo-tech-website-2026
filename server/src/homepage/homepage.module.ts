import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomepageSectionEntity } from './entities/homepage-section.entity';
import { HomepageService } from './homepage.service';
import { HomepageController } from './homepage.controller';
import { InternalHomepageController } from './internal-homepage.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([HomepageSectionEntity]), AuthModule],
  controllers: [HomepageController, InternalHomepageController],
  providers: [HomepageService]
})
export class HomepageModule {}
