import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../products/entities/product.entity';
import { InternalQuotationsController } from './internal-quotations.controller';
import { QuotationRequestEntity } from './entities/quotation-request.entity';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuotationRequestEntity, ProductEntity]), AuthModule],
  controllers: [QuotationsController, InternalQuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService]
})
export class QuotationsModule {}
