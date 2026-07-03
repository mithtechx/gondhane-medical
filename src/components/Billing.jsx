import React from 'react';

export default function Billing({ 
  cart, barcodeInput, setBarcodeInput, billingError, 
  customerName, setCustomerName, paymentMode, setPaymentMode, 
  handleScan, handleCheckout 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* BARCODE SCANNER FORM */}
        <form onSubmit={handleScan} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scanner Radar Target</label>
          <input
            type="text" autoFocus placeholder="Awaiting barcode laser scan or type manual input..." value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="w-full p-4 border border-slate-200 bg-slate-50/50 rounded-xl font-mono text-base tracking-wide focus:bg-sky-50/40 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition-all"
          />
          {billingError && <p className="text-rose-500 font-semibold text-sm mt-3 flex items-center gap-1">⚠️ {billingError}</p>}
        </form>

        {/* CHECKOUT CART RENDER LIST CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print-receipt-container">
          <div className="p-4 border-b bg-slate-50 border-slate-200 font-bold text-sm text-slate-700 uppercase tracking-wider print:hidden">Current Checkout Queue</div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/60 border-b border-slate-200 text-xs text-slate-400 uppercase font-bold tracking-wider print:bg-transparent">
              <tr>
                <th className="p-4">Medicine Specifications</th>
                <th className="p-4">MRP</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {cart.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-medium">Checkout list empty. Scan medicine boxes to build the bill ledger.</td></tr>
              ) : (
                cart.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4">
                      <span className="block font-bold text-slate-800 text-base">{item.name}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 font-mono text-xs text-slate-500 rounded">Batch: {item.batch_number || '—'}</span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-600">₹{parseFloat(item.mrp).toFixed(2)}</td>
                    <td className="p-4 text-center font-black font-mono text-slate-800 text-base">{item.quantity}</td>
                    <td className="p-4 text-right font-mono font-black text-slate-900 text-base">₹{(item.mrp * item.quantity).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* METADATA SIDE PANEL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit space-y-5">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-3 border-slate-100">Invoice Configurations</h3>
        
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Client Record Name</label>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Settlement Pathway</label>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 focus:outline-none">
            <option value="Cash">Cash Settlement</option>
            <option value="UPI">UPI Digital Payment / QR</option>
          </select>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Payable Amount</span>
          <span className="block text-3xl font-black font-mono text-emerald-600">₹{cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0).toFixed(2)}</span>
        </div>

        <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-sm uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
          Finalize & Print Thermal Invoice
        </button>
      </div>
    </div>
  );
}