import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Flight DTOs ──────────────────────────────────────────

export class AdminCreateFlightDto {
  @IsString()
  flightNumber: string;

  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsDateString()
  departureTime: string;

  @IsDateString()
  arrivalTime: string;

  @IsString()
  aircraftId: string;

  @IsNumber()
  @Type(() => Number)
  basePrice: number;

  @IsOptional()
  @IsString()
  airline?: string;

  @IsOptional()
  @IsString()
  recurrence?: string; // "NONE" | "DAILY" | "WEEKLY" | "MONTHLY"

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}

export class AdminUpdateFlightDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  basePrice?: number;

  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @IsOptional()
  @IsDateString()
  arrivalTime?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  recurrence?: string;

  @IsOptional()
  @IsString()
  airline?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;
}

// ── Booking Search DTO ───────────────────────────────────

export class AdminSearchBookingsDto {
  @IsOptional()
  @IsString()
  pnr?: string;

  @IsOptional()
  @IsString()
  passengerName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  flightNumber?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

// ── Manual Override DTOs ─────────────────────────────────

export class AdminChangeSeatDto {
  @IsArray()
  seatChanges: { oldSeat: string; newSeat: string }[];
}

export class AdminRefundDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

// ── Meal Catalog DTOs ────────────────────────────────────

export class CreateMealCategoryDto {
  @IsString()
  name: string;
}

export class CreateMealItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsString()
  categoryId: string;
}

export class UpdateMealItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ── Baggage Policy DTOs ──────────────────────────────────

export class CreateBaggagePolicyDto {
  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  freeWeightKg: number;

  @IsNumber()
  @Type(() => Number)
  maxWeightKg: number;

  @IsNumber()
  @Type(() => Number)
  extraCostPerKg: number;
}

export class UpdateBaggagePolicyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  freeWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  extraCostPerKg?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ── Audit Log Query ──────────────────────────────────────

export class AdminAuditLogQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
