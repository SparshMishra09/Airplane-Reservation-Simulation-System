"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { adminGet } from "@/lib/admin-api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminGet("/analytics/summary"),
      adminGet("/analytics/timeline?days=7"),
    ])
      .then(([sum, tl]) => {
        setSummary(sum);
        setTimeline(tl);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = summary
    ? [
        { label: "Total Revenue", value: `₹${summary.totalRevenue?.toLocaleString("en-IN") || 0}`, icon: "💰", gradient: "from-emerald-500 to-teal-600" },
        { label: "Avg Ticket Value", value: `₹${summary.avgTicketValue?.toLocaleString("en-IN") || 0}`, icon: "🎟️", gradient: "from-blue-500 to-indigo-600" },
        { label: "Total Bookings", value: summary.totalBookings || 0, icon: "🎫", gradient: "from-violet-500 to-purple-600" },
        { label: "Total Flights", value: summary.totalFlights || 0, icon: "✈️", gradient: "from-amber-500 to-orange-600" },
        { label: "Active Bookings", value: summary.activeBookings || 0, icon: "📈", gradient: "from-rose-500 to-pink-600" },
        { label: "Avg Occupancy", value: `${summary.avgOccupancy || 0}%`, icon: "💺", gradient: "from-cyan-500 to-sky-600" },
      ]
    : [];

  const maxRevenue = Math.max(...timeline.map((d) => d.revenue), 1);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Operations Center</p>
        <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mb-8">Real-time overview of your airline operations.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-lg relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold text-white mb-6">Revenue Trend (Last 7 Days)</h3>
            <div className="flex items-end gap-3 h-44">
              {timeline.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400">₹{d.revenue?.toLocaleString("en-IN")}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: maxRevenue > 0 ? `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` : "4%" }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 min-h-[4px]"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {timeline.map((d) => (
                <span key={d.date} className="flex-1 text-center text-[10px] text-slate-500">
                  {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
