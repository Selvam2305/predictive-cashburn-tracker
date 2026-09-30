import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, Car, Tv, Zap, ShoppingBag, Users, Layers, ShieldCheck } from 'lucide-react';

const CATEGORY_META = {
  Food: { icon: Utensils, color: 'from-amber-500 to-orange-600', text: 'text-amber-400', border: 'border-amber-500/30' },
  Travel: { icon: Car, color: 'from-cyan-500 to-blue-600', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  Subscriptions: { icon: Tv, color: 'from-rose-500 to-pink-600', text: 'text-rose-400', border: 'border-rose-500/30' },
  Utilities: { icon: Zap, color: 'from-yellow-400 to-amber-600', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Shopping: { icon: ShoppingBag, color: 'from-purple-500 to-indigo-600', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Transfers & Friend Loans': { icon: Users, color: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  General: { icon: Layers, color: 'from-slate-500 to-slate-700', text: 'text-slate-400', border: 'border-slate-700' },
};

export default function CategoryBreakdown({ selectedCategory, onSelectCategory }) {
  const { analytics } = useAuth();
  const { categoryTotals = {}, total30DaySpend = 1 } = analytics;

  const categories = Object.keys(CATEGORY_META);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-slate-300">
          Category Isolation View
        </h3>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Reset Filter (Show All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const total = categoryTotals[cat] || 0;
          const isSelected = selectedCategory === cat;
          const percentage = Math.round((total / (total30DaySpend || 1)) * 100);

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`glass-card p-3.5 rounded-xl text-left transition-all duration-200 relative overflow-hidden group ${
                isSelected
                  ? `ring-2 ring-cyan-500 bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10`
                  : `hover:border-slate-700`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-tr ${meta.color} text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {percentage}%
                </span>
              </div>

              <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                {cat}
              </div>

              <div className={`text-sm font-extrabold mt-0.5 ${meta.text}`}>
                ₹{total.toLocaleString('en-IN')}
              </div>

              {cat === 'Transfers & Friend Loans' && (
                <div className="mt-1 text-[9px] text-emerald-400/90 font-medium flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> Excluded from $v$
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
