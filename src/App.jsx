import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function BillingDashboard() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('billing'); // 'billing' | 'inventory' | 'history'

  // Global State
  const [cart, setCart] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Billing Inputs
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [billingError, setBillingError] = useState('');

  // Inventory Management Inputs
  const [newMedicine, setNewMedicine] = useState({
    barcode: '', name: '', batch_number: '', mrp: '', stock: '', expiry_date: ''
  });
  const [invSuccess, setInvSuccess] = useState('');

  // Load Initial Data
  useEffect(() => {
    fetchInventory();
    fetchHistory();
  }, []);

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select('*').order('name', { ascending: true });
    if (data) setInventory(data);
  };

  const fetchHistory = async () => {
    const { data } = await supabase.from('bills').select('*').order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  // --- BILLING COUNTER OPERATIONS ---
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    setBillingError('');

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('barcode', barcodeInput.trim())
      .single();

    if (error || !data) {
      setBillingError('Product not found in inventory.');
      setBarcodeInput('');
      return;
    }

    if (data.stock <= 0) {
      setBillingError(`${data.name} is completely out of stock!`);
      setBarcodeInput('');
      return;
    }

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

  const totalAmount = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!');
    const invoiceNum = 'GM-' + Date.now();

    const { data: billData, error: billError } = await supabase
      .from('bills')
      .insert([{ invoice_number: invoiceNum, customer_name: customerName, payment_mode: paymentMode, total: totalAmount }])
      .select().single();

    if (billError) return alert('Error saving bill: ' + billError.message);

    const billItems = cart.map((item) => ({
      bill_id: billData.id,
      inventory_id: item.id,
      quantity: item.quantity,
      price_per_unit: item.mrp,
    }));

    const { error: itemsError } = await supabase.from('bill_items').insert(billItems);
    if (itemsError) return alert('Error mapping items: ' + itemsError.message);

    alert('Invoice saved successfully!');
    window.print();

    setCart([]);
    setCustomerName('Walk-in Customer');
    fetchInventory(); // Refresh stock tracking numbers
    fetchHistory();   // Update invoice list
  };

  // --- INVENTORY MANAGEMENT OPERATIONS ---
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setInvSuccess('');

    const { error } = await supabase.from('inventory').insert([
      {
        barcode: newMedicine.barcode,
        name: newMedicine.name,
        batch_number: newMedicine.batch_number,
        mrp: parseFloat(newMedicine.mrp),
        stock: parseInt(newMedicine.stock),
        expiry_date: newMedicine.expiry_date || null
      }
    ]);

    if (error) {
      alert('Failed to save product: ' + error.message);
      return;
    }

    setInvSuccess('Medicine added directly to database!');
    setNewMedicine({ barcode: '', name: '', batch_number: '', mrp: '', stock: '', expiry_date: '' });
    fetchInventory();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Top Application Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-xs border border-slate-100 gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gondhane Medical Dashboard</h1>
          <p className="text-xs text-slate-500">Mithtechx POS Enterprise Solution</p>
        </div>

        {/* Global Navigation System */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'billing' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🧾 Billing Counter
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'inventory' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            📦 Manage Inventory
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            📜 View History
          </button>
        </div>
      </header>

      {/* ==================== TAB 1: BILLING COUNTER ==================== */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleScan} className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 no-print">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Barcode Scanner Input</label>
              <input
                type="text"
                placeholder="Scan item or enter barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full p-3 border border-sky-200 bg-sky-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono tracking-wider"
                autoFocus
              />
              {billingError && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {billingError}</p>}
            </form>

            <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden print-receipt-container">
              <div className="hidden print:block p-4 text-center border-b border-dashed border-black">
                <h2 className="text-xl font-bold">GONDHANE MEDICAL</h2>
                <p className="text-xs">Chikhli, Maharashtra</p>
                <p className="text-xs">Customer: {customerName}</p>
                <p className="text-xs">Payment: {paymentMode}</p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase print:bg-transparent">
                    <th className="p-4">Medicine Details</th>
                    <th className="p-4">MRP</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-400 font-medium no-print">Cart empty. Scan barcodes to add line items.</td>
                    </tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.id}>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">Batch: {item.batch_number || 'N/A'}</p>
                        </td>
                        <td className="p-4 font-mono">₹{parseFloat(item.mrp).toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center space-x-2 no-print">
                            <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 bg-slate-100 rounded font-bold">-</button>
                            <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 bg-slate-100 rounded font-bold">+</button>
                          </div>
                          <span className="hidden print:inline font-mono">{item.quantity}</span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-800">₹{(item.mrp * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="hidden print:block p-4 text-right border-t border-dashed border-black">
                <p className="text-lg font-bold">Grand Total: ₹{totalAmount.toFixed(2)}</p>
                <p className="text-xs mt-2">Thank you! Visit again.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 h-fit space-y-4 no-print">
            <h3 className="text-md font-bold text-slate-800 border-b pb-2 border-slate-100">Checkout Configuration</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / QR Scan</option>
              </select>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <span className="text-xs text-slate-500 block">Total Due Amount</span>
              <span className="text-2xl font-black font-mono text-emerald-600">₹{totalAmount.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer text-center">
              Generate & Print Invoice
            </button>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: INVENTORY MANAGEMENT ==================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Add New Medicine Form Row */}
          <form onSubmit={handleAddMedicine} className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-4">
            <h3 className="text-md font-bold text-indigo-600 border-b pb-2 border-slate-100">Add New Product to Shelves</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Barcode *</label>
                <input type="text" required value={newMedicine.barcode} onChange={(e) => setNewMedicine({...newMedicine, barcode: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono" placeholder="e.g. 890123" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Medicine Name *</label>
                <input type="text" required value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Lipitor" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Batch Code</label>
                <input type="text" value={newMedicine.batch_number} onChange={(e) => setNewMedicine({...newMedicine, batch_number: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono" placeholder="e.g. B-992" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Retail Price (MRP) *</label>
                <input type="number" step="0.01" required value={newMedicine.mrp} onChange={(e) => setNewMedicine({...newMedicine, mrp: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Initial Stock *</label>
                <input type="number" required value={newMedicine.stock} onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Expiry Date</label>
                <input type="date" value={newMedicine.expiry_date} onChange={(e) => setNewMedicine({...newMedicine, expiry_date: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              {invSuccess && <span className="text-emerald-600 text-sm font-semibold">✓ {invSuccess}</span>}
              <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm ml-auto cursor-pointer">
                Save Product
              </button>
            </div>
          </form>

          {/* Master Shelf Table view */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h4 className="text-sm font-bold text-slate-700">Live Shelf Database Logs ({inventory.length} Items Indexed)</h4>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase">
                  <th className="p-4">Barcode</th>
                  <th className="p-4">Medicine Item</th>
                  <th className="p-4">Batch ID</th>
                  <th className="p-4">MRP Price</th>
                  <th className="p-4">Available Stock</th>
                  <th className="p-4">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-xs text-slate-500">{item.barcode}</td>
                    <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="p-4 font-mono text-xs">{item.batch_number || '—'}</td>
                    <td className="p-4 font-mono text-slate-600">₹{parseFloat(item.mrp).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${item.stock <= 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {item.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{item.expiry_date || 'No Expiry'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: INVOICE HISTORY AUDIT ==================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h4 className="text-sm font-bold text-slate-700">Archived Invoices History Engine</h4>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase">
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date & Timestamp</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No sales recorded yet.</td>
                </tr>
              ) : (
                history.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-indigo-600">{bill.invoice_number}</td>
                    <td className="p-4 font-medium text-slate-800">{bill.customer_name}</td>
                    <td className="p-4 text-xs text-slate-500">{new Date(bill.created_at).toLocaleString()}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{bill.payment_mode}</span></td>
                    <td className="p-4 text-right font-mono font-bold text-slate-900">₹{parseFloat(bill.total).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}