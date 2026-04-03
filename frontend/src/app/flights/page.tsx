"use client";

import Navbar from "@/components/navbar";
import { EarthModel } from "@/components/earth-model";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState, useCallback, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Plane,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  MapPin,
  Ticket,
  Radar,
  Calendar,
  Search,
  Check,
  Users
} from "lucide-react";

const GLOBAL_AIRPORTS = [
  // Top Domestic (India)
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi Intl" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Intl" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda Intl" },
  { code: "MAA", city: "Chennai", name: "Chennai Intl" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi Intl" },
  { code: "GOI", city: "Goa (Dabolim)", name: "Dabolim Airport" },
  { code: "GOX", city: "Goa (Mopa)", name: "Manohar Intl" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel Intl" },
  { code: "PNQ", city: "Pune", name: "Pune Airport" },
  { code: "COK", city: "Kochi", name: "Cochin Intl" },
  { code: "JAI", city: "Jaipur", name: "Jaipur Intl" },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi Intl" },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh Intl" },
  { code: "IXC", city: "Chandigarh", name: "Chandigarh Intl" },
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan Intl" },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam Intl" },
  { code: "TRV", city: "Thiruvananthapuram", name: "Trivandrum Intl" },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri Intl" },
  { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik Intl" },
  { code: "VTZ", city: "Visakhapatnam", name: "Visakhapatnam Airport" },
  { code: "CJB", city: "Coimbatore", name: "Coimbatore Intl" },
  { code: "IXB", city: "Bagdogra", name: "Bagdogra Airport" },
  { code: "RPR", city: "Raipur", name: "Swami Vivekananda Airport" },

  // Top International (Middle East & Asia)
  { code: "DXB", city: "Dubai", name: "Dubai Intl" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed Intl" },
  { code: "DOH", city: "Doha", name: "Hamad Intl" },
  { code: "SIN", city: "Singapore", name: "Changi Airport" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport" },
  { code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur Intl" },
  { code: "HKG", city: "Hong Kong", name: "Hong Kong Intl" },
  { code: "NRT", city: "Tokyo", name: "Narita Intl" },
  { code: "HND", city: "Tokyo", name: "Haneda Airport" },
  { code: "ICN", city: "Seoul", name: "Incheon Intl" },

  // Top International (Europe)
  { code: "LHR", city: "London", name: "Heathrow Airport" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Airport" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol" },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport" },

  // Top International (Americas & Oceania)
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl" },
  { code: "EWR", city: "Newark", name: "Newark Liberty Intl" },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Intl" },
  { code: "SFO", city: "San Francisco", name: "San Francisco Intl" },
  { code: "YYZ", city: "Toronto", name: "Toronto Pearson" },
  { code: "SYD", city: "Sydney", name: "Sydney Kingsford Smith" },
  { code: "MEL", city: "Melbourne", name: "Melbourne Airport" },
];

const DEMO_FLIGHTS = [
  { id: "f1", flightIata: "SV-101", airline: "SkyVoyage Airways", price: 689, stops: 0, departure: { iata: "DXB", airport: "Dubai Intl", scheduled: "2026-04-15T08:00:00" }, arrival: { iata: "LHR", airport: "London Heathrow", scheduled: "2026-04-15T14:30:00" }, status: "scheduled", aircraft: "B787" },
  { id: "f2", flightIata: "SV-205", airline: "SkyVoyage Airways", price: 920, stops: 0, departure: { iata: "JFK", airport: "New York JFK", scheduled: "2026-04-16T22:00:00" }, arrival: { iata: "CDG", airport: "Paris CDG", scheduled: "2026-04-17T10:15:00" }, status: "scheduled", aircraft: "A380" },
  { id: "f3", flightIata: "SV-310", airline: "SkyVoyage Airways", price: 540, stops: 1, departure: { iata: "NRT", airport: "Tokyo Narita", scheduled: "2026-04-17T01:30:00" }, arrival: { iata: "DXB", airport: "Dubai Intl", scheduled: "2026-04-17T08:45:00" }, status: "scheduled", aircraft: "B777" },
  { id: "f4", flightIata: "SV-412", airline: "SkyVoyage Airways", price: 410, stops: 0, departure: { iata: "LHR", airport: "London Heathrow", scheduled: "2026-04-18T11:00:00" }, arrival: { iata: "JFK", airport: "New York JFK", scheduled: "2026-04-18T14:00:00" }, status: "scheduled", aircraft: "A350" },
  { id: "f5", flightIata: "SV-520", airline: "SkyVoyage Airways", price: 1120, stops: 1, departure: { iata: "CDG", airport: "Paris CDG", scheduled: "2026-04-19T13:45:00" }, arrival: { iata: "NRT", airport: "Tokyo Narita", scheduled: "2026-04-20T08:00:00" }, status: "scheduled", aircraft: "B787" },
  { id: "f6", flightIata: "SV-601", airline: "SkyVoyage Airways", price: 320, stops: 0, departure: { iata: "DXB", airport: "Dubai Intl", scheduled: "2026-04-20T06:30:00" }, arrival: { iata: "CDG", airport: "Paris CDG", scheduled: "2026-04-20T11:45:00" }, status: "scheduled", aircraft: "A320" },
];

interface Flight {
  id: string;
  flightIata: string;
  airline: string;
  price?: number;
  stops?: number;
  numberOfStops?: number;
  departure: {
    iata: string;
    airport: string;
    scheduled: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    iata: string;
    airport: string;
    scheduled: string;
  };
  status: string;
  aircraft?: string;
  airlineIata?: string;
}

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "--:--";
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getDuration(dep: string, arr: string) {
  try {
    const ms = new Date(arr).getTime() - new Date(dep).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  } catch {
    return "";
  }
}

function durationHours(dep: string, arr: string): number {
  try {
    const ms = new Date(arr).getTime() - new Date(dep).getTime();
    return ms / 3600000;
  } catch {
    return 999;
  }
}

function estimateLivePrice(flight: { flightIata?: string; departure?: {scheduled: string}; arrival?: {scheduled: string} }) {
  let durHours = 2; // Default for domestic
  if (flight.departure?.scheduled && flight.arrival?.scheduled) {
    durHours = durationHours(flight.departure.scheduled, flight.arrival.scheduled);
  }
  const baseInr = 2500 + (durHours * 1600); // 1600 INR per hour approx
  const key = flight.flightIata || "";
  const h = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offset = (h % 1500) - 750; // Random offset based on flight code
  return Math.round((baseInr + offset) / 100) * 100; // Round to nearest 100
}

function estimateStops(flight: { numberOfStops?: number }) {
  if (typeof flight.numberOfStops === "number") return flight.numberOfStops;
  return 0;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-sky-100/90 text-sky-800 ring-1 ring-sky-200/80",
  active: "bg-emerald-100/90 text-emerald-800 ring-1 ring-emerald-200/80",
  landed: "bg-muted text-muted-foreground ring-1 ring-border",
  cancelled: "bg-red-100/90 text-red-700 ring-1 ring-red-200/80",
  incident: "bg-amber-100/90 text-amber-900 ring-1 ring-amber-200/80",
  diverted: "bg-violet-100/90 text-violet-800 ring-1 ring-violet-200/80",
};

// --- Custom Searchable Combobox for Cities/Airports ---
function AirportCombobox({ label, letter, value, onChange }: { label: string, letter: string, value: string, onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selectedItem = GLOBAL_AIRPORTS.find(a => a.code === value);
  const filtered = GLOBAL_AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(query.toLowerCase()) ||
    a.code.toLowerCase().includes(query.toLowerCase()) ||
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] text-primary">
          {letter}
        </span>
        {label}
      </label>
      <div
        className="relative flex w-full cursor-text items-center justify-between rounded-2xl border-2 border-border/60 bg-white px-4 py-4 text-sm font-medium shadow-inner transition-[border-color,box-shadow] duration-300 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/15"
      >
        <div className="flex w-full items-center gap-2">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <input
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground"
            placeholder={selectedItem ? `${selectedItem.city} (${selectedItem.code})` : "Search city or airport..."}
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (val.trim().length > 0) {
                setOpen(true);
              } else {
                setOpen(false);
              }
            }}
            onFocus={() => {
              if (selectedItem && query === `${selectedItem.city} (${selectedItem.code})`) {
                setQuery(""); // Clear on focus for easy typing
              }
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-60 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-xl"
          >
            {filtered.length === 0 ? (
              query.length === 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.toUpperCase());
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-primary/10 text-primary font-bold"
                >
                  Confirm Custom IATA Code &quot;{query.toUpperCase()}&quot;
                </button>
              ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No matches. Type any exact 3-letter IATA code to select it globally.
                </p>
              )
            ) : (
              filtered.map(a => (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => {
                    onChange(a.code);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-secondary/60 ${value === a.code ? 'bg-primary/5 text-primary' : ''}`}
                >
                  <div>
                    <p className="font-semibold">{a.city} <span className="text-muted-foreground font-normal">({a.code})</span></p>
                    <p className="text-xs text-muted-foreground/80">{a.name}</p>
                  </div>
                  {value === a.code && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlightsPageContent() {
  const searchParams = useSearchParams();
  const urlInitRef = useRef(false);
  const CACHE_KEY = "skyvoyage_flight_search_state";

  // Robustly restore state from browser session to prevent losing search results on "Back" navigation
  const getInitialState = <T,>(key: string, defaultVal: T): T => {
    if (typeof window === "undefined") return defaultVal;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const state = JSON.parse(cached);
        return state[key] !== undefined ? state[key] : defaultVal;
      }
    } catch { }
    return defaultVal;
  };

  const [from, setFrom] = useState(() => getInitialState("from", ""));
  const [to, setTo] = useState(() => getInitialState("to", ""));
  const [flights, setFlights] = useState<Flight[]>(() => getInitialState("flights", []));
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(() => getInitialState("searched", false));
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "demo">(() => getInitialState("mode", "live"));

  const [filterMaxPrice, setFilterMaxPrice] = useState(() => getInitialState("filterMaxPrice", 180000));
  const [filterMaxHours, setFilterMaxHours] = useState(() => getInitialState("filterMaxHours", 30));
  const [filterMaxStops, setFilterMaxStops] = useState(() => getInitialState("filterMaxStops", 2));

  // Date selection states
  const [departureDate, setDepartureDate] = useState(() => getInitialState("departureDate", ""));
  const [returnDate, setReturnDate] = useState(() => getInitialState("returnDate", ""));

  // Sync state actively to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ from, to, flights, searched, mode, filterMaxPrice, filterMaxHours, filterMaxStops, departureDate, returnDate })
      );
    }
  }, [from, to, flights, searched, mode, filterMaxPrice, filterMaxHours, filterMaxStops, departureDate, returnDate]);

  useEffect(() => {
    const f = searchParams.get("from") || "";
    const t = searchParams.get("to") || "";
    if (f) setFrom(f);
    if (t) setTo(t);
  }, [searchParams]);

  const searchLive = useCallback(
    async (depOverride?: string, arrOverride?: string, dateOverride?: string) => {
      const dep = depOverride ?? from;
      const arr = arrOverride ?? to;
      const dDate = dateOverride ?? departureDate;
      if (!dep || !arr) return;
      if (dep === arr) {
        setError("Origin and destination must be different.");
        return;
      }

      setLoading(true);
      setError(null);
      setSearched(true);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        let fetchUrl = `${apiUrl}/flights/live?dep=${dep}&arr=${arr}`;
        if (dDate) fetchUrl += `&date=${dDate}`;
        const res = await fetch(fetchUrl);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setFlights([]);
          setError("No flights found for this route. Try a different route or switch to Demo Flights.");
        } else {
          setFlights(data);
        }
      } catch {
        setError("Could not reach the backend. Is the backend running on port 4000?");
        setFlights([]);
      } finally {
        setLoading(false);
      }
    },
    [from, to]
  );

  useEffect(() => {
    if (urlInitRef.current) return;
    const f = searchParams.get("from");
    const t = searchParams.get("to");
    // Only search automatically if URL params exist AND we haven't already searched and cached them
    if (f && t && f !== t && mode === "live" && !searched) {
      urlInitRef.current = true;
      searchLive(f, t);
    }
  }, [searchParams, mode, searchLive, searched]);

  const showDemo = () => {
    setMode("demo");
    setFlights(DEMO_FLIGHTS);
    setSearched(true);
    setError(null);
  };

  const displayFlights = useMemo(() => {
    // 1. Strict Date Processing - Filter out ghost past flights
    const now = new Date();

    const timeFiltered = flights.filter(flight => {
      if (!flight.departure?.scheduled) return false;
      const flightTime = new Date(flight.departure.scheduled);
      // In live mode, rigorously block past departure times
      if (mode === "live" && flightTime.getTime() < now.getTime()) return false;
      return true;
    });

    // 2. Process Custom UI Filters (Price/Duration/Stops)
    const validFlights = timeFiltered.filter((flight) => {
      const dep = flight.departure?.scheduled;
      const arr = flight.arrival?.scheduled;
      if (!dep || !arr) return true;
      const hours = durationHours(dep, arr);
      const stops = mode === "demo" ? flight.stops ?? 0 : estimateStops(flight);
      const price = mode === "demo" ? flight.price ?? estimateLivePrice(flight) : estimateLivePrice(flight);
      return price <= filterMaxPrice && hours <= filterMaxHours && stops <= filterMaxStops;
    });

    // 3. Chronological Sorting - Upcoming flights first
    return validFlights.sort((a, b) => new Date(a.departure.scheduled).getTime() - new Date(b.departure.scheduled).getTime());
  }, [flights, filterMaxHours, filterMaxPrice, filterMaxStops, mode]);

  const maxDemoPrice = useMemo(() => {
    if (mode !== "demo" || flights.length === 0) return 200000;
    return Math.max(...flights.map((f: { price?: number }) => f.price ?? 0), 50000);
  }, [flights, mode]);

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage: `repeating-linear-gradient(
              -12deg,
              transparent,
              transparent 40px,
              oklch(0.45 0.08 260 / 0.04) 40px,
              oklch(0.45 0.08 260 / 0.04) 41px
            )`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-15%,oklch(0.42_0.12_260/0.14),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <Ticket className="h-3.5 w-3.5" aria-hidden />
                Reservations
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.35rem]">
                {mode === "live" ? (
                  <>
                    Plan your{" "}
                    <span className="bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
                      next departure
                    </span>
                  </>
                ) : (
                  <>
                    Global{" "}
                    <span className="bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
                      demo routes
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Live lookups for Indian city pairs, or switch to demo flights for instant cabin and seat
                selection — same booking engine underneath.
              </p>
            </motion.div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-border/70 bg-gradient-to-b from-card to-secondary/20 p-1.5 shadow-md backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("live");
                  setFlights([]);
                  setSearched(false);
                  setError(null);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === "live"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  }`}
              >
                <Radar className="h-4 w-4" aria-hidden />
                Live
              </button>
              <button
                type="button"
                onClick={showDemo}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === "demo"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  }`}
              >
                <Plane className="h-4 w-4 -rotate-45" aria-hidden />
                Demo
              </button>
            </div>
          </div>

          {mode === "demo" && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <EarthModel from={from} to={to} className="h-[320px] md:h-[450px] w-full" />
            </motion.div>
          )}

          {mode === "demo" && searched && flights.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Ticket className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                You&apos;re viewing <strong className="text-foreground">demo inventory</strong> — select a flight to open seats and add-ons.
              </span>
            </motion.p>
          )}

          {mode === "live" && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <EarthModel from={from} to={to} className="h-[320px] md:h-[450px] w-full" />
            </motion.div>
          )}

          {mode === "live" && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-20 mt-6 rounded-2xl border border-border/50 bg-white/95 shadow-lg ring-1 ring-black/[0.03] backdrop-blur-sm"
            >
              <div className="px-5 py-5 md:px-6">
                <div className="flex flex-wrap items-end gap-3 lg:flex-nowrap">
                  <div className="flex-1 min-w-[180px]">
                    <AirportCombobox label="Origin" letter="A" value={from} onChange={setFrom} />
                  </div>

                  <div className="flex items-end pb-1">
                    <button
                      type="button"
                      onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}
                      className="group flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition-all duration-300 hover:scale-105 hover:bg-primary/10"
                      title="Swap airports"
                      aria-label="Swap origin and destination"
                    >
                      <ArrowLeftRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <AirportCombobox label="Destination" letter="B" value={to} onChange={setTo} />
                  </div>

                  <div className="shrink-0">
                    <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                      <Calendar className="h-3 w-3" /> Departure
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full cursor-pointer rounded-xl border border-border/60 bg-white px-3 py-[0.82rem] text-sm font-medium shadow-sm transition-colors duration-200 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="shrink-0">
                    <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                      <Calendar className="h-3 w-3" /> Return <span className="opacity-40">(Opt)</span>
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={departureDate || new Date().toISOString().split("T")[0]}
                      className="w-full cursor-pointer rounded-xl border border-border/60 bg-white px-3 py-[0.82rem] text-sm font-medium shadow-sm transition-colors duration-200 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => searchLive()}
                      disabled={!from || !to || loading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-[0.82rem] text-sm font-bold text-primary-foreground shadow-md shadow-primary/30 transition-all duration-200 hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <><Plane className="h-4 w-4 -rotate-45" strokeWidth={2.5} /> Search</>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 rounded-xl border border-red-200/80 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {searched && !loading && flights.length > 0 && (
            <div className="mt-6 mx-auto w-full">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {mode === "live"
                    ? `${displayFlights.length} flight${displayFlights.length !== 1 ? "s" : ""} · ${GLOBAL_AIRPORTS.find((a) => a.code === from)?.city || from} → ${GLOBAL_AIRPORTS.find((a) => a.code === to)?.city || to}`
                    : `${displayFlights.length} demo flight${displayFlights.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <AnimatePresence mode="wait">
                {displayFlights.length > 0 && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {displayFlights.map((flight, i) => {
                      const price = mode === "demo" ? flight.price ?? estimateLivePrice(flight) : estimateLivePrice(flight);
                      const stops = mode === "demo" ? flight.stops ?? 0 : estimateStops(flight);
                      const dur = getDuration(flight.departure.scheduled, flight.arrival.scheduled);

                      return (
                        <motion.article
                          key={flight.flightIata + i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                          className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.03] transition-shadow duration-200 hover:shadow-md lg:flex-row lg:items-center"
                        >
                          {/* Left accent */}
                          <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl bg-gradient-to-b from-primary/80 via-sky-400/70 to-primary/40" aria-hidden />

                          {/* Airline */}
                          <div className="flex items-center gap-3 pl-2 lg:w-44 lg:shrink-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                              {flight.airlineIata || "✈"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{flight.airline}</p>
                              <p className="text-xs text-muted-foreground">{flight.flightIata} · {stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`}</p>
                            </div>
                          </div>

                          {/* Route timeline */}
                          <div className="flex flex-1 items-center justify-between gap-3 pl-2 lg:pl-0">
                            <div className="text-center">
                              <p className="text-xl font-bold tabular-nums">{formatTime(flight.departure.scheduled)}</p>
                              <p className="text-xs font-semibold text-muted-foreground">{flight.departure.iata}</p>
                            </div>

                            <div className="flex flex-1 flex-col items-center gap-1 px-2">
                              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{dur}</p>
                              <div className="relative flex w-full max-w-[160px] items-center">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                                <span className="h-px flex-1 bg-gradient-to-r from-primary/40 via-sky-400/60 to-primary/40" />
                                <Plane className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-primary" />
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                              </div>
                              {(flight.aircraft || flight.departure.terminal) && (
                                <p className="text-[10px] text-muted-foreground/70">
                                  {flight.aircraft ? `${flight.aircraft}` : ""}{flight.departure.terminal ? ` · T${flight.departure.terminal}` : ""}
                                </p>
                              )}
                            </div>

                            <div className="text-center">
                              <p className="text-xl font-bold tabular-nums">{formatTime(flight.arrival.scheduled)}</p>
                              <p className="text-xs font-semibold text-muted-foreground">{flight.arrival.iata}</p>
                            </div>
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-3 pl-2 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0 lg:shrink-0">
                            <div>
                              {flight.status && (
                                <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColors[flight.status] || "bg-muted text-muted-foreground"}`}>
                                  {flight.status}
                                </span>
                              )}
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">From</p>
                              <p className="text-2xl font-bold text-primary">₹{price.toLocaleString("en-IN")}</p>
                              <p className="text-[10px] text-muted-foreground">{formatDate(flight.departure.scheduled)}</p>
                            </div>
                            {mode === "demo" ? (
                              <Link
                                href={`/flights/${flight.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:opacity-90"
                              >
                                Book
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            ) : (
                              <Link
                                href={`/flights/f1?live=${encodeURIComponent(flight.flightIata)}&airline=${encodeURIComponent(flight.airline)}&dep=${flight.departure.iata}&arr=${flight.arrival.iata}&depTime=${encodeURIComponent(flight.departure.scheduled)}&arrTime=${encodeURIComponent(flight.arrival.scheduled)}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:opacity-90"
                              >
                                Book
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            )}
                          </div>
                        </motion.article>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {searched && !loading && flights.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 rounded-3xl border border-border/60 bg-card/40 py-20 text-center shadow-inner"
            >
              <span className="text-5xl" aria-hidden>
                🔍
              </span>
              <h2 className="mt-4 text-xl font-semibold">No flights found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Try another route or open Demo flights to explore the full SkyVoyage experience.
              </p>
              <button type="button" onClick={showDemo} className="btn-airline-primary mt-8 inline-flex px-8 py-3">
                Load demo flights
              </button>
            </motion.div>
          )}

          {loading && (
            <div className="mt-10 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-3xl border border-border/60 bg-white/90 p-6 shadow-sm md:p-8"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="skeleton-shimmer h-14 w-14 shrink-0 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <div className="skeleton-shimmer h-4 w-1/3 rounded-lg" />
                      <div className="skeleton-shimmer h-3 w-1/4 rounded-lg" />
                    </div>
                    <div className="skeleton-shimmer h-10 w-28 rounded-full md:ml-auto" />
                  </div>
                  <div className="mt-6 flex gap-4 border-t border-border/40 pt-4">
                    <div className="skeleton-shimmer h-3 flex-1 rounded" />
                    <div className="skeleton-shimmer h-3 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function FlightsLoadingFallback() {
  return (
    <>
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="skeleton-shimmer mb-8 h-10 w-64 max-w-full rounded-xl" />
        <div className="skeleton-shimmer h-40 w-full rounded-3xl" />
      </main>
    </>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={<FlightsLoadingFallback />}>
      <FlightsPageContent />
    </Suspense>
  );
}
