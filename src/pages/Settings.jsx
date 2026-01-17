import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

export default function Settings() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <GlassCard className="p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Account Info</h3>
        <div className="space-y-4">
          <div>
            <p className="text-white/60 text-sm mb-1">Name</p>
            <p className="text-white text-lg">{user?.full_name || 'Loading...'}</p>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Email</p>
            <p className="text-white text-lg">{user?.email || 'Loading...'}</p>
          </div>
        </div>
      </GlassCard>

      <Button
        onClick={handleLogout}
        className="w-full bg-white/20 hover:bg-white/30 text-white"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign out
      </Button>
    </div>
  );
}