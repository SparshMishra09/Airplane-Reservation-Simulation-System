"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { adminGet, adminPost, adminPatch, adminDelete } from "@/lib/admin-api";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  DELAYED: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/20",
  COMPLETED: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

export default function FlightSchedulerPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<any>(null);
  const [form, setForm] = useState({
    flightNumber: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    aircraftId: "",
    basePrice: "",
    airline: "SkyVoyage",
    recurrence: "NONE",
    isTemplate: false,
  });

  const loadData = () => {
    Promise.all([adminGet("/flights"), adminGet("/aircraft")])
      .then(([f, a]) => {
        setFlights(f);
        setAircraft(a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    try {
      await adminPost("/flights", {
        ...form,
        basePrice: parseFloat(form.basePrice),
        isTemplate: form.recurrence !== "NONE" ? true : form.isTemplate,
      });
      setShowAddModal(false);
      setForm({ flightNumber: "", origin: "", destination: "", departureTime: "", arrivalTime: "", aircraftId: "", basePrice: "", airline: "SkyVoyage", recurrence: "NONE", isTemplate: false });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingFlight) return;
    try {
      const updates: any = {};
      if (form.basePrice) updates.basePrice = parseFloat(form.basePrice);
      if (form.departureTime) updates.departureTime = form.departureTime;
      if (form.arrivalTime) updates.arrivalTime = form.arrivalTime;
      if (form.origin) updates.origin = form.origin;
      if (form.destination) updates.destination = form.destination;
      if (form.recurrence) updates.recurrence = form.recurrence;
      await adminPatch(`/flights/${editingFlight.id}`, updates);
      setEditingFlight(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this flight?")) return;
    try {
      await adminDelete(`/flights/${id}`);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleClone = async (id: string) => {
    try {
      await adminPost(`/flights/${id}/clone`);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Operations</p>
            <h1 className="text-3xl font-bold text-white">Flight Scheduler</h1>
            <p className="text-slate-400 text-sm mt-1">Create and manage flight routes with recurring schedules.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
          >
            ➕ Add Flight
          </button>
        </div>
      </motion.div>

      {/* Flight Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm"
      >
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full" />
          </div>
        ) : flights.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">✈️</p>
            <p className="font-medium">No flights yet</p>
            <p className="text-sm">Create your first flight to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Flight</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Route</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recurrence</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupancy</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f) => (
                  <tr key={f.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-white">{f.flightNumber}</td>
                    <td className="px-5 py-4 text-slate-300">{f.origin} → {f.destination}</td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(f.departureTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-5 py-4 text-slate-300">₹{f.basePrice?.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusColors[f.status] || "bg-slate-700 text-slate-300"}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {f.isTemplate && <span className="text-blue-400 font-medium">{f.recurrence || "—"}</span>}
                      {!f.isTemplate && <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(f._stats?.occupancy || 0) > 85 ? "bg-red-500" : (f._stats?.occupancy || 0) > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${f._stats?.occupancy || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{f._stats?.occupancy || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-400">₹{(f._stats?.revenue || 0).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingFlight(f); setForm({ ...form, basePrice: String(f.basePrice), origin: f.origin, destination: f.destination, recurrence: f.recurrence || "NONE" }); }} className="text-xs text-blue-400 font-medium hover:text-blue-300 transition-colors">Edit</button>
                        <button onClick={() => handleClone(f.id)} className="text-xs text-violet-400 font-medium hover:text-violet-300 transition-colors">Clone</button>
                        {f.status !== "CANCELLED" && (
                          <button onClick={() => handleCancel(f.id)} className="text-xs text-red-400 font-medium hover:text-red-300 transition-colors">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Flight Modal */}
      <AnimatePresence>
        {(showAddModal || editingFlight) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowAddModal(false); setEditingFlight(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white mb-6">
                {editingFlight ? "Edit Flight" : "Schedule New Flight"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {!editingFlight && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Flight Number</label>
                    <input value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} placeholder="SV-101" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Origin (IATA)</label>
                  <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })} placeholder="DEL" maxLength={3} className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Destination (IATA)</label>
                  <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value.toUpperCase() })} placeholder="BOM" maxLength={3} className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                </div>
                {!editingFlight && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Departure</label>
                      <input type="datetime-local" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Arrival</label>
                      <input type="datetime-local" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Aircraft</label>
                      <select value={form.aircraftId} onChange={(e) => setForm({ ...form, aircraftId: e.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30">
                        <option value="">Select</option>
                        {aircraft.map((a: any) => (
                          <option key={a.id} value={a.id}>{a.model} ({a.capacity} seats)</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Base Price (₹)</label>
                  <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="4500" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Recurrence</label>
                  <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30">
                    <option value="NONE">None (one-time)</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowAddModal(false); setEditingFlight(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700/50 transition-colors">
                  Cancel
                </button>
                <button onClick={editingFlight ? handleUpdate : handleCreate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all">
                  {editingFlight ? "Update Flight" : "Schedule Flight"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
