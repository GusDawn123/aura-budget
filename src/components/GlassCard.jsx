import React from 'react';
import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}