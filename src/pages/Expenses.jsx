import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, parseISO } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import AddExpenseWizard from '@/components/AddExpenseWizard';
import { getNextDueDateFromNow } from '@/components/helpers/dateHelpers';

export default function Expenses() {
  const [showWizard, setShowWizard] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['expenseTemplates'],
    queryFn: () => base44.entities.ExpenseTemplate.filter({ isActive: true })
  });

  const { data: paymentRecords = [] } = useQuery({
    queryKey: ['paymentRecords'],
    queryFn: () => base44.entities.PaymentRecord.list()
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

  const repeatingBills = templates.filter(t => 
    t.scheduleType === 'recurring' || t.scheduleType === 'payment_plan'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Expenses</h1>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-white/20 hover:bg-white/30 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {showWizard && (
        <AddExpenseWizard
          onSubmit={(templateData, alreadyPaid) => createTemplate.mutate({ templateData, alreadyPaid })}
          onClose={() => setShowWizard(false)}
        />
      )}

      <GlassCard variant="light" className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">Bills that repeat</h3>
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
                        {nextDue ? format(parseISO(nextDue), 'MMM d, yyyy') : 'All paid'}
                      </td>
                      <td className="py-3 text-white/80 text-sm">
                        {bill.scheduleType === 'payment_plan' 
                          ? `${bill.frequency === 'monthly' ? 'Monthly' : 'Every 2 weeks'} (${bill.planCountRemaining} left)`
                          : bill.frequency === 'weekly' ? 'Weekly' :
                            bill.frequency === 'every_2_weeks' ? 'Every 2 weeks' :
                            bill.frequency === 'monthly' ? 'Monthly' :
                            bill.frequency === 'every_3_months' ? 'Every 3 months' : 'Yearly'}
                      </td>
                      <td className="py-3 text-white font-semibold">${bill.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/80 hover:text-white"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplate.mutate(bill.id)}
                            className="text-white/80 hover:text-red-300"
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