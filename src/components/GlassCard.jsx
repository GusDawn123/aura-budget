import React from 'react';
import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, variant = 'heavy', ...props }) {
  const variants = {
    light: "backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-lg",
    heavy: "backdrop-blur-xl bg-white/15 border border-white/25 rounded-2xl shadow-2xl"
  };

  return (
    <div
      className={cn(
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}