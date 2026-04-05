"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HeroVideoBackground } from "@/components/hero-video-background";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <HeroVideoBackground overlayOpacity={0.55} />
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto w-full max-w-md text-center"
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white"
          >
            <span className="text-lg">✈</span>
            <span className="tracking-wide">SkyVoyage</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <div className="mt-3 text-sm text-white/80">{subtitle}</div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
          className="mx-auto mt-8 w-full max-w-md"
        >
          <div className="glass-premium rounded-3xl border border-white/25 p-8 shadow-2xl shadow-black/25">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
