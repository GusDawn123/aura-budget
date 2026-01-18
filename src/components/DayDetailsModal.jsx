import React from 'react';
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Circle } from 'lucide-react';
import GlassCard from './GlassCard';
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";

export default function DayDetailsModal({ date, expenses, onMarkPaid, onMarkUnpaid, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              {format(parseISO(date), 'MMM d, yyyy')}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-800 rounded-xl transform hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No expenses due this day.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expenses.map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-pink-50 rounded-xl border border-pink-200">
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{exp.name}</p>
                  <p className="text-gray-600 text-sm">${exp.amount.toFixed(2)}</p>
                </div>
                {exp.isPaid ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkUnpaid(exp.paymentRecordId)}
                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Paid
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkPaid(exp.id, date)}
                    className="bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-lg flex items-center gap-1"
                  >
                    <Circle className="w-4 h-4" />
                    Mark Paid
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}