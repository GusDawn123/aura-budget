import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import GlassCard from './GlassCard';

export default function AddExpenseWizard({ onSubmit, onClose }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    amount: '',
    firstDueDate: '',
    doesRepeat: null,
    repeatType: null,
    frequency: null,
    planCountTotal: '',
    alreadyPaid: false
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    const payload = {
      name: data.name,
      amount: parseFloat(data.amount),
      firstDueDate: data.firstDueDate,
      scheduleType: data.doesRepeat === false ? 'one_time' : 
                   data.repeatType === 'repeats' ? 'recurring' : 'payment_plan',
      isActive: true
    };

    if (data.doesRepeat !== false) {
      payload.frequency = data.frequency;
    }

    if (data.repeatType === 'payment_plan') {
      payload.planCountTotal = parseInt(data.planCountTotal);
      payload.planCountRemaining = parseInt(data.planCountTotal);
    }

    onSubmit(payload, data.alreadyPaid);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Add Expense</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-600 hover:text-gray-800 rounded-xl transform hover:scale-110 transition-all">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div>
              <Label className="text-gray-700 mb-2 block">What's the name?</Label>
              <Input
                placeholder="Electric Bill"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="bg-pink-50 border-pink-200 text-gray-800 placeholder:text-gray-500"
              />
              <Button
                onClick={handleNext}
                disabled={!data.name}
                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all"
              >
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <Label className="text-gray-700 mb-2 block">How much?</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.amount}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
                className="bg-pink-50 border-pink-200 text-gray-800 placeholder:text-gray-500"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleBack} variant="ghost" className="flex-1 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
                <Button onClick={handleNext} disabled={!data.amount} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <Label className="text-gray-700 mb-2 block">Due date</Label>
              <Input
                type="date"
                value={data.firstDueDate}
                onChange={(e) => setData({ ...data, firstDueDate: e.target.value })}
                className="bg-pink-50 border-pink-200 text-gray-800"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleBack} variant="ghost" className="flex-1 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
                <Button onClick={handleNext} disabled={!data.firstDueDate} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <Label className="text-gray-700 mb-4 block">Paid already?</Label>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setData({ ...data, alreadyPaid: false });
                    setStep(5);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    setData({ ...data, alreadyPaid: true });
                    setStep(5);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  Yes
                </Button>
              </div>
              <Button onClick={handleBack} variant="ghost" className="w-full mt-4 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
            </div>
          )}

          {step === 5 && (
            <div>
              <Label className="text-gray-700 mb-4 block">Does it repeat?</Label>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setData({ ...data, doesRepeat: false });
                    handleSubmit();
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  No (one time)
                </Button>
                <Button
                  onClick={() => {
                    setData({ ...data, doesRepeat: true });
                    setStep(6);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  Yes
                </Button>
              </div>
              <Button onClick={handleBack} variant="ghost" className="w-full mt-4 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
            </div>
          )}

          {step === 6 && data.doesRepeat === true && (
            <div>
              <Label className="text-gray-700 mb-4 block">What type?</Label>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setData({ ...data, repeatType: 'repeats' });
                    setStep(7);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  Repeats
                </Button>
                <Button
                  onClick={() => {
                    setData({ ...data, repeatType: 'payment_plan' });
                    setStep(7);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  Payment plan
                </Button>
              </div>
              <Button onClick={handleBack} variant="ghost" className="w-full mt-4 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
            </div>
          )}

          {step === 7 && data.repeatType === 'repeats' && (
            <div>
              <Label className="text-gray-700 mb-4 block">How often?</Label>
              <div className="space-y-2">
                {['weekly', 'every_2_weeks', 'monthly', 'every_3_months', 'yearly'].map(freq => (
                  <Button
                    key={freq}
                    onClick={() => {
                      setData({ ...data, frequency: freq });
                      handleSubmit();
                    }}
                    className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                  >
                    {freq === 'weekly' ? 'Weekly' :
                     freq === 'every_2_weeks' ? 'Every 2 weeks' :
                     freq === 'monthly' ? 'Monthly' :
                     freq === 'every_3_months' ? 'Every 3 months' : 'Yearly'}
                  </Button>
                ))}
              </div>
              <Button onClick={handleBack} variant="ghost" className="w-full mt-4 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
            </div>
          )}

          {step === 7 && data.repeatType === 'payment_plan' && (
            <div>
              <Label className="text-gray-700 mb-4 block">How often?</Label>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setData({ ...data, frequency: 'monthly' });
                    setStep(8);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  Monthly
                </Button>
                <Button
                  onClick={() => {
                    setData({ ...data, frequency: 'every_2_weeks' });
                    setStep(8);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-gray-700 justify-start rounded-xl transform hover:scale-105 transition-all"
                >
                  Every 2 weeks
                </Button>
              </div>
              <Button onClick={handleBack} variant="ghost" className="w-full mt-4 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
            </div>
          )}

          {step === 8 && data.repeatType === 'payment_plan' && (
            <div>
              <Label className="text-gray-700 mb-2 block">Total payments?</Label>
              <Input
                type="number"
                placeholder="12"
                value={data.planCountTotal}
                onChange={(e) => setData({ ...data, planCountTotal: e.target.value })}
                className="bg-pink-50 border-pink-200 text-gray-800 placeholder:text-gray-500"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleBack} variant="ghost" className="flex-1 text-gray-700 rounded-xl hover:bg-pink-100">Back</Button>
                <Button onClick={handleSubmit} disabled={!data.planCountTotal} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all">
                  Save
                </Button>
              </div>
            </div>
          )}


        </div>
      </GlassCard>
    </div>
  );
}