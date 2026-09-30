import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, Tag, ShieldCheck, HelpCircle, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Travel',
  'Subscriptions',
  'Utilities',
  'Shopping',
  'Transfers & Friend Loans',
  'General',
];

export default function ExpenseList({ selectedCategory, onSelectCategory }) {
  const { expenses, deleteExpense, reTagExpense } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter expenses based on category isolation & search term
  const filtered = expenses.filter((item) => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.amount.toString().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-heading font-extrabold text-white">
              Transaction History
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold">
              {filtered.length} Records
            </span>
            {selectedCategory && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-1">
                Isolated: {selectedCategory}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-categorized by 4-Layer Regex & UPI Protocol Engine. Retagging saves Layer 2 merchant rules.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Description Narrative</th>
              <th className="py-3 px-4">Protocol</th>
              <th className="py-3 px-4">Category Tag</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-900/50 transition-colors group">
                  {/* Date */}
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(item.timestamp).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Description Narrative */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{item.description}</div>
                    {item.isNeedsReview && (
                      <span className="inline-flex items-center text-[10px] text-amber-400 mt-0.5 gap-1">
                        <HelpCircle className="w-3 h-3" /> Needs Review Micro-spend
                      </span>
                    )}
                  </td>

                  {/* Protocol Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        item.protocol === 'P2P'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          : item.protocol === 'P2M'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.protocol || 'DIRECT'}
                    </span>
                  </td>

                  {/* Category Retag Dropdown */}
                  <td className="py-3 px-4">
                    <select
                      value={item.category}
                      onChange={(e) => reTagExpense(item._id, e.target.value)}
                      className={`bg-slate-900 border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none transition cursor-pointer ${
                        item.category === 'Transfers & Friend Loans'
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                          : item.category === 'Food'
                          ? 'border-amber-500/40 text-amber-400'
                          : item.category === 'Travel'
                          ? 'border-cyan-500/40 text-cyan-400'
                          : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-sm text-white">
                    ₹{Number(item.amount).toLocaleString('en-IN')}
                  </td>

                  {/* Delete Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deleteExpense(item._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
