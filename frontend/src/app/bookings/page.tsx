"use client";

import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAPIUrl } from "@/lib/api";
import { BoardingPassTicket } from "@/components/bookings/boarding-pass-ticket";
import { EarthModel } from "@/components/earth-model";
import { useBookingsEntrance } from "@/hooks/useBookingsEntrance";
import { animate } from "animejs";
import { Plane } from "lucide-react";

const API_URL = getAPIUrl();

interface Booking {
  id: string;
  flightId: string;
  status: string;
  totalAmount: number;
  hasCancellationProtection: boolean;
  createdAt: string;
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime?: string;
  };
  seats: { id: string; seatNumber: string; seatClass: string; price: number }[];
  passengerName: string | null;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; bookingId: string | null; refundAmount: number; fee: number }>({ isOpen: false, bookingId: null, refundAmount: 0, fee: 0 });
  const [seatModal, setSeatModal] = useState<{ isOpen: boolean; bookingId: string | null; fee: number }>({ isOpen: false, bookingId: null, fee: 0 });
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [processingCancel, setProcessingCancel] = useState(false);

  const { user, session, loading: authLoading } = useAuth();

  const allRoutes = useMemo(() => {
    return bookings.map(b => ({
      from: b.flight.origin,
      to: b.flight.destination
    }));
  }, [bookings]);

  const bookingSignature = useMemo(
    () => bookings.map((b) => `${b.id}:${b.status}`).join("|"),
    [bookings]
  );

  const animationsReady = !authLoading && !loading && !!user && bookings.length > 0;
  useBookingsEntrance({ ready: animationsReady, signature: bookingSignature });

  const showToast = (message: string, type: "success" | "info" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && session) {
      fetchBookings();
    }
  }, [user, session, authLoading]);

  const calculateFees = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    const msUntilFlight = new Date(booking.flight.departureTime).getTime() - Date.now();
    const hoursUntilFlight = msUntilFlight / (1000 * 60 * 60);

    let refundAmount = 0;
    let cancelFee = 0;

    if (booking.hasCancellationProtection) {
      refundAmount = booking.totalAmount;
      cancelFee = 0;
    } else {
      if (hoursUntilFlight <= 24) {
        cancelFee = booking.totalAmount;
        refundAmount = 0;
      } else if (hoursUntilFlight <= 24 * 7) {
        cancelFee = Math.min(100 + booking.totalAmount * 0.3, booking.totalAmount);
        refundAmount = booking.totalAmount - cancelFee;
      } else {
        cancelFee = Math.min(50, booking.totalAmount);
        refundAmount = booking.totalAmount - cancelFee;
      }
    }

    let seatChangeFee = 0;
    const baseSeatFee = 5;

    if (hoursUntilFlight > 168) {
      seatChangeFee = baseSeatFee;
    } else if (hoursUntilFlight >= 48) {
      seatChangeFee = baseSeatFee + booking.totalAmount * 0.15;
    } else {
      seatChangeFee = baseSeatFee + booking.totalAmount * 0.4;
    }

    return { refundAmount, cancelFee, seatChangeFee, hoursUntilFlight, flightId: booking.flightId };
  };

  const openCancelModal = (id: string) => {
    const fees = calculateFees(id);
    if (!fees) return;
    setCancelModal({ isOpen: true, bookingId: id, refundAmount: fees.refundAmount, fee: fees.cancelFee });
  };

  const openSeatModal = (id: string) => {
    const fees = calculateFees(id);
    if (!fees) return;
    setSeatModal({ isOpen: true, bookingId: id, fee: fees.seatChangeFee });
  };

  const confirmCancel = async () => {
    if (!cancelModal.bookingId) return;

    try {
      setProcessingCancel(true);
      const res = await fetch(`${API_URL}/bookings/${cancelModal.bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to cancel booking");

      setBookings((prev) =>
        prev.map((b) => (b.id === cancelModal.bookingId ? { ...b, status: "CANCELLED" } : b))
      );

      showToast(`Booking cancelled. Refund of ₹${cancelModal.refundAmount.toLocaleString('en-IN')} is being processed.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to process cancellation.", "error");
    } finally {
      setProcessingCancel(false);
      setCancelModal({ isOpen: false, bookingId: null, refundAmount: 0, fee: 0 });
    }
  };

  const confirmSeatChange = () => {
    if (!seatModal.bookingId) return;
    const booking = bookings.find((b) => b.id === seatModal.bookingId);

    showToast("Redirecting to seat selection...", "info");
    setSeatModal({ isOpen: false, bookingId: null, fee: 0 });

    if (booking) {
      router.push(`/flights/live?live=${encodeURIComponent(booking.flight.flightNumber)}&dep=${booking.flight.origin}&arr=${booking.flight.destination}&depTime=${encodeURIComponent(booking.flight.departureTime)}&arrTime=${encodeURIComponent(booking.flight.arrivalTime || "")}&bookingId=${booking.id}&seatCount=${booking.seats.length}&oldSeats=${encodeURIComponent(booking.seats.map(s => s.seatNumber).join(','))}&step=2`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative mx-auto max-w-3xl px-4 py-10 md:max-w-4xl md:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_85%_50%_at_50%_-15%,oklch(0.48_0.12_260/0.12),transparent_55%)]" />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1">
            <Plane className="h-3.5 w-3.5 -rotate-45 text-primary" aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Boarding passes</p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your reservations</h1>
        </motion.div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* Left Side: 3D Earth Model */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:sticky lg:top-24 lg:w-[55%]"
          >
            <EarthModel routes={allRoutes} className="h-[500px] md:h-[600px] lg:h-[750px] w-full" autoFocus />
          </motion.div>

          {/* Right Side: Tickets */}
          <div className="flex-1 lg:max-w-[42%]">
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: -20, x: "-50%" }}
                  className={`fixed top-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium shadow-xl backdrop-blur-md ${toast.type === "success" ? "bg-emerald-700 text-white" : toast.type === "error" ? "bg-red-700 text-white" : "bg-primary text-primary-foreground"}`}
                >
                  {toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i"} {toast.message}
                </motion.div>
              )}
            </AnimatePresence>

            {authLoading || loading ? (
              <div className="space-y-4 py-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="overflow-hidden rounded-[1.35rem] border border-border/60 bg-card/80 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="skeleton-shimmer h-12 w-28 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <div className="skeleton-shimmer h-5 w-2/5 rounded-lg" />
                        <div className="skeleton-shimmer h-3 w-3/5 rounded-lg" />
                      </div>
                      <div className="skeleton-shimmer h-10 w-24 rounded-xl" />
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm text-muted-foreground">Loading your reservations…</p>
              </div>
            ) : !user ? null : bookings.length === 0 ? (
              <EmptyTripsCard />
            ) : (
              <div data-bookings-tickets className="space-y-12">
                {bookings.map((booking) => (
                  <BoardingPassTicket
                    key={booking.id}
                    booking={booking}
                    onBoardingPass={() => showToast("Boarding pass ready — check your email (demo).", "success")}
                    onChangeSeats={() => openSeatModal(booking.id)}
                    onCancel={() => openCancelModal(booking.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {cancelModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, translateY: 16 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-2xl"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-red-500" />
                <h3 className="mb-2 text-xl font-bold text-red-600">Cancel booking?</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  This action will release your seats back into the database immediately.
                </p>

                <div className="mb-6 rounded-xl border bg-muted/40 p-4 text-sm">
                  {cancelModal.fee === 0 ? (
                    <p className="whitespace-pre-wrap font-medium text-green-700">
                      You have Cancellation Protection!{"\n"}Your refund will be the full amount.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium text-red-600">Cancellation fee: ₹{cancelModal.fee.toLocaleString('en-IN')}</p>
                      <p>Reimbursement decreases as the flight approaches.</p>
                    </div>
                  )}
                  <div className="mt-4 border-t pt-3 text-lg">
                    Estimated refund: <span className="font-bold text-primary">₹{cancelModal.refundAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelModal({ isOpen: false, bookingId: null, refundAmount: 0, fee: 0 })}
                    disabled={processingCancel}
                    className="rounded-xl border px-5 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    Keep booking
                  </button>
                  <button
                    type="button"
                    onClick={confirmCancel}
                    disabled={processingCancel}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {processingCancel ? "Cancelling…" : "Confirm cancellation"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {seatModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, translateY: 16 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-blue-500" />
                <h3 className="mb-2 text-xl font-bold text-blue-950">Change seats</h3>

                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
                  <p className="mb-2 flex justify-between border-b border-blue-100 pb-2 text-lg font-bold">
                    <span>Seat change fee</span>
                    {seatModal.fee <= 450 ? (
                      <span className="text-green-600">₹{seatModal.fee.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-red-500">₹{seatModal.fee.toLocaleString('en-IN')}</span>
                    )}
                  </p>

                  {seatModal.fee <= 450 ? (
                    <p className="font-medium text-green-700">
                      Standard ₹450 processing fee — your flight is more than 7 days away.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-medium text-amber-600">A higher fee applies because your flight is soon.</p>
                      <span className="block text-xs text-muted-foreground">Includes base fee plus a timeline surcharge.</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSeatModal({ isOpen: false, bookingId: null, fee: 0 })}
                    className="rounded-xl border px-5 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmSeatChange}
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-95"
                  >
                    Proceed to seat map
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

function EmptyTripsCard() {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const el = iconRef.current;
    if (!el || mq.matches) return;
    const a = animate(el, {
      translateY: [-6, 6],
      rotate: [-6, 6],
      duration: 2200,
      ease: "inOut(2)",
      loop: true,
      alternate: true,
    });
    return () => {
      a.revert();
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.05] via-card/90 to-sky-50/60 px-6 py-16 text-center shadow-inner">
      <div
        ref={iconRef}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
      >
        <Plane className="h-8 w-8 -rotate-45" strokeWidth={1.75} />
      </div>
      <h2 className="mt-6 text-xl font-semibold">No trips yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Book a flight and you&apos;ll see boarding-pass style tickets here with animations.
      </p>
      <Link href="/flights" className="btn-airline-primary mt-8 inline-flex px-8 py-3">
        Search flights
      </Link>
    </div>
  );
}
