import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * FlightSchedulerService — Nightly Cron Job
 *
 * Runs at 2:00 AM daily. For each flight template with recurrence = DAILY/WEEKLY/MONTHLY,
 * auto-generates actual Flight records for a rolling 30-day window.
 * This demonstrates background workers and automated system maintenance.
 */
@Injectable()
export class FlightSchedulerService {
  private readonly logger = new Logger(FlightSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every day at 2:00 AM.
   * Generates flights for the next 30 days from each template.
   */
  @Cron('0 2 * * *', { name: 'flight-auto-generator' })
  async generateRecurringFlights() {
    this.logger.log('🕐 [CRON] Starting recurring flight generation...');

    const templates = await this.prisma.flight.findMany({
      where: {
        isTemplate: true,
        recurrence: { in: ['DAILY', 'WEEKLY', 'MONTHLY'] },
        status: { not: 'CANCELLED' },
      },
    });

    if (templates.length === 0) {
      this.logger.log('ℹ️  No flight templates found. Skipping.');
      return;
    }

    let created = 0;
    let skipped = 0;

    for (const template of templates) {
      const dayOffsets = this.getDayOffsets(template.recurrence!, 30);

      for (const offset of dayOffsets) {
        const newDepTime = new Date(template.departureTime);
        newDepTime.setDate(newDepTime.getDate() + offset);

        const newArrTime = new Date(template.arrivalTime);
        newArrTime.setDate(newArrTime.getDate() + offset);

        // Only generate for future dates
        if (newDepTime <= new Date()) continue;

        // Check if flight with the same number + date already exists
        const dateStr = newDepTime.toISOString().split('T')[0];
        const flightNumber = `${template.flightNumber}-${dateStr.replace(/-/g, '')}`;

        const existing = await this.prisma.flight.findUnique({
          where: { flightNumber },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await this.prisma.flight.create({
          data: {
            flightNumber,
            origin: template.origin,
            destination: template.destination,
            departureTime: newDepTime,
            arrivalTime: newArrTime,
            aircraftId: template.aircraftId,
            basePrice: template.basePrice,
            airline: template.airline,
            recurrence: 'NONE',
            isTemplate: false,
            status: 'SCHEDULED',
          },
        });

        created++;
      }
    }

    this.logger.log(
      `✅ [CRON] Flight generation complete: ${created} created, ${skipped} already existed`,
    );
  }

  /**
   * Calculate day offsets for the rolling window based on recurrence type.
   */
  private getDayOffsets(recurrence: string, windowDays: number): number[] {
    const offsets: number[] = [];

    switch (recurrence) {
      case 'DAILY':
        for (let d = 1; d <= windowDays; d++) offsets.push(d);
        break;
      case 'WEEKLY':
        for (let d = 7; d <= windowDays; d += 7) offsets.push(d);
        break;
      case 'MONTHLY':
        offsets.push(30);
        break;
      default:
        break;
    }

    return offsets;
  }
}
