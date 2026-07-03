import React from 'react';

export default function History({ history }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 bg-slate-50 border-b border-slate-200">
        <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">Archived Closed Bills Ledger Journal</h4>
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider border-b">
          <tr>
            <th className="p-4">Invoice Tracking Number</th>
            <th className="p-4">Client Buyer Label</th>
            <th className="p-4">Transaction Closing Timestamp</th>
            <th className="p-4">Payment Method</th>
            <th className="p-4 text-right">Settled Subtotal</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-slate-100">
          {history.length === 0 ? (
            <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-medium">No archived bills exist inside database ledger memory bounds.</td></tr>
          ) : (
            history.map(bill => (
              <tr key={bill.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4 font-mono font-bold text-emerald-600 text-base">{bill.invoice_number}</td>
                <td className="p-4 font-bold text-slate-800 text-base">{bill.customer_name}</td>
                <td className="p-4 text-xs text-slate-400 font-medium">{new Date(bill.created_at).toLocaleString()}</td>
                <td className="p-4">
                  <span className="inline-block px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-md font-bold text-xs text-slate-500 tracking-wide">
                    {bill.payment_mode}
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-black text-slate-900 text-base">₹{parseFloat(bill.total).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}