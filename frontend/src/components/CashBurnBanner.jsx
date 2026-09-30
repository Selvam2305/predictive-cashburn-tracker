import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, TrendingDown, Calendar, Wallet, Tag, ShieldCheck } from 'lucide-react';

export default function CashBurnBanner() {
  const { analytics } = useAuth();
  const {
    monthlyBudget,
    remainingBudget,
    dailyVelocity,
    daysRemaining,
    forecastedZeroDate,
    isInfiniteRunway,
    isDepleted,
    topSpendCategory,
    topSpendAmount,
  } = analytics;

  return (
    <div className="space-y-4">
      {/* High Visibility Warning Alert Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
          isDepleted
            ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-rose-500/50 cyber-glow-rose'
            : 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border-cyan-500/30 cyber-glow-cyan'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Main Forecast Message */}
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isDepleted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {isDepleted ? (
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  PREDICTIVE ZERO-BALANCE ALERT
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-cyan-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1 text-cyan-400" />
                  P2P Friend Loans Excluded
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">
                {isDepleted ? (
                  <span className="text-rose-400">Monthly Budget Depleted!</span>
                ) : isInfiniteRunway ? (
                  <span className="text-emerald-400">Infinite Runway (₹0/day Velocity)</span>
                ) : (
                  <>
                    At current velocity (
                    <span className="gradient-text-cyan font-bold">
                      ₹{dailyVelocity.toLocaleString('en-IN')}/day
                    </span>
                    ), your balance will hit{' '}
                    <span className="text-rose-400 font-extrabold">₹0</span> in{' '}
                    <span className="text-amber-400 font-extrabold">{daysRemaining} days</span> on{' '}
                    <span className="underline decoration-cyan-500/50">{forecastedZeroDate}</span>!
                  </>
                )}
              </h2>

              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Forward-looking forecast based on 30-day non-transfer daily cash-burn velocity.
              </p>
            </div>
          </div>

          {/* Top Spend Category Highlight Badge */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3 shrink-0">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Top Spend Category
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{topSpendCategory}</span>
                <span className="text-xs text-amber-400 font-medium">
                  (₹{topSpendAmount.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Remaining Budget */}
        <div className="glass-card glass-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Remaining Balance</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-white">
            ₹{remainingBudget.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            out of ₹{monthlyBudget.toLocaleString('en-IN')} target
          </div>
        </div>

        {/* Card 2: Daily Spend Velocity (v) */}
        <div className="glass-card glass-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Daily Velocity (v)</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-cyan-400">
            ₹{dailyVelocity.toLocaleString('en-IN')}
            <span className="text-xs text-slate-400 font-normal">/day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">30-day consumption average</div>
        </div>

        {/* Card 3: Forecasted Zero Date */}
        <div className="glass-card glass-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Zero-Balance Date</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-amber-400">
            {forecastedZeroDate}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Depleted'}
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="glass-card glass-card-hover rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">#1 Spend Sector</span>
            <Tag className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-purple-300">
            {topSpendCategory}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ₹{topSpendAmount.toLocaleString('en-IN')} spent
          </div>
        </div>
      </div>
    </div>
  );
}
