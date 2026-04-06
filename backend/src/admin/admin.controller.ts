import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase.guard';
import { AdminGuard } from '../auth/guards';
import { AdminService } from './admin.service';
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

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private getAdmin(req: any) {
    return {
      id: req.dbUser?.id || req.user?.id,
      name: req.dbUser?.name || req.user?.email || 'Admin',
    };
  }

  // ── Aircraft (for dropdowns) ──────────────────────────

  @Get('aircraft')
  @ApiOperation({ summary: 'List all aircraft (for flight creation dropdowns)' })
  getAircraft() {
    return this.adminService.getAircraft();
  }

  // ── Flight Scheduler ──────────────────────────────────

  @Get('flights')
  @ApiOperation({ summary: 'List all flights with occupancy/revenue stats' })
  getFlights() {
    return this.adminService.getFlightsWithRevenue();
  }

  @Post('flights')
  @ApiOperation({ summary: 'Create a new flight' })
  createFlight(@Body() dto: AdminCreateFlightDto, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.createFlight(dto, admin.id, admin.name);
  }

  @Patch('flights/:id')
  @ApiOperation({ summary: 'Update a flight (price, times, status, etc.)' })
  updateFlight(
    @Param('id') id: string,
    @Body() dto: AdminUpdateFlightDto,
    @Request() req: any,
  ) {
    const admin = this.getAdmin(req);
    return this.adminService.updateFlight(id, dto, admin.id, admin.name);
  }

  @Delete('flights/:id')
  @ApiOperation({ summary: 'Cancel a flight' })
  deleteFlight(@Param('id') id: string, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.deleteFlight(id, admin.id, admin.name);
  }

  @Post('flights/:id/clone')
  @ApiOperation({ summary: 'Clone a flight (next day)' })
  cloneFlight(@Param('id') id: string, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.cloneFlight(id, admin.id, admin.name);
  }

  // ── Booking Search ────────────────────────────────────

  @Get('bookings')
  @ApiOperation({ summary: 'Search bookings with filters (PNR, name, date, status)' })
  searchBookings(@Query() dto: AdminSearchBookingsDto) {
    return this.adminService.searchBookings(dto);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get full booking details' })
  getBooking(@Param('id') id: string) {
    return this.adminService.getBookingById(id);
  }

  // ── Manual Overrides ──────────────────────────────────

  @Patch('bookings/:id/confirm')
  @ApiOperation({ summary: 'Manually confirm a pending booking' })
  confirmBooking(@Param('id') id: string, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.confirmBooking(id, admin.id, admin.name);
  }

  @Patch('bookings/:id/seat')
  @ApiOperation({ summary: 'Admin change seat for a customer' })
  changeSeat(
    @Param('id') id: string,
    @Body() dto: AdminChangeSeatDto,
    @Request() req: any,
  ) {
    const admin = this.getAdmin(req);
    return this.adminService.adminChangeSeat(id, dto, admin.id, admin.name);
  }

  @Post('bookings/:id/refund')
  @ApiOperation({ summary: 'Trigger manual refund (Saga Pattern with mock gateway)' })
  refund(
    @Param('id') id: string,
    @Body() dto: AdminRefundDto,
    @Request() req: any,
  ) {
    const admin = this.getAdmin(req);
    return this.adminService.issueRefund(id, dto, admin.id, admin.name);
  }

  // ── Revenue Analytics ─────────────────────────────────

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Total revenue, avg ticket value, occupancy' })
  getAnalyticsSummary() {
    return this.adminService.getAnalyticsSummary();
  }

  @Get('analytics/routes')
  @ApiOperation({ summary: 'Revenue & occupancy per route' })
  getAnalyticsByRoute() {
    return this.adminService.getAnalyticsByRoute();
  }

  @Get('analytics/timeline')
  @ApiOperation({ summary: 'Daily revenue chart data (last 30 days)' })
  getAnalyticsTimeline(@Query('days') days?: string) {
    return this.adminService.getAnalyticsTimeline(days ? parseInt(days) : 30);
  }

  // ── Audit Logs ────────────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: 'Paginated, filterable audit trail' })
  getAuditLogs(@Query() dto: AdminAuditLogQueryDto) {
    return this.adminService.getAuditLogs(dto);
  }

  // ── Meal Catalog ──────────────────────────────────────

  @Get('meals/categories')
  @ApiOperation({ summary: 'List all meal categories with items' })
  getMealCategories() {
    return this.adminService.getMealCategories();
  }

  @Post('meals/categories')
  @ApiOperation({ summary: 'Create a meal category' })
  createMealCategory(@Body() dto: CreateMealCategoryDto, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.createMealCategory(dto, admin.id, admin.name);
  }

  @Post('meals/items')
  @ApiOperation({ summary: 'Create a meal item' })
  createMealItem(@Body() dto: CreateMealItemDto, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.createMealItem(dto, admin.id, admin.name);
  }

  @Patch('meals/items/:id')
  @ApiOperation({ summary: 'Update a meal item (price, active status)' })
  updateMealItem(
    @Param('id') id: string,
    @Body() dto: UpdateMealItemDto,
    @Request() req: any,
  ) {
    const admin = this.getAdmin(req);
    return this.adminService.updateMealItem(id, dto, admin.id, admin.name);
  }

  @Delete('meals/items/:id')
  @ApiOperation({ summary: 'Deactivate a meal item' })
  deleteMealItem(@Param('id') id: string, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.deleteMealItem(id, admin.id, admin.name);
  }

  // ── Baggage Policies ──────────────────────────────────

  @Get('baggage-policies')
  @ApiOperation({ summary: 'List all baggage policies' })
  getBaggagePolicies() {
    return this.adminService.getBaggagePolicies();
  }

  @Post('baggage-policies')
  @ApiOperation({ summary: 'Create a baggage policy' })
  createBaggagePolicy(@Body() dto: CreateBaggagePolicyDto, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.createBaggagePolicy(dto, admin.id, admin.name);
  }

  @Patch('baggage-policies/:id')
  @ApiOperation({ summary: 'Update a baggage policy' })
  updateBaggagePolicy(
    @Param('id') id: string,
    @Body() dto: UpdateBaggagePolicyDto,
    @Request() req: any,
  ) {
    const admin = this.getAdmin(req);
    return this.adminService.updateBaggagePolicy(id, dto, admin.id, admin.name);
  }

  @Delete('baggage-policies/:id')
  @ApiOperation({ summary: 'Deactivate a baggage policy' })
  deleteBaggagePolicy(@Param('id') id: string, @Request() req: any) {
    const admin = this.getAdmin(req);
    return this.adminService.deleteBaggagePolicy(id, admin.id, admin.name);
  }
}
