"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { adminGet } from "@/lib/admin-api";

export default function RevenueAnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminGet("/analytics/summary"),
      adminGet("/analytics/routes"),
      adminGet(`/analytics/timeline?days=${days}`),
    ])
      .then(([s, r, t]) => {
        setSummary(s);
        setRoutes(r);
        setTimeline(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const maxRevenue = Math.max(...timeline.map((d) => d.revenue), 1);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Intelligence</p>
        <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>
        <p className="text-slate-400 text-sm mt-1 mb-8">Total revenue, average ticket value, and occupancy rates across routes.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Revenue", value: `₹${(summary?.totalRevenue || 0).toLocaleString("en-IN")}`, icon: "💰", gradient: "from-emerald-500 to-teal-600" },
              { label: "Avg Ticket Value", value: `₹${(summary?.avgTicketValue || 0).toLocaleString("en-IN")}`, icon: "🎟️", gradient: "from-blue-500 to-indigo-600" },
              { label: "Total Bookings", value: summary?.totalBookings || 0, icon: "🎫", gradient: "from-violet-500 to-purple-600" },
              { label: "Avg Occupancy", value: `${summary?.avgOccupancy || 0}%`, icon: "📈", gradient: "from-amber-500 to-orange-600" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-lg relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
                <span className="text-2xl block mb-2">{stat.icon}</span>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Revenue Timeline Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 mb-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
              <div className="flex gap-2">
                {[7, 14, 30].map((d) => (
                  <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${days === d ? "bg-blue-600 text-white" : "border border-slate-600 text-slate-400 hover:bg-slate-700/50"}`}>
                    {d}D
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-1 h-48">
              {timeline.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: maxRevenue > 0 ? `${Math.max((d.revenue / maxRevenue) * 100, 2)}%` : "2%" }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 min-h-[2px] hover:from-blue-500 hover:to-blue-300 transition-colors cursor-pointer"
                    title={`${d.date}: ₹${d.revenue?.toLocaleString("en-IN")}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 overflow-hidden">
              {timeline.filter((_, i) => i % Math.ceil(timeline.length / 10) === 0).map((d) => (
                <span key={d.date} className="text-[9px] text-slate-500">
                  {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Route Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm"
          >
            <div className="px-6 py-4 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white">Route Performance</h3>
            </div>
            {routes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No route data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Route</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Flights</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Revenue</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r) => (
                      <tr key={r.route} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="px-5 py-4 font-medium text-white">{r.route}</td>
                        <td className="px-5 py-4 text-slate-300">{r.flights}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-400">₹{r.revenue?.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-slate-700 overflow-hidden">
                              <div className={`h-full rounded-full ${r.occupancy > 85 ? "bg-red-500" : r.occupancy > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${r.occupancy}%` }} />
                            </div>
                            <span className="text-xs text-slate-400">{r.occupancy}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </>
  );
}
