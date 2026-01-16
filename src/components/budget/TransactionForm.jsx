import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import GlassCard from './GlassCard';

const EXPENSE_CATEGORIES = [
  "Food & Dining", "Transportation", "Shopping", "Entertainment",
  "Healthcare", "Utilities", "Housing", "Personal", "Other"
];

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Gift", "Refund", "Other"
];

export default function TransactionForm({ onSubmit, onClose }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Add Transaction</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
          <button
            type="button"
            onClick={() => { setType("expense"); setCategory(""); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              type === "expense" 
                ? "bg-white shadow-sm text-rose-600" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => { setType("income"); setCategory(""); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              type === "income" 
                ? "bg-white shadow-sm text-emerald-600" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Income
          </button>
        </div>

        <div>
          <Label className="text-slate-600">Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 bg-white/50 border-slate-200 focus:border-violet-300"
            required
          />
        </div>

        <div>
          <Label className="text-slate-600">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="mt-1.5 bg-white/50 border-slate-200">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-600">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 bg-white/50 border-slate-200"
            required
          />
        </div>

        <div>
          <Label className="text-slate-600">Description (optional)</Label>
          <Input
            placeholder="Add a note..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 bg-white/50 border-slate-200"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          Add {type === "expense" ? "Expense" : "Income"}
        </Button>
      </form>
    </GlassCard>
  );
}