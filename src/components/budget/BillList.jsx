import React from 'react';
import { Check, Clock, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlassCard from './GlassCard';
import { cn } from "@/lib/utils";

export default function BillList({ bills, onTogglePaid, onEdit, onDelete }) {
  if (!bills?.length) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-slate-500">No bills added</p>
        <p className="text-sm text-slate-400 mt-1">Add recurring bills to track your monthly expenses</p>
      </GlassCard>
    );
  }

  const sortedBills = [...bills].sort((a, b) => a.due_date - b.due_date);
  const today = new Date().getDate();

  return (
    <GlassCard className="overflow-hidden">
      <div className="divide-y divide-slate-100">
        {sortedBills.map((bill) => {
          const isPastDue = !bill.is_paid && bill.due_date < today;
          const isDueSoon = !bill.is_paid && bill.due_date >= today && bill.due_date <= today + 3;

          return (
            <div 
              key={bill.id} 
              className="p-4 flex items-center gap-4 hover:bg-white/50 transition-colors group"
            >
              <button
                onClick={() => onTogglePaid(bill)}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  bill.is_paid 
                    ? "bg-emerald-100 text-emerald-600" 
                    : isPastDue 
                      ? "bg-rose-100 text-rose-500"
                      : isDueSoon
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-100 text-slate-400 hover:bg-violet-100 hover:text-violet-600"
                )}
              >
                {bill.is_paid ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  bill.is_paid ? "text-slate-400 line-through" : "text-slate-800"
                )}>
                  {bill.name}
                </p>
                <p className="text-sm text-slate-500">
                  {bill.category && `${bill.category} · `}
                  Due on {bill.due_date}{getDaySuffix(bill.due_date)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  ${bill.amount.toFixed(2)}
                </p>
                {bill.is_recurring && (
                  <p className="text-xs text-slate-400">monthly</p>
                )}
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(bill)}
                  className="h-8 w-8 text-slate-400 hover:text-violet-600"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete(bill.id)}
                  className="h-8 w-8 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}