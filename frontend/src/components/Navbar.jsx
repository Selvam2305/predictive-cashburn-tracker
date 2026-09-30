import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Upload,
  Plus,
  LogOut,
  Edit2,
  Check,
  X,
  Wifi,
  WifiOff,
  User as UserIcon,
} from 'lucide-react';

export default function Navbar({ onOpenUpload, onOpenAdd }) {
  const { user, updateBudget, logout, isOfflineMode, toggleOfflineMode } = useAuth();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState(user?.monthlyBudget || 50000);

  const handleSaveBudget = async () => {
    await updateBudget(budgetVal);
    setIsEditingBudget(false);
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Cash<span className="gradient-text-cyan">Burn</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-semibold">
                PROD v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide">
              PREDICTIVE ZERO-BALANCE ENGINE
            </p>
          </div>
        </div>

        {/* Center: Budget Editor */}
        <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-800 rounded-full px-4 py-1.5 space-x-3">
          <span className="text-xs text-slate-400 font-medium">Monthly Target:</span>
          {isEditingBudget ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-cyan-400 font-bold">₹</span>
              <input
                type="number"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-24 bg-slate-950 border border-cyan-500/50 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveBudget}
                className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded transition"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">
                ₹{(user?.monthlyBudget || 50000).toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => {
                  setBudgetVal(user?.monthlyBudget || 50000);
                  setIsEditingBudget(true);
                }}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition"
                title="Edit Target Budget"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Offline Demo Mode Indicator */}
          <button
            onClick={toggleOfflineMode}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
              isOfflineMode
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
            }`}
            title="Toggle Live Backend / Demo Mode"
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isOfflineMode ? 'Demo Mode' : 'API Live'}</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* Add Expense */}
          <button
            onClick={onOpenAdd}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
