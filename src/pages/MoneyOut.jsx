import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import GlassCard from '@/components/moneena/GlassCard';
import MoneyOutForm from '@/components/moneena/MoneyOutForm';

export default function MoneyOut() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy');
  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', currentMonth],
    queryFn: () => base44.entities.Expense.filter({ month: currentMonth }, '-date')
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => base44.entities.Category.filter({ type: 'expense' })
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
    }
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = !search ||
      e.category?.toLowerCase().includes(search.toLowerCase()) ||
      e.place?.toLowerCase().includes(search.toLowerCase()) ||
      e.note?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalMoneyOut = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F7FAFC] mb-1">Money Out</h1>
          <p className="text-[#C9D4DF] text-sm">This Month: {monthLabel}</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#B23B3B] hover:bg-[#B23B3B]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Money Out
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <MoneyOutForm
              currentMonth={currentMonth}
              onSubmit={(data) => createExpense.mutate(data)}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Total */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#C9D4DF] text-sm mb-1">Total Money Out</p>
            <p className="text-3xl font-bold text-[#B23B3B]">- ${totalMoneyOut.toFixed(2)}</p>
          </div>
          <TrendingDown className="w-10 h-10 text-[#B23B3B]/40" />
        </div>
      </GlassCard>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D4DF]" />
          <Input
            placeholder="Search by category, place, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] placeholder:text-[#C9D4DF]/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <GlassCard className="overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#C9D4DF]">No money out yet</p>
            <p className="text-[#C9D4DF]/70 text-sm mt-1">Add your first entry to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.12]">
            {filteredExpenses.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.05] group">
                <div className="p-2 rounded-xl bg-[#B23B3B]/20">
                  <TrendingDown className="w-4 h-4 text-[#B23B3B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#F7FAFC]">{item.category}</p>
                  {item.place && <p className="text-sm text-[#C9D4DF]">{item.place}</p>}
                  {item.note && <p className="text-sm text-[#C9D4DF]/70 truncate">{item.note}</p>}
                  {item.is_recurring && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-[#B23B3B]/20 text-[#B23B3B]">
                      Recurring
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#B23B3B]">- ${item.amount.toFixed(2)}</p>
                  <p className="text-xs text-[#C9D4DF]">{format(new Date(item.date), 'MMM d')}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteExpense.mutate(item.id)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 text-[#C9D4DF] hover:text-[#B23B3B]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}