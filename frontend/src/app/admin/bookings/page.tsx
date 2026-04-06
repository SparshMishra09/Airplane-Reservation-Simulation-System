"use client";

import { motion } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { adminGet, adminPatch, adminPost } from "@/lib/admin-api";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/20",
  REFUNDED: "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

export default function AdminBookingsPage() {
  const [data, setData] = useState<any>({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ pnr: "", passengerName: "", status: "", flightNumber: "", dateFrom: "", dateTo: "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadBookings = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.pnr) params.set("pnr", filters.pnr);
    if (filters.passengerName) params.set("passengerName", filters.passengerName);
    if (filters.status) params.set("status", filters.status);
    if (filters.flightNumber) params.set("flightNumber", filters.flightNumber);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    params.set("page", String(page));
    params.set("limit", "15");

    adminGet(`/bookings?${params.toString()}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    try {
      await adminPatch(`/bookings/${id}/confirm`);
      loadBookings();
    } catch (err: any) { alert(err.message); }
    setActionLoading(null);
  };

  const handleRefund = async (id: string) => {
    if (!confirm("Issue refund for this booking? This will contact the payment gateway.")) return;
    setActionLoading(id);
    try {
      const result = await adminPost(`/bookings/${id}/refund`, { reason: "Admin-initiated refund" });
      alert(`✅ Refund successful!\nTransaction ID: ${result.refund?.transactionId}`);
      loadBookings();
    } catch (err: any) {
      alert(`❌ Refund failed: ${err.message}`);
    }
    setActionLoading(null);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Operations</p>
        <h1 className="text-3xl font-bold text-white">Booking Search</h1>
        <p className="text-slate-400 text-sm mt-1 mb-6">Search, filter, and manage all bookings. Manually confirm, change seats, or issue refunds.</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 mb-6 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">PNR</label>
            <input value={filters.pnr} onChange={(e) => setFilters({ ...filters, pnr: e.target.value.toUpperCase() })} placeholder="ABC123" maxLength={6} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Passenger</label>
            <input value={filters.passengerName} onChange={(e) => setFilters({ ...filters, passengerName: e.target.value })} placeholder="Name" className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Flight</label>
            <input value={filters.flightNumber} onChange={(e) => setFilters({ ...filters, flightNumber: e.target.value })} placeholder="SV-101" className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
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
        <div className="flex gap-2 mt-3">
          <button onClick={() => { setPage(1); loadBookings(); }} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors">Search</button>
          <button onClick={() => { setFilters({ pnr: "", passengerName: "", status: "", flightNumber: "", dateFrom: "", dateTo: "" }); setPage(1); }} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-700/50 transition-colors">Clear</button>
        </div>
      </motion.div>

      {/* Bookings Table */}
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
            <p className="text-4xl mb-3">🎫</p>
            <p className="font-medium">No bookings found</p>
            <p className="text-sm">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">PNR</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Passenger</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Flight</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Route</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((b: any) => (
                  <tr key={b.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                    <td className="px-5 py-4 font-mono font-bold text-blue-400">{b.pnr}</td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm">{b.passengerName || b.user?.name || "—"}</p>
                      <p className="text-slate-500 text-xs">{b.passengerEmail || b.user?.email || ""}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-300">{b.flight?.flightNumber}</td>
                    <td className="px-5 py-4 text-slate-400">{b.flight?.origin} → {b.flight?.destination}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-400">₹{b.totalAmount?.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusColors[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {b.status === "PENDING" && (
                          <button onClick={() => handleConfirm(b.id)} disabled={actionLoading === b.id} className="text-xs text-emerald-400 font-medium hover:text-emerald-300 disabled:opacity-50">
                            {actionLoading === b.id ? "..." : "Confirm"}
                          </button>
                        )}
                        {(b.status === "CONFIRMED" || b.status === "PENDING") && (
                          <button onClick={() => handleRefund(b.id)} disabled={actionLoading === b.id} className="text-xs text-violet-400 font-medium hover:text-violet-300 disabled:opacity-50">
                            {actionLoading === b.id ? "Processing..." : "Refund"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data.pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)</span>
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
