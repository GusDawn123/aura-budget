import React from 'react';
import GlassCard from './GlassCard';
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, trend, trendUp, className }) {
  return (
    <GlassCard className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-2",
              trendUp ? "text-emerald-600" : "text-rose-500"
            )}>
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
            <Icon className="w-5 h-5 text-violet-600" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}