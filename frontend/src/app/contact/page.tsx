"use client";

import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, Send, Plane, Ticket, CheckCircle, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0">
          {/* Sky gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,oklch(0.55_0.12_250/0.25),transparent_55%)]" />
          
          {/* Flying airplane animation */}
          <motion.div
            className="absolute top-20 -left-20 opacity-10"
            animate={{ x: ["0vw", "110vw"], y: [0, -30] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <Plane className="h-16 w-16 text-primary rotate-12" />
          </motion.div>

          {/* Second airplane */}
          <motion.div
            className="absolute top-40 -left-20 opacity-5"
            animate={{ x: ["0vw", "110vw"], y: [0, -20] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 10 }}
          >
            <Plane className="h-12 w-12 text-primary -rotate-12" />
          </motion.div>

          {/* Floating clouds */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20 blur-2xl"
              style={{
                width: `${150 + i * 50}px`,
                height: `${60 + i * 20}px`,
                top: `${10 + i * 15}%`,
              }}
              animate={{ x: ["-200px", "calc(100vw + 200px)"] }}
              transition={{
                duration: 40 + i * 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 5,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
            >
              <Plane className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Contact Us</span>
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Ready to Assist Your Journey</h1>
            <p className="mt-4 text-muted-foreground">
              Our customer support team is here to help with your reservations, changes, or any questions about your upcoming flight.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-5">
            {/* Contact Info Card - Boarding Pass Style */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/5 to-primary/10 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl lg:col-span-2"
            >
              {/* Decorative ticket holes */}
              <div className="absolute -left-3 top-1/4 h-6 w-6 rounded-full bg-background" />
              <div className="absolute -left-3 top-1/2 h-6 w-6 rounded-full bg-background" />
              <div className="absolute -left-3 top-3/4 h-6 w-6 rounded-full bg-background" />
              
              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <Ticket className="h-6 w-6 text-primary" />
                  <h2 className="text-lg font-semibold">Customer Support</h2>
                </div>

                {/* Runway divider */}
                <div className="mb-6 h-px w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                <ul className="space-y-6 text-sm text-muted-foreground">
                  <motion.li 
                    className="flex gap-3 cursor-pointer group/item"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover/item:bg-primary/20">
                      <Phone className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-primary/70">Phone</span>
                      <a href="tel:9075619050" className="font-medium text-foreground transition-colors hover:text-primary">
                        9075619050
                      </a>
                      <span className="block text-xs text-muted-foreground mt-1">Available 24/7</span>
                    </div>
                  </motion.li>

                  <motion.li 
                    className="flex gap-3 cursor-pointer group/item"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover/item:bg-primary/20">
                      <Mail className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-primary/70">Email</span>
                      <a href="mailto:skyvoyage09@gmail.com" className="font-medium text-foreground transition-colors hover:text-primary break-all">
                        skyvoyage09@gmail.com
                      </a>
                      <span className="block text-xs text-muted-foreground mt-1">We respond within 24 hours</span>
                    </div>
                  </motion.li>

                  <motion.li 
                    className="flex gap-3 group/item"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover/item:bg-primary/20">
                      <MapPin className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-primary/70">Head Office</span>
                      <span className="font-medium text-foreground">
                        Terminal Row, Suite 400
                        <br />
                        San Francisco, CA
                      </span>
                    </div>
                  </motion.li>
                </ul>

                {/* Bottom decorative element */}
                <div className="mt-8 rounded-xl bg-primary/5 p-4 text-center">
                  <p className="text-xs font-semibold text-primary">Emergency Hotline</p>
                  <a href="tel:9075619050" className="mt-1 block text-lg font-bold text-primary hover:text-primary/80 transition-colors">
                    9075619050
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-white to-white/90 p-8 shadow-xl backdrop-blur-sm lg:col-span-3"
            >
              {/* Decorative corner elements */}
              <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />
              <div className="absolute -bottom-2 -left-2 h-20 w-20 rounded-full bg-gradient-to-tr from-primary/10 to-transparent" />

              <form onSubmit={handleSubmit} className="relative space-y-5">
                <div className="mb-2 flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Send Us a Message</h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Plane className="h-3 w-3" />
                      Your Name
                    </label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-airline bg-white transition-all duration-300"
                      placeholder="John Doe"
                      disabled={submitting}
                    />
                  </motion.div>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-airline bg-white transition-all duration-300"
                      placeholder="you@example.com"
                      disabled={submitting}
                    />
                  </motion.div>
                </div>

                <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Ticket className="h-3 w-3" />
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-airline resize-none bg-white transition-all duration-300"
                    placeholder="How can we assist you with your flight reservation?"
                    disabled={submitting}
                  />
                </motion.div>

                {/* Success/Error Messages */}
                <AnimatePresence mode="wait">
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-4 py-4 text-sm font-medium text-emerald-800"
                    >
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <div>
                        <p className="font-semibold">Message Sent Successfully!</p>
                        <p className="text-xs text-emerald-700 mt-1">We&apos;ll get back to you within 24 hours.</p>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 px-4 py-4 text-sm font-medium text-red-800"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="btn-airline-primary flex w-full items-center justify-center gap-2 py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending your message...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
