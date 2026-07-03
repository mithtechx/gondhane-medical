import React from 'react';

export default function Billing({ 
  cart, barcodeInput, setBarcodeInput, billingError, 
  customerName, setCustomerName, paymentMode, setPaymentMode, 
  handleScan, handleCheckout 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <form onSubmit={handleScan} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Fast Barcode Scan Target</label>
          <input
            type="text" autoFocus placeholder="Scan item or type barcode directly here..." value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="w-full p-3 border border-sky-200 bg-sky-50/50 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          {billingError && <p className="text-red-500 font-semibold text-sm mt-2">⚠️ {billingError}</p>}
        </form>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print-receipt-container">
          <div className="hidden print:block text-center p-4 border-b border-dashed border-black">
            <h3 className="text-xl font-black">GUIDHANE MEDICAL</h3>
            <p className="text-xs">Chikhli, MH</p>
            <p className="text-xs">Client: {customerName}</p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-4">Item Line Info</th>
                <th className="p-4">MRP</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-right">Sum</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {cart.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium">No items present inside active checkout queue.</td></tr>
              ) : (
                cart.map(item => (
                  <tr key={item.id}>
                    <td className="p-4">
                      <span className="block font-bold text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-400 font-mono">Batch: {item.batch_number}</span>
                    </td>
                    <td className="p-4 font-mono">₹{parseFloat(item.mrp).toFixed(2)}</td>
                    <td className="p-4 text-center font-bold font-mono">{item.quantity}</td>
                    <td className="p-4 text-right font-mono font-bold">₹{(item.mrp * item.quantity).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs h-fit space-y-4">
        <h3 className="text-md font-bold text-slate-700 border-b pb-2">Checkout Details</h3>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Profile Name</label>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Options</label>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
            <option value="Cash">Cash Currency</option>
            <option value="UPI">UPI QR Receipt</option>
          </select>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl text-center border">
          <span className="text-2xl font-black font-mono text-emerald-600">₹{cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0).toFixed(2)}</span>
        </div>
        <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-xl disabled:opacity-40 cursor-pointer">
          Commit Sale & Print Receipt
        </button>
      </div>
    </div>
  );
}