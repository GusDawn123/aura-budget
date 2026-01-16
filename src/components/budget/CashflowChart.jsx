import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import GlassCard from './GlassCard';

export default function CashflowChart({ transactions }) {
  // Get last 30 days of data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM d'),
      income: 0,
      expense: 0
    };
  });

  // Aggregate transactions by date
  transactions?.forEach(t => {
    const dateKey = t.date;
    const dayData = last30Days.find(d => d.date === dateKey);
    if (dayData) {
      if (t.type === 'income') {
        dayData.income += t.amount;
      } else {
        dayData.expense += t.amount;
      }
    }
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-slate-100">
          <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-xs text-emerald-600">Income: ${payload[0]?.value?.toFixed(2)}</p>
          <p className="text-xs text-rose-500">Expense: ${payload[1]?.value?.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Cash Flow (30 Days)</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last30Days} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval={6}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#incomeGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#f43f5e" 
              strokeWidth={2}
              fill="url(#expenseGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}