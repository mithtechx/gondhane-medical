import React from 'react';

export default function Dashboard({ stats, setActiveView }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back, Counter Desk</h2>
        <p className="text-sm text-slate-500">Real-time status metrics summary dashboard</p>
      </div>

      {/* COLOR SUMMARY CARDS BLOCK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-sm text-white">
          <span className="text-xs uppercase font-bold text-emerald-100 opacity-90">Today's Revenue</span>
          <h3 className="text-3xl font-black font-mono mt-1">₹{stats.todaySales.toFixed(2)}</h3>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-sm text-white">
          <span className="text-xs uppercase font-bold text-blue-100 opacity-90">Total Recorded Revenue</span>
          <h3 className="text-3xl font-black font-mono mt-1">₹{stats.totalSales.toFixed(2)}</h3>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-2xl shadow-sm text-white">
          <span className="text-xs uppercase font-bold text-purple-100 opacity-90">Indexed Medicines</span>
          <h3 className="text-3xl font-black font-mono mt-1">{stats.totalItems} Items</h3>
        </div>
        <div className={`bg-gradient-to-br p-6 rounded-2xl shadow-sm text-white ${stats.lowStock > 0 ? 'from-amber-500 to-red-600' : 'from-slate-700 to-slate-800'}`}>
          <span className="text-xs uppercase font-bold text-amber-100 opacity-90">Low Stock Warnings (≤5)</span>
          <h3 className="text-3xl font-black font-mono mt-1">{stats.lowStock} Items</h3>
        </div>
      </div>

      {/* QUICK LINK PANEL ACROSS COMPONENT ROW */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <h4 className="text-md font-bold text-slate-700 mb-4">Quick Counter Launch Desk Shortcuts</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => setActiveView('billing')} className="p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 rounded-xl text-left transition-colors cursor-pointer">
            <span className="block font-bold text-emerald-800 text-sm">🧾 Open New Bill Tab</span>
            <span className="text-xs text-emerald-600 mt-0.5 block">Launch checkout screen scan sequence.</span>
          </button>
          <button onClick={() => setActiveView('add_medicine')} className="p-4 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 rounded-xl text-left transition-colors cursor-pointer">
            <span className="block font-bold text-indigo-800 text-sm">📦 Restock Registry</span>
            <span className="text-xs text-indigo-600 mt-0.5 block">Add a barcode package layout directly.</span>
          </button>
          <button onClick={() => setActiveView('inventory')} className="p-4 bg-purple-50 hover:bg-purple-100/80 border border-purple-100 rounded-xl text-left transition-colors cursor-pointer">
            <span className="block font-bold text-purple-800 text-sm">👁️ Check Live Shelves</span>
            <span className="text-xs text-purple-600 mt-0.5 block">Review total batch numbers and codes.</span>
          </button>
        </div>
      </div>
    </div>
  );
}