"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Plane } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/flights", label: "Book flights" },
  { href: "/bookings", label: "My trips", authOnly: true as const },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function RunwayLights() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-px overflow-hidden opacity-80"
      aria-hidden
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0, transparent 10px, rgba(212,160,23,0.85) 10px, rgba(212,160,23,0.85) 14px, transparent 14px, transparent 28px)",
        }}
      />
    </div>
  );
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const solid = scrolled;
  const onHero = isHome && !solid;

  const shellClass = solid
    ? "bg-[oklch(0.2_0.06_265)]/96 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] border-b border-white/[0.08]"
    : onHero
      ? "bg-transparent border-b border-transparent"
      : "bg-[oklch(0.99_0.005_260)]/92 backdrop-blur-xl border-b border-primary/10 shadow-sm";

  const linkBase =
    solid || onHero
      ? "text-white/80 hover:text-white"
      : "text-muted-foreground hover:text-primary";

  const linkActive =
    solid || onHero ? "text-white font-semibold" : "text-primary font-semibold";

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-300 ease-out ${shellClass}`}
    >
      <div className="relative mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Subtle contrail / flight path (hero only) */}
        {onHero && (
          <div
            className="pointer-events-none absolute left-[18%] top-1/2 hidden h-px w-[40%] -translate-y-1/2 md:block"
            aria-hidden
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 80%, transparent)",
            }}
          />
        )}

        <Link
          href="/"
          className="group relative z-10 flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 rounded-xl"
        >
          <span
            className={`relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-[1.04] ${
              solid || onHero
                ? "bg-gradient-to-br from-sky-400/30 via-white/10 to-[var(--color-gold)]/35 ring-2 ring-white/20"
                : "bg-gradient-to-br from-primary via-[oklch(0.35_0.12_260)] to-primary ring-2 ring-primary/20"
            }`}
          >
            <Plane
              className={`h-5 w-5 -rotate-45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                solid || onHero ? "text-white drop-shadow-sm" : "text-primary-foreground"
              }`}
              strokeWidth={2.25}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-gold)] shadow-[0_0_10px_rgba(212,160,23,0.9)]"
              aria-hidden
            />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={`text-[0.65rem] font-bold uppercase tracking-[0.35em] ${
                solid || onHero ? "text-sky-200/90" : "text-primary/80"
              }`}
            >
              Airlines
            </span>
            <span
              className={`mt-0.5 text-lg font-bold tracking-[0.12em] ${
                solid || onHero ? "text-white" : "text-primary"
              }`}
            >
              SKYVOYAGE
            </span>
          </span>
        </Link>

        <nav
          className={`relative z-10 hidden items-center gap-1 rounded-full px-1 py-1 md:flex ${
            onHero
              ? "bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
              : solid
                ? "bg-white/5 ring-1 ring-white/10"
                : "bg-primary/[0.06] ring-1 ring-primary/10"
          }`}
          aria-label="Main"
        >
          {links
            .filter((l) => !l.authOnly || user)
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  pathname === l.href ? linkActive : linkBase
                } ${!solid && !onHero ? "" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          {user && (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                pathname === "/admin" ? linkActive : linkBase
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="relative z-10 hidden items-center gap-2 md:flex">
          {user ? (
            <button
              type="button"
              onClick={() => signOut()}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                solid || onHero
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                solid || onHero
                  ? "text-white/85 hover:bg-white/10"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/flights"
            className={`group relative overflow-hidden rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-[transform,box-shadow] duration-300 ${
              solid || onHero
                ? "bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-amber-600 text-[oklch(0.18_0.06_75)] shadow-black/30 hover:shadow-xl"
                : "bg-gradient-to-r from-primary to-[oklch(0.42_0.14_260)] text-primary-foreground shadow-primary/30 hover:shadow-primary/40"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plane className="h-3.5 w-3.5 -rotate-45" strokeWidth={2.5} aria-hidden />
              Book
            </span>
            <span
              className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full"
              aria-hidden
            />
          </Link>
        </div>

        <button
          type="button"
          className={`relative z-10 rounded-xl p-2 md:hidden ${
            solid || onHero ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary"
          }`}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <RunwayLights />
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`border-t md:hidden ${
            solid || onHero
              ? "border-white/10 bg-[oklch(0.18_0.06_265)]/98"
              : "border-border bg-background/98"
          } backdrop-blur-xl`}
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {links
              .filter((l) => !l.authOnly || user)
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    solid || onHero
                      ? "text-white/90 hover:bg-white/10"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            {user && (
              <Link
                href="/admin"
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  solid || onHero ? "text-white/90 hover:bg-white/10" : "hover:bg-secondary"
                }`}
              >
                Admin
              </Link>
            )}
            <div
              className={`mt-2 flex flex-col gap-2 border-t pt-4 ${
                solid || onHero ? "border-white/10" : "border-border"
              }`}
            >
              {user ? (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                    solid || onHero ? "text-red-200 hover:bg-white/10" : "text-red-600 hover:bg-secondary"
                  }`}
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    solid || onHero ? "text-white hover:bg-white/10" : "hover:bg-secondary"
                  }`}
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/flights"
                className="mx-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] py-3 text-sm font-bold text-[oklch(0.18_0.06_75)] shadow-md"
              >
                <Plane className="h-4 w-4 -rotate-45" />
                Book flights
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
