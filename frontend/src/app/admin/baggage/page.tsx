"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { adminGet, adminPost, adminPatch, adminDelete } from "@/lib/admin-api";

export default function BaggagePolicyPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [form, setForm] = useState({ name: "", freeWeightKg: "", maxWeightKg: "", extraCostPerKg: "" });

  const loadData = () => {
    adminGet("/baggage-policies")
      .then(setPolicies)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await adminPost("/baggage-policies", {
        name: form.name,
        freeWeightKg: parseFloat(form.freeWeightKg) || 0,
        maxWeightKg: parseFloat(form.maxWeightKg) || 0,
        extraCostPerKg: parseFloat(form.extraCostPerKg) || 0,
      });
      setForm({ name: "", freeWeightKg: "", maxWeightKg: "", extraCostPerKg: "" });
      setShowAddModal(false);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdate = async () => {
    if (!editingPolicy) return;
    try {
      await adminPatch(`/baggage-policies/${editingPolicy.id}`, {
        name: form.name || undefined,
        freeWeightKg: form.freeWeightKg ? parseFloat(form.freeWeightKg) : undefined,
        maxWeightKg: form.maxWeightKg ? parseFloat(form.maxWeightKg) : undefined,
        extraCostPerKg: form.extraCostPerKg ? parseFloat(form.extraCostPerKg) : undefined,
      });
      setEditingPolicy(null);
      setForm({ name: "", freeWeightKg: "", maxWeightKg: "", extraCostPerKg: "" });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await adminDelete(`/baggage-policies/${id}`);
      } else {
        await adminPatch(`/baggage-policies/${id}`, { isActive: true });
      }
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const openEdit = (policy: any) => {
    setEditingPolicy(policy);
    setForm({
      name: policy.name,
      freeWeightKg: String(policy.freeWeightKg),
      maxWeightKg: String(policy.maxWeightKg),
      extraCostPerKg: String(policy.extraCostPerKg),
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Policies</p>
            <h1 className="text-3xl font-bold text-white">Baggage Policy Manager</h1>
            <p className="text-slate-400 text-sm mt-1">Define weight limits and extra baggage costs.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all">
            + Add Policy
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-800/50 animate-pulse" />)}
        </div>
      ) : policies.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl bg-slate-800/30 border border-slate-700/30">
          <p className="text-4xl mb-3">🧳</p>
          <p className="font-medium">No baggage policies defined</p>
          <p className="text-sm">Create your first policy to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((policy, i) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border p-6 transition-all ${
                policy.isActive
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-slate-800/20 border-slate-700/20 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg">{policy.name}</h3>
                <button
                  onClick={() => handleToggle(policy.id, policy.isActive)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${policy.isActive ? "bg-emerald-500" : "bg-slate-600"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${policy.isActive ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Free Allowance</span>
                  <span className="text-sm font-semibold text-white">{policy.freeWeightKg} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Max Weight</span>
                  <span className="text-sm font-semibold text-white">{policy.maxWeightKg} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Extra Cost</span>
                  <span className="text-sm font-bold text-amber-400">₹{policy.extraCostPerKg?.toLocaleString("en-IN")}/kg</span>
                </div>
              </div>

              {/* Weight visual bar */}
              <div className="mb-4">
                <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${(policy.freeWeightKg / policy.maxWeightKg) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-500">0 kg</span>
                  <span className="text-[10px] text-emerald-400">{policy.freeWeightKg} kg free</span>
                  <span className="text-[10px] text-slate-500">{policy.maxWeightKg} kg max</span>
                </div>
              </div>

              <button onClick={() => openEdit(policy)} className="w-full py-2 rounded-xl border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-700/50 transition-colors">
                Edit Policy
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingPolicy) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowAddModal(false); setEditingPolicy(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-white mb-6">
                {editingPolicy ? "Edit Baggage Policy" : "New Baggage Policy"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Policy Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., International Economy" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Free (kg)</label>
                    <input type="number" value={form.freeWeightKg} onChange={(e) => setForm({ ...form, freeWeightKg: e.target.value })} placeholder="15" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max (kg)</label>
                    <input type="number" value={form.maxWeightKg} onChange={(e) => setForm({ ...form, maxWeightKg: e.target.value })} placeholder="32" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">₹/kg Extra</label>
                    <input type="number" value={form.extraCostPerKg} onChange={(e) => setForm({ ...form, extraCostPerKg: e.target.value })} placeholder="300" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowAddModal(false); setEditingPolicy(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700/50 transition-colors">Cancel</button>
                <button onClick={editingPolicy ? handleUpdate : handleCreate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/25">
                  {editingPolicy ? "Update Policy" : "Create Policy"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
