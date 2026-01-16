import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Download, Trash2, Plus, Pencil, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from '@/components/moneena/GlassCard';
import { format } from 'date-fns';

export default function Settings() {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState('USD');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [editingCategory, setEditingCategory] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list()
  });

  useEffect(() => {
    if (user) {
      setCurrency(user.currency || 'USD');
      setFirstDayOfWeek(user.first_day_of_week ?? 0);
    }
  }, [user]);

  const updateUser = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] })
  });

  const createCategory = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategoryName('');
    }
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
    }
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });

  const handleSaveSettings = () => {
    updateUser.mutate({ currency, first_day_of_week: firstDayOfWeek });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategory.mutate({ name: newCategoryName.trim(), type: newCategoryType });
    }
  };

  const handleExportData = async (type) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    let data = [];
    let filename = '';

    if (type === 'income') {
      data = await base44.entities.Income.filter({ month: currentMonth });
      filename = `moneena-income-${currentMonth}.csv`;
    } else if (type === 'expenses') {
      data = await base44.entities.Expense.filter({ month: currentMonth });
      filename = `moneena-expenses-${currentMonth}.csv`;
    } else if (type === 'bills') {
      data = await base44.entities.Bill.list();
      filename = `moneena-bills-${currentMonth}.csv`;
    }

    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F7FAFC] mb-1">Settings</h1>
        <p className="text-[#C9D4DF] text-sm">Manage your app settings</p>
      </div>

      {/* General Settings */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#F7FAFC] mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-[#C9D4DF] text-sm">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="AUD">AUD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[#C9D4DF] text-sm">First Day of Week</Label>
            <Select value={firstDayOfWeek.toString()} onValueChange={(v) => setFirstDayOfWeek(parseInt(v))}>
              <SelectTrigger className="mt-1.5 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSaveSettings}
            className="w-full bg-[#2CB1BC] hover:bg-[#2CB1BC]/80 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </GlassCard>

      {/* Categories */}
      <GlassCard className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#F7FAFC] mb-4">Categories</h3>
        
        {/* Add Category */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] placeholder:text-[#C9D4DF]/50"
          />
          <Select value={newCategoryType} onValueChange={setNewCategoryType}>
            <SelectTrigger className="w-32 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddCategory}
            className="bg-[#2CB1BC] hover:bg-[#2CB1BC]/80 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Category List */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05]">
              {editingCategory?.id === cat.id ? (
                <>
                  <Input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="flex-1 mr-2 bg-white/[0.08] border-white/[0.18] text-[#F7FAFC]"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateCategory.mutate({ id: cat.id, data: { ...cat, name: editingCategory.name } })}
                    className="bg-[#2CB1BC] hover:bg-[#2CB1BC]/80 text-white mr-2"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingCategory(null)}
                    className="text-[#C9D4DF]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-[#F7FAFC] font-medium">{cat.name}</p>
                    <p className="text-[#C9D4DF] text-xs">{cat.type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCategory(cat)}
                      className="text-[#C9D4DF] hover:text-[#F2C14E]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {!cat.is_default && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCategory.mutate(cat.id)}
                        className="text-[#C9D4DF] hover:text-[#B23B3B]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Export Data */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#F7FAFC] mb-4">Export Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleExportData('income')}
            className="bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] hover:bg-white/[0.12]"
          >
            <Download className="w-4 h-4 mr-2" />
            Income CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportData('expenses')}
            className="bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] hover:bg-white/[0.12]"
          >
            <Download className="w-4 h-4 mr-2" />
            Expenses CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportData('bills')}
            className="bg-white/[0.08] border-white/[0.18] text-[#F7FAFC] hover:bg-white/[0.12]"
          >
            <Download className="w-4 h-4 mr-2" />
            Bills CSV
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}