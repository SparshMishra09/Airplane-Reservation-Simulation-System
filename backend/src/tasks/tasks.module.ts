import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { FlightSchedulerService } from './flight-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CleanupService, FlightSchedulerService],
})
export class TasksModule {}
