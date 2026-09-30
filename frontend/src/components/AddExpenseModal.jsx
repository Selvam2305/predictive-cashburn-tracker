import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { categorizeFrontend } from '../utils/categorizerFrontend';
import { X, Plus, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Auto-Detect',
  'Food',
  'Travel',
  'Subscriptions',
  'Utilities',
  'Shopping',
  'Transfers & Friend Loans',
  'General',
];

export default function AddExpenseModal({ isOpen, onClose }) {
  const { addExpense } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Auto-Detect');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [previewCat, setPreviewCat] = useState('');

  useEffect(() => {
    if (description && category === 'Auto-Detect') {
      const res = categorizeFrontend(description, Number(amount) || 0, date);
      setPreviewCat(res.category);
    } else {
      setPreviewCat('');
    }
  }, [description, amount, category, date]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    await addExpense({
      description,
      amount: Number(amount),
      category: category === 'Auto-Detect' ? '' : category,
      timestamp: date ? new Date(date).toISOString() : new Date().toISOString(),
    });

    setDescription('');
    setAmount('');
    setCategory('Auto-Detect');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="glass-panel border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-extrabold text-white">
              Log Manual Expense
            </h3>
            <p className="text-xs text-slate-400">
              4-Layer Regex engine auto-detects category if set to Auto-Detect.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description Narrative
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy Order, Uber Cab, Ramesh Stores"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Detect Preview Badge */}
          {category === 'Auto-Detect' && previewCat && (
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Auto-Detected Category:
              </span>
              <span className="font-bold text-white uppercase">{previewCat}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
            >
              Add Expense Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
