import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, parse, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, isSameDay } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import { getLocalMonth, formatMonthYear, getAllDueDatesForMonth, isDueToday } from '@/components/helpers/dateHelpers';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import DayDetailsModal from '@/components/DayDetailsModal';

export default function Overview() {
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonth());
  const [filter, setFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRecords'] });
      queryClient.invalidateQueries({ queryKey: ['expenseTemplates'] });
    }
  });

  const markUnpaid = useMutation({
    mutationFn: (recordId) => base44.entities.PaymentRecord.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRecords'] });
      queryClient.invalidateQueries({ queryKey: ['expenseTemplates'] });
    }
  });

  const expensesThisMonth = [];
  templates.forEach((template) => {
    const dueDates = getAllDueDatesForMonth(template, selectedMonth);
    dueDates.forEach((dueDate) => {
      const paymentRecord = paymentRecords.find((p) => p.templateId === template.id && p.dueDate === dueDate);
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
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Month Switcher */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
        >
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">Overview</h1>
          <p className="text-gray-600 text-base">This Month: {formatMonthYear(selectedMonth)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="bg-white hover:bg-pink-50 text-gray-700 border-pink-200 rounded-xl transform hover:scale-110 transition-all shadow-sm">

            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-gray-800 font-medium px-4">{formatMonthYear(selectedMonth)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="bg-white hover:bg-pink-50 text-gray-700 border-pink-200 rounded-xl transform hover:scale-110 transition-all shadow-sm">

            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard variant="light" className="p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/40 via-green-200/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <p className="text-gray-700 text-sm font-medium">MONEY IN</p>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
              ${totalMoneyIn.toFixed(2)}
            </p>
            <p className="text-gray-500 text-xs">From Income tab</p>
          </div>
        </GlassCard>

        <GlassCard variant="light" className="p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-200/40 via-pink-200/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <p className="text-gray-700 text-sm font-medium">MONEY OUT</p>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-1">
              ${totalMoneyOut.toFixed(2)}
            </p>
            <p className="text-gray-500 text-xs">Total expenses for {formatMonthYear(selectedMonth)}</p>
          </div>
        </GlassCard>

        <GlassCard variant="light" className="p-8 relative overflow-hidden group">
          <div className={cn(
            "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500",
            leftOver >= 0 ? "bg-gradient-to-br from-pink-200/40 to-transparent" : "bg-gradient-to-br from-rose-200/40 to-transparent"
          )} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={cn("w-5 h-5", leftOver >= 0 ? "text-pink-600" : "text-rose-600")} />
              <p className="text-gray-700 text-sm font-medium">LEFT OVER</p>
            </div>
            <p className={cn(
              "text-4xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent",
              leftOver >= 0 ? "from-pink-600 to-rose-600" : "from-rose-600 to-red-600"
            )}>
              ${leftOver >= 0 ? leftOver.toFixed(2) : leftOver.toFixed(2)}
            </p>
            <p className="text-gray-500 text-xs">Safe to spend</p>
          </div>
        </GlassCard>
      </div>

      {/* Calendar */}
      <GlassCard className="p-8">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6">
        Calendar — {formatMonthYear(selectedMonth)}
      </h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) =>
          <div key={day} className="text-center text-gray-700 text-sm font-semibold py-2">
            {day}
          </div>
          )}
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayExpenses = expensesThisMonth.filter((e) => e.dueDate === dateStr);
            const isToday = isCurrentMonth && isSameDay(day, today);
            const anyPaid = dayExpenses.some(e => e.isPaid);
            return (
              <motion.div 
                key={dateStr}
                whileHover={{ scale: 1.05 }}
                onClick={() => dayExpenses.length > 0 && setSelectedDay(dateStr)}
                className={cn(
                  "min-h-[80px] p-3 rounded-2xl border transition-all",
                  dayExpenses.length > 0 ? "cursor-pointer" : "cursor-default",
                  isToday ?
                  "bg-gradient-to-br from-pink-100 to-rose-100 border-pink-400 shadow-lg shadow-pink-500/20" :
                  "bg-pink-50/30 border-pink-200/50 hover:bg-pink-100/50"
                )}
                >
                <div className={cn(
                  "text-sm font-semibold mb-1 flex items-center justify-between",
                  isToday ? "text-pink-700 font-bold" : "text-gray-700"
                )}>
                  <span>{format(day, 'd')}</span>
                  {anyPaid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="space-y-1">
                  {dayExpenses.slice(0, 2).map((exp, idx) =>
                  <div key={idx} className={cn("text-xs truncate", exp.isPaid ? "text-emerald-600 line-through opacity-70" : "text-gray-600")}>
                      ${exp.amount} {exp.name}
                    </div>
                  )}
                  {dayExpenses.length > 2 &&
                  <div className="text-xs text-gray-500">+{dayExpenses.length - 2} more</div>
                  }
                  </div>
                  </motion.div>);

          })}
        </div>
      </GlassCard>

      {/* Expenses Sheet */}
      <GlassCard className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Expenses Sheet — {formatMonthYear(selectedMonth)}
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'ghost'}
              onClick={() => setFilter('all')}
              className={cn(
                "text-sm rounded-xl transition-all",
                filter === 'all' ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg" : "bg-pink-50 text-gray-700 hover:bg-pink-100"
              )}>

              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'due' ? 'default' : 'ghost'}
              onClick={() => setFilter('due')}
              className={cn(
                "text-sm rounded-xl transition-all",
                filter === 'due' ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg" : "bg-pink-50 text-gray-700 hover:bg-pink-100"
              )}>

              Due
            </Button>
            <Button
              size="sm"
              variant={filter === 'paid' ? 'default' : 'ghost'}
              onClick={() => setFilter('paid')}
              className={cn(
                "text-sm rounded-xl transition-all",
                filter === 'paid' ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg" : "bg-pink-50 text-gray-700 hover:bg-pink-100"
              )}>

              Paid
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pink-200">
                <th className="text-left text-gray-700 text-sm font-medium py-3">Name</th>
                <th className="text-left text-gray-700 text-sm font-medium py-3">Amount</th>
                <th className="text-left text-gray-700 text-sm font-medium py-3">Due Date</th>
                <th className="text-left text-gray-700 text-sm font-medium py-3">How Often</th>
                <th className="text-left text-gray-700 text-sm font-medium py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp, idx) =>
              <tr key={idx} className="border-b border-pink-100">
                  <td className="py-3 text-gray-800">{exp.name}</td>
                  <td className="py-3 text-gray-800">${exp.amount.toFixed(2)}</td>
                  <td className="py-3 text-gray-800">
                    {format(parseISO(exp.dueDate), 'MMM d')}
                    {isDueToday(exp.dueDate) &&
                  <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded">DUE TODAY</span>
                  }
                  </td>
                  <td className="py-3 text-gray-600 text-sm">
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
                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl transform hover:scale-105 transition-all shadow-sm">

                        Paid
                      </Button> :

                    <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markPaid.mutate({ templateId: exp.id, dueDate: exp.dueDate })}
                    className="bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-xl transform hover:scale-105 transition-all shadow-sm">

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

      {selectedDay && (
        <DayDetailsModal
          date={selectedDay}
          expenses={expensesThisMonth.filter(e => e.dueDate === selectedDay)}
          onMarkPaid={(templateId, dueDate) => {
            markPaid.mutate({ templateId, dueDate });
          }}
          onMarkUnpaid={(recordId) => {
            markUnpaid.mutate(recordId);
          }}
          onClose={() => setSelectedDay(null)}
        />
      )}
      </div>);

      }