"use client";

import Navbar from "@/components/navbar";
import Link from "next/link";
import { motion } from "motion/react";
import { HeroVideoBackground } from "@/components/hero-video-background";
import {
  Plane,
  ShieldCheck,
  Sparkles,
  Headphones,
  Clock,
  Award,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

const featured = [
  {
    city: "Dubai",
    code: "DXB",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80&auto=format&fit=crop",
  },
  {
    city: "Paris",
    code: "CDG",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80&auto=format&fit=crop",
  },
  {
    city: "Tokyo",
    code: "NRT",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80&auto=format&fit=crop",
  },
  {
    city: "New York",
    code: "JFK",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900&q=80&auto=format&fit=crop",
  },
];

const pillars = [
  {
    icon: Plane,
    title: "Global network",
    desc: "Search live schedules and demo routes with a cabin experience inspired by full-service carriers.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted booking",
    desc: "Secure sign-in with Supabase, clear fare breakdowns, and seat holds that mirror real airline flows.",
  },
  {
    icon: Sparkles,
    title: "Premium cabin feel",
    desc: "Pick seats in real time, add baggage and meals, and finish with a polished checkout experience.",
  },
  {
    icon: Headphones,
    title: "24/7 care",
    desc: "Manage trips, change seats, and cancel with transparent fees — just like a modern airline portal.",
  },
  {
    icon: Clock,
    title: "On-time clarity",
    desc: "Departure and arrival windows, duration, and route context are always visible on every card.",
  },
  {
    icon: Award,
    title: "SkyVoyage standards",
    desc: "A cohesive deep-blue brand, gold highlights, and motion that feels calm — not chaotic.",
  },
];

export default function Home() {
  return (
    <>
      <div className="relative min-h-[100svh]">
        <HeroVideoBackground overlayOpacity={0.5} />
        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <Navbar />
          <section className="flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-6 text-center md:px-6 md:pb-28 md:pt-10">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-sky-100/90"
            >
              SkyVoyage Airlines
            </motion.p>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl"
            >
              Explore the World with Comfort
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mx-auto mt-5 max-w-xl text-base text-white/85 md:text-lg"
            >
              Curated routes, elegant cabin design, and a booking flow that feels as refined as the
              journey itself.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-16 flex justify-center"
              aria-hidden
            >
              <div className="relative flex w-full max-w-sm items-center justify-center md:max-w-md">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <span className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-lg backdrop-blur-md">
                  <Plane className="h-5 w-5 -rotate-45 text-[var(--color-gold-light)]" strokeWidth={2} />
                </span>
              </div>
            </motion.div>
          </section>
        </div>
      </div>

      <section className="relative z-0 bg-gradient-to-b from-background via-secondary/25 to-background px-4 py-20 md:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Featured destinations
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Where will you fly next?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Hand-picked cities with rich culture and seamless connections — tap a card to start your
              search.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((d, i) => (
              <motion.div
                key={d.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <Link
                  href="/flights"
                  className="card-lift group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${d.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-left text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-100/90">
                      {d.code}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{d.city}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-gold-light)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      View flights <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40 px-4 py-20 backdrop-blur-sm md:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why choose us
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              The SkyVoyage difference
            </h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="card-lift rounded-2xl border border-border/80 bg-white/80 p-7 shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </motion.div>
            );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-primary px-4 py-14 text-primary-foreground md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg ring-1 ring-white/20">
                ✈
              </span>
              <span className="text-xl font-bold tracking-tight">SkyVoyage</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/75">
              Premium airline-style reservations with seat maps, transparent fees, and a calm, modern
              experience.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div>
              <p className="font-semibold text-[var(--color-gold-light)]">Explore</p>
              <ul className="mt-3 space-y-2 text-white/75">
                <li>
                  <Link href="/flights" className="transition hover:text-white">
                    Book flights
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="transition hover:text-white">
                    My trips
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-gold-light)]">Account</p>
              <ul className="mt-3 space-y-2 text-white/75">
                <li>
                  <Link href="/login" className="transition hover:text-white">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="transition hover:text-white">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-center text-xs text-white/55">
          © {new Date().getFullYear()} SkyVoyage Airlines. Built with Next.js and Supabase.
        </p>
      </footer>
    </>
  );
}
