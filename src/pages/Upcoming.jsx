import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { format, parseISO, addDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import { getLocalDate, getLocalMonth, isDueToday, getAllDueDatesForMonth } from '@/components/helpers/dateHelpers';
import { motion } from 'framer-motion';

export default function Upcoming() {
  const queryClient = useQueryClient();
  const today = getLocalDate();
  const currentMonth = getLocalMonth();

  const { data: templates = [] } = useQuery({
    queryKey: ['expenseTemplates'],
    queryFn: () => base44.entities.ExpenseTemplate.filter({ isActive: true })
  });

  const { data: paymentRecords = [] } = useQuery({
    queryKey: ['paymentRecords'],
    queryFn: () => base44.entities.PaymentRecord.list()
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

  const allExpenses = [];
  templates.forEach(template => {
    const dueDates = getAllDueDatesForMonth(template, currentMonth);
    dueDates.forEach(dueDate => {
      const paymentRecord = paymentRecords.find(p => p.templateId === template.id && p.dueDate === dueDate);
      allExpenses.push({
        ...template,
        dueDate,
        isPaid: !!paymentRecord,
        paymentRecordId: paymentRecord?.id
      });
    });
  });

  const sevenDaysFromNow = format(addDays(parseISO(today), 7), 'yyyy-MM-dd');
  
  const dueNext7Days = allExpenses.filter(e => 
    !e.isPaid && e.dueDate >= today && e.dueDate <= sevenDaysFromNow
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const dueLater = allExpenses.filter(e => 
    !e.isPaid && e.dueDate > sevenDaysFromNow
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const paidThisMonth = allExpenses.filter(e => e.isPaid)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  const ExpenseRow = ({ exp }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium">{exp.name}</p>
          {isDueToday(exp.dueDate) && (
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">DUE TODAY</span>
          )}
        </div>
        <p className="text-white/60 text-sm">{format(parseISO(exp.dueDate), 'MMM d, yyyy')}</p>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-white font-semibold">${exp.amount.toFixed(2)}</p>
        {exp.isPaid ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => markUnpaid.mutate(exp.paymentRecordId)}
            className="bg-green-500/30 text-green-300 hover:bg-green-500/40 rounded-xl transform hover:scale-105 transition-all shadow-lg shadow-green-500/20"
          >
            Paid
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => markPaid.mutate({ templateId: exp.id, dueDate: exp.dueDate })}
            className="bg-white/10 text-white hover:bg-white/20 rounded-xl transform hover:scale-105 transition-all"
          >
            Mark Paid
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-12 space-y-12">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent"
      >
        Upcoming
      </motion.h1>

      <div className="space-y-8">
        {/* Due Next 7 Days */}
        <GlassCard variant="light" className="p-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-200 to-orange-300 bg-clip-text text-transparent mb-4">Due Next (7 Days)</h3>
          {dueNext7Days.length === 0 ? (
            <p className="text-white/60">Nothing due in the next 7 days</p>
          ) : (
            <div>
              {dueNext7Days.map((exp, idx) => <ExpenseRow key={idx} exp={exp} />)}
            </div>
          )}
        </GlassCard>

        {/* Due Later This Month */}
        <GlassCard className="p-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent mb-4">Due Later (This Month)</h3>
          {dueLater.length === 0 ? (
            <p className="text-white/60">Nothing due later this month</p>
          ) : (
            <div>
              {dueLater.map((exp, idx) => <ExpenseRow key={idx} exp={exp} />)}
            </div>
          )}
        </GlassCard>

        {/* Paid This Month */}
        <GlassCard className="p-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-200 to-emerald-300 bg-clip-text text-transparent mb-4">Paid (This Month)</h3>
          {paidThisMonth.length === 0 ? (
            <p className="text-white/60">No payments yet this month</p>
          ) : (
            <div>
              {paidThisMonth.map((exp, idx) => <ExpenseRow key={idx} exp={exp} />)}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}