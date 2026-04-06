"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { adminGet, adminPost, adminPatch, adminDelete } from "@/lib/admin-api";

export default function MealCatalogPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [itemForm, setItemForm] = useState({ name: "", price: "", categoryId: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "" });

  const loadData = () => {
    adminGet("/meals/categories")
      .then((data) => {
        setCategories(data);
        if (!activeTab && data.length > 0) setActiveTab(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) return;
    try {
      await adminPost("/meals/categories", categoryForm);
      setCategoryForm({ name: "" });
      setShowAddCategory(false);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleAddItem = async () => {
    if (!itemForm.name.trim() || !itemForm.categoryId) return;
    try {
      await adminPost("/meals/items", { ...itemForm, price: parseFloat(itemForm.price) || 0 });
      setItemForm({ name: "", price: "", categoryId: "" });
      setShowAddItem(false);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateItem = async (id: string) => {
    try {
      await adminPatch(`/meals/items/${id}`, {
        name: editForm.name || undefined,
        price: editForm.price ? parseFloat(editForm.price) : undefined,
      });
      setEditingItem(null);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminPatch(`/meals/items/${id}`, { isActive: !isActive });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this meal item?")) return;
    try {
      await adminDelete(`/meals/items/${id}`);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const activeCategory = categories.find((c) => c.id === activeTab);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Services</p>
            <h1 className="text-3xl font-bold text-white">Meal & Service Catalog</h1>
            <p className="text-slate-400 text-sm mt-1">Manage meal categories and update prices for all flight tiers.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddCategory(true)} className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700/50 transition-colors">
              + Category
            </button>
            <button onClick={() => { setShowAddItem(true); setItemForm({ ...itemForm, categoryId: activeTab }); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all">
              + Meal Item
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full" />
        </div>
      ) : (
        <>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === cat.id
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {cat.name} <span className="ml-1 text-xs opacity-60">({cat.items?.length || 0})</span>
              </button>
            ))}
          </div>

          {/* Meal Items Grid */}
          {activeCategory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategory.items?.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-400 rounded-2xl bg-slate-800/30 border border-slate-700/30">
                  <p className="text-3xl mb-2">🍽️</p>
                  <p className="font-medium">No items in this category</p>
                  <p className="text-sm">Add your first meal item.</p>
                </div>
              ) : (
                activeCategory.items?.map((item: any, i: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`rounded-2xl border p-5 transition-all ${
                      item.isActive
                        ? "bg-slate-800/50 border-slate-700/50"
                        : "bg-slate-800/20 border-slate-700/20 opacity-50"
                    }`}
                  >
                    {editingItem === item.id ? (
                      <div className="space-y-3">
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
                        <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateItem(item.id)} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold">Save</button>
                          <button onClick={() => setEditingItem(null)} className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          <button
                            onClick={() => handleToggleActive(item.id, item.isActive)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${item.isActive ? "bg-emerald-500" : "bg-slate-600"}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.isActive ? "left-5" : "left-0.5"}`} />
                          </button>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400 mb-4">
                          {item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : "Free"}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(item.id); setEditForm({ name: item.name, price: String(item.price) }); }} className="text-xs text-blue-400 font-medium hover:text-blue-300">Edit</button>
                          <button onClick={() => handleDeactivate(item.id)} className="text-xs text-red-400 font-medium hover:text-red-300">Remove</button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">No categories found. Create one first.</div>
          )}
        </>
      )}

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddCategory(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-white mb-4">New Category</h2>
              <input value={categoryForm.name} onChange={(e) => setCategoryForm({ name: e.target.value })} placeholder="e.g., Premium" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowAddCategory(false)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm">Cancel</button>
                <button onClick={handleAddCategory} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddItem(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-white mb-4">New Meal Item</h2>
              <div className="space-y-3">
                <input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Item name" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                <input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="Price (₹)" className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAddItem(false)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm">Cancel</button>
                <button onClick={handleAddItem} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Add Item</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
