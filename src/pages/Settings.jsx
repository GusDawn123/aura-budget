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
    <div className="max-w-2xl mx-auto space-y-10">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent leading-tight"
      >
        Settings
      </motion.h1>

      <GlassCard className="p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-purple-500/20">
              <User className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent">Account Info</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-white/60 text-sm mb-2">Name</p>
              <p className="text-white text-2xl font-semibold">{user?.full_name || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-2">Email</p>
              <p className="text-white text-2xl font-semibold">{user?.email || 'Loading...'}</p>
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