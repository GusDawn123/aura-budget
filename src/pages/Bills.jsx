import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";

import GlassCard from '@/components/budget/GlassCard';
import BillForm from '@/components/budget/BillForm';
import BillList from '@/components/budget/BillList';

export default function Bills() {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
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

  const resetAllBills = useMutation({
    mutationFn: async () => {
      const updates = bills
        .filter(b => b.is_paid)
        .map(b => base44.entities.Bill.update(b.id, { ...b, is_paid: false }));
      await Promise.all(updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] })
  });

  const handleTogglePaid = (bill) => {
    updateBill.mutate({ 
      id: bill.id, 
      data: { ...bill, is_paid: !bill.is_paid } 
    });
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleSubmit = (data) => {
    if (editingBill) {
      updateBill.mutate({ id: editingBill.id, data });
    } else {
      createBill.mutate(data);
    }
  };

  // Stats
  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidBills = bills.filter(b => b.is_paid);
  const paidTotal = paidBills.reduce((sum, b) => sum + b.amount, 0);
  const unpaidTotal = totalBills - paidTotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bills</h1>
            <p className="text-slate-500 text-sm">Manage your recurring bills</p>
          </div>
          <div className="flex gap-2">
            {paidBills.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => resetAllBills.mutate()}
                className="border-slate-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Month
              </Button>
            )}
            <Button 
              onClick={() => { setEditingBill(null); setShowForm(true); }}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
        <GlassCard className="p-5 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-500">Total Monthly</p>
              <p className="text-xl font-semibold text-slate-800">${totalBills.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Paid</p>
              <p className="text-xl font-semibold text-emerald-600">${paidTotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="text-xl font-semibold text-rose-500">${unpaidTotal.toFixed(2)}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: totalBills > 0 ? `${(paidTotal / totalBills) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {paidBills.length} of {bills.length} bills paid this month
          </p>
        </GlassCard>

        {/* Bills List */}
        <BillList 
          bills={bills}
          onTogglePaid={handleTogglePaid}
          onEdit={handleEdit}
          onDelete={(id) => deleteBill.mutate(id)}
        />
      </div>
    </div>
  );
}