"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PlusCircle, Wallet, ArrowUpCircle, ArrowDownCircle, Trash2, X,
  PieChart as PieIcon, AlertCircle, ShoppingBag, Car, Home, Search,
  Clapperboard, Dumbbell, Banknote, Coffee, Sparkles, Trash, CheckCircle2,
  BarChart3, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [budgetLimit, setBudgetLimit] = useState(2000);


  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');


  const [showBudgetToast, setShowBudgetToast] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('personal_finance_data');
    if (saved) setTransactions(JSON.parse(saved));
    const savedBudget = localStorage.getItem('personal_budget_limit');
    if (savedBudget) setBudgetLimit(JSON.parse(savedBudget));
  }, []);

  useEffect(() => {
    localStorage.setItem('personal_finance_data', JSON.stringify(transactions));
    localStorage.setItem('personal_budget_limit', JSON.stringify(budgetLimit));
  }, [transactions, budgetLimit]);


  useEffect(() => {
    if (searchQuery.length > 0) {
      const hasMatch = transactions.some(t =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (hasMatch) {
        // Set the active filter so the list stays filtered
        setActiveFilter(searchQuery);
        // Clear the actual input text after a delay
        const timer = setTimeout(() => setSearchQuery(''), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchQuery, transactions]);

  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expenses;
  const isOverBudget = expenses > budgetLimit;


  const chartData = [
    { name: 'In', value: income, color: '#10b981' },
    { name: 'Out', value: expenses, color: '#f43f5e' },
    { name: 'Limit', value: budgetLimit, color: '#0f172a' },
  ];

  const categoryMap = {
    Food: { icon: <Coffee size={14} />, color: 'bg-orange-100 text-orange-500', hex: '#f97316' },
    Transport: { icon: <Car size={14} />, color: 'bg-blue-100 text-blue-500', hex: '#3b82f6' },
    Housing: { icon: <Home size={14} />, color: 'bg-rose-100 text-rose-500', hex: '#f43f5e' },
    Entertainment: { icon: <Clapperboard size={14} />, color: 'bg-purple-100 text-purple-500', hex: '#a855f7' },
    Shopping: { icon: <ShoppingBag size={14} />, color: 'bg-yellow-100 text-yellow-600', hex: '#eab308' },
    Other: { icon: <Dumbbell size={14} />, color: 'bg-indigo-100 text-indigo-500', hex: '#6366f1' },
    Salary: { icon: <Banknote size={14} />, color: 'bg-emerald-100 text-emerald-600', hex: '#10b981' },
  };

  const distributionData = Object.keys(categoryMap)
      .filter(cat => cat !== 'Salary')
      .map(cat => ({
        name: cat,
        value: transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((acc, curr) => acc + curr.amount, 0)
      })).filter(item => item.value > 0);


  const filteredTransactions = useMemo(() => {
    const query = searchQuery || activeFilter;
    return transactions.filter(t =>
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [transactions, searchQuery, activeFilter]);

  useEffect(() => {
    if (isOverBudget) {
      setShowBudgetToast(true);
      const timer = setTimeout(() => setShowBudgetToast(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowBudgetToast(false);
    }
  }, [expenses, isOverBudget]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!amount || !description || parseFloat(amount) <= 0 || !category) {
      triggerToast("Fill all fields", 'error');
      return;
    }
    if (type === 'expense' && balance <= 0) {
      triggerToast("Low funds. Log income!", 'error');
      return;
    }
    const now = new Date();
    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setDescription('');
    setCategory('');
    triggerToast("Logged!", 'success');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(item => item.id !== id));
    triggerToast("Removed", 'success');
  };

  const clearAllData = () => {
    setTransactions([]);
    setShowConfirmModal(false);
    triggerToast("Wiped", 'success');
  };

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const categoryTotals = Object.keys(categoryMap)
      .filter(cat => cat !== 'Salary')
      .map(cat => ({
        name: cat,
        total: transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((acc, curr) => acc + curr.amount, 0)
      }));

  return (
      <main className="relative min-h-screen bg-slate-50/50 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-10 animate-in fade-in duration-700">

        <div className="fixed top-4 right-4 left-4 md:left-auto z-[100] flex flex-col gap-2 items-end pointer-events-none">
          {toast.show && (
              <div className={`pointer-events-auto flex items-center gap-2 p-3 px-4 text-white rounded-xl shadow-2xl animate-in slide-in-from-top-2 duration-300 w-full md:w-auto md:min-w-[140px] ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                <p className="text-[10px] font-black uppercase tracking-wider">{toast.message}</p>
              </div>
          )}

          {showBudgetToast && (
              <div className="pointer-events-auto flex items-center justify-between gap-3 p-3 px-4 bg-slate-900 text-white rounded-xl shadow-2xl animate-in slide-in-from-top-2 duration-300 w-full md:w-auto md:min-w-[180px] border border-white/10">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-500 shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-wider">Limit Reached</p>
                </div>
                <button onClick={() => setShowBudgetToast(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={12} />
                </button>
              </div>
          )}
        </div>

        {showConfirmModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="bg-rose-50 w-12 h-12 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Wipe Ledger?</h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-wider">
                  This action is irreversible. Records will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={clearAllData} className="flex-1 py-4 rounded-xl bg-rose-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all">Delete All</button>
                </div>
              </div>
            </div>
        )}

        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-2xl text-yellow-400 shadow-sm shrink-0">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <div className="block">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-none">FinancePulse</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Personal Ledger</p>
            </div>
          </div>

          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-2 md:gap-3 bg-slate-900 p-1.5 pl-3 md:pl-4 rounded-2xl shadow-md ring-1 ring-slate-800">
              <span className="text-[9px] font-black text-white uppercase tracking-wider">Budget</span>
              <div className="relative flex items-center">
                <span className="absolute left-2 text-emerald-400 text-[10px] font-black">$</span>
                <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                    className="w-16 sm:w-24 pl-5 pr-2 py-2 text-xs font-black bg-slate-800 text-white rounded-xl border-none focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <SummaryCard title="Balance" value={balance} icon={<Wallet size={16} className="text-blue-500" />} />
          <SummaryCard title="Inflow" value={income} icon={<ArrowUpCircle size={16} className="text-emerald-500" />} isPositive />
          <SummaryCard title="Outflow" value={expenses} icon={<ArrowDownCircle size={16} className="text-rose-500" />} isNegative overLimit={isOverBudget} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-200/60">
              <h2 className="text-[11px] font-black mb-6 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                <PlusCircle size={14} className="text-slate-900" /> New Entry
              </h2>
              <form onSubmit={addTransaction} className="space-y-4">
                <input
                    type="text" placeholder="Description..."
                    className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-0 transition-all outline-none"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-black text-xs">$</span>
                    <input
                        type="number" placeholder="Amount..."
                        className="w-full p-3.5 pl-7 bg-slate-50 rounded-xl border border-transparent font-black text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-0 transition-all outline-none"
                        value={amount} onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <select
                      className={`w-full p-3.5 bg-slate-50 rounded-xl border border-transparent font-bold text-xs focus:bg-white focus:border-slate-200 focus:ring-0 outline-none transition-all cursor-pointer ${category ? 'text-slate-900' : 'text-slate-400'}`}
                      value={category} onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled hidden>Category...</option>
                    {Object.keys(categoryMap).map(cat => <option key={cat} value={cat} className="text-slate-900">{cat}</option>)}
                  </select>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-xl">
                  {['expense', 'income'].map((t) => (
                      <button
                          key={t} type="button" onClick={() => setType(t)}
                          className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {t}
                      </button>
                  ))}
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200">Log Transaction</button>
              </form>
            </section>

            <section className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-200/60">
              <h2 className="text-[11px] font-black mb-6 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                <Activity size={14} className="text-slate-900" /> Distribution
              </h2>
              <div className="h-48 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={categoryMap[entry.name].hex} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {categoryTotals.map(cat => (
                    <div key={cat.name} className="group">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                        <span className="flex items-center gap-2">
                          <span className={`p-1 rounded-lg ${categoryMap[cat.name].color}`}>{categoryMap[cat.name].icon}</span>
                          {cat.name}
                        </span>
                        <span className="group-hover:text-slate-900 font-black tracking-tight">${cat.total.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: `${expenses > 0 ? (cat.total / expenses) * 100 : 0}%` }} />
                      </div>
                    </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200/60">
              <h2 className="text-[11px] font-black mb-8 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                <BarChart3 size={14} className="text-slate-900" /> Performance
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={12}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900' }} />
                    <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                      {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200/60 min-h-[500px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Activity Log</h2>
                <div className="flex items-center gap-2 w-full sm:max-w-xs md:max-w-md">
                  <div className="relative flex items-center flex-1 group">
                    <Search size={14} className="absolute left-4 text-slate-500 group-focus-within:text-slate-900 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-2xl text-[12px] font-black text-slate-900 border-2 border-transparent placeholder:text-slate-500 focus:bg-white focus:border-slate-900 focus:ring-0 outline-none transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setActiveFilter(e.target.value); // Sync active filter on manual type
                        }}
                    />
                    {activeFilter && (
                        <button
                            onClick={() => {setSearchQuery(''); setActiveFilter('');}}
                            className="absolute right-3 p-1 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          <X size={12} />
                        </button>
                    )}
                  </div>
                  <button onClick={() => setShowConfirmModal(true)} className="flex items-center justify-center p-2.5 rounded-2xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all border-2 border-transparent">
                    <Trash size={14} className="xs:mr-2" />
                    <span className="hidden xs:inline">Wipe</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-40">
                      <div className="bg-slate-50 p-8 rounded-full mb-6">
                        <Wallet size={40} strokeWidth={1} className="text-slate-400" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{(searchQuery || activeFilter) ? "No Matches" : "Ledger Clear"}</p>
                    </div>
                ) : (
                    filteredTransactions.map(t => (
                        <div key={t.id} className="group flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 rounded-[1.5rem] md:rounded-3xl transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                            <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 shadow-sm ${categoryMap[t.category]?.color || 'bg-slate-100'}`}>
                              {categoryMap[t.category]?.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 text-xs sm:text-sm tracking-tight truncate pr-2">{t.description}</p>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5 whitespace-nowrap">
                                {t.date} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {t.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
                            <span className={`text-xs sm:text-base font-black tracking-tighter ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                              {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                            </span>
                            <button
                                onClick={() => deleteTransaction(t.id)}
                                className="md:opacity-0 md:group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                aria-label="Delete transaction"
                            >
                              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
  );
}

function SummaryCard({ title, value, icon, isPositive, isNegative, overLimit }) {
  return (
      <div className={`p-5 md:p-6 rounded-[2rem] border transition-all duration-500 ease-in-out ${overLimit && isNegative ? 'bg-rose-600 border-rose-500 shadow-2xl scale-[1.02]' : 'bg-white border-slate-200/60 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className={`p-2.5 md:p-3 rounded-2xl ${overLimit && isNegative ? 'bg-white/20 text-white' : 'bg-slate-50 ring-1 ring-slate-100'}`}>{icon}</div>
          {overLimit && isNegative && <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-white text-rose-600 px-2.5 py-1.5 rounded-lg shadow-sm animate-pulse whitespace-nowrap">Alert</span>}
        </div>
        <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ${overLimit && isNegative ? 'text-rose-100/70' : 'text-slate-400'}`}>{title}</p>
        <p className={`text-xl md:text-3xl font-black mt-1.5 md:mt-2 tracking-tighter ${isPositive ? 'text-emerald-500' : isNegative && overLimit ? 'text-white' : 'text-slate-900'}`}>
          ${value.toLocaleString()}
        </p>
      </div>
  );
}