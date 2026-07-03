import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

// Component view layer imports
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import History from './components/History';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, todaySales: 0, totalItems: 0, lowStock: 0 });

  // Billing states passed to child
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [billingError, setBillingError] = useState('');

  // Form state passed to child
  const [newMedicine, setNewMedicine] = useState({ barcode: '', name: '', batch_number: '', mrp: '', stock: '', expiry_date: '' });
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    const { data: invData } = await supabase.from('inventory').select('*').order('name', { ascending: true });
    const currentInventory = invData || [];
    setInventory(currentInventory);

    const { data: billData } = await supabase.from('bills').select('*').order('created_at', { ascending: false });
    const currentHistory = billData || [];
    setHistory(currentHistory);

    const totalSalesSum = currentHistory.reduce((sum, b) => sum + parseFloat(b.total), 0);
    const todayStr = new Date().toDateString();
    const todaySalesSum = currentHistory
      .filter(b => new Date(b.created_at).toDateString() === todayStr)
      .reduce((sum, b) => sum + parseFloat(b.total), 0);

    setStats({
      totalSales: totalSalesSum,
      todaySales: todaySalesSum,
      totalItems: currentInventory.length,
      lowStock: currentInventory.filter(item => item.stock <= 5).length
    });
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    setBillingError('');

    const { data, error } = await supabase.from('inventory').select('*').eq('barcode', barcodeInput.trim()).single();
    if (error || !data) {
      setBillingError('Product not found in system logs.');
      setBarcodeInput('');
      return;
    }
    if (data.stock <= 0) {
      setBillingError(`${data.name} is completely unavailable.`);
      setBarcodeInput('');
      return;
    }

    setCart((prev) => {
      const match = prev.find((item) => item.id === data.id);
      if (match) return prev.map((item) => item.id === data.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...data, quantity: 1 }];
    });
    setBarcodeInput('');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const invoiceNum = 'GM-' + Date.now();
    const grandTotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);

    const { data: bill, error } = await supabase
      .from('bills')
      .insert([{ invoice_number: invoiceNum, customer_name: customerName, payment_mode: paymentMode, total: grandTotal }])
      .select().single();

    if (error) return alert(error.message);
    const mappedItems = cart.map(i => ({ bill_id: bill.id, inventory_id: i.id, quantity: i.quantity, price_per_unit: i.mrp }));
    await supabase.from('bill_items').insert(mappedItems);

    alert('Bill saved. Printing thermal receipt...');
    window.print();
    setCart([]);
    setCustomerName('Walk-in Customer');
    loadMasterData();
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    const { error } = await supabase.from('inventory').insert([{
      barcode: newMedicine.barcode, name: newMedicine.name, batch_number: newMedicine.batch_number,
      mrp: parseFloat(newMedicine.mrp), stock: parseInt(newMedicine.stock), expiry_date: newMedicine.expiry_date || null
    }]);

    if (error) return alert(error.message);
    setFormSuccess('Medicine indexed successfully!');
    setNewMedicine({ barcode: '', name: '', batch_number: '', mrp: '', stock: '', expiry_date: '' });
    loadMasterData();
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 no-print">
        <div className="p-5 border-b border-slate-800 bg-slate-950">
          <h2 className="text-xl font-black text-emerald-400 tracking-wide">GONDHANE POS</h2>
          <p className="text-xs text-slate-500">Mithtechx Enterprise Studio</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeView === 'dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>📊 Main Dashboard Summary</button>
          <button onClick={() => setActiveView('billing')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeView === 'billing' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>🧾 Create New Checkout Bill</button>
          <button onClick={() => setActiveView('add_medicine')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeView === 'add_medicine' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>➕ Add Medicine to Shelf</button>
          <button onClick={() => setActiveView('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeView === 'inventory' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>📦 Manage Master Inventory</button>
          <button onClick={() => setActiveView('history')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeView === 'history' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>📜 Audit Bill History Log</button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeView === 'dashboard' && <Dashboard stats={stats} setActiveView={setActiveView} />}
        {activeView === 'billing' && <Billing cart={cart} barcodeInput={barcodeInput} setBarcodeInput={setBarcodeInput} billingError={billingError} customerName={customerName} setCustomerName={setCustomerName} paymentMode={paymentMode} setPaymentMode={setPaymentMode} handleScan={handleScan} handleCheckout={handleCheckout} />}
        {activeView === 'add_medicine' && <Inventory inventory={inventory} newMedicine={newMedicine} setNewMedicine={setNewMedicine} formSuccess={formSuccess} handleAddMedicine={handleAddMedicine} showFormOnly={true} />}
        {activeView === 'inventory' && <Inventory inventory={inventory} newMedicine={newMedicine} setNewMedicine={setNewMedicine} formSuccess={formSuccess} handleAddMedicine={handleAddMedicine} showFormOnly={false} />}
        {activeView === 'history' && <History history={history} />}
      </main>
    </div>
  );
}