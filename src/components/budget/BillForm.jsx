import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import GlassCard from './GlassCard';

const BILL_CATEGORIES = [
  "Rent/Mortgage", "Utilities", "Insurance", "Subscriptions",
  "Phone/Internet", "Loans", "Credit Card", "Other"
];

export default function BillForm({ onSubmit, onClose, bill }) {
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount?.toString() || "");
  const [dueDate, setDueDate] = useState(bill?.due_date?.toString() || "");
  const [category, setCategory] = useState(bill?.category || "");
  const [isRecurring, setIsRecurring] = useState(bill?.is_recurring ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      amount: parseFloat(amount),
      due_date: parseInt(dueDate),
      category,
      is_recurring: isRecurring,
      is_paid: bill?.is_paid || false
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          {bill ? "Edit Bill" : "Add Bill"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-slate-600">Bill Name</Label>
          <Input
            placeholder="e.g., Netflix, Electric Bill"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 bg-white/50 border-slate-200"
            required
          />
        </div>

        <div>
          <Label className="text-slate-600">Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 bg-white/50 border-slate-200"
            required
          />
        </div>

        <div>
          <Label className="text-slate-600">Due Date (day of month)</Label>
          <Input
            type="number"
            min="1"
            max="31"
            placeholder="1-31"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1.5 bg-white/50 border-slate-200"
            required
          />
        </div>

        <div>
          <Label className="text-slate-600">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1.5 bg-white/50 border-slate-200">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {BILL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between py-2">
          <Label className="text-slate-600">Recurring Monthly</Label>
          <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {bill ? "Update Bill" : "Add Bill"}
        </Button>
      </form>
    </GlassCard>
  );
}