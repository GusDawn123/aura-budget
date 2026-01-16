import React from 'react';
import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-lg shadow-black/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}