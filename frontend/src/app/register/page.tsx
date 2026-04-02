"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "motion/react";
import { AuthShell } from "@/components/auth-shell";
import { HeroVideoBackground } from "@/components/hero-video-background";
import { User, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <HeroVideoBackground overlayOpacity={0.55} />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium w-full max-w-md rounded-3xl border border-white/35 p-10 text-center shadow-2xl"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" aria-hidden />
            </span>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">Check your inbox</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-semibold text-foreground">{email}</span>. Open it to activate your
              SkyVoyage account.
            </p>
            <Link
              href="/login"
              className="btn-airline-primary mt-8 inline-flex w-full justify-center py-3.5"
            >
              Return to sign in
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Join SkyVoyage"
      subtitle={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleRegister}>
        <div>
          <label htmlFor="reg-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-airline pl-11"
              placeholder="Alex Morgan"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-airline pl-11"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-airline pl-11"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          disabled={loading}
          type="submit"
          className="btn-airline-primary w-full py-3.5 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
