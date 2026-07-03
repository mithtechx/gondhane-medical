import React from 'react';

export default function Inventory({ 
  inventory, newMedicine, setNewMedicine, formSuccess, handleAddMedicine, showFormOnly = false 
}) {
  return (
    <div className="space-y-8">
      {/* ADD NEW PRODUCT SCREEN LAYER */}
      {showFormOnly && (
        <form onSubmit={handleAddMedicine} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div className="border-b pb-4 border-slate-100">
            <h3 className="text-xl font-extrabold text-indigo-600 tracking-tight">Index New Pharmacy Stock</h3>
            <p className="text-xs text-slate-400 mt-0.5">Commit new medicine box parameters directly into your database rows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Universal Barcode Code *</label>
              <input type="text" required value={newMedicine.barcode} onChange={(e) => setNewMedicine({...newMedicine, barcode: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="Scan or input code..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medicine Commercial Name *</label>
              <input type="text" required value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="e.g. Crocin Advance" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assigned Batch Code Tracking ID</label>
              <input type="text" value={newMedicine.batch_number} onChange={(e) => setNewMedicine({...newMedicine, batch_number: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="e.g. BAT-2026X" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Retail Price (Single Pack MRP) *</label>
              <input type="number" step="0.01" required value={newMedicine.mrp} onChange={(e) => setNewMedicine({...newMedicine, mrp: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Initial Inventory Count (Units) *</label>
              <input type="number" required value={newMedicine.stock} onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiration Timeline Threshold</label>
              <input type="date" value={newMedicine.expiry_date} onChange={(e) => setNewMedicine({...newMedicine, expiry_date: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {formSuccess && <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">✓ {formSuccess}</span>}
            <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl ml-auto cursor-pointer shadow-xs transition-colors">
              Save Entry Parameters
            </button>
          </div>
        </form>
      )}

      {/* MASTER MANAGEMENT SHELF GRID RECORD VIEW */}
      {!showFormOnly && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">Indexed Active Inventory Database Log ({inventory.length} Records)</h4>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider border-b">
              <tr>
                <th className="p-4">Barcode Key</th>
                <th className="p-4">Medicine Generic Label</th>
                <th className="p-4">Batch Tracking Code</th>
                <th className="p-4">Unit Price (MRP)</th>
                <th className="p-4">Shelf Stock Remaining</th>
                <th className="p-4">Expiry Context</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-all">
                  <td className="p-4 font-mono text-xs text-slate-400 tracking-wide">{item.barcode}</td>
                  <td className="p-4 font-bold text-slate-800 text-base">{item.name}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">{item.batch_number || '—'}</td>
                  <td className="p-4 font-mono font-semibold text-slate-700">₹{parseFloat(item.mrp).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wide font-mono ${item.stock <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {item.stock} UNITS
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-400 font-medium">{item.expiry_date || 'No Constraint Logged'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}