"use client";

import { motion } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { adminGet } from "@/lib/admin-api";

const actionColors: Record<string, string> = {
  FLIGHT_CREATED: "bg-emerald-500/15 text-emerald-400",
  FLIGHT_UPDATED: "bg-blue-500/15 text-blue-400",
  FLIGHT_PRICE_CHANGED: "bg-amber-500/15 text-amber-400",
  FLIGHT_CANCELLED: "bg-red-500/15 text-red-400",
  FLIGHT_CLONED: "bg-violet-500/15 text-violet-400",
  BOOKING_MANUALLY_CONFIRMED: "bg-emerald-500/15 text-emerald-400",
  SEAT_CHANGED_BY_ADMIN: "bg-cyan-500/15 text-cyan-400",
  REFUND_ISSUED: "bg-violet-500/15 text-violet-400",
  REFUND_FAILED: "bg-red-500/15 text-red-400",
  MEAL_CATEGORY_CREATED: "bg-amber-500/15 text-amber-400",
  MEAL_ITEM_CREATED: "bg-emerald-500/15 text-emerald-400",
  MEAL_ITEM_UPDATED: "bg-blue-500/15 text-blue-400",
  MEAL_ITEM_DEACTIVATED: "bg-red-500/15 text-red-400",
  BAGGAGE_POLICY_CREATED: "bg-emerald-500/15 text-emerald-400",
  BAGGAGE_POLICY_UPDATED: "bg-blue-500/15 text-blue-400",
  BAGGAGE_POLICY_DEACTIVATED: "bg-red-500/15 text-red-400",
};

export default function AuditLogsPage() {
  const [data, setData] = useState<any>({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: "", entityType: "", dateFrom: "", dateTo: "" });
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.action) params.set("action", filters.action);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    params.set("page", String(page));
    params.set("limit", "20");

    adminGet(`/audit-logs?${params.toString()}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const formatDetails = (details: string) => {
    try {
      return JSON.stringify(JSON.parse(details), null, 2);
    } catch {
      return details;
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Compliance</p>
        <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
        <p className="text-slate-400 text-sm mt-1 mb-6">Immutable trail — who changed what, and when.</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 mb-6 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Action Type</label>
            <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
              <option value="">All Actions</option>
              {Object.keys(actionColors).map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Entity Type</label>
            <select value={filters.entityType} onChange={(e) => setFilters({ ...filters, entityType: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
              <option value="">All</option>
              <option value="Flight">Flight</option>
              <option value="Booking">Booking</option>
              <option value="MealCategory">Meal Category</option>
              <option value="MealItem">Meal Item</option>
              <option value="BaggagePolicy">Baggage Policy</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
          </div>
        </div>
      </motion.div>

      {/* Audit Log Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm"
      >
        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full" /></div>
        ) : data.data.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No audit logs yet</p>
            <p className="text-sm">Actions will appear here as admins make changes.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {data.data.map((log: any) => (
              <div key={log.id} className="hover:bg-slate-700/20 transition-colors">
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <div className="flex-shrink-0">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${actionColors[log.action] || "bg-slate-700 text-slate-300"}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="text-slate-400">{log.entityType}</span> <span className="font-mono text-xs text-slate-500">{log.entityId?.slice(0, 8)}…</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">{log.adminName || "System"}</p>
                    <p className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <span className="text-slate-500 text-xs">{expandedId === log.id ? "▲" : "▼"}</span>
                </div>
                {expandedId === log.id && (
                  <div className="px-5 pb-4">
                    <pre className="text-xs text-slate-300 bg-slate-900/50 rounded-xl p-4 overflow-x-auto border border-slate-700/30 font-mono">
                      {formatDetails(log.details)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">Page {data.pagination.page} of {data.pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 rounded-lg border border-slate-600 text-slate-300 text-xs disabled:opacity-30 hover:bg-slate-700/50">← Prev</button>
              <button onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))} disabled={page >= data.pagination.totalPages} className="px-3 py-1 rounded-lg border border-slate-600 text-slate-300 text-xs disabled:opacity-30 hover:bg-slate-700/50">Next →</button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
