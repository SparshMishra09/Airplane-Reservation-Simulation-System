"use client";

import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAPIUrl } from "@/lib/api";

const API_URL = getAPIUrl();

const seatClassColors: Record<string, string> = {
  FIRST_CLASS: "bg-amber-100 border-amber-400 text-amber-800",
  BUSINESS: "bg-blue-100 border-blue-400 text-blue-800",
  ECONOMY: "bg-gray-100 border-gray-300 text-gray-700",
};

const seatClassSelectedColors: Record<string, string> = {
  FIRST_CLASS: "bg-amber-500 border-amber-600 text-white",
  BUSINESS: "bg-blue-500 border-blue-600 text-white",
  ECONOMY: "bg-primary border-primary text-white",
};

const ADDON_PRICES = {
  baggage: 1500,
  insurance: 499,
  meals: {
    Standard: 0,
    Vegetarian: 350,
    Vegan: 450,
    Halal: 400,
    Kosher: 500,
  } as Record<string, number>,
};

interface Seat {
  id: string; // tmp-id from server
  seatNumber: string;
  seatClass: string;
  isAvailable: boolean;
  price: number;
}

interface JITFlightInfo {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
}

export default function FlightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, session } = useAuth();

  // Primary state: The live URL parameters dictate the flight
  const flightInfo: JITFlightInfo = {
    flightNumber: searchParams.get("live") || "Unknown",
    airline: searchParams.get("airline") || "Unknown Airline",
    origin: searchParams.get("dep") || "ORG",
    destination: searchParams.get("arr") || "DST",
    departureTime: searchParams.get("depTime") || new Date().toISOString(),
    arrivalTime: searchParams.get("arrTime") || new Date().toISOString(),
    basePrice: 4500, // Fixed INR equivalent for demo
  };

  const bookingId = searchParams.get("bookingId");
  const isSeatChange = !!bookingId;
  // Original seats from URL (comma-separated, e.g. "4A,4B,4C")
  const originalSeatsList = (searchParams.get("oldSeats") || "").split(",").filter(Boolean);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stepper State
  const queryStep = searchParams.get("step");
  const [step, setStep] = useState(queryStep ? parseInt(queryStep, 10) : 1);
  const totalSteps = 4;

  // Form State
  const [passenger, setPassenger] = useState({ firstName: "", lastName: "", email: "", documentId: "" });
  const [passengerCount, setPassengerCount] = useState(() => {
    // In seat-change mode, lock to original booking's seat count
    if (bookingId) {
      const sc = searchParams.get("seatCount");
      return sc ? parseInt(sc, 10) : 1;
    }
    const val = searchParams.get("passengers");
    return val ? parseInt(val, 10) : 1;
  });
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<Set<string>>(new Set());
  const [addons, setAddons] = useState({ checkedBags: 0, meal: "Standard", insurance: false });
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Partial seat-change state
  // activeOldSeat: which original seat is currently being replaced
  const [activeOldSeat, setActiveOldSeat] = useState<string | null>(
    originalSeatsList.length > 0 ? originalSeatsList[0] : null
  );
  // seatMappings: confirmed old→new pairs chosen by the user
  const [seatMappings, setSeatMappings] = useState<{ oldSeat: string; newSeat: string }[]>([]);

  // In partial mode, clicking a seat on the map either assigns it to activeOldSeat or deselects
  const toggleSeatPartial = (seatNum: string) => {
    if (!activeOldSeat) return;
    // Check if we already have a mapping for this old seat
    const existingForOld = seatMappings.find(m => m.oldSeat === activeOldSeat);

    if (existingForOld && existingForOld.newSeat === seatNum) {
      // Deselect: remove this mapping
      setSeatMappings(prev => prev.filter(m => m.oldSeat !== activeOldSeat));
    } else {
      // Assign / re-assign: remove old mapping for this oldSeat + any mapping with same newSeat
      setSeatMappings(prev => [
        ...prev.filter(m => m.oldSeat !== activeOldSeat && m.newSeat !== seatNum),
        { oldSeat: activeOldSeat, newSeat: seatNum },
      ]);
    }
  };


  // Fetch On-Demand Seat Map without DB inserts
  useEffect(() => {
    const fetchMap = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`${API_URL}/flights/seat-map`);
        url.searchParams.append("flightNumber", flightInfo.flightNumber);
        url.searchParams.append("date", flightInfo.departureTime);
        url.searchParams.append("basePrice", flightInfo.basePrice.toString());

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to load seat map");

        const data = await res.json();
        setSeats(data.seats || []);
      } catch (err: any) {
        setError(err.message || "Failed to load flight data");
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, []); // Run once on mount

  // Derived computations
  const selectedSeats = seats.filter((s) => selectedSeatNumbers.has(s.seatNumber));
  const seatsTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const baggageTotal = addons.checkedBags * ADDON_PRICES.baggage;
  const insuranceTotal = addons.insurance ? ADDON_PRICES.insurance : 0;
  const mealTotal = ADDON_PRICES.meals[addons.meal] || 0;

  const estimatedTotal = seatsTotal === 0 ? flightInfo.basePrice * passengerCount : seatsTotal;
  const finalTotal = estimatedTotal + baggageTotal + (insuranceTotal * passengerCount) + (mealTotal * passengerCount);

  const cols = ["A", "B", "C", "D", "E", "F"];
  const rows = 30; // Matches backend seat map generator

  const handleNext = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Validation checks before proceeding
    if (step === 1) {
      const isEmailValid = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(passenger.email);
      if (!passenger.firstName || !passenger.lastName || !isEmailValid) return;
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  };
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleCheckout = async () => {
    if (isSeatChange) {
      // Partial seat change mode — sends only the user-selected old→new mappings
      if (seatMappings.length === 0) return;
      if (!user || !session) { router.push("/login"); return; }
      setBookingLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/bookings/${bookingId}/seats/partial`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ seatChanges: seatMappings }),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Seat change failed"); }
        setBookingConfirmed(true);
      } catch (err: any) {
        setError(err.message || "Failed to change seats");
      } finally {
        setBookingLoading(false);
      }
      return;
    }

    // Standard Checkout mode
    if (selectedSeats.length === 0) return;
    if (!user || !session) { router.push("/login"); return; }
    setBookingLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          flightNumber: flightInfo.flightNumber,
          airline: flightInfo.airline,
          origin: flightInfo.origin,
          destination: flightInfo.destination,
          departureTime: flightInfo.departureTime,
          arrivalTime: flightInfo.arrivalTime,
          basePrice: flightInfo.basePrice,
          seatNumbers: Array.from(selectedSeatNumbers),
          passengerName: `${passenger.firstName} ${passenger.lastName}`,
          passengerEmail: passenger.email,
          documentId: passenger.documentId,
          meal: addons.meal,
          checkedBags: addons.checkedBags,
          hasCancellationProtection: addons.insurance,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Booking failed");
      }
      setBookingConfirmed(true);
    } catch (err: any) {
      setError(err.message || "Failed to finalize booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const toggleSeat = (seatNum: string) => {
    setSelectedSeatNumbers((prev) => {
      const copy = new Set(prev);
      if (copy.has(seatNum)) {
        copy.delete(seatNum);
      } else {
        if (copy.size >= passengerCount) {
          const firstItem = copy.values().next().value;
          if (firstItem !== undefined) copy.delete(firstItem);
        }
        copy.add(seatNum);
      }
      return copy;
    });
  };

  const steps = isSeatChange
    ? [{ id: 2, name: "Change Seat" }]
    : [
      { id: 1, name: "Passenger" },
      { id: 2, name: "Seats" },
      { id: 3, name: "Add-ons" },
      { id: 4, name: "Payment" },
    ];

  // LOADING STATE
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="relative mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,oklch(0.5_0.1_260/0.1),transparent_55%)]" />
          <div className="mx-auto max-w-lg rounded-3xl border border-border/60 bg-card/80 p-10 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
            <p className="text-sm font-medium text-foreground">Preparing your cabin</p>
            <p className="mt-2 text-sm text-muted-foreground">Loading live seat availability…</p>
            <div className="mt-8 space-y-3">
              <div className="skeleton-shimmer mx-auto h-3 w-4/5 rounded-full" />
              <div className="skeleton-shimmer mx-auto h-3 w-3/5 rounded-full" />
            </div>
          </div>
        </main>
      </>
    );
  }

  // ERROR STATE
  if (error || seats.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4 py-24">
          <div className="max-w-md rounded-3xl border border-border/70 bg-card/90 p-10 text-center shadow-xl backdrop-blur-md">
            <span className="text-4xl" aria-hidden>✈</span>
            <h1 className="mt-4 text-2xl font-bold">Flight unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error || "The seat map could not be loaded. Try again or pick another flight."}</p>
            <Link href="/flights" className="btn-airline-primary mt-8 inline-flex px-8 py-3">Back to flights</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.55_0.12_250/0.08),transparent_50%)]" />

        <AnimatePresence>
          {bookingLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} className="bg-white/95 p-10 rounded-[2rem] shadow-2xl flex flex-col items-center border border-border/70 max-w-sm w-full mx-4">
                <div className="relative mb-6">
                  <div className="absolute inset-0 h-16 w-16 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative h-16 w-16 bg-gradient-to-tr from-primary to-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-white text-3xl animate-bounce" aria-hidden>✈</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
                <p className="text-sm text-gray-500 text-center">Securing your cabin and finalizing your reservation...</p>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-8 overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-full animate-[progress_1.5s_ease-in-out_infinite] origin-left" style={{ animationName: "pulse-width" }} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {bookingConfirmed ? (
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-10 text-center shadow-2xl max-w-2xl mx-auto md:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
            <span className="relative text-5xl mb-4 block" aria-hidden>🎫</span>
            <h2 className="relative text-3xl font-bold text-emerald-950 mb-2">{isSeatChange ? "Seat updated" : "Booking confirmed"}</h2>
            <p className="relative text-emerald-900/90 text-base mb-6">
              {flightInfo.origin} → {flightInfo.destination} · {flightInfo.flightNumber}
            </p>
            <div className="relative glass-premium p-6 rounded-2xl text-left mb-8 border border-white/50">
              {isSeatChange ? (
                <p><strong>New Seat:</strong> {selectedSeats.map(s => s.seatNumber).join(", ")}</p>
              ) : (
                <>
                  <p><strong>Passenger:</strong> {passenger.firstName} {passenger.lastName}</p>
                  <p><strong>Seat:</strong> {selectedSeats.map(s => s.seatNumber).join(", ")} ({selectedSeats[0]?.seatClass.replace("_", " ")})</p>
                  <p><strong>Add-ons:</strong> {addons.checkedBags} Bags, {addons.meal} Meal {addons.insurance && ", Travel Insurance"}</p>
                  <p className="mt-4 text-xl font-bold text-primary border-t border-border/60 pt-4">Total paid: ₹{finalTotal.toLocaleString('en-IN')}</p>
                </>
              )}
            </div>
            <div className="relative flex items-center justify-center gap-4">
              <Link href="/bookings" className="btn-airline-primary px-10 py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 shadow-emerald-900/25">View my trips</Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">

              {/* Flight Info Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-sky-50/80 to-background border border-primary/15 p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-primary">{flightInfo.airline} · {flightInfo.flightNumber}</p>
                  <p className="text-xs text-muted-foreground">{flightInfo.origin} → {flightInfo.destination}</p>
                </div>
                <span className="text-xs bg-emerald-100/90 text-emerald-800 px-3 py-1.5 rounded-full font-semibold ring-1 ring-emerald-200/80">Live availability</span>
              </div>

              {/* Stepper Header */}
              <div className="glass-premium rounded-3xl p-6 shadow-md mb-6 flex flex-wrap items-center justify-between gap-2">
                {steps.map((s, idx) => (
                  <div key={s.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${step >= s.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                      {s.id}
                    </div>
                    <span className={`ml-3 text-sm font-semibold hidden md:block ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>{s.name}</span>
                    {idx < steps.length - 1 && (
                      <div className={`w-8 md:w-16 h-1 mx-2 md:mx-4 rounded-full transition-colors ${step > s.id ? "bg-primary/50" : "bg-secondary"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Forms */}
              <AnimatePresence mode="wait">

                {/* Step 1: Passenger */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl bg-white/95 border border-border/70 p-8 shadow-lg ring-1 ring-black/[0.03]">
                    <h2 className="text-2xl font-bold mb-2">Passenger Details</h2>
                    <p className="text-sm text-muted-foreground mb-6">Fields marked <span className="text-red-500">*</span> are required.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">First Name <span className="text-red-500">*</span></label>
                        <input type="text" value={passenger.firstName} onChange={e => setPassenger({ ...passenger, firstName: e.target.value })} className="w-full rounded-xl border border-border bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name <span className="text-red-500">*</span></label>
                        <input type="text" value={passenger.lastName} onChange={e => setPassenger({ ...passenger, lastName: e.target.value })} className="w-full rounded-xl border border-border bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" placeholder="Doe" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address <span className="text-red-500">*</span></label>
                        <input 
                          type="email" 
                          value={passenger.email} 
                          onChange={e => setPassenger({ ...passenger, email: e.target.value })} 
                          className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:bg-white transition-all ${
                            passenger.email && !passenger.email.toLowerCase().endsWith('@gmail.com')
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-border focus:ring-primary/30'
                          }`}
                          placeholder="yourname@gmail.com" 
                        />
                        {passenger.email && !passenger.email.toLowerCase().endsWith('@gmail.com') && (
                          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ Please use a valid @gmail.com address.</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Passport / ID Number <span className="text-xs text-gray-400">(optional)</span></label>
                        <input type="text" value={passenger.documentId} onChange={e => setPassenger({ ...passenger, documentId: e.target.value })} className="w-full rounded-xl border border-border bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" placeholder="A12345678" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={handleNext} 
                        disabled={!passenger.firstName || !passenger.lastName || !passenger.email.toLowerCase().endsWith('@gmail.com')} 
                        className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Continue to Seats →</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Seats */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl bg-white/95 border border-border/70 p-8 shadow-lg ring-1 ring-black/[0.03]">
                    <h2 className="text-2xl font-bold mb-2">Select Your Seat</h2>
                    <p className="text-muted-foreground mb-6 text-sm">Real-time availability mapped directly from database.</p>

                    {isSeatChange ? (
                      <div className="mb-8">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Your booked seats</p>
                        <p className="text-xs text-muted-foreground mb-4">Click a seat below to select it for replacement, then pick a new seat from the map.</p>
                        <div className="flex flex-wrap gap-3">
                          {originalSeatsList.map((oldSeat) => {
                            const mapping = seatMappings.find(m => m.oldSeat === oldSeat);
                            const isActive = activeOldSeat === oldSeat;
                            return (
                              <button
                                key={oldSeat}
                                onClick={() => setActiveOldSeat(isActive ? null : oldSeat)}
                                className={`relative flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                                  mapping
                                    ? "border-green-400 bg-green-50 text-green-800 shadow-sm"
                                    : isActive
                                    ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200 scale-105"
                                    : "border-border bg-white text-foreground hover:border-blue-300 hover:bg-blue-50"
                                }`}
                              >
                                <span className="font-mono">{oldSeat}</span>
                                {mapping ? (
                                  <>
                                    <span className="text-green-500">→</span>
                                    <span className="font-mono text-green-700">{mapping.newSeat}</span>
                                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white text-[9px]">✓</span>
                                  </>
                                ) : isActive ? (
                                  <span className="text-blue-100 text-xs">← pick seat</span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                        {activeOldSeat && (
                          <p className="mt-3 text-xs text-blue-600 font-medium animate-pulse">
                            📍 Tap a seat on the map to replace <strong>{activeOldSeat}</strong>
                          </p>
                        )}
                        {seatMappings.length > 0 && (
                          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 font-medium">
                            ⚡ Seat change fee: ₹{(seatMappings.length * 450).toLocaleString('en-IN')} ({seatMappings.length} seat{seatMappings.length > 1 ? "s" : ""} × ₹450)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-2xl mb-8 border border-border/60">
                        <div>
                          <p className="font-semibold text-sm">Number of Passengers</p>
                          <p className="text-xs text-muted-foreground">Up to 5 passengers per booking</p>
                        </div>
                        <div className="flex items-center bg-white border rounded-full p-1 shadow-sm">
                          <button onClick={() => {
                            const num = Math.max(1, passengerCount - 1);
                            setPassengerCount(num);
                            if (selectedSeatNumbers.size > num) {
                              setSelectedSeatNumbers(new Set(Array.from(selectedSeatNumbers).slice(-num)));
                            }
                          }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg font-medium transition-colors">-</button>
                          <span className="w-10 text-center font-bold text-sm tracking-wide">{passengerCount}</span>
                          <button onClick={() => setPassengerCount(Math.min(5, passengerCount + 1))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg font-medium transition-colors">+</button>
                        </div>
                      </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-8 text-xs bg-gray-50 p-4 rounded-xl">
                      <span className="flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded border bg-gray-100 border-gray-300" /> Available</span>
                      <span className="flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded bg-primary shadow-sm" /> Selected</span>
                      <span className="flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded bg-gray-300 opacity-50" /> Booked</span>
                      <span className="flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded bg-amber-100 border border-amber-400" /> First Class</span>
                      <span className="flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded bg-blue-100 border border-blue-400" /> Business</span>
                    </div>

                    <div className="bg-white border rounded-3xl p-6 shadow-inner max-h-[500px] overflow-y-auto w-fit mx-auto">
                      <div className="grid grid-cols-[30px_repeat(3,40px)_30px_repeat(3,40px)] gap-1.5 justify-center mb-4 border-b pb-4">
                        <div />
                        {cols.slice(0, 3).map((c) => <div key={c} className="text-center text-xs font-bold text-gray-400">{c}</div>)}
                        <div /> {/* Aisle */}
                        {cols.slice(3).map((c) => <div key={c} className="text-center text-xs font-bold text-gray-400">{c}</div>)}
                      </div>

                      <div className="space-y-2">
                        {Array.from({ length: rows }, (_, r) => r + 1).map((row) => (
                          <div key={row} className="grid grid-cols-[30px_repeat(3,40px)_30px_repeat(3,40px)] gap-1.5 justify-center group">
                            <div className="flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-primary transition-colors">{row}</div>
                            {cols.map((col, ci) => {
                              const seat = seats.find((s) => s.seatNumber === `${row}${col}`);
                              if (!seat) return <div key={col} />;
                              // In seat-change mode, treat original seats as available (user is changing them)
                              const isOriginalSeat = originalSeatsList.includes(seat.seatNumber);
                              const mappedAsNew = seatMappings.find(m => m.newSeat === seat.seatNumber);
                              const mappedAsOld = seatMappings.find(m => m.oldSeat === seat.seatNumber);
                              const isSelected = isSeatChange ? !!mappedAsNew : selectedSeatNumbers.has(seat.seatNumber);
                              // Original seats the user holds: show as their current seat (greyed out, not selectable as new)
                              const isBooked = isSeatChange
                                ? (!seat.isAvailable && !isOriginalSeat) || (isOriginalSeat && !mappedAsOld)
                                : !seat.isAvailable;

                              return (
                                <div key={col} className="contents">
                                  {ci === 3 && <div className="w-full flex justify-center"><div className="w-px h-full bg-gray-100" /></div>}
                                  <button
                                    disabled={isSeatChange ? (isBooked && !isOriginalSeat) || isOriginalSeat : isBooked}
                                    onClick={() => isSeatChange ? toggleSeatPartial(seat.seatNumber) : toggleSeat(seat.seatNumber)}
                                    className={`relative h-10 w-10 rounded-t-lg rounded-b-sm text-[10px] font-bold border-t-4 transition-all duration-200
                                      ${isOriginalSeat && isSeatChange
                                        ? "bg-orange-100 border-orange-300 text-orange-700 cursor-not-allowed opacity-80"
                                        : (isSeatChange ? isBooked && !isOriginalSeat : isBooked) ? "bg-gray-100 border-gray-300 text-transparent cursor-not-allowed opacity-60"
                                          : isSelected ? `${seatClassSelectedColors[seat.seatClass]} shadow-lg scale-110 z-10`
                                            : `${seatClassColors[seat.seatClass]} hover:scale-105 hover:shadow-md cursor-pointer`}`}
                                    title={
                                      isOriginalSeat && isSeatChange
                                        ? `Your current seat (${seat.seatNumber})`
                                        : (isSeatChange ? isBooked && !isOriginalSeat : isBooked)
                                        ? "Booked"
                                        : `${seat.seatNumber} — ₹${seat.price.toLocaleString('en-IN')}`
                                    }
                                  >
                                    {!(isSeatChange ? (isBooked && !isOriginalSeat) : isBooked) && <span className={isSelected ? "text-white" : ""}>{seat.seatNumber}</span>}
                                    {isSelected && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white shadow-sm ring-2 ring-white text-[8px]">✓</span>}
                                    {isOriginalSeat && isSeatChange && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-400 text-white shadow-sm ring-2 ring-white text-[8px]">★</span>}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t">
                      {!isSeatChange && <button onClick={handlePrev} className="rounded-xl px-6 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">← Back</button>}
                      {isSeatChange ? (
                        <button onClick={handleCheckout} disabled={seatMappings.length === 0 || bookingLoading} className="rounded-xl ml-auto bg-green-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-green-600/20 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {bookingLoading ? "Saving..." : `Confirm ${seatMappings.length} seat change${seatMappings.length !== 1 ? "s" : ""}`}
                        </button>
                      ) : (
                        <button onClick={handleNext} disabled={selectedSeats.length !== passengerCount} className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Continue to Add-ons →</button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Add-ons */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl bg-white/95 border border-border/70 p-8 shadow-lg ring-1 ring-black/[0.03] space-y-8">
                    <h2 className="text-2xl font-bold">Customize Your Journey</h2>

                    {/* Baggage */}
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">🧳 Checked Baggage</h3>
                        <p className="text-sm text-muted-foreground mt-1">23kg max per bag. +₹{ADDON_PRICES.baggage.toLocaleString('en-IN')} each.</p>
                      </div>
                      <div className="flex items-center bg-white border rounded-full p-1 shadow-sm">
                        <button onClick={() => setAddons(a => ({ ...a, checkedBags: Math.max(0, a.checkedBags - 1) }))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg font-medium transition-colors">-</button>
                        <span className="w-10 text-center font-bold">{addons.checkedBags}</span>
                        <button onClick={() => setAddons(a => ({ ...a, checkedBags: Math.min(passengerCount * 2, a.checkedBags + 1) }))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg font-medium transition-colors">+</button>
                      </div>
                    </div>

                    {/* Meal Preferences */}
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">🍽️ Meal Preference</h3>
                        <p className="text-sm text-muted-foreground mt-1">Choose your in-flight meal. (Per Passenger)</p>
                      </div>
                      <select value={addons.meal} onChange={e => setAddons(a => ({ ...a, meal: e.target.value }))} className="rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 min-w-[150px]">
                        <option value="Standard">Standard (+₹0)</option>
                        <option value="Vegetarian">Vegetarian (+₹350)</option>
                        <option value="Vegan">Vegan (+₹450)</option>
                        <option value="Halal">Halal (+₹400)</option>
                        <option value="Kosher">Kosher (+₹500)</option>
                      </select>
                    </div>

                    {/* Insurance */}
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-blue-100 bg-blue-50/30">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-900">🛡️ Travel Insurance</h3>
                        <p className="text-sm text-blue-700/80 mt-1">Cancellation protection & medical cover. +₹{ADDON_PRICES.insurance.toLocaleString('en-IN')} per passenger.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={addons.insurance} onChange={e => setAddons(a => ({ ...a, insurance: e.target.checked }))} />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t">
                      <button onClick={handlePrev} className="rounded-xl px-6 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">← Back</button>
                      <button onClick={handleNext} className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all">Review & Pay →</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Payment */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl bg-white/95 border border-border/70 p-8 shadow-lg ring-1 ring-black/[0.03]">
                    <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
                    <p className="text-sm text-muted-foreground mb-6">All card fields are required to complete your booking.</p>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="h-10 px-4 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center font-bold text-blue-700 italic text-sm">VISA</div>
                        <div className="h-10 px-4 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center font-bold text-red-500 italic text-sm">MC</div>
                        <div className="h-10 px-4 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center font-bold text-gray-700 text-sm">UPI</div>
                        <div className="h-10 px-4 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center font-bold text-[#1a73e8] text-sm">G Pay</div>
                        <div className="h-10 px-4 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center font-bold text-sky-600 text-sm">Paytm</div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Card Number <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            value={payment.cardNumber} 
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                              setPayment({ ...payment, cardNumber: formatted });
                            }} 
                            maxLength={19}
                            placeholder="0000 0000 0000 0000" 
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                          />
                          {payment.cardNumber && payment.cardNumber.replace(/\s/g, '').length < 16 && (
                            <p className="text-xs text-amber-600 mt-1">{16 - payment.cardNumber.replace(/\s/g, '').length} digits remaining</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expiry Date <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              value={payment.expiry} 
                              onChange={e => {
                                let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);
                                setPayment({ ...payment, expiry: val });
                              }}
                              maxLength={5}
                              placeholder="MM/YY" 
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CVV <span className="text-red-500">*</span></label>
                            <input 
                              type="password" 
                              value={payment.cvv} 
                              onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              maxLength={4}
                              placeholder="•••" 
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600 font-medium">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t">
                      <button onClick={handlePrev} className="rounded-xl px-6 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">← Back</button>
                      <button 
                        onClick={handleCheckout} 
                        disabled={
                          payment.cardNumber.replace(/\s/g, '').length !== 16 ||
                          !/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry) ||
                          !/^\d{3,4}$/.test(payment.cvv) ||
                          bookingLoading
                        }
                        className="rounded-xl bg-gradient-to-r from-primary to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {bookingLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing JIT...
                          </span>
                        ) : (
                          <>
                            <span>Pay ₹{finalTotal.toLocaleString('en-IN')}</span>
                            <span>🔒</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Sticky Pricing Sidebar */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-24 rounded-3xl glass-premium border border-border/60 p-6 shadow-2xl shadow-black/10">
                <h3 className="text-xl font-bold mb-6 pb-4 border-b">Order Summary</h3>

                <div className="space-y-6">
                  {/* Flight Info */}
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Flight</p>
                    <div className="flex justify-between items-start font-medium">
                      <span>{flightInfo.origin} → {flightInfo.destination}</span>
                      <span className="text-right">₹{(flightInfo.basePrice * passengerCount).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{flightInfo.flightNumber} • {new Date(flightInfo.departureTime).toLocaleDateString()} • {passengerCount} Passenger(s)</p>
                  </div>

                  {/* Seat Info */}
                  {selectedSeats.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t pt-4">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Seat</p>
                      {selectedSeats.map(seat => (
                        <div key={seat.id} className="flex justify-between items-start text-sm">
                          <span>Seat {seat.seatNumber} <span className="text-muted-foreground text-xs ml-1">({seat.seatClass.replace("_", " ")})</span></span>
                          <span className="font-medium">{seat.price - flightInfo.basePrice > 0 ? `+₹${(seat.price - flightInfo.basePrice).toLocaleString('en-IN')}` : 'Included'}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Addons Info */}
                  {!isSeatChange && (addons.checkedBags > 0 || addons.insurance || mealTotal > 0) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t pt-4">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Add-ons</p>
                      {addons.checkedBags > 0 && (
                        <div className="flex justify-between items-start text-sm mb-2">
                          <span>{addons.checkedBags}x Checked Bag</span>
                          <span className="font-medium">+₹{baggageTotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {mealTotal > 0 && (
                        <div className="flex justify-between items-start text-sm mb-2">
                          <span>{addons.meal} Meal x{passengerCount}</span>
                          <span className="font-medium">+₹{(mealTotal * passengerCount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {addons.insurance && (
                        <div className="flex justify-between items-start text-sm text-blue-700">
                          <span>Travel Insurance x{passengerCount}</span>
                          <span className="font-medium">+₹{(insuranceTotal * passengerCount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {!isSeatChange && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Due</p>
                        <p className="text-xs text-muted-foreground mt-1">Includes all taxes and fees</p>
                      </div>
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={finalTotal}
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="text-3xl font-extrabold text-primary"
                        >
                          ₹{finalTotal.toLocaleString('en-IN')}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )}

              </motion.div>
            </div>

          </div>
        )}
      </main>
    </>
  );
}
