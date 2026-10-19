import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  DollarSign,
  LogOut,
  RefreshCw,
  Printer,
  ShieldCheck,
  ChevronRight,
  Check,
  Eye,
  Trash2,
  Search,
  Filter,
  Settings,
  FileCheck,
  Download,
  ArrowRight,
  Sparkles,
  Layers,
  Sliders,
  Smartphone,
  AlertTriangle,
  X,
  Lock,
  User,
} from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  // Navigation & Auth State
  const [userRole, setUserRole] = useState(null); // 'student' | 'stationer' | null
  const [loginStep, setLoginStep] = useState('selector'); // 'selector' | 'student-login' | 'stationer-login'
  const [activeTab, setActiveTab] = useState('new-job'); // 'new-job' | 'my-orders'

  // Login Form Inputs
  const [inputStudentName, setInputStudentName] = useState('Sahana M');
  const [inputStudentId, setInputStudentId] = useState('RA2311003010000');
  const [inputPin, setInputPin] = useState('');

  // Orders & Data State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State for Student Order
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('bw'); // 'bw' | 'color'
  const [paperSize, setPaperSize] = useState('A4');
  const [printSide, setPrintSide] = useState('single'); // 'single' | 'double'
  const [bindingOption, setBindingOption] = useState('none'); // 'none' | 'staple' | 'spiral'
  const [paymentMethod, setPaymentMethod] = useState('gpay'); // 'gpay' | 'cod'
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Stationer Pricing Rates State
  const [rates, setRates] = useState({
    bwSingle: 2,
    bwDouble: 3,
    colorSingle: 10,
    colorDouble: 18,
    staple: 5,
    spiral: 30,
  });

  const [selectedPreview, setSelectedPreview] = useState(null);

  // Fetch initial orders & subscribe to Supabase Real-time updates
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data);
    } catch (err) {
      console.error('Error fetching orders from Supabase:', err.message);
    }
  };

  // Dynamic Pricing Calculation
  const calculateTotal = () => {
    let perPagePrice = rates.bwSingle;
    if (colorMode === 'color') {
      perPagePrice =
        printSide === 'double' ? rates.colorDouble / 2 : rates.colorSingle;
    } else {
      perPagePrice =
        printSide === 'double' ? rates.bwDouble / 2 : rates.bwSingle;
    }

    let baseCost = pageCount * copies * perPagePrice;
    let bindingCost = 0;
    if (bindingOption === 'staple') bindingCost = rates.staple;
    if (bindingOption === 'spiral') bindingCost = rates.spiral;

    return Math.ceil(baseCost + bindingCost);
  };

  const totalPrice = calculateTotal();

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf') {
        alert('Please upload a valid PDF document.');
        return;
      }
      setFile(uploadedFile);
      const simulatedPages = Math.floor(uploadedFile.size / 50000) || 1;
      setPageCount(simulatedPages > 0 ? simulatedPages : 1);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload a PDF document before submitting!');

    setLoading(true);

    const newOrder = {
      student_name: inputStudentName,
      file_name: file.name,
      page_count: pageCount,
      copies: parseInt(copies),
      color_mode: colorMode === 'color' ? 'Full Color' : 'B&W',
      paper_size: `${paperSize} (${
        printSide === 'double' ? 'Double-sided' : 'Single-sided'
      })`,
      total_price: totalPrice,
      payment_method:
        paymentMethod === 'gpay' ? 'GPay / UPI' : 'Cash on Delivery',
      payment_status: paymentMethod === 'gpay' ? 'Completed' : 'Pending',
      status: 'Submitted',
    };

    try {
      const { error } = await supabase.from('orders').insert([newOrder]);
      if (error) throw error;

      alert('Print job submitted successfully to the stationer!');
      setFile(null);
      setSpecialInstructions('');
      setActiveTab('my-orders');
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating status in Supabase:', err.message);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.file_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      statusFilter === 'all' ||
      ord.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // LOGIN & AUTHENTICATION SCREENS
  // ==========================================
  if (!userRole) {
    return (
      <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 bg-black text-white font-sans overflow-hidden">
        {/* Minimalist Dark Wavy Background */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-100 200 C300 100, 500 600, 900 400 C1200 250, 1400 700, 1600 500"
              stroke="#ffffff"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-50 400 C200 300, 600 800, 1000 300 C1300 0, 1500 800, 1700 300"
              stroke="#888888"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M-200 600 C400 500, 300 900, 800 600 C1100 400, 1300 950, 1600 700"
              stroke="#ffffff"
              strokeWidth="0.75"
              strokeDasharray="4 4"
              fill="none"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-md w-full text-center space-y-8 bg-zinc-900/90 p-8 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-black mb-2 shadow-md">
              <Printer className="w-6 h-6" />
            </div>
            <h1
              className="text-4xl font-serif font-bold tracking-wider text-white"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              PRINT QUEUE
            </h1>
            <p className="text-xs uppercase tracking-widest text-zinc-400">
              Campus Express Digital Print Service
            </p>
          </div>

          {loginStep === 'selector' && (
            <div className="space-y-4 pt-4">
              <button
                onClick={() => setLoginStep('student-login')}
                className="w-full py-4 px-6 rounded-xl bg-white text-black font-bold tracking-wide hover:bg-zinc-200 transition duration-200 flex items-center justify-between shadow-xl group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-zinc-800" />
                  <span className="text-sm">Student Portal Login</span>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setLoginStep('stationer-login')}
                className="w-full py-4 px-6 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold tracking-wide hover:bg-zinc-700 transition duration-200 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <Printer className="w-5 h-5 text-zinc-300" />
                  <span className="text-sm">Stationer Shop Login</span>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {loginStep === 'student-login' && (
            <div className="space-y-4 text-left pt-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-2">
                Student Authentication
              </h2>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={inputStudentName}
                    onChange={(e) => setInputStudentName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Student Registration ID
                </label>
                <input
                  type="text"
                  value={inputStudentId}
                  onChange={(e) => setInputStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white outline-none focus:border-white font-mono"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  onClick={() => setLoginStep('selector')}
                  className="w-1/3 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!inputStudentName || !inputStudentId)
                      return alert('Please enter both name and ID');
                    setUserRole('student');
                  }}
                  className="w-2/3 py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition shadow-lg"
                >
                  Enter Student Portal
                </button>
              </div>
            </div>
          )}

          {loginStep === 'stationer-login' && (
            <div className="space-y-4 text-left pt-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-2">
                Stationer Administrator Access
              </h2>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Shop Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="Enter security PIN (any code)"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white outline-none focus:border-white"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Default Demo PIN: any 4 digits or leave blank for quick access
                </p>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  onClick={() => setLoginStep('selector')}
                  className="w-1/3 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setUserRole('stationer')}
                  className="w-2/3 py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition shadow-lg"
                >
                  Open Shop Manager
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Sync Active</span>
            </span>
            <span>SRM Campus Stationer</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARDS (Solid Clean Background)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1
              className="text-2xl font-serif font-bold tracking-wider text-black flex items-center space-x-2"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              <span>PRINT QUEUE</span>
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-700 uppercase tracking-wider">
              {userRole === 'student' ? 'Student Workspace' : 'Stationer Admin'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {userRole === 'student' && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">
                  {inputStudentName}
                </p>
                <p className="text-[10px] text-slate-500">{inputStudentId}</p>
              </div>
            )}
            <button
              onClick={() => {
                setUserRole(null);
                setLoginStep('selector');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6">
        {userRole === 'student' ? (
          /* ================= STUDENT VIEW ================= */
          <div className="space-y-6">
            <div className="flex space-x-2 border-b border-slate-300 pb-1">
              <button
                onClick={() => setActiveTab('new-job')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition flex items-center space-x-2 ${
                  activeTab === 'new-job'
                    ? 'bg-black text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Submit New Print Job</span>
              </button>

              <button
                onClick={() => setActiveTab('my-orders')}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition flex items-center space-x-2 ${
                  activeTab === 'my-orders'
                    ? 'bg-black text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  My Print History (
                  {
                    orders.filter((o) => o.student_name === inputStudentName)
                      .length
                  }
                  )
                </span>
              </button>
            </div>

            {activeTab === 'new-job' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Upload Box */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-slate-900" />
                      <span>1. Select PDF Document</span>
                    </h2>

                    <div className="border-2 border-dashed border-slate-300 hover:border-black transition rounded-xl p-8 text-center cursor-pointer relative bg-slate-50/50">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 mx-auto text-slate-400" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {file
                              ? file.name
                              : 'Click or drag & drop PDF file here'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {file
                              ? `${(file.size / (1024 * 1024)).toFixed(
                                  2
                                )} MB • PDF Document`
                              : 'Supports PDF files up to 50MB'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {file && (
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 flex items-center space-x-1">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>Ready for printing: {file.name}</span>
                        </span>
                        <button
                          onClick={() => setSelectedPreview(file.name)}
                          className="text-blue-600 font-bold hover:underline flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick Preview</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Print Options */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-slate-900" />
                      <span>2. Print Options & Specifications</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Color Mode
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setColorMode('bw')}
                            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                              colorMode === 'bw'
                                ? 'border-black bg-black text-white shadow-sm'
                                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span>B&W (₹{rates.bwSingle}/pg)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setColorMode('color')}
                            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                              colorMode === 'color'
                                ? 'border-black bg-black text-white shadow-sm'
                                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span>Color (₹{rates.colorSingle}/pg)</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Printing Sides
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPrintSide('single')}
                            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                              printSide === 'single'
                                ? 'border-black bg-black text-white shadow-sm'
                                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span>Single-Sided</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintSide('double')}
                            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                              printSide === 'double'
                                ? 'border-black bg-black text-white shadow-sm'
                                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span>Double-Sided</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Number of Copies
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={copies}
                          onChange={(e) => setCopies(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Detected Pages
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={pageCount}
                          onChange={(e) =>
                            setPageCount(parseInt(e.target.value) || 1)
                          }
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Binding Option
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'none', label: 'No Binding', cost: 0 },
                            {
                              id: 'staple',
                              label: 'Corner Staple',
                              cost: rates.staple,
                            },
                            {
                              id: 'spiral',
                              label: 'Spiral Binding',
                              cost: rates.spiral,
                            },
                          ].map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setBindingOption(b.id)}
                              className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition ${
                                bindingOption === b.id
                                  ? 'border-black bg-black text-white shadow-sm'
                                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              <span>{b.label}</span>
                              <span className="text-[10px] opacity-80 mt-0.5">
                                {b.cost > 0 ? `+₹${b.cost}` : 'Free'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Special Instructions for Stationer
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Print only pages 5-12, use thick front cover..."
                          value={specialInstructions}
                          onChange={(e) =>
                            setSpecialInstructions(e.target.value)
                          }
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-black font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Selection Options */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-slate-900" />
                      <span>3. Select Payment Method</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('gpay')}
                        className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition ${
                          paymentMethod === 'gpay'
                            ? 'border-black bg-slate-950 text-white ring-2 ring-black'
                            : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 mt-0.5 text-blue-400" />
                        <div>
                          <p className="font-bold text-sm">
                            GPay / PhonePe / UPI
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              paymentMethod === 'gpay'
                                ? 'text-slate-300'
                                : 'text-slate-500'
                            }`}
                          >
                            Instant digital payment online
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition ${
                          paymentMethod === 'cod'
                            ? 'border-black bg-slate-950 text-white ring-2 ring-black'
                            : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <DollarSign className="w-5 h-5 mt-0.5 text-emerald-400" />
                        <div>
                          <p className="font-bold text-sm">Cash on Pick Up</p>
                          <p
                            className={`text-xs mt-0.5 ${
                              paymentMethod === 'cod'
                                ? 'text-slate-300'
                                : 'text-slate-500'
                            }`}
                          >
                            Pay cash at shop counter
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg sticky top-24 space-y-6">
                    <h2 className="text-lg font-serif font-bold border-b border-slate-200 pb-3 text-slate-900">
                      Order Breakdown
                    </h2>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Student Name:</span>
                        <span className="font-bold text-slate-900">
                          {inputStudentName}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Document:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[150px]">
                          {file ? file.name : 'None uploaded'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Total Quantity:</span>
                        <span className="font-bold text-slate-900">
                          {pageCount} pgs × {copies} copies
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Mode & Sides:</span>
                        <span className="font-bold text-slate-900 capitalize">
                          {colorMode} • {printSide}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Binding Option:</span>
                        <span className="font-bold text-slate-900 capitalize">
                          {bindingOption}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Payment Selected:</span>
                        <span className="font-bold text-slate-900 uppercase">
                          {paymentMethod}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-800">
                          Total Payable:
                        </span>
                        <span className="text-2xl font-extrabold text-black">
                          ₹{totalPrice}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitOrder}
                      disabled={loading || !file}
                      className="w-full py-4 bg-black text-white rounded-xl font-bold tracking-wide hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center space-x-2"
                    >
                      <span>
                        {loading
                          ? 'Submitting to Supabase...'
                          : 'Proceed & Place Order'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-[10px] text-center text-slate-500">
                      Orders are sent directly to SRM Campus Stationer database.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Student Print History */
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800">
                    Your Submitted Print Jobs
                  </h3>
                  <button
                    onClick={fetchOrders}
                    className="p-1.5 rounded border bg-white hover:bg-slate-100 text-xs flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 uppercase text-slate-600 font-bold">
                      <tr>
                        <th className="p-4">File Name</th>
                        <th className="p-4">Specifications</th>
                        <th className="p-4">Total Price</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Print Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {orders.filter((o) => o.student_name === inputStudentName)
                        .length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-slate-500"
                          >
                            No print jobs placed yet.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter((o) => o.student_name === inputStudentName)
                          .map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-900">
                                {ord.file_name}
                              </td>
                              <td className="p-4 text-slate-600">
                                {ord.page_count} pgs • {ord.copies} copies •{' '}
                                {ord.color_mode}
                              </td>
                              <td className="p-4 font-extrabold text-slate-900">
                                ₹{ord.total_price}
                              </td>
                              <td className="p-4 font-bold text-slate-700">
                                {ord.payment_method} ({ord.payment_status})
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                                    ord.status === 'Completed'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : ord.status === 'Printing'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= STATIONER ADMIN VIEW ================= */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Total Received
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {orders.length}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-amber-600 uppercase">
                  Pending Queue
                </p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">
                  {orders.filter((o) => o.status === 'Submitted').length}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-blue-600 uppercase">
                  Currently Printing
                </p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  {orders.filter((o) => o.status === 'Printing').length}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-emerald-600 uppercase">
                  Ready for Pickup
                </p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {orders.filter((o) => o.status === 'Completed').length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-black font-medium"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs font-bold bg-white outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="printing">Printing</option>
                  <option value="completed">Completed</option>
                </select>

                <button
                  onClick={fetchOrders}
                  className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 text-xs font-bold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 uppercase text-slate-600 font-bold">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Document</th>
                      <th className="p-4">Specs</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Update State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-slate-500"
                        >
                          No print jobs matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-900">
                            {ord.student_name}
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {ord.file_name}
                          </td>
                          <td className="p-4 text-slate-600">
                            {ord.page_count} pgs • {ord.copies} copies •{' '}
                            {ord.color_mode}
                          </td>
                          <td className="p-4 font-extrabold text-slate-900">
                            ₹{ord.total_price}
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            {ord.payment_method}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : ord.status === 'Printing'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 space-x-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(ord.id, 'Printing')
                              }
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold shadow-sm"
                            >
                              Print
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(ord.id, 'Completed')
                              }
                              className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-bold shadow-sm"
                            >
                              Ready
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* File Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-800" />
                <span>Document Inspector: {selectedPreview}</span>
              </h3>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <FileCheck className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-sm font-bold text-slate-800">
                {selectedPreview}
              </p>
              <p className="text-xs text-slate-500">
                PDF Document verified • Page Count: {pageCount} Pages
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
