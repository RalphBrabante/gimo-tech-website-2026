import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DashboardController } from './dashboard.controller';
import { InternalAuthGuard } from './internal-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController, DashboardController],
  providers: [AuthService, InternalAuthGuard],
  exports: [AuthService, InternalAuthGuard]
})
export class AuthModule {}
