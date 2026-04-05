"use client";

import Navbar from "@/components/navbar";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,oklch(0.55_0.12_250/0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Contact</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">We&apos;re here to help</h1>
            <p className="mt-4 text-muted-foreground">
              Reach our reservations desk for changes, group bookings, or partnership inquiries. This
              demo form shows a success state only — wire it to your backend when you&apos;re ready.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 }}
              className="glass card-lift rounded-3xl border border-border/80 p-8 lg:col-span-2"
            >
              <h2 className="text-lg font-semibold">SkyVoyage support</h2>
              <ul className="mt-6 space-y-5 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span>
                    <span className="font-medium text-foreground">Phone</span>
                    <br />
                    +1 (800) 555-0199
                  </span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span>
                    <span className="font-medium text-foreground">Email</span>
                    <br />
                    care@skyvoyage.example
                  </span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span>
                    <span className="font-medium text-foreground">Head office</span>
                    <br />
                    Terminal Row, Suite 400
                    <br />
                    San Francisco, CA
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="glass-premium rounded-3xl border border-border/60 p-8 shadow-xl lg:col-span-3"
            >
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
                    </label>
                    <input required className="input-airline bg-white" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      className="input-airline bg-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="input-airline resize-none bg-white"
                    placeholder="How can we help?"
                  />
                </div>
                {sent && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    Thanks — your message has been recorded for this demo.
                  </p>
                )}
                <button type="submit" className="btn-airline-primary flex w-full items-center justify-center gap-2 py-3.5">
                  <Send className="h-4 w-4" aria-hidden />
                  Send message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
