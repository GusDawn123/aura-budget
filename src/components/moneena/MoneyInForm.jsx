import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import GlassCard from './GlassCard';
import { format } from 'date-fns';

const INCOME_SOURCES = ["Paycheck", "Cash", "Gift", "Refund", "Bonus", "Side Job", "Other"];

export default function MoneyInForm({ onSubmit, onClose, currentMonth }) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount),
      source,
      date,
      note: note || undefined,
      is_recurring: isRecurring,
      month: currentMonth
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#F7FAFC]">Add Money In</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-[#C9D4DF] hover:text-[#F7FAFC]">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label className="text-[#C9D4DF] text-sm">Source</Label>
          <Select value={source} onValueChange={setSource} required>
            <SelectTrigger className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]">
              <SelectValue placeholder="Where did this come from?" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[#C9D4DF] text-sm">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]"
            required
          />
        </div>

        <div>
          <Label className="text-[#C9D4DF] text-sm">Note (optional)</Label>
          <Input
            placeholder="Add details..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] placeholder:text-[#C9D4DF]/50"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label className="text-[#C9D4DF] text-sm">Recurring income?</Label>
          <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#2CB1BC] hover:bg-[#2CB1BC]/80 text-white font-medium"
        >
          Add Money In
        </Button>
      </form>
    </GlassCard>
  );
}