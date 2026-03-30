import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CacheProvider } from '../cache/cache-provider.interface.js';
import { CACHE_PROVIDER } from '../cache/cache-provider.interface.js';

export interface AviationFlightResult {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    scheduled: string;
    estimated: string;
    actual: string | null;
    terminal: string | null;
    gate: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    scheduled: string;
    estimated: string;
    actual: string | null;
    terminal: string | null;
    gate: string | null;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight: {
    number: string;
    iata: string;
    icao: string;
  };
  aircraft: {
    registration: string;
    iata: string;
    icao: string;
  } | null;
}

// ---------- Synthetic flight generator ----------

const AIRPORT_META: Record<string, { name: string; tz: string }> = {
  DEL: { name: 'Indira Gandhi Intl', tz: 'Asia/Kolkata' },
  BOM: { name: 'Chhatrapati Shivaji Intl', tz: 'Asia/Kolkata' },
  BLR: { name: 'Kempegowda Intl', tz: 'Asia/Kolkata' },
  MAA: { name: 'Chennai Intl', tz: 'Asia/Kolkata' },
  CCU: { name: 'Netaji Subhas Chandra Bose Intl', tz: 'Asia/Kolkata' },
  HYD: { name: 'Rajiv Gandhi Intl', tz: 'Asia/Kolkata' },
  GOI: { name: 'Dabolim Airport', tz: 'Asia/Kolkata' },
  AMD: { name: 'Sardar Vallabhbhai Patel Intl', tz: 'Asia/Kolkata' },
  PNQ: { name: 'Pune Airport', tz: 'Asia/Kolkata' },
  COK: { name: 'Cochin Intl', tz: 'Asia/Kolkata' },
  JAI: { name: 'Jaipur Intl', tz: 'Asia/Kolkata' },
  LKO: { name: 'Chaudhary Charan Singh Intl', tz: 'Asia/Kolkata' },
  TRV: { name: 'Trivandrum Intl', tz: 'Asia/Kolkata' },
  VNS: { name: 'Lal Bahadur Shastri Intl', tz: 'Asia/Kolkata' },
  BBI: { name: 'Biju Patnaik Intl', tz: 'Asia/Kolkata' },
  IXC: { name: 'Chandigarh Intl', tz: 'Asia/Kolkata' },
  SXR: { name: 'Sheikh ul-Alam Intl', tz: 'Asia/Kolkata' },
  PAT: { name: 'Jay Prakash Narayan Intl', tz: 'Asia/Kolkata' },
  GAU: { name: 'Lokpriya Gopinath Bordoloi Intl', tz: 'Asia/Kolkata' },
};

const AIRLINES = [
  { name: 'IndiGo', iata: '6E' },
  { name: 'Air India', iata: 'AI' },
  { name: 'SpiceJet', iata: 'SG' },
  { name: 'Vistara', iata: 'UK' },
  { name: 'Go First', iata: 'G8' },
  { name: 'AirAsia India', iata: 'I5' },
  { name: 'Akasa Air', iata: 'QP' },
  { name: 'Star Air', iata: 'S5' },
];

const AIRCRAFT_TYPES = ['A320', 'B737', 'A321', 'ATR72', 'A319', 'B737MAX'];
const STATUSES = ['scheduled', 'active', 'active', 'scheduled', 'scheduled'];

const DEPARTURE_SLOTS: [number, number][] = [
  [5, 30], [6, 0], [6, 45], [7, 20], [8, 0], [8, 40],
  [9, 30], [10, 10], [11, 0], [12, 30], [13, 15], [14, 0],
  [15, 30], [16, 10], [17, 0], [18, 20], [19, 0], [20, 0],
  [21, 0], [22, 30],
];

function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

function generateSyntheticFlights(
  depIata: string,
  arrIata: string,
  dateStr?: string,
): AviationFlightResult[] {
  const baseDate = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  baseDate.setHours(0, 0, 0, 0);

  const codeSeed =
    depIata.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31 +
    arrIata.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const globalRand = seededRand(codeSeed + baseDate.getDate() * 97);

  const depMeta = AIRPORT_META[depIata] ?? { name: `${depIata} Airport`, tz: 'Asia/Kolkata' };
  const arrMeta = AIRPORT_META[arrIata] ?? { name: `${arrIata} Airport`, tz: 'Asia/Kolkata' };

  // Base route duration 1–3 h
  const baseMinutes = 60 + Math.round(globalRand() * 120);

  const numFlights = 7 + Math.floor(globalRand() * 4); // 7–10
  const usedSlots = new Set<number>();
  const results: AviationFlightResult[] = [];

  for (let i = 0; i < numFlights; i++) {
    const r = seededRand(codeSeed + i * 7919 + baseDate.getDate());

    let slotIdx = Math.floor(r() * DEPARTURE_SLOTS.length);
    while (usedSlots.has(slotIdx)) slotIdx = (slotIdx + 1) % DEPARTURE_SLOTS.length;
    usedSlots.add(slotIdx);

    const [depH, depM] = DEPARTURE_SLOTS[slotIdx];
    const depTime = new Date(baseDate);
    depTime.setHours(depH, depM, 0, 0);

    const duration = baseMinutes + Math.floor(r() * 20) - 10;
    const arrTime = new Date(depTime.getTime() + duration * 60000);

    const airline = AIRLINES[Math.floor(r() * AIRLINES.length)];
    const flightNum = 100 + Math.floor(r() * 900);
    const aircraft = AIRCRAFT_TYPES[Math.floor(r() * AIRCRAFT_TYPES.length)];
    const status = STATUSES[Math.floor(r() * STATUSES.length)];

    const depTerminals = ['1', '2', '3', 'T1', 'T2'];
    const depTerminal = depTerminals[Math.floor(r() * depTerminals.length)];
    const depGate = `${['A', 'B', 'C'][Math.floor(r() * 3)]}${Math.floor(r() * 30) + 1}`;

    const arrTerminals = ['1', '2', 'T1', 'T2'];
    const arrTerminal = arrTerminals[Math.floor(r() * arrTerminals.length)];

    results.push({
      flight_date: baseDate.toISOString().split('T')[0],
      flight_status: status,
      departure: {
        airport: depMeta.name,
        timezone: depMeta.tz,
        iata: depIata,
        scheduled: depTime.toISOString(),
        estimated: depTime.toISOString(),
        actual: null,
        terminal: depTerminal,
        gate: depGate,
      },
      arrival: {
        airport: arrMeta.name,
        timezone: arrMeta.tz,
        iata: arrIata,
        scheduled: arrTime.toISOString(),
        estimated: arrTime.toISOString(),
        actual: null,
        terminal: arrTerminal,
        gate: null,
      },
      airline: { name: airline.name, iata: airline.iata },
      flight: {
        number: String(flightNum),
        iata: `${airline.iata}${flightNum}`,
        icao: `${airline.iata}${flightNum}`,
      },
      aircraft: {
        registration: `VT-${String.fromCharCode(65 + Math.floor(r() * 26))}${String.fromCharCode(65 + Math.floor(r() * 26))}${Math.floor(r() * 99)}`,
        iata: aircraft,
        icao: aircraft,
      },
    });
  }

  return results.sort(
    (a, b) =>
      new Date(a.departure.scheduled).getTime() -
      new Date(b.departure.scheduled).getTime(),
  );
}

// ---------- Service ----------

@Injectable()
export class AviationstackService {
  private readonly logger = new Logger(AviationstackService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'http://api.aviationstack.com/v1';

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_PROVIDER) private readonly cacheProvider: CacheProvider,
  ) {
    this.apiKey = this.configService.get<string>('AVIATIONSTACK_API_KEY') ?? '';
  }

  async searchFlights(
    depIata: string,
    arrIata: string,
    date?: string,
  ): Promise<AviationFlightResult[]> {
    const cacheKey = `avstack:${depIata}:${arrIata}${date ? `:${date}` : ''}`;

    const cached = await this.cacheProvider.get<AviationFlightResult[]>(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT for ${depIata} → ${arrIata}`);
      return cached;
    }

    this.logger.log(`Cache MISS — calling AviationStack: ${depIata} → ${arrIata}`);

    try {
      let url = `${this.baseUrl}/flights?access_key=${this.apiKey}&dep_iata=${depIata}&arr_iata=${arrIata}&limit=25`;
      if (date) url += `&flight_date=${date}`;

      const response = await fetch(url);
      const data = (await response.json()) as {
        error?: { code?: string; message?: string };
        data?: AviationFlightResult[];
      };

      if (data.error) {
        this.logger.warn(
          `AviationStack API restricted (${data.error.code}) — using synthetic fallback for ${depIata} → ${arrIata}`,
        );
        const synth = generateSyntheticFlights(depIata, arrIata, date);
        await this.cacheProvider.set(cacheKey, synth, 900);
        return synth;
      }

      const flights = data.data ?? [];
      if (flights.length === 0) {
        this.logger.warn(`AviationStack returned 0 flights — using synthetic fallback`);
        const synth = generateSyntheticFlights(depIata, arrIata, date);
        await this.cacheProvider.set(cacheKey, synth, 900);
        return synth;
      }

      await this.cacheProvider.set(cacheKey, flights, 900);
      return flights;
    } catch (err) {
      this.logger.error(`AviationStack fetch failed: ${String(err)} — using synthetic fallback`);
      return generateSyntheticFlights(depIata, arrIata, date);
    }
  }
}
