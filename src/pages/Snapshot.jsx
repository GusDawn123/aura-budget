import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, ShoppingBag, Store } from 'lucide-react';
import { format } from 'date-fns';
import GlassCard from '@/components/moneena/GlassCard';

export default function Snapshot() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy');

  const { data: income = [] } = useQuery({
    queryKey: ['income', currentMonth],
    queryFn: () => base44.entities.Income.filter({ month: currentMonth })
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', currentMonth],
    queryFn: () => base44.entities.Expense.filter({ month: currentMonth })
  });

  const totalMoneyIn = income.reduce((sum, i) => sum + i.amount, 0);
  const totalMoneyOut = expenses.reduce((sum, e) => sum + e.amount, 0);
  const leftOver = totalMoneyIn - totalMoneyOut;

  // Top Spending Types (Categories)
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Top Places You Spent Money
  const placeTotals = {};
  expenses.forEach(e => {
    if (e.place) {
      placeTotals[e.place] = (placeTotals[e.place] || 0) + e.amount;
    }
  });
  const topPlaces = Object.entries(placeTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F7FAFC] mb-1">Snapshot</h1>
        <p className="text-[#C9D4DF] text-sm">This Month: {monthLabel}</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#C9D4DF]">Money In</p>
            <TrendingUp className="w-5 h-5 text-[#2CB1BC]" />
          </div>
          <p className="text-3xl font-bold text-[#F7FAFC]">${totalMoneyIn.toFixed(2)}</p>
          <p className="text-xs text-[#C9D4DF] mt-1">Total income</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#C9D4DF]">Money Out</p>
            <TrendingDown className="w-5 h-5 text-[#B23B3B]" />
          </div>
          <p className="text-3xl font-bold text-[#F7FAFC]">- ${totalMoneyOut.toFixed(2)}</p>
          <p className="text-xs text-[#C9D4DF] mt-1">Total spending</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#C9D4DF]">Left Over</p>
            <Wallet className={`w-5 h-5 ${leftOver >= 0 ? 'text-[#1F6B3A]' : 'text-[#B23B3B]'}`} />
          </div>
          <p className={`text-3xl font-bold ${leftOver >= 0 ? 'text-[#1F6B3A]' : 'text-[#B23B3B]'}`}>
            ${leftOver.toFixed(2)}
          </p>
          <p className="text-xs text-[#C9D4DF] mt-1">
            {leftOver >= 0 ? 'Money you have left' : 'Over budget'}
          </p>
        </GlassCard>
      </div>

      {/* Helper */}
      <GlassCard className="p-5 mb-8 text-center">
        <p className="text-[#C9D4DF] text-sm">Left Over is what you still have after spending.</p>
      </GlassCard>

      {/* Top Spending Types */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-[#F2C14E]" />
          <h3 className="text-lg font-semibold text-[#F7FAFC]">Top Spending Types</h3>
        </div>
        <p className="text-sm text-[#C9D4DF] mb-4">Where you spent the most money.</p>
        {topCategories.length === 0 ? (
          <p className="text-[#C9D4DF]/70 text-sm text-center py-4">No spending yet this month</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map(([category, total], index) => (
              <div key={category} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F2C14E]/20 flex items-center justify-center text-[#F2C14E] font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#F7FAFC]">{category}</p>
                  <div className="h-2 bg-white/[0.12] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[#F2C14E]"
                      style={{ width: `${(total / totalMoneyOut) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="font-semibold text-[#F7FAFC]">${total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Top Places */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-[#2CB1BC]" />
          <h3 className="text-lg font-semibold text-[#F7FAFC]">Top Places You Spent Money</h3>
        </div>
        <p className="text-sm text-[#C9D4DF] mb-4">The stores or companies you paid the most.</p>
        {topPlaces.length === 0 ? (
          <p className="text-[#C9D4DF]/70 text-sm text-center py-4">No places tracked yet</p>
        ) : (
          <div className="space-y-3">
            {topPlaces.map(([place, total], index) => (
              <div key={place} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2CB1BC]/20 flex items-center justify-center text-[#2CB1BC] font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#F7FAFC]">{place}</p>
                  <div className="h-2 bg-white/[0.12] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[#2CB1BC]"
                      style={{ width: `${(total / totalMoneyOut) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="font-semibold text-[#F7FAFC]">${total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}