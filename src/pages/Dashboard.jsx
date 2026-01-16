import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth } from 'date-fns';

import GlassCard from '@/components/budget/GlassCard';
import StatCard from '@/components/budget/StatCard';
import TransactionForm from '@/components/budget/TransactionForm';
import TransactionList from '@/components/budget/TransactionList';
import CashflowChart from '@/components/budget/CashflowChart';

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 100)
  });

  const { data: bills = [] } = useQuery({
    queryKey: ['bills'],
    queryFn: () => base44.entities.Bill.list()
  });

  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  });

  // Calculate stats for current month
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const monthTransactions = transactions.filter(t => 
    t.date >= monthStart && t.date <= monthEnd
  );

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const unpaidBills = bills.filter(b => !b.is_paid);
  const upcomingBillsTotal = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm">{format(now, 'MMMM yyyy')}</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <TransactionForm 
                onSubmit={(data) => createTransaction.mutate(data)}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Balance"
            value={`$${balance.toFixed(2)}`}
            icon={Wallet}
            trend={balance >= 0 ? "On track" : "Over budget"}
            trendUp={balance >= 0}
          />
          <StatCard 
            title="Income"
            value={`$${totalIncome.toFixed(2)}`}
            icon={TrendingUp}
          />
          <StatCard 
            title="Expenses"
            value={`$${totalExpenses.toFixed(2)}`}
            icon={TrendingDown}
          />
          <StatCard 
            title="Upcoming Bills"
            value={`$${upcomingBillsTotal.toFixed(2)}`}
            icon={Receipt}
            trend={`${unpaidBills.length} pending`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cashflow Chart */}
          <CashflowChart transactions={transactions} />

          {/* Recent Transactions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Transactions</h3>
            <TransactionList 
              transactions={transactions.slice(0, 5)}
              onDelete={(id) => deleteTransaction.mutate(id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}