import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import GlassCard from './GlassCard';

export default function BillForm({ onSubmit, onClose, bill }) {
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount?.toString() || "");
  const [dueDate, setDueDate] = useState(bill?.due_date?.toString() || "");
  const [frequency, setFrequency] = useState(bill?.frequency || "monthly");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      amount: parseFloat(amount),
      due_date: parseInt(dueDate),
      frequency,
      is_paid: bill?.is_paid || false,
      paid_months: bill?.paid_months || []
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#F7FAFC]">
          {bill ? "Edit Bill" : "Add a Bill"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-[#C9D4DF] hover:text-[#F7FAFC]">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-[#C9D4DF] text-sm">Bill Name</Label>
          <Input
            placeholder="Electric, Rent, Netflix..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] placeholder:text-[#C9D4DF]/50"
            required
          />
        </div>

        <div>
          <Label className="text-[#C9D4DF] text-sm">Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] placeholder:text-[#C9D4DF]/50"
            required
          />
        </div>

        <div>
          <Label className="text-[#C9D4DF] text-sm">Due Date (day of month)</Label>
          <Input
            type="number"
            min="1"
            max="31"
            placeholder="1 to 31"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] placeholder:text-[#C9D4DF]/50"
            required
          />
        </div>

        <div>
          <Label className="text-[#C9D4DF] text-sm">How often?</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-Time</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#2CB1BC] hover:bg-[#2CB1BC]/80 text-white font-medium"
        >
          {bill ? "Update Bill" : "Add a Bill"}
        </Button>
      </form>
    </GlassCard>
  );
}