import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { motion } from 'framer-motion';

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
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent mb-8"
      >
        Settings
      </motion.h1>

      <GlassCard className="p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent">Account Info</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Name</p>
              <p className="text-white text-xl font-medium">{user?.full_name || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Email</p>
              <p className="text-white text-xl font-medium">{user?.email || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <Button
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-red-500/30 to-orange-500/30 hover:from-red-500/40 hover:to-orange-500/40 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign out
      </Button>
    </div>
  );
}