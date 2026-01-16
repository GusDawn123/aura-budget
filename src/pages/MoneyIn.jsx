import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import GlassCard from '@/components/moneena/GlassCard';
import MoneyInForm from '@/components/moneena/MoneyInForm';

export default function MoneyIn() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy');
  const queryClient = useQueryClient();

  const { data: income = [] } = useQuery({
    queryKey: ['income', currentMonth],
    queryFn: () => base44.entities.Income.filter({ month: currentMonth }, '-date')
  });

  const createIncome = useMutation({
    mutationFn: (data) => base44.entities.Income.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      setShowForm(false);
    }
  });

  const deleteIncome = useMutation({
    mutationFn: (id) => base44.entities.Income.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['income'] })
  });

  const filteredIncome = income.filter(i =>
    !search ||
    i.source?.toLowerCase().includes(search.toLowerCase()) ||
    i.note?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMoneyIn = income.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F7FAFC] mb-1">Money In</h1>
          <p className="text-[#C9D4DF] text-sm">This Month: {monthLabel}</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#2CB1BC] hover:bg-[#2CB1BC]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Money In
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <MoneyInForm
              currentMonth={currentMonth}
              onSubmit={(data) => createIncome.mutate(data)}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Total */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#C9D4DF] text-sm mb-1">Total Money In</p>
            <p className="text-3xl font-bold text-[#2CB1BC]">${totalMoneyIn.toFixed(2)}</p>
          </div>
          <TrendingUp className="w-10 h-10 text-[#2CB1BC]/40" />
        </div>
      </GlassCard>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D4DF]" />
          <Input
            placeholder="Search by source or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] placeholder:text-[#C9D4DF]/50"
          />
        </div>
      </div>

      {/* List */}
      <GlassCard className="overflow-hidden">
        {filteredIncome.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#C9D4DF]">No money in yet</p>
            <p className="text-[#C9D4DF]/70 text-sm mt-1">Add your first entry to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.12]">
            {filteredIncome.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.05] group">
                <div className="p-2 rounded-xl bg-[#2CB1BC]/20">
                  <TrendingUp className="w-4 h-4 text-[#2CB1BC]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#F7FAFC]">{item.source}</p>
                  {item.note && <p className="text-sm text-[#C9D4DF] truncate">{item.note}</p>}
                  {item.is_recurring && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-[#2CB1BC]/20 text-[#2CB1BC]">
                      Recurring
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#2CB1BC]">${item.amount.toFixed(2)}</p>
                  <p className="text-xs text-[#C9D4DF]">{format(new Date(item.date), 'MMM d')}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteIncome.mutate(item.id)}
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