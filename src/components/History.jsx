import React from 'react';

export default function History({ history }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h4 className="font-bold text-sm text-slate-700">Historical Closed Bills Registry Ledger</h4>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-100 border-b text-xs text-slate-500 font-bold uppercase">
          <tr>
            <th className="p-4">Invoice Number</th>
            <th className="p-4">Customer Name</th>
            <th className="p-4">Settlement Time</th>
            <th className="p-4">Method</th>
            <th className="p-4 text-right">Settled Amount Total</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-slate-100">
          {history.length === 0 ? (
            <tr><td colSpan="5" className="p-8 text-center text-slate-400">No transactions recorded inside current tracking workspace window.</td></tr>
          ) : (
            history.map(bill => (
              <tr key={bill.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-mono font-bold text-emerald-600">{bill.invoice_number}</td>
                <td className="p-4 font-semibold text-slate-800">{bill.customer_name}</td>
                <td className="p-4 text-xs text-slate-500">{new Date(bill.created_at).toLocaleString()}</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 border rounded text-xs">{bill.payment_mode}</span></td>
                <td className="p-4 text-right font-mono font-bold text-slate-900">₹{parseFloat(bill.total).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}