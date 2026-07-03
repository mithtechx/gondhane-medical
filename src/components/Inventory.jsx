import React from 'react';

export default function Inventory({ 
  inventory, newMedicine, setNewMedicine, formSuccess, handleAddMedicine, showFormOnly = false 
}) {
  return (
    <div className="space-y-6">
      {/* ADD MEDICINE INTERFACE BLOCK */}
      {((showFormOnly) || !showFormOnly) && (
        <form onSubmit={handleAddMedicine} className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 ${showFormOnly ? 'max-w-4xl mx-auto' : ''}`}>
          <div>
            <h3 className="text-xl font-bold text-indigo-600">Index New Medicine Stock</h3>
            <p className="text-xs text-slate-400">Insert new product metrics row into the central data cloud tables.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Barcode String (Unique) *</label>
              <input type="text" required value={newMedicine.barcode} onChange={(e) => setNewMedicine({...newMedicine, barcode: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm font-mono" placeholder="Scan barcode line target..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Medicine Nomenclature Title *</label>
              <input type="text" required value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="e.g. Paracetamol 650mg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Batch Code Tracking ID</label>
              <input type="text" value={newMedicine.batch_number} onChange={(e) => setNewMedicine({...newMedicine, batch_number: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm font-mono" placeholder="e.g. B-M2026" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Retail Price (MRP Individual) *</label>
              <input type="number" step="0.01" required value={newMedicine.mrp} onChange={(e) => setNewMedicine({...newMedicine, mrp: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm font-mono" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Initial Pack Units Count *</label>
              <input type="number" required value={newMedicine.stock} onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm font-mono" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Product Expiration Date</label>
              <input type="date" value={newMedicine.expiry_date} onChange={(e) => setNewMedicine({...newMedicine, expiry_date: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            {formSuccess && <span className="text-emerald-600 text-sm font-bold">✓ {formSuccess}</span>}
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm ml-auto cursor-pointer">
              Save Medicine Configuration
            </button>
          </div>
        </form>
      )}

      {/* MASTER LOGS MATRIX TABLE VIEW */}
      {!showFormOnly && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="font-bold text-sm text-slate-700">Central Shelf Stock Index Logs ({inventory.length} Verified Entries)</h4>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-100 border-b text-xs text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">Barcode</th>
                <th className="p-4">Medicine Generic Name</th>
                <th className="p-4">Batch Number</th>
                <th className="p-4">MRP Price</th>
                <th className="p-4">Current Stock Units</th>
                <th className="p-4">Expiry Timeline</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-xs text-slate-500">{item.barcode}</td>
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className="p-4 font-mono text-xs text-slate-600">{item.batch_number || '—'}</td>
                  <td className="p-4 font-mono">₹{parseFloat(item.mrp).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {item.stock} left
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{item.expiry_date || 'No Limit Date'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}