import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import GlassCard from '@/components/moneena/GlassCard';
import MoneyInForm from '@/components/moneena/MoneyInForm';
import MoneyOutForm from '@/components/moneena/MoneyOutForm';

export default function Overview() {
  const [showMoneyInForm, setShowMoneyInForm] = useState(false);
  const [showMoneyOutForm, setShowMoneyOutForm] = useState(false);
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy');
  const queryClient = useQueryClient();

  const { data: income = [] } = useQuery({
    queryKey: ['income', currentMonth],
    queryFn: () => base44.entities.Income.filter({ month: currentMonth })
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', currentMonth],
    queryFn: () => base44.entities.Expense.filter({ month: currentMonth })
  });

  const { data: bills = [] } = useQuery({
    queryKey: ['bills'],
    queryFn: () => base44.entities.Bill.list()
  });

  const createIncome = useMutation({
    mutationFn: (data) => base44.entities.Income.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      setShowMoneyInForm(false);
    }
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowMoneyOutForm(false);
    }
  });

  const totalMoneyIn = income.reduce((sum, i) => sum + i.amount, 0);
  const totalMoneyOut = expenses.reduce((sum, e) => sum + e.amount, 0);
  const leftOver = totalMoneyIn - totalMoneyOut;

  const upcomingBills = bills.filter(b => {
    const currentDay = new Date().getDate();
    return b.due_date >= currentDay && !b.is_paid;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F7FAFC] mb-1">Overview</h1>
        <p className="text-[#C9D4DF] text-sm">This Month: {monthLabel}</p>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button
          onClick={() => setShowMoneyInForm(true)}
          className="h-auto py-6 bg-white/[0.12] hover:bg-white/[0.18] border border-white/[0.18] backdrop-blur-md text-[#F7FAFC]"
        >
          <Plus className="w-5 h-5 mr-2 text-[#2CB1BC]" />
          <span>Add Money In</span>
        </Button>
        <Button
          onClick={() => setShowMoneyOutForm(true)}
          className="h-auto py-6 bg-white/[0.12] hover:bg-white/[0.18] border border-white/[0.18] backdrop-blur-md text-[#F7FAFC]"
        >
          <Plus className="w-5 h-5 mr-2 text-[#B23B3B]" />
          <span>Add Money Out</span>
        </Button>
      </div>

      {/* Modals */}
      {showMoneyInForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <MoneyInForm
              currentMonth={currentMonth}
              onSubmit={(data) => createIncome.mutate(data)}
              onClose={() => setShowMoneyInForm(false)}
            />
          </div>
        </div>
      )}

      {showMoneyOutForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <MoneyOutForm
              currentMonth={currentMonth}
              onSubmit={(data) => createExpense.mutate(data)}
              onClose={() => setShowMoneyOutForm(false)}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#C9D4DF]">Money In</p>
            <TrendingUp className="w-5 h-5 text-[#2CB1BC]" />
          </div>
          <p className="text-3xl font-bold text-[#F7FAFC]">${totalMoneyIn.toFixed(2)}</p>
          <p className="text-xs text-[#C9D4DF] mt-2">{income.length} entries</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#C9D4DF]">Money Out</p>
            <TrendingDown className="w-5 h-5 text-[#B23B3B]" />
          </div>
          <p className="text-3xl font-bold text-[#F7FAFC]">- ${totalMoneyOut.toFixed(2)}</p>
          <p className="text-xs text-[#C9D4DF] mt-2">{expenses.length} entries</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#C9D4DF]">Left Over</p>
            <Wallet className={`w-5 h-5 ${leftOver >= 0 ? 'text-[#1F6B3A]' : 'text-[#B23B3B]'}`} />
          </div>
          <p className={`text-3xl font-bold ${leftOver >= 0 ? 'text-[#1F6B3A]' : 'text-[#B23B3B]'}`}>
            ${leftOver.toFixed(2)}
          </p>
          <p className="text-xs text-[#C9D4DF] mt-2">
            {leftOver >= 0 ? 'You have money left' : 'You spent more than you earned'}
          </p>
        </GlassCard>
      </div>

      {/* Helper Text */}
      <GlassCard className="p-6 mb-8">
        <div className="text-center">
          <p className="text-[#F7FAFC] font-medium mb-1">Add it yourself. No bank connection needed.</p>
          <p className="text-[#C9D4DF] text-sm">Left Over is what you still have after spending.</p>
        </div>
      </GlassCard>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#F7FAFC] mb-4">Upcoming Bills This Month</h3>
          <div className="space-y-3">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-2 border-b border-white/[0.12] last:border-0">
                <div>
                  <p className="text-[#F7FAFC] font-medium">{bill.name}</p>
                  <p className="text-[#C9D4DF] text-sm">Due on day {bill.due_date}</p>
                </div>
                <p className="text-[#F7FAFC] font-semibold">${bill.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}