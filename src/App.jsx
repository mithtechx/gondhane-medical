import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function BillingDashboard() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Scan Event
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setErrorMessage('');
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('barcode', barcodeInput.trim())
      .single();

    if (error || !data) {
      setErrorMessage('Product not found in inventory.');
      setBarcodeInput('');
      return;
    }

    if (data.stock <= 0) {
      setErrorMessage(`${data.name} is out of stock!`);
      setBarcodeInput('');
      return;
    }

    // Add to cart or increment quantity
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === data.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === data.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...data, quantity: 1 }];
    });

    setBarcodeInput('');
  };

  const updateQuantity = (id, amount) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);

  // Submit Invoice to DB & Open Print Layout
  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!');

    const invoiceNum = 'GM-' + Date.now();

    // 1. Insert into bills table
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .insert([
        {
          invoice_number: invoiceNum,
          customer_name: customerName,
          payment_mode: paymentMode,
          total: totalAmount,
        },
      ])
      .select()
      .single();

    if (billError) return alert('Error generating invoice metadata: ' + billError.message);

    // 2. Prepare items collection
    const billItems = cart.map((item) => ({
      bill_id: billData.id,
      inventory_id: item.id,
      quantity: item.quantity,
      price_per_unit: item.mrp,
    }));

    // 3. Insert items (This automatically fires the stock reduction trigger)
    const { error: itemsError } = await supabase.from('bill_items').insert(billItems);

    if (itemsError) return alert('Error mapping items: ' + itemsError.message);

    alert('Invoice saved successfully! Opening Print dialog.');
    window.print(); // Triggers the clean window stylesheet print view

    // Clear state for next customer
    setCart([]);
    setCustomerName('Walk-in Customer');
    setBarcodeInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Header Block */}
      <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gondhane Medical Billing Counter</h1>
          <p className="text-xs text-slate-500">Fast-checkout POS System</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspace Operations Left Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scanner Input Row */}
          <form onSubmit={handleScan} className="bg-white p-4 rounded-xl shadow-xs border border-slate-100">
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Barcode Scanner Target</label>
            <input
              type="text"
              placeholder="Scan item or type barcode manually and press Enter..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full p-3 border border-sky-200 bg-sky-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono tracking-wider"
              autoFocus
            />
            {errorMessage && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errorMessage}</p>}
          </form>

          {/* Cart UI Matrix */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase">
                  <th className="p-4">Medicine details</th>
                  <th className="p-4">MRP</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                      Cart empty. Scan a barcode to start processing items.
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400 font-mono">Batch: {item.batch_number || 'N/A'}</p>
                      </td>
                      <td className="p-4 font-mono text-slate-700">₹{parseFloat(item.mrp).toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 font-bold">-</button>
                          <span className="font-mono font-bold text-slate-800 w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 font-bold">+</button>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">₹{(item.mrp * item.quantity).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Remove</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Actions Panel Right */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b pb-2 border-slate-100">Customer Metadata</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / QR Scan</option>
                <option value="Card">Credit/Debit Card</option>
              </select>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Payable Amount:</span>
                <span className="text-2xl font-black font-mono text-emerald-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-center cursor-pointer"
            >
              Generate Bill & Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}