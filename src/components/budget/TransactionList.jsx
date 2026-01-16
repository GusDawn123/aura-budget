import React from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlassCard from './GlassCard';

export default function TransactionList({ transactions, onDelete }) {
  if (!transactions?.length) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-slate-500">No transactions yet</p>
        <p className="text-sm text-slate-400 mt-1">Add your first transaction to get started</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="divide-y divide-slate-100">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="p-4 flex items-center gap-4 hover:bg-white/50 transition-colors group"
          >
            <div className={`p-2 rounded-xl ${
              transaction.type === 'income' 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-rose-100 text-rose-500'
            }`}>
              {transaction.type === 'income' 
                ? <ArrowUpRight className="w-4 h-4" />
                : <ArrowDownRight className="w-4 h-4" />
              }
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">
                {transaction.category}
              </p>
              {transaction.description && (
                <p className="text-sm text-slate-500 truncate">{transaction.description}</p>
              )}
            </div>
            
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">
                {format(new Date(transaction.date), 'MMM d')}
              </p>
            </div>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(transaction.id)}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}