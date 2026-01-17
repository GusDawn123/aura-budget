import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, parse, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, isSameDay } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import { getLocalMonth, formatMonthYear, getAllDueDatesForMonth, isDueToday } from '@/components/helpers/dateHelpers';
import { cn } from "@/lib/utils";

export default function Overview() {
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonth());
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['expenseTemplates'],
    queryFn: () => base44.entities.ExpenseTemplate.filter({ isActive: true })
  });

  const { data: paymentRecords = [] } = useQuery({
    queryKey: ['paymentRecords'],
    queryFn: () => base44.entities.PaymentRecord.list()
  });

  const { data: incomeRecords = [] } = useQuery({
    queryKey: ['incomeRecords', selectedMonth],
    queryFn: () => base44.entities.IncomeRecord.filter({ 
      date: { $gte: `${selectedMonth}-01`, $lte: `${selectedMonth}-31` }
    })
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
  templates.forEach(template => {
    const dueDates = getAllDueDatesForMonth(template, selectedMonth);
    dueDates.forEach(dueDate => {
      const paymentRecord = paymentRecords.find(p => p.templateId === template.id && p.dueDate === dueDate);
      expensesThisMonth.push({
        ...template,
        dueDate,
        isPaid: !!paymentRecord,
        paymentRecordId: paymentRecord?.id
      });
    });
  });

  const totalMoneyIn = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalMoneyOut = expensesThisMonth.reduce((sum, e) => sum + e.amount, 0);
  const leftOver = totalMoneyIn - totalMoneyOut;

  const filteredExpenses = expensesThisMonth.filter(e => {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Month Switcher */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
          <p className="text-white/80 text-sm">This Month: {formatMonthYear(selectedMonth)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-white font-medium px-4">{formatMonthYear(selectedMonth)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard variant="light" className="p-6">
          <p className="text-white/80 text-sm mb-1">MONEY IN</p>
          <p className="text-3xl font-bold text-white mb-1">${totalMoneyIn.toFixed(2)}</p>
          <p className="text-white/60 text-xs">From Income tab</p>
          </GlassCard>

          <GlassCard variant="light" className="p-6">
          <p className="text-white/80 text-sm mb-1">MONEY OUT</p>
          <p className="text-3xl font-bold text-white mb-1">${totalMoneyOut.toFixed(2)}</p>
          <p className="text-white/60 text-xs">Total expenses for {formatMonthYear(selectedMonth)}</p>
          </GlassCard>

          <GlassCard variant="light" className="p-6">
          <p className="text-white/80 text-sm mb-1">LEFT OVER</p>
          <p className={cn("text-3xl font-bold mb-1", leftOver >= 0 ? "text-green-400" : "text-red-400")}>
            ${leftOver >= 0 ? leftOver.toFixed(2) : `${leftOver.toFixed(2)}`}
          </p>
          <p className="text-white/60 text-xs">Safe to spend</p>
        </GlassCard>
      </div>

      {/* Calendar */}
      <GlassCard className="p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Calendar — {formatMonthYear(selectedMonth)}</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-white/60 text-sm font-medium py-2">
              {day}
            </div>
          ))}
          {calendarDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayExpenses = expensesThisMonth.filter(e => e.dueDate === dateStr);
            const isToday = isCurrentMonth && isSameDay(day, today);
            return (
              <div key={dateStr} className={cn(
                "min-h-[80px] p-2 rounded-lg border",
                isToday 
                  ? "bg-white/20 border-white/40 ring-2 ring-white/50" 
                  : "bg-white/5 border-white/10"
              )}>
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-white font-bold" : "text-white/80"
                )}>{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayExpenses.slice(0, 2).map((exp, idx) => (
                    <div key={idx} className="text-xs text-white/70 truncate">
                      ${exp.amount} {exp.name}
                    </div>
                  ))}
                  {dayExpenses.length > 2 && (
                    <div className="text-xs text-white/50">+{dayExpenses.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Expenses Sheet */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Expenses Sheet — {formatMonthYear(selectedMonth)}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'ghost'}
              onClick={() => setFilter('all')}
              className={cn(
                "text-sm",
                filter === 'all' ? "bg-white/20 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'due' ? 'default' : 'ghost'}
              onClick={() => setFilter('due')}
              className={cn(
                "text-sm",
                filter === 'due' ? "bg-white/20 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}
            >
              Due
            </Button>
            <Button
              size="sm"
              variant={filter === 'paid' ? 'default' : 'ghost'}
              onClick={() => setFilter('paid')}
              className={cn(
                "text-sm",
                filter === 'paid' ? "bg-white/20 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}
            >
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
              {filteredExpenses.map((exp, idx) => (
                <tr key={idx} className="border-b border-white/10">
                  <td className="py-3 text-white">{exp.name}</td>
                  <td className="py-3 text-white">${exp.amount.toFixed(2)}</td>
                  <td className="py-3 text-white">
                    {format(parseISO(exp.dueDate), 'MMM d')}
                    {isDueToday(exp.dueDate) && (
                      <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">DUE TODAY</span>
                    )}
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
                    {exp.isPaid ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markUnpaid.mutate(exp.paymentRecordId)}
                        className="bg-green-500/20 text-green-300 hover:bg-green-500/30"
                      >
                        Paid
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markPaid.mutate({ templateId: exp.id, dueDate: exp.dueDate })}
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}