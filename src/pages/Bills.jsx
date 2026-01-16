import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import GlassCard from '@/components/moneena/GlassCard';
import BillForm from '@/components/moneena/BillForm';
import { cn } from "@/lib/utils";

export default function Bills() {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy');
  const queryClient = useQueryClient();

  const { data: bills = [] } = useQuery({
    queryKey: ['bills'],
    queryFn: () => base44.entities.Bill.list()
  });

  const createBill = useMutation({
    mutationFn: (data) => base44.entities.Bill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setShowForm(false);
    }
  });

  const updateBill = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Bill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setEditingBill(null);
      setShowForm(false);
    }
  });

  const deleteBill = useMutation({
    mutationFn: (id) => base44.entities.Bill.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] })
  });

  const handleTogglePaid = (bill) => {
    const paidMonths = bill.paid_months || [];
    const isPaidThisMonth = paidMonths.includes(currentMonth);
    
    const newPaidMonths = isPaidThisMonth
      ? paidMonths.filter(m => m !== currentMonth)
      : [...paidMonths, currentMonth];

    updateBill.mutate({
      id: bill.id,
      data: { ...bill, paid_months: newPaidMonths, is_paid: !isPaidThisMonth }
    });
  };

  const handleSubmit = (data) => {
    if (editingBill) {
      updateBill.mutate({ id: editingBill.id, data });
    } else {
      createBill.mutate(data);
    }
  };

  const sortedBills = [...bills].sort((a, b) => a.due_date - b.due_date);
  const paidBills = bills.filter(b => b.paid_months?.includes(currentMonth));
  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidTotal = paidBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F7FAFC] mb-1">Bills</h1>
          <p className="text-[#C9D4DF] text-sm">This Month: {monthLabel}</p>
        </div>
        <Button
          onClick={() => { setEditingBill(null); setShowForm(true); }}
          className="bg-[#2CB1BC] hover:bg-[#2CB1BC]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a Bill
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <BillForm
              bill={editingBill}
              onSubmit={handleSubmit}
              onClose={() => { setShowForm(false); setEditingBill(null); }}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      <GlassCard className="p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-[#C9D4DF] text-sm mb-1">Total Bills</p>
            <p className="text-2xl font-bold text-[#F7FAFC]">${totalBills.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[#C9D4DF] text-sm mb-1">Paid</p>
            <p className="text-2xl font-bold text-[#1F6B3A]">${paidTotal.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[#C9D4DF] text-sm mb-1">Not Paid</p>
            <p className="text-2xl font-bold text-[#B23B3B]">${(totalBills - paidTotal).toFixed(2)}</p>
          </div>
        </div>
        <div className="h-2 bg-white/[0.12] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1F6B3A] transition-all duration-500"
            style={{ width: totalBills > 0 ? `${(paidTotal / totalBills) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-[#C9D4DF] mt-2 text-center">
          {paidBills.length} of {bills.length} bills paid
        </p>
      </GlassCard>

      {/* Bills List */}
      <GlassCard className="overflow-hidden">
        {sortedBills.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#C9D4DF]">No bills yet</p>
            <p className="text-[#C9D4DF]/70 text-sm mt-1">Add your first bill to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.12]">
            {sortedBills.map((bill) => {
              const isPaid = bill.paid_months?.includes(currentMonth);
              return (
                <div key={bill.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.05] group">
                  <button
                    onClick={() => handleTogglePaid(bill)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isPaid
                        ? "bg-[#1F6B3A]/20 text-[#1F6B3A]"
                        : "bg-white/[0.08] text-[#C9D4DF] hover:bg-[#2CB1BC]/20 hover:text-[#2CB1BC]"
                    )}
                  >
                    {isPaid ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium",
                      isPaid ? "text-[#C9D4DF] line-through" : "text-[#F7FAFC]"
                    )}>
                      {bill.name}
                    </p>
                    <p className="text-sm text-[#C9D4DF]">
                      Due on day {bill.due_date} · {bill.frequency}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-[#F7FAFC]">${bill.amount.toFixed(2)}</p>
                    <p className="text-xs text-[#C9D4DF]">
                      {isPaid ? 'Paid' : 'Not Paid'}
                    </p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingBill(bill); setShowForm(true); }}
                      className="h-8 w-8 text-[#C9D4DF] hover:text-[#F2C14E]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBill.mutate(bill.id)}
                      className="h-8 w-8 text-[#C9D4DF] hover:text-[#B23B3B]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}