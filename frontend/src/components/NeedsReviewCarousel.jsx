import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, CheckCircle, Coffee, ArrowRight, ShieldAlert, Sparkles, ThumbsUp } from 'lucide-react';

export default function NeedsReviewCarousel() {
  const { expenses, reTagExpense } = useAuth();
  const needsReviewItems = expenses.filter((e) => e.isNeedsReview);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (needsReviewItems.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Smart Context Engine
            </span>
            <p className="text-xs text-slate-300">
              100% of transactions categorized with high confidence. No unremembered spends in queue!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = needsReviewItems[currentIndex % needsReviewItems.length];

  const handleAction = async (category) => {
    await reTagExpense(currentItem._id, category);
    if (needsReviewItems.length > 1) {
      setCurrentIndex((prev) => prev % (needsReviewItems.length - 1));
    }
  };

  return (
    <div className="glass-panel border border-amber-500/30 rounded-2xl p-5 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 cyber-glow-amber relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Header & Smart Inference */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                UNSURE / NEEDS REVIEW ({needsReviewItems.length})
              </span>
              <span className="text-[10px] bg-amber-950 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                Smart Context Profiler
              </span>
            </div>

            <h4 className="text-base font-bold text-white mt-1">
              "{currentItem.description}" —{' '}
              <span className="text-amber-300">₹{currentItem.amount}</span>
            </h4>

            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Micro-spend profile inferred: Was this{' '}
                <strong className="text-cyan-300">
                  {currentItem.suggestedCategory || 'Evening Tea & Snacks'}
                </strong>
                ?
              </span>
            </p>
          </div>
        </div>

        {/* 1-Tap Confirmation Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={() => handleAction(currentItem.suggestedCategory || 'Food')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Yes, Tag as {currentItem.suggestedCategory || 'Food'}</span>
          </button>

          <button
            onClick={() => handleAction('Transfers & Friend Loans')}
            className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-500/30 text-purple-200 text-xs font-medium transition"
          >
            Friend Loan
          </button>

          <button
            onClick={() => handleAction('General')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Keep in General
          </button>

          {needsReviewItems.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Next Item"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
