import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, parseISO } from 'date-fns';
import GlassCard from '@/components/GlassCard';
import AddExpenseWizard from '@/components/AddExpenseWizard';
import { getNextDueDateFromNow } from '@/components/helpers/dateHelpers';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-12 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Expenses</h1>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all"
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

      <GlassCard variant="light" className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Bills that repeat</h3>
          <p className="text-gray-600 text-sm">Tap a bill to edit.</p>
        </div>

        {repeatingBills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No repeating bills yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pink-200">
                  <th className="text-left text-gray-700 text-sm font-medium py-3">Name</th>
                  <th className="text-left text-gray-700 text-sm font-medium py-3">Due Date</th>
                  <th className="text-left text-gray-700 text-sm font-medium py-3">How Often</th>
                  <th className="text-left text-gray-700 text-sm font-medium py-3">Amount</th>
                  <th className="text-left text-gray-700 text-sm font-medium py-3">Edit</th>
                </tr>
              </thead>
              <tbody>
                {repeatingBills.map((bill) => {
                  const nextDue = getNextDueDateFromNow(bill, paymentRecords);
                  return (
                    <tr key={bill.id} className="border-b border-pink-100">
                      <td className="py-3 text-gray-800">{bill.name}</td>
                      <td className="py-3 text-gray-800">
                        {nextDue ? format(parseISO(nextDue), 'MMM d, yyyy') : 'All paid'}
                      </td>
                      <td className="py-3 text-gray-600 text-sm">
                        {bill.scheduleType === 'payment_plan' 
                          ? `${bill.frequency === 'monthly' ? 'Monthly' : 'Every 2 weeks'} (${bill.planCountRemaining} left)`
                          : bill.frequency === 'weekly' ? 'Weekly' :
                            bill.frequency === 'every_2_weeks' ? 'Every 2 weeks' :
                            bill.frequency === 'monthly' ? 'Monthly' :
                            bill.frequency === 'every_3_months' ? 'Every 3 months' : 'Yearly'}
                      </td>
                      <td className="py-3 text-gray-800 font-semibold">${bill.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:text-pink-700 hover:bg-pink-100 rounded-xl transform hover:scale-110 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplate.mutate(bill.id)}
                            className="text-gray-600 hover:text-rose-700 hover:bg-rose-100 rounded-xl transform hover:scale-110 transition-all"
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