import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlassCard from '@/components/GlassCard';
import AddExpenseWizard from '@/components/AddExpenseWizard';
import { getNextDueDateFromNow } from '@/components/helpers/dateHelpers';
import { safeFormatDate, safeMoney } from '@/utils/safe';
import { motion } from 'framer-motion';

export default function Expenses() {
  const [showWizard, setShowWizard] = useState(false);
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

  const createTemplate = useMutation({
    mutationFn: async ({ templateData, alreadyPaid }) => {
      const template = await base44.entities.ExpenseTemplate.create(templateData);
      if (alreadyPaid) {
        await base44.entities.PaymentRecord.create({
          templateId: template.id,
          dueDate: templateData.firstDueDate,
          paidAt: new Date().toISOString()
        });
      }
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRecords'] });
      setShowWizard(false);
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.ExpenseTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenseTemplates'] })
  });

  const safeTemplates = Array.isArray(templates) ? templates.filter(t => t && t.id) : [];
  const repeatingBills = safeTemplates.filter(t => 
    t && (t.scheduleType === 'recurring' || t.scheduleType === 'payment_plan')
  );

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-200 to-orange-300 bg-clip-text text-transparent leading-tight">Expenses</h1>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-gradient-to-r from-red-500/30 to-orange-500/30 hover:from-red-500/40 hover:to-orange-500/40 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </motion.div>

      {showWizard && (
        <AddExpenseWizard
          onSubmit={(templateData, alreadyPaid) => createTemplate.mutate({ templateData, alreadyPaid })}
          onClose={() => setShowWizard(false)}
        />
      )}

      <GlassCard variant="light" className="p-10">
        <div className="mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-red-200 to-orange-300 bg-clip-text text-transparent">Bills that repeat</h3>
          <p className="text-white/60 text-sm">Tap a bill to edit.</p>
        </div>

        {repeatingBills.length === 0 ? (
          <p className="text-white/60 text-center py-8">No repeating bills yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-white/80 text-sm font-medium py-3">Name</th>
                  <th className="text-left text-white/80 text-sm font-medium py-3">Due Date</th>
                  <th className="text-left text-white/80 text-sm font-medium py-3">How Often</th>
                  <th className="text-left text-white/80 text-sm font-medium py-3">Amount</th>
                  <th className="text-left text-white/80 text-sm font-medium py-3">Edit</th>
                </tr>
              </thead>
              <tbody>
                {repeatingBills.map((bill) => {
                  const nextDue = getNextDueDateFromNow(bill, paymentRecords);
                  return (
                    <tr key={bill.id} className="border-b border-white/10">
                       <td className="py-3 text-white">{bill.name}</td>
                       <td className="py-3 text-white">
                         {nextDue ? safeFormatDate(nextDue, 'MMM d, yyyy') : 'All paid'}
                       </td>
                       <td className="py-3 text-white/80 text-sm">
                         {bill.scheduleType === 'payment_plan' 
                           ? `${bill.frequency === 'monthly' ? 'Monthly' : 'Every 2 weeks'} (${bill.planCountRemaining} left)`
                           : bill.frequency === 'weekly' ? 'Weekly' :
                             bill.frequency === 'every_2_weeks' ? 'Every 2 weeks' :
                             bill.frequency === 'monthly' ? 'Monthly' :
                             bill.frequency === 'every_3_months' ? 'Every 3 months' : 'Yearly'}
                       </td>
                       <td className="py-3 text-white font-semibold">${safeMoney(bill.amount)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/80 hover:text-white rounded-xl transform hover:scale-110 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplate.mutate(bill.id)}
                            className="text-white/80 hover:text-red-300 rounded-xl transform hover:scale-110 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}