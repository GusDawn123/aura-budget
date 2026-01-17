import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parse, addMonths, subMonths } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getLocalMonth, formatMonthYear } from '@/components/helpers/dateHelpers';
import { motion } from 'framer-motion';

export default function Income() {
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonth());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ source: '', amount: '', date: '' });
  const queryClient = useQueryClient();

  const { data: incomeRecords = [] } = useQuery({
    queryKey: ['incomeRecords', selectedMonth],
    queryFn: async () => {
      try {
        const data = await base44.entities.IncomeRecord.filter({ 
          date: { $gte: `${selectedMonth}-01`, $lte: `${selectedMonth}-31` }
        }, '-date');
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          return item && typeof item === 'object' && item.id && 
                 typeof item.source === 'string' && item.source.trim().length > 0 &&
                 typeof item.amount === 'number' && item.amount > 0;
        });
      } catch (error) {
        console.error('Error fetching income records:', error);
        return [];
      }
    }
  });

  const { data: allIncome = [] } = useQuery({
    queryKey: ['incomeRecords', 'all'],
    queryFn: async () => {
      try {
        const data = await base44.entities.IncomeRecord.list();
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          return item && typeof item === 'object' && item.id && 
                 typeof item.source === 'string' && item.source.trim().length > 0 &&
                 typeof item.amount === 'number' && item.amount > 0;
        });
      } catch (error) {
        console.error('Error fetching all income:', error);
        return [];
      }
    }
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
  const safeAllIncome = Array.isArray(allIncome) ? allIncome : [];
  const safeIncomeRecords = Array.isArray(incomeRecords) ? incomeRecords : [];
  
  const yearTotal = safeAllIncome
    .filter(i => i?.date?.startsWith?.(currentYear.toString()))
    .reduce((sum, i) => sum + (Number(i?.amount) || 0), 0);

  const monthTotal = safeIncomeRecords
    .reduce((sum, i) => sum + (Number(i?.amount) || 0), 0);

  return (
    <ErrorBoundary>
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-200 to-emerald-300 bg-clip-text text-transparent mb-2 leading-tight">Income</h1>
          <p className="text-white/70 text-base">This Month: {formatMonthYear(selectedMonth)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transform hover:scale-110 transition-all h-12 w-12"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <span className="text-white font-semibold px-6 text-lg">{formatMonthYear(selectedMonth)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transform hover:scale-110 transition-all h-12 w-12"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </motion.div>

      <div className="mb-6">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </div>

      {showForm && (
        <GlassCard className="p-8 mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-200 to-emerald-300 bg-clip-text text-transparent mb-4">Add Income</h3>
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

      <GlassCard variant="light" className="p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/30 to-transparent rounded-full blur-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-white/90 text-sm font-semibold tracking-wide">This Month</p>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              ${monthTotal.toFixed(2)}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white/90 text-sm font-semibold tracking-wide">Total this year ({currentYear})</p>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              ${yearTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-10">
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
              {safeIncomeRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-white/60">
                    No income yet for this month
                  </td>
                </tr>
              ) : (
                safeIncomeRecords.map((income) => {
                  if (!income || !income.id || !income.source) return null;
                  return (
                    <tr key={income.id} className="border-b border-white/10">
                      <td className="py-3 text-white">{income.source}</td>
                      <td className="py-3 text-white">
                        {income.date ? format(new Date(income.date), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="py-3 text-white font-semibold">
                        ${(Number(income.amount) || 0).toFixed(2)}
                      </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}