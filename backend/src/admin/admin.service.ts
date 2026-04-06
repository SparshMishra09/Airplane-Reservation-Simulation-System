import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_PROVIDER } from '../cache/cache-provider.interface';
import type { CacheProvider } from '../cache/cache-provider.interface';
import { PaymentGatewayService } from './services/payment-gateway.service';
import {
  AdminCreateFlightDto,
  AdminUpdateFlightDto,
  AdminSearchBookingsDto,
  AdminChangeSeatDto,
  AdminRefundDto,
  CreateMealCategoryDto,
  CreateMealItemDto,
  UpdateMealItemDto,
  CreateBaggagePolicyDto,
  UpdateBaggagePolicyDto,
  AdminAuditLogQueryDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_PROVIDER) private readonly cache: CacheProvider,
    private readonly paymentGateway: PaymentGatewayService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // AUDIT LOG HELPER
  // ═══════════════════════════════════════════════════════

  private async writeAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    performedBy: string,
    adminName: string,
    details: Record<string, any>,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        performedBy,
        adminName,
        details: JSON.stringify(details),
      },
    });
  }

  // ═══════════════════════════════════════════════════════
  // FLIGHT SCHEDULER
  // ═══════════════════════════════════════════════════════

  async getFlights() {
    const flights = await this.prisma.flight.findMany({
      include: {
        aircraft: true,
        seats: true,
        bookings: { select: { id: true, status: true } },
      },
      orderBy: { departureTime: 'desc' },
    });

    return flights.map((f) => {
      const totalSeats = f.aircraft.capacity || 180;
      const bookedSeats = f.seats.filter((s) => !s.isAvailable).length;
      const occupancy = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
      const revenue = f.bookings.reduce((sum, _b) => sum, 0); // We'll compute from booking amounts below

      return {
        ...f,
        seats: undefined,
        bookings: undefined,
        _stats: {
          totalSeats,
          bookedSeats,
          occupancy,
          activeBookings: f.bookings.filter((b) => b.status === 'CONFIRMED').length,
          totalBookings: f.bookings.length,
        },
      };
    });
  }

  async getFlightsWithRevenue() {
    const flights = await this.prisma.flight.findMany({
      include: {
        aircraft: true,
        seats: true,
        bookings: {
          select: { id: true, status: true, totalAmount: true },
        },
      },
      orderBy: { departureTime: 'desc' },
    });

    return flights.map((f) => {
      const totalSeats = f.aircraft.capacity || 180;
      const bookedSeats = f.seats.filter((s) => !s.isAvailable).length;
      const occupancy = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
      const revenue = f.bookings
        .filter((b) => b.status !== 'CANCELLED' && b.status !== 'REFUNDED')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      return {
        id: f.id,
        flightNumber: f.flightNumber,
        origin: f.origin,
        destination: f.destination,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        basePrice: f.basePrice,
        status: f.status,
        airline: f.airline,
        recurrence: f.recurrence,
        isTemplate: f.isTemplate,
        aircraft: f.aircraft,
        _stats: {
          totalSeats,
          bookedSeats,
          occupancy,
          revenue,
          activeBookings: f.bookings.filter((b) => b.status === 'CONFIRMED').length,
          totalBookings: f.bookings.length,
        },
      };
    });
  }

  async createFlight(dto: AdminCreateFlightDto, adminId: string, adminName: string) {
    const flight = await this.prisma.flight.create({
      data: {
        flightNumber: dto.flightNumber,
        origin: dto.origin.toUpperCase(),
        destination: dto.destination.toUpperCase(),
        departureTime: new Date(dto.departureTime),
        arrivalTime: new Date(dto.arrivalTime),
        aircraftId: dto.aircraftId,
        basePrice: dto.basePrice,
        airline: dto.airline,
        recurrence: dto.recurrence || 'NONE',
        isTemplate: dto.isTemplate || false,
      },
      include: { aircraft: true },
    });

    await this.writeAuditLog(
      'FLIGHT_CREATED',
      'Flight',
      flight.id,
      adminId,
      adminName,
      { flightNumber: flight.flightNumber, origin: flight.origin, destination: flight.destination, basePrice: flight.basePrice },
    );

    await this.cache.del('flights:all');
    return flight;
  }

  async updateFlight(id: string, dto: AdminUpdateFlightDto, adminId: string, adminName: string) {
    const existing = await this.prisma.flight.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Flight ${id} not found`);

    const data: any = {};
    if (dto.basePrice !== undefined) data.basePrice = dto.basePrice;
    if (dto.departureTime) data.departureTime = new Date(dto.departureTime);
    if (dto.arrivalTime) data.arrivalTime = new Date(dto.arrivalTime);
    if (dto.status) data.status = dto.status;
    if (dto.recurrence) data.recurrence = dto.recurrence;
    if (dto.airline !== undefined) data.airline = dto.airline;
    if (dto.origin) data.origin = dto.origin.toUpperCase();
    if (dto.destination) data.destination = dto.destination.toUpperCase();

    const updated = await this.prisma.flight.update({
      where: { id },
      data,
      include: { aircraft: true },
    });

    // Build before/after details for audit
    const changes: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      changes[key] = { before: (existing as any)[key], after: data[key] };
    }

    await this.writeAuditLog(
      dto.basePrice !== undefined ? 'FLIGHT_PRICE_CHANGED' : 'FLIGHT_UPDATED',
      'Flight',
      id,
      adminId,
      adminName,
      changes,
    );

    await this.cache.del('flights:all');
    return updated;
  }

  async deleteFlight(id: string, adminId: string, adminName: string) {
    const flight = await this.prisma.flight.findUnique({ where: { id } });
    if (!flight) throw new NotFoundException(`Flight ${id} not found`);

    // Cancel the flight instead of hard-deleting
    const updated = await this.prisma.flight.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.writeAuditLog(
      'FLIGHT_CANCELLED',
      'Flight',
      id,
      adminId,
      adminName,
      { flightNumber: flight.flightNumber, previousStatus: flight.status },
    );

    await this.cache.del('flights:all');
    return updated;
  }

  async cloneFlight(id: string, adminId: string, adminName: string) {
    const original = await this.prisma.flight.findUnique({
      where: { id },
      include: { aircraft: true },
    });
    if (!original) throw new NotFoundException(`Flight ${id} not found`);

    // Offset dates by 1 day
    const newDep = new Date(original.departureTime);
    newDep.setDate(newDep.getDate() + 1);
    const newArr = new Date(original.arrivalTime);
    newArr.setDate(newArr.getDate() + 1);

    // Generate unique flight number suffix
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();

    const cloned = await this.prisma.flight.create({
      data: {
        flightNumber: `${original.flightNumber}-${suffix}`,
        origin: original.origin,
        destination: original.destination,
        departureTime: newDep,
        arrivalTime: newArr,
        aircraftId: original.aircraftId,
        basePrice: original.basePrice,
        airline: original.airline,
        recurrence: 'NONE',
        isTemplate: false,
      },
      include: { aircraft: true },
    });

    await this.writeAuditLog(
      'FLIGHT_CLONED',
      'Flight',
      cloned.id,
      adminId,
      adminName,
      { clonedFrom: original.flightNumber, newFlightNumber: cloned.flightNumber },
    );

    return cloned;
  }

  // ═══════════════════════════════════════════════════════
  // BOOKING SEARCH & MANAGEMENT
  // ═══════════════════════════════════════════════════════

  async searchBookings(dto: AdminSearchBookingsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dto.pnr) where.pnr = { contains: dto.pnr.toUpperCase(), mode: 'insensitive' };
    if (dto.passengerName) where.passengerName = { contains: dto.passengerName, mode: 'insensitive' };
    if (dto.status) where.status = dto.status;
    if (dto.flightNumber) {
      where.flight = { flightNumber: { contains: dto.flightNumber, mode: 'insensitive' } };
    }
    if (dto.dateFrom || dto.dateTo) {
      where.createdAt = {};
      if (dto.dateFrom) where.createdAt.gte = new Date(dto.dateFrom);
      if (dto.dateTo) {
        const to = new Date(dto.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          flight: true,
          seats: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        flight: { include: { aircraft: true } },
        seats: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  // ═══════════════════════════════════════════════════════
  // MANUAL OVERRIDES
  // ═══════════════════════════════════════════════════════

  async confirmBooking(id: string, adminId: string, adminName: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    if (booking.status !== 'PENDING') {
      throw new ConflictException(`Booking is already ${booking.status}`);
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { flight: true, seats: true },
    });

    await this.writeAuditLog(
      'BOOKING_MANUALLY_CONFIRMED',
      'Booking',
      id,
      adminId,
      adminName,
      { pnr: booking.pnr, previousStatus: 'PENDING' },
    );

    await this.cache.del(`bookings:user:${booking.userId}`);
    return updated;
  }

  async adminChangeSeat(
    bookingId: string,
    dto: AdminChangeSeatDto,
    adminId: string,
    adminName: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { seats: true, flight: true },
      });
      if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);
      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        throw new ConflictException(`Cannot change seats on a ${booking.status} booking`);
      }

      for (const { oldSeat, newSeat } of dto.seatChanges) {
        // Find old seat
        const oldSeatRecord = booking.seats.find((s) => s.seatNumber === oldSeat);
        if (!oldSeatRecord) {
          throw new NotFoundException(`Seat ${oldSeat} not found in booking`);
        }

        // Release old seat
        await tx.seat.update({
          where: { id: oldSeatRecord.id },
          data: { isAvailable: true, bookingId: null },
        });

        // Claim new seat
        const existingNew = await tx.seat.findUnique({
          where: { flightId_seatNumber: { flightId: booking.flight.id, seatNumber: newSeat } },
        });

        if (existingNew) {
          if (!existingNew.isAvailable) {
            // Roll back old seat
            await tx.seat.update({
              where: { id: oldSeatRecord.id },
              data: { isAvailable: false, bookingId: booking.id },
            });
            throw new ConflictException(`Seat ${newSeat} is already booked`);
          }
          await tx.seat.update({
            where: { id: existingNew.id },
            data: { isAvailable: false, bookingId: booking.id },
          });
        } else {
          // JIT-create new seat
          const row = parseInt(newSeat.replace(/[A-Z]/g, ''), 10);
          const seatClass = row <= 3 ? 'FIRST_CLASS' : row <= 8 ? 'BUSINESS' : 'ECONOMY';
          const price =
            seatClass === 'FIRST_CLASS'
              ? Math.round(booking.flight.basePrice * 2.5)
              : seatClass === 'BUSINESS'
                ? Math.round(booking.flight.basePrice * 1.5)
                : booking.flight.basePrice;

          await tx.seat.create({
            data: {
              flightId: booking.flight.id,
              seatNumber: newSeat,
              seatClass,
              price,
              isAvailable: false,
              bookingId: booking.id,
            },
          });
        }
      }

      // Recalculate total
      const updatedSeats = await tx.seat.findMany({ where: { bookingId: booking.id } });
      const seatsTotal = updatedSeats.reduce((sum, s) => sum + Number(s.price), 0);
      const baggageCost = (booking.checkedBags || 0) * 50;
      const mealCost = 0; // Will use meal catalog pricing in future
      const insuranceCost = booking.hasCancellationProtection ? 35 : 0;
      const newTotal = seatsTotal + baggageCost + mealCost + insuranceCost;

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { totalAmount: newTotal },
        include: { seats: true, flight: true },
      });

      await this.writeAuditLog(
        'SEAT_CHANGED_BY_ADMIN',
        'Booking',
        bookingId,
        adminId,
        adminName,
        { pnr: booking.pnr, seatChanges: dto.seatChanges },
      );

      await this.cache.del(`bookings:user:${booking.userId}`);
      return updatedBooking;
    });
  }

  async issueRefund(
    bookingId: string,
    dto: AdminRefundDto,
    adminId: string,
    adminName: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { seats: true },
    });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);
    if (booking.status === 'REFUNDED') {
      throw new ConflictException('Booking is already refunded');
    }
    if (booking.status === 'CANCELLED') {
      throw new ConflictException('Booking is already cancelled. Use confirm first to re-activate.');
    }

    // Step 1: Call mock payment gateway (Saga Pattern)
    const gatewayResult = await this.paymentGateway.issueRefund(
      booking.pnr,
      booking.totalAmount,
    );

    if (!gatewayResult.success) {
      await this.writeAuditLog(
        'REFUND_FAILED',
        'Booking',
        bookingId,
        adminId,
        adminName,
        {
          pnr: booking.pnr,
          amount: booking.totalAmount,
          reason: dto.reason,
          gatewayMessage: gatewayResult.message,
          transactionId: gatewayResult.transactionId,
        },
      );
      throw new BadRequestException(gatewayResult.message);
    }

    // Step 2: Gateway succeeded — update DB
    return this.prisma.$transaction(async (tx) => {
      // Release seats
      await tx.seat.updateMany({
        where: { id: { in: booking.seats.map((s) => s.id) } },
        data: { isAvailable: true, bookingId: null },
      });

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'REFUNDED' },
        include: { flight: true, seats: true },
      });

      await this.writeAuditLog(
        'REFUND_ISSUED',
        'Booking',
        bookingId,
        adminId,
        adminName,
        {
          pnr: booking.pnr,
          amount: booking.totalAmount,
          reason: dto.reason || 'Admin-initiated refund',
          transactionId: gatewayResult.transactionId,
        },
      );

      await this.cache.del(`bookings:user:${booking.userId}`);
      return { booking: updated, refund: gatewayResult };
    });
  }

  // ═══════════════════════════════════════════════════════
  // REVENUE ANALYTICS
  // ═══════════════════════════════════════════════════════

  async getAnalyticsSummary() {
    const [totalBookings, flights, bookings] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.flight.count(),
      this.prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED', 'PENDING'] } },
        select: { totalAmount: true },
      }),
    ]);

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const avgTicketValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

    // Occupancy: count booked seats vs total capacity
    const [bookedSeatsCount, totalCapacity] = await Promise.all([
      this.prisma.seat.count({ where: { isAvailable: false } }),
      this.prisma.aircraft
        .findMany({ select: { capacity: true } })
        .then((a) => a.reduce((s, ac) => s + ac.capacity, 0)),
    ]);

    const avgOccupancy = totalCapacity > 0 ? Math.round((bookedSeatsCount / totalCapacity) * 100) : 0;

    return {
      totalRevenue,
      avgTicketValue,
      totalBookings,
      totalFlights: flights,
      activeBookings: bookings.length,
      avgOccupancy,
    };
  }

  async getAnalyticsByRoute() {
    const flights = await this.prisma.flight.findMany({
      include: {
        aircraft: true,
        seats: true,
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
          select: { totalAmount: true },
        },
      },
    });

    // Group by route
    const routeMap = new Map<
      string,
      { route: string; flights: number; revenue: number; bookedSeats: number; totalSeats: number }
    >();

    for (const f of flights) {
      const route = `${f.origin} → ${f.destination}`;
      const existing = routeMap.get(route) || {
        route,
        flights: 0,
        revenue: 0,
        bookedSeats: 0,
        totalSeats: 0,
      };
      existing.flights += 1;
      existing.revenue += f.bookings.reduce((s, b) => s + b.totalAmount, 0);
      existing.bookedSeats += f.seats.filter((s) => !s.isAvailable).length;
      existing.totalSeats += f.aircraft.capacity;
      routeMap.set(route, existing);
    }

    return Array.from(routeMap.values()).map((r) => ({
      ...r,
      occupancy: r.totalSeats > 0 ? Math.round((r.bookedSeats / r.totalSeats) * 100) : 0,
    }));
  }

  async getAnalyticsTimeline(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: { createdAt: true, totalAmount: true },
    });

    // Group by day
    const dailyRevenue = new Map<string, number>();
    for (let d = 0; d < days; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      dailyRevenue.set(date.toISOString().split('T')[0], 0);
    }

    for (const b of bookings) {
      const day = b.createdAt.toISOString().split('T')[0];
      dailyRevenue.set(day, (dailyRevenue.get(day) || 0) + b.totalAmount);
    }

    return Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  // ═══════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════

  async getAuditLogs(dto: AdminAuditLogQueryDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 30;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (dto.action) where.action = dto.action;
    if (dto.entityType) where.entityType = dto.entityType;
    if (dto.dateFrom || dto.dateTo) {
      where.createdAt = {};
      if (dto.dateFrom) where.createdAt.gte = new Date(dto.dateFrom);
      if (dto.dateTo) {
        const to = new Date(dto.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════════
  // MEAL CATALOG
  // ═══════════════════════════════════════════════════════

  async getMealCategories() {
    return this.prisma.mealCategory.findMany({
      include: { items: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async createMealCategory(dto: CreateMealCategoryDto, adminId: string, adminName: string) {
    const category = await this.prisma.mealCategory.create({ data: { name: dto.name } });
    await this.writeAuditLog('MEAL_CATEGORY_CREATED', 'MealCategory', category.id, adminId, adminName, { name: dto.name });
    return category;
  }

  async createMealItem(dto: CreateMealItemDto, adminId: string, adminName: string) {
    const item = await this.prisma.mealItem.create({
      data: { name: dto.name, price: dto.price, categoryId: dto.categoryId },
      include: { category: true },
    });
    await this.writeAuditLog('MEAL_ITEM_CREATED', 'MealItem', item.id, adminId, adminName, { name: dto.name, price: dto.price });
    return item;
  }

  async updateMealItem(id: string, dto: UpdateMealItemDto, adminId: string, adminName: string) {
    const existing = await this.prisma.mealItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Meal item ${id} not found`);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.mealItem.update({ where: { id }, data, include: { category: true } });

    const changes: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      changes[key] = { before: (existing as any)[key], after: data[key] };
    }
    await this.writeAuditLog('MEAL_ITEM_UPDATED', 'MealItem', id, adminId, adminName, changes);
    return updated;
  }

  async deleteMealItem(id: string, adminId: string, adminName: string) {
    const existing = await this.prisma.mealItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Meal item ${id} not found`);

    const updated = await this.prisma.mealItem.update({
      where: { id },
      data: { isActive: false },
    });
    await this.writeAuditLog('MEAL_ITEM_DEACTIVATED', 'MealItem', id, adminId, adminName, { name: existing.name });
    return updated;
  }

  // ═══════════════════════════════════════════════════════
  // BAGGAGE POLICY
  // ═══════════════════════════════════════════════════════

  async getBaggagePolicies() {
    return this.prisma.baggagePolicy.findMany({ orderBy: { name: 'asc' } });
  }

  async createBaggagePolicy(dto: CreateBaggagePolicyDto, adminId: string, adminName: string) {
    const policy = await this.prisma.baggagePolicy.create({ data: dto });
    await this.writeAuditLog('BAGGAGE_POLICY_CREATED', 'BaggagePolicy', policy.id, adminId, adminName, dto);
    return policy;
  }

  async updateBaggagePolicy(id: string, dto: UpdateBaggagePolicyDto, adminId: string, adminName: string) {
    const existing = await this.prisma.baggagePolicy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Baggage Policy ${id} not found`);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.freeWeightKg !== undefined) data.freeWeightKg = dto.freeWeightKg;
    if (dto.maxWeightKg !== undefined) data.maxWeightKg = dto.maxWeightKg;
    if (dto.extraCostPerKg !== undefined) data.extraCostPerKg = dto.extraCostPerKg;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const updated = await this.prisma.baggagePolicy.update({ where: { id }, data });

    const changes: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      changes[key] = { before: (existing as any)[key], after: data[key] };
    }
    await this.writeAuditLog('BAGGAGE_POLICY_UPDATED', 'BaggagePolicy', id, adminId, adminName, changes);
    return updated;
  }

  async deleteBaggagePolicy(id: string, adminId: string, adminName: string) {
    const existing = await this.prisma.baggagePolicy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Baggage Policy ${id} not found`);

    const updated = await this.prisma.baggagePolicy.update({
      where: { id },
      data: { isActive: false },
    });
    await this.writeAuditLog('BAGGAGE_POLICY_DEACTIVATED', 'BaggagePolicy', id, adminId, adminName, { name: existing.name });
    return updated;
  }

  // ═══════════════════════════════════════════════════════
  // AIRCRAFT (for dropdowns)
  // ═══════════════════════════════════════════════════════

  async getAircraft() {
    return this.prisma.aircraft.findMany({ orderBy: { model: 'asc' } });
  }
}
