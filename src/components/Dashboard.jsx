import React from 'react';

export default function Dashboard({ stats, setActiveView }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Metrics</h2>
        <p className="text-sm text-slate-500">Real-time point-of-sale overview tracking data</p>
      </div>

      {/* DASHBOARD SUMMARIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Today's Revenue</span>
          <h3 className="text-3xl font-black font-mono mt-2 text-slate-800">₹{stats.todaySales.toFixed(2)}</h3>
        </div>
        
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Revenue</span>
          <h3 className="text-3xl font-black font-mono mt-2 text-slate-800">₹{stats.totalSales.toFixed(2)}</h3>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Indexed Stock Types</span>
          <h3 className="text-3xl font-black font-mono mt-2 text-slate-800">{stats.totalItems} Items</h3>
        </div>

        <div className={`bg-white border border-slate-200 p-6 rounded-2xl shadow-xs relative overflow-hidden ${stats.lowStock > 0 ? 'bg-rose-50/30' : ''}`}>
          <div className={`absolute top-0 left-0 w-2 h-full ${stats.lowStock > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`}></div>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Critical Low Stock (≤5)</span>
          <h3 className={`text-3xl font-black font-mono mt-2 ${stats.lowStock > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{stats.lowStock} Items</h3>
        </div>
      </div>

      {/* QUICK DECK LINK ACTIONS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Launch Quick Tasks</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => setActiveView('billing')} className="p-5 border border-slate-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group">
            <span className="block font-bold text-slate-800 group-hover:text-emerald-700 text-base">🧾 Open Billing Desk</span>
            <span className="text-xs text-slate-400 group-hover:text-emerald-600 mt-1 block">Scan counter items sequence.</span>
          </button>
          <button onClick={() => setActiveView('add_medicine')} className="p-5 border border-slate-200 rounded-xl text-left hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group">
            <span className="block font-bold text-slate-800 group-hover:text-indigo-700 text-base">➕ Index New Medicine</span>
            <span className="text-xs text-slate-400 group-hover:text-indigo-600 mt-1 block">Add barcode entries to database.</span>
          </button>
          <button onClick={() => setActiveView('inventory')} className="p-5 border border-slate-200 rounded-xl text-left hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer group">
            <span className="block font-bold text-slate-800 group-hover:text-purple-700 text-base">📦 View Shelf Inventory</span>
            <span className="text-xs text-slate-400 group-hover:text-purple-600 mt-1 block">Check quantities & batch codes.</span>
          </button>
        </div>
      </div>
    </div>
  );
}