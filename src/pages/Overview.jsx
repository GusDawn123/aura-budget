import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, parse, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, isSameDay } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import { getLocalMonth, formatMonthYear, getAllDueDatesForMonth, isDueToday } from '@/components/helpers/dateHelpers';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

export default function Overview() {
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonth());
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['expenseTemplates'],
    queryFn: async () => {
      try {
        const data = await base44.entities.ExpenseTemplate.filter({ isActive: true });
        if (!Array.isArray(data)) return [];
        return data.filter(item => item && typeof item === 'object');
      } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
      }
    }
  });

  const { data: paymentRecords = [] } = useQuery({
    queryKey: ['paymentRecords'],
    queryFn: async () => {
      try {
        const data = await base44.entities.PaymentRecord.list();
        if (!Array.isArray(data)) return [];
        return data.filter(item => item && typeof item === 'object');
      } catch (error) {
        console.error('Error fetching payment records:', error);
        return [];
      }
    }
  });

  const { data: incomeRecords = [] } = useQuery({
    queryKey: ['incomeRecords', selectedMonth],
    queryFn: async () => {
      try {
        const data = await base44.entities.IncomeRecord.filter({
          date: { $gte: `${selectedMonth}-01`, $lte: `${selectedMonth}-31` }
        });
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          return item && typeof item === 'object' && item.id && 
                 typeof item.source === 'string' && item.source.trim().length > 0 &&
                 typeof item.amount === 'number' && item.amount > 0;
        });
      } catch (error) {
        console.error('Error fetching income:', error);
        return [];
      }
    }
  });

  const markPaid = useMutation({
    mutationFn: ({ templateId, dueDate }) =>
    base44.entities.PaymentRecord.create({
      templateId,
      dueDate,
      paidAt: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['paymentRecords'] })
  });

  const markUnpaid = useMutation({
    mutationFn: (recordId) => base44.entities.PaymentRecord.delete(recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['paymentRecords'] })
  });

  const expensesThisMonth = [];
  const safeTemplates = Array.isArray(templates) ? templates.filter(t => t && t.id) : [];
  const safePaymentRecords = Array.isArray(paymentRecords) ? paymentRecords.filter(p => p && p.id) : [];
  
  safeTemplates.forEach((template) => {
    if (!template || !template.id || !template.firstDueDate) return;
    const dueDates = getAllDueDatesForMonth(template, selectedMonth);
    dueDates.forEach((dueDate) => {
      const paymentRecord = safePaymentRecords.find((p) => p.templateId === template.id && p.dueDate === dueDate);
      expensesThisMonth.push({
        ...template,
        dueDate,
        isPaid: !!paymentRecord,
        paymentRecordId: paymentRecord?.id
      });
    });
  });

  const totalMoneyIn = Array.isArray(incomeRecords) 
    ? incomeRecords.reduce((sum, r) => sum + (Number(r?.amount) || 0), 0) 
    : 0;
  const totalMoneyOut = expensesThisMonth.reduce((sum, e) => sum + e.amount, 0);
  const leftOver = totalMoneyIn - totalMoneyOut;

  const filteredExpenses = expensesThisMonth.filter((e) => {
    if (filter === 'due') return !e.isPaid;
    if (filter === 'paid') return e.isPaid;
    return true;
  });

  const handlePrevMonth = () => {
    const prev = format(subMonths(parse(selectedMonth, 'yyyy-MM', new Date()), 1), 'yyyy-MM');
    setSelectedMonth(prev);
  };

  const handleNextMonth = () => {
    const next = format(addMonths(parse(selectedMonth, 'yyyy-MM', new Date()), 1), 'yyyy-MM');
    setSelectedMonth(next);
  };

  const monthStart = startOfMonth(parse(selectedMonth, 'yyyy-MM', new Date()));
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = new Date();
  const isCurrentMonth = format(today, 'yyyy-MM') === selectedMonth;

  return (
    <div className="space-y-10">
      {/* Month Switcher */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-200 via-purple-100 to-teal-200 bg-clip-text text-transparent mb-2 leading-tight">Overview</h1>
          <p className="text-white/70 text-base">This Month: {formatMonthYear(selectedMonth)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transform hover:scale-110 transition-all h-12 w-12">

            <ChevronLeft className="w-6 h-6" />
          </Button>
          <span className="text-white font-semibold px-6 text-lg">{formatMonthYear(selectedMonth)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transform hover:scale-110 transition-all h-12 w-12">

            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard variant="light" className="p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/30 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-white/90 text-sm font-semibold tracking-wide">MONEY IN</p>
            </div>
            <p className="text-5xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              ${totalMoneyIn.toFixed(2)}
            </p>
            <p className="text-white/60 text-sm">From Income tab</p>
          </div>
        </GlassCard>

        <GlassCard variant="light" className="p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/30 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/20">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-white/90 text-sm font-semibold tracking-wide">MONEY OUT</p>
            </div>
            <p className="text-5xl font-bold bg-gradient-to-r from-red-300 to-orange-400 bg-clip-text text-transparent">
              ${totalMoneyOut.toFixed(2)}
            </p>
            <p className="text-white/60 text-sm">Total expenses for {formatMonthYear(selectedMonth)}</p>
          </div>
        </GlassCard>

        <GlassCard variant="light" className="p-10 relative overflow-hidden group">
          <div className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500",
            leftOver >= 0 ? "bg-gradient-to-br from-purple-400/30 to-transparent" : "bg-gradient-to-br from-red-400/30 to-transparent"
          )} />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-2xl", leftOver >= 0 ? "bg-purple-500/20" : "bg-red-500/20")}>
                <DollarSign className={cn("w-6 h-6", leftOver >= 0 ? "text-purple-400" : "text-red-400")} />
              </div>
              <p className="text-white/90 text-sm font-semibold tracking-wide">LEFT OVER</p>
            </div>
            <p className={cn(
              "text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              leftOver >= 0 ? "from-purple-300 to-teal-300" : "from-red-400 to-orange-400"
            )}>
              ${leftOver >= 0 ? leftOver.toFixed(2) : leftOver.toFixed(2)}
            </p>
            <p className="text-white/60 text-sm">Safe to spend</p>
          </div>
        </GlassCard>
      </div>

      {/* Calendar */}
      <GlassCard className="p-10">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent mb-8">
          Calendar — {formatMonthYear(selectedMonth)}
        </h3>
        <div className="grid grid-cols-7 gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) =>
          <div key={day} className="text-center text-purple-300 text-sm font-bold py-3 tracking-wide">
            {day}
          </div>
          )}
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayExpenses = expensesThisMonth.filter((e) => e.dueDate === dateStr);
            const isToday = isCurrentMonth && isSameDay(day, today);
            return (
              <motion.div 
                key={dateStr}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "min-h-[90px] p-4 rounded-2xl border transition-all cursor-pointer",
                  isToday ?
                  "bg-gradient-to-br from-purple-500/40 to-teal-500/40 border-purple-400/60 shadow-xl shadow-purple-500/40" :
                  "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "text-base font-bold mb-2",
                  isToday ? "text-white" : "text-white/80"
                )}>{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayExpenses.slice(0, 2).map((exp, idx) =>
                  <div key={idx} className="text-xs text-white/70 truncate">
                      ${exp.amount} {exp.name}
                    </div>
                  )}
                  {dayExpenses.length > 2 &&
                  <div className="text-xs text-white/50">+{dayExpenses.length - 2} more</div>
                  }
                  </div>
                  </motion.div>);

          })}
        </div>
      </GlassCard>

      {/* Expenses Sheet */}
      <GlassCard className="p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent">
            Expenses Sheet — {formatMonthYear(selectedMonth)}
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'ghost'}
              onClick={() => setFilter('all')}
              className={cn(
                "text-sm rounded-xl transition-all",
                filter === 'all' ? "bg-gradient-to-r from-purple-500/40 to-teal-500/40 text-white shadow-lg" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}>

              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'due' ? 'default' : 'ghost'}
              onClick={() => setFilter('due')}
              className={cn(
                "text-sm rounded-xl transition-all",
                filter === 'due' ? "bg-gradient-to-r from-purple-500/40 to-teal-500/40 text-white shadow-lg" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}>

              Due
            </Button>
            <Button
              size="sm"
              variant={filter === 'paid' ? 'default' : 'ghost'}
              onClick={() => setFilter('paid')}
              className={cn(
                "text-sm rounded-xl transition-all",
                filter === 'paid' ? "bg-gradient-to-r from-purple-500/40 to-teal-500/40 text-white shadow-lg" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}>

              Paid
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/80 text-sm font-medium py-3">Name</th>
                <th className="text-left text-white/80 text-sm font-medium py-3">Amount</th>
                <th className="text-left text-white/80 text-sm font-medium py-3">Due Date</th>
                <th className="text-left text-white/80 text-sm font-medium py-3">How Often</th>
                <th className="text-left text-white/80 text-sm font-medium py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp, idx) =>
              <tr key={idx} className="border-b border-white/10">
                  <td className="py-3 text-white">{exp.name}</td>
                  <td className="py-3 text-white">${exp.amount.toFixed(2)}</td>
                  <td className="py-3 text-white">
                    {format(parseISO(exp.dueDate), 'MMM d')}
                    {isDueToday(exp.dueDate) &&
                  <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">DUE TODAY</span>
                  }
                  </td>
                  <td className="py-3 text-white/80 text-sm">
                    {exp.scheduleType === 'one_time' ? 'One time' :
                  exp.scheduleType === 'payment_plan' ? `${exp.frequency === 'monthly' ? 'Monthly' : 'Every 2 weeks'} (${exp.planCountRemaining} left)` :
                  exp.frequency === 'weekly' ? 'Weekly' :
                  exp.frequency === 'every_2_weeks' ? 'Every 2 weeks' :
                  exp.frequency === 'monthly' ? 'Monthly' :
                  exp.frequency === 'every_3_months' ? 'Every 3 months' : 'Yearly'}
                  </td>
                  <td className="py-3">
                    {exp.isPaid ?
                    <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markUnpaid.mutate(exp.paymentRecordId)}
                    className="bg-green-500/30 text-green-300 hover:bg-green-500/40 rounded-xl transform hover:scale-105 transition-all shadow-lg shadow-green-500/20">

                        Paid
                      </Button> :

                    <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markPaid.mutate({ templateId: exp.id, dueDate: exp.dueDate })}
                    className="bg-white/10 text-white hover:bg-white/20 rounded-xl transform hover:scale-105 transition-all">

                        Mark Paid
                      </Button>
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>);

}