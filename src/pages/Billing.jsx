import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Billing() {
  // State management
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus ref to keep the scanner input active
  const scanInputRef = useRef(null);

  // 1. Auto-focus the scanner input on page load
  useEffect(() => {
    focusScanner();
    generateInvoiceNumber();
  }, []);

  const focusScanner = () => {
    if (scanInputRef.current) scanInputRef.current.focus();
  };

  const generateInvoiceNumber = () => {
    // Generates a unique sequential-style invoice number for the session
    const timestamp = Date.now().toString().slice(-6);
    setInvoiceNumber(`GM-${timestamp}`);
  };

  // 2. Handle Barcode Scan / Enter Key
  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      // Fetch item from your Supabase inventory table
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('barcode', barcodeInput.trim())
        .single();

      if (error || !data) {
        alert('Product not found in inventory!');
        setBarcodeInput('');
        return;
      }

      // Check if item is out of stock
      if (data.stock <= 0) {
        alert(`Warning: ${data.name} is out of stock!`);
      }

      // Add to cart or increment quantity if already exists
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === data.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === data.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        // Add new item with default quantity of 1
        return [...prevCart, { ...data, quantity: 1 }];
      });

    } catch (err) {
      console.error('Error scanning item:', err);
    } finally {
      setBarcodeInput('');
      focusScanner(); // Keep cursor ready for next scan
    }
  };

  // 3. Adjust Quantities manually
  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(cart.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
    }
  };

  // 4. Calculate Totals
  const totalAmount = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);

  // 5. Save Invoice & Trigger Stock Deduction
  const handleCheckoutAndPrint = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step A: Insert into 'bills' table
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert([{ 
          invoice_number: invoiceNumber, 
          total: totalAmount, 
          payment_mode: paymentMode,
          customer_name: customerName || 'Walk-in Customer'
        }])
        .select()
        .single();

      if (billError) throw billError;

      // Step B: Prepare items for 'bill_items' table
      const billItemsToInsert = cart.map((item) => ({
        bill_id: billData.id, // Foreign key linking back to the parent bill
        inventory_id: item.id,
        quantity: item.quantity,
        price_per_unit: item.mrp,
      }));

      // Step C: Insert into 'bill_items' (Your DB trigger automatically handles stock subtraction here)
      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(billItemsToInsert);

      if (itemsError) throw itemsError;

      // Step D: Trigger Browser Print Mode (Triggers the specialized CSS print settings)
      setTimeout(() => {
        window.print();
        // Reset state for next customer
        setCart([]);
        setCustomerName('');
        generateInvoiceNumber();
        focusScanner();
      }, 500);

    } catch (err) {
      alert(`Database error: ${err.message}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans pb-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/CENTER COLUMNS: SCANNER & LIVE CART */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Gondhane Medical - Billing Counter</h2>
          
          {/* Barcode Scanner Target Field */}
          <form onSubmit={handleScanSubmit} className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Scanner Input (Keep cursor focused here)
            </label>
            <div className="relative">
              <input
                ref={scanInputRef}
                type="text"
                className="w-full bg-blue-50 border-2 border-blue-400 rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
                placeholder="Scan barcode or press Enter..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onBlur={focusScanner} // Forces cursor to stay inside if staff accidentally click away
              />
              <span className="absolute right-3 top-3.5 text-xs font-bold uppercase tracking-wider bg-blue-500 text-white px-2 py-1 rounded">
                Active
              </span>
            </div>
          </form>

          {/* Checkout Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="pb-3">Medicine/Batch</th>
                  <th className="pb-3 text-center">MRP</th>
                  <th className="pb-3 text-center w-32">Qty</th>
                  <th className="pb-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400">
                      No items scanned yet. Ready for barcode input...
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.id} className="text-gray-700">
                      <td className="py-4">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-400 font-mono">Batch: {item.batch_number || 'N/A'}</div>
                      </td>
                      <td className="py-4 text-center font-mono">₹{item.mrp.toFixed(2)}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono font-semibold text-gray-900">
                        ₹{(item.mrp * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER META & PAYMENT CONTROL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Invoice Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Invoice No</label>
                <input type="text" disabled className="w-full bg-gray-50 border rounded p-2 font-mono" value={invoiceNumber} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2" 
                  placeholder="Walk-in Patient"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Mode</label>
                <select 
                  className="w-full border rounded p-2 bg-white" 
                  value={paymentMode} 
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / QR">UPI / QR Code</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Grand Total:</span>
              <span className="text-3xl font-black text-gray-900 font-mono">₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckoutAndPrint}
              disabled={isSubmitting || cart.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white tracking-wide transition shadow-md ${
                cart.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? 'Saving Transaction...' : 'Print & Save Receipt'}
            </button>
          </div>

        </div>
      </div>

      {/* HIDDEN IN WEB UI: 3-INCH THERMAL RECEIPT CONTAINER */}
      <div id="thermal-receipt" className="hidden print:block font-mono text-black text-xs p-2 leading-tight">
        <div className="text-center mb-2">
          <h1 className="text-sm font-bold uppercase tracking-wide">Gondhane Medical</h1>
          <p className="text-[10px]">Your Address Line Here<br/>Phone: +91 XXXXXXXXXX</p>
        </div>
        
        <div className="border-b border-dashed border-black my-2"></div>
        
        <div className="space-y-0.5 text-[11px]">
          <div><strong>Inv No:</strong> {invoiceNumber}</div>
          <div><strong>Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          <div><strong>Cust:</strong> {customerName || 'Walk-in'}</div>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        {/* Minimal Item Matrix */}
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-black">
              <th className="font-bold">Item</th>
              <th className="text-center font-bold">Qty</th>
              <th className="text-right font-bold">Amt</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id}>
                <td className="py-1">
                  <div>{item.name}</div>
                  <div className="text-[9px] text-gray-600">MRP: ₹{item.mrp.toFixed(2)}</div>
                </td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">₹{(item.mrp * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-b border-dashed border-black my-2"></div>

        <div className="space-y-1 text-right text-[12px]">
          <div><strong>Total: ₹{totalAmount.toFixed(2)}</strong></div>
          <div className="text-[10px]">Paid Via: {paymentMode}</div>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>
        
        <div className="text-center text-[10px] italic mt-4">
          Thank you for visiting!<br/>Medicines once sold cannot be returned.
        </div>
      </div>

    </div>
  );
}