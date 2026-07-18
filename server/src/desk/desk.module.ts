import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DeskService } from './desk.service';
import { DeskClientEntity } from './entities/desk-client.entity';
import { DeskMessageAssignmentEntity } from './entities/desk-message-assignment.entity';
import { InternalDeskController } from './internal-desk.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeskClientEntity, DeskMessageAssignmentEntity]), AuthModule],
  controllers: [InternalDeskController],
  providers: [DeskService]
})
export class DeskModule {}
