import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingDown, Activity } from 'lucide-react';

export default function CashBurnChart() {
  const { analytics } = useAuth();
  const { chartData } = analytics;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-slate-700 p-3 rounded-xl text-xs space-y-1 shadow-xl">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300 font-medium">{entry.name}:</span>
              <span className="font-mono font-bold text-white">
                ₹{Number(entry.value).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-heading font-extrabold text-white">
              Mathematical Zero-Balance Extrapolation Slope
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Solid line shows actual past balance. Dashed rose line projects future linear descent based on velocity $v$.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-cyan-400 rounded-full" />
            <span className="text-slate-300">Actual Spend Slope</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-rose-400 rounded-full border border-dashed border-rose-400" />
            <span className="text-rose-300">Projected Depletion</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            {/* Solid Line: Actual Historical Balance */}
            <Line
              type="monotone"
              dataKey="actualBalance"
              name="Actual Balance"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6, fill: '#38bdf8' }}
              connectNulls={false}
            />
            {/* Dashed Line: Projected Zero-Balance Extrapolation Slope */}
            <Line
              type="monotone"
              dataKey="projectedBalance"
              name="Projected Zero-Balance Slope"
              stroke="#f43f5e"
              strokeWidth={3}
              strokeDasharray="6 6"
              dot={{ fill: '#f43f5e', r: 4 }}
              activeDot={{ r: 6, fill: '#fb7185' }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
