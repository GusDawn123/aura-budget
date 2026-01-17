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
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-teal-300 bg-clip-text text-transparent">
              {format(parseISO(date), 'MMM d, yyyy')}
            </h3>
            <p className="text-white/60 text-sm mt-1">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-white/80 hover:text-white rounded-xl transform hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-white/60">No expenses due this day.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expenses.map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1">
                  <p className="text-white font-medium">{exp.name}</p>
                  <p className="text-white/60 text-sm">${exp.amount.toFixed(2)}</p>
                </div>
                {exp.isPaid ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkUnpaid(exp.paymentRecordId)}
                    className="bg-green-500/30 text-green-300 hover:bg-green-500/40 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Paid
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkPaid(exp.id, date)}
                    className="bg-white/10 text-white hover:bg-white/20 rounded-lg flex items-center gap-1"
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