import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PaymentGatewayService } from './services/payment-gateway.service';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [AdminController],
  providers: [AdminService, PaymentGatewayService],
  exports: [AdminService],
})
export class AdminModule {}
