import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parse, addMonths, subMonths } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import { getLocalMonth, formatMonthYear } from '@/components/helpers/dateHelpers';
import { motion } from 'framer-motion';

export default function Income() {
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonth());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ source: '', amount: '', date: '' });
  const queryClient = useQueryClient();

  const { data: incomeRecords = [] } = useQuery({
    queryKey: ['incomeRecords', selectedMonth],
    queryFn: () => base44.entities.IncomeRecord.filter({ 
      date: { $gte: `${selectedMonth}-01`, $lte: `${selectedMonth}-31` }
    }, '-date')
  });

  const { data: allIncome = [] } = useQuery({
    queryKey: ['incomeRecords', 'all'],
    queryFn: () => base44.entities.IncomeRecord.list()
  });

  const createIncome = useMutation({
    mutationFn: (data) => base44.entities.IncomeRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeRecords'] });
      setShowForm(false);
      setFormData({ source: '', amount: '', date: '' });
    }
  });

  const deleteIncome = useMutation({
    mutationFn: (id) => base44.entities.IncomeRecord.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incomeRecords'] })
  });

  const handlePrevMonth = () => {
    const prev = format(subMonths(parse(selectedMonth, 'yyyy-MM', new Date()), 1), 'yyyy-MM');
    setSelectedMonth(prev);
  };

  const handleNextMonth = () => {
    const next = format(addMonths(parse(selectedMonth, 'yyyy-MM', new Date()), 1), 'yyyy-MM');
    setSelectedMonth(next);
  };

  const currentYear = new Date().getFullYear();
  const yearTotal = allIncome
    .filter(i => i.date.startsWith(currentYear.toString()))
    .reduce((sum, i) => sum + i.amount, 0);

  const monthTotal = incomeRecords.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-12 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent mb-2">Income</h1>
          <p className="text-white/70 text-base">This Month: {formatMonthYear(selectedMonth)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl transform hover:scale-110 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-white font-medium px-4">{formatMonthYear(selectedMonth)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl transform hover:scale-110 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      <div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="md:w-auto bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </div>

      {showForm && (
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent mb-4">Add Income</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Source</Label>
              <Input
                placeholder="Paycheck, Cash, etc."
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowForm(false)}
                variant="ghost"
                className="flex-1 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createIncome.mutate({
                  source: formData.source,
                  amount: parseFloat(formData.amount),
                  date: formData.date
                })}
                disabled={!formData.source || !formData.amount || !formData.date}
                className="flex-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 text-white rounded-xl transform hover:scale-105 transition-all shadow-lg"
              >
                Add
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard variant="light" className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/30 via-emerald-400/20 to-transparent rounded-full blur-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-white/80 text-sm font-medium">This Month</p>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              ${monthTotal.toFixed(2)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <p className="text-white/80 text-sm font-medium">Total this year ({currentYear})</p>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              ${yearTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/80 text-sm font-medium py-3">Source</th>
                <th className="text-left text-white/80 text-sm font-medium py-3">Date</th>
                <th className="text-left text-white/80 text-sm font-medium py-3">Amount</th>
                <th className="text-left text-white/80 text-sm font-medium py-3">Delete</th>
              </tr>
            </thead>
            <tbody>
              {incomeRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-white/60">
                    No income yet for this month
                  </td>
                </tr>
              ) : (
                incomeRecords.map((income) => (
                  <tr key={income.id} className="border-b border-white/10">
                    <td className="py-3 text-white">{income.source}</td>
                    <td className="py-3 text-white">{format(new Date(income.date), 'MMM d, yyyy')}</td>
                    <td className="py-3 text-white font-semibold">${income.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteIncome.mutate(income.id)}
                        className="text-white/80 hover:text-red-300 rounded-xl transform hover:scale-110 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}