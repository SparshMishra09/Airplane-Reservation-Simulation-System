"use client";

import { Plane } from "lucide-react";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-emerald-100/95 text-emerald-800 ring-emerald-200/80",
  PENDING: "bg-amber-100/95 text-amber-900 ring-amber-200/80",
  CANCELLED: "bg-red-100/95 text-red-800 ring-red-200/70",
};

export type BoardingPassBooking = {
  id: string;
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
};

type Props = {
  booking: BoardingPassBooking;
  onBoardingPass: () => void;
  onChangeSeats: () => void;
  onCancel: () => void;
};

export function BoardingPassTicket({
  booking,
  onBoardingPass,
  onChangeSeats,
  onCancel,
}: Props) {
  const dep = new Date(booking.flight.departureTime);
  const dateStr = dep.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = dep.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const seatList = booking.seats.map((s) => s.seatNumber).join(", ");
  const seatClass = booking.seats[0]?.seatClass?.replace("_", " ") ?? "Economy";
  const confirmed = booking.status === "CONFIRMED";

  return (
    <article
      data-ticket-card
      style={{ opacity: 0 }}
      className={`group relative overflow-hidden rounded-2xl border-2 border-dashed border-border/50 bg-gradient-to-br from-white via-white to-secondary/30 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.04] md:rounded-[1.35rem] ${booking.status === "CANCELLED" ? "grayscale-[0.45]" : ""
        }`}
    >
      {/* Left colour stripe */}
      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[var(--color-gold)] via-primary to-sky-600" />

      <div className="pl-6 pr-6 pt-7 pb-7 md:pl-8 md:pr-9 md:pt-9 md:pb-8">

        {/* ── Header: airline + flight number / status ── */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-border/70 pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">SkyVoyage</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              PNR · {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border/80 bg-secondary/60 px-2.5 py-1 font-mono text-xs font-bold">
              {booking.flight.flightNumber}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${statusStyles[booking.status] || "bg-muted text-muted-foreground"}`}
            >
              {booking.status}
            </span>
            {booking.hasCancellationProtection && (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-900 ring-1 ring-sky-200">
                Protected
              </span>
            )}
          </div>
        </header>

        {/* ── Route row: FROM → plane → TO ── */}
        <div className="mt-7 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">From</p>
            <p className="mt-1.5 font-mono text-3xl font-black tabular-nums text-primary md:text-4xl">
              {booking.flight.origin}
            </p>
          </div>
          <div className="flex flex-col items-center flex-shrink-0 px-4">
            <Plane
              data-ticket-plane
              className="h-6 w-6 -rotate-45 text-[var(--color-gold)] drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
              strokeWidth={2}
              aria-hidden
            />
            <div className="mt-1.5 h-px w-16 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:w-28" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">To</p>
            <p className="mt-1.5 font-mono text-3xl font-black tabular-nums text-primary md:text-4xl">
              {booking.flight.destination}
            </p>
          </div>
        </div>

        {/* ── Total paid — on its own row, no overlap possible ── */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-border/50 bg-primary/[0.04] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Paid</p>
          <p data-ticket-price className="font-mono text-2xl font-black text-primary">
            ₹{booking.totalAmount.toLocaleString("en-IN")}
          </p>
        </div>

        {/* ── Info grid: date / passenger / seat ── */}
        <div className="mt-6 grid gap-6 border-t border-border/40 pt-6 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date &amp; time</p>
            <p className="mt-2 text-sm font-semibold leading-snug">{dateStr}</p>
            <p className="mt-0.5 font-mono text-sm text-muted-foreground">{timeStr}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Passenger</p>
            <p className="mt-2 text-sm font-semibold">
              {booking.passengerName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seat &amp; cabin</p>
            <p className="mt-2 font-mono text-sm font-bold">{seatList || "—"}</p>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">{seatClass.toLowerCase()}</p>
          </div>
        </div>

        {/* ── Actions ── */}
        {confirmed && (
          <div
            data-ticket-actions
            className="mt-8 flex flex-wrap gap-4 border-t border-border/40 pt-6"
            style={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={onBoardingPass}
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition-[transform,box-shadow] duration-300 hover:shadow-xl"
            >
              Boarding pass
            </button>
            <button
              type="button"
              onClick={onChangeSeats}
              className="rounded-full border-2 border-primary/20 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground transition-colors duration-300 hover:bg-secondary/60"
            >
              Change seats
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-red-200 bg-red-50/80 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-red-700 transition-colors duration-300 hover:bg-red-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
