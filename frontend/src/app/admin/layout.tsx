"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { getAPIUrl } from "@/lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

const API_URL = getAPIUrl();

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", id: "dashboard" },
  { href: "/admin/flights", label: "Flight Scheduler", icon: "✈️", id: "flights" },
  { href: "/admin/bookings", label: "Bookings", icon: "🎫", id: "bookings" },
  { href: "/admin/analytics", label: "Revenue Analytics", icon: "💰", id: "analytics" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "📋", id: "audit-logs" },
  { href: "/admin/meals", label: "Meal Catalog", icon: "🍽️", id: "meals" },
  { href: "/admin/baggage", label: "Baggage Policies", icon: "🧳", id: "baggage" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !session) {
      router.push("/");
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data?.role === "ADMIN") {
            setIsAdmin(true);
            setAdminName(data.name || "Admin");
            return;
          }
        }
        router.push("/");
      })
      .catch(() => router.push("/"));
  }, [user, session, authLoading]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin h-10 w-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full" />
        <p className="text-sm text-slate-400">Verifying administrator access…</p>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/60 fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
              SV
            </div>
            <div>
              <p className="text-sm font-bold text-white">SkyVoyage</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.href) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
              )}
            </Link>
          ))}
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-xl"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/60 z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-800/60">
                <p className="text-sm font-bold text-white">SkyVoyage Admin</p>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
