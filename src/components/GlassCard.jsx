import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

export default function GlassCard({ children, className, variant = 'heavy', ...props }) {
  const variants = {
    light: "bg-white border border-pink-200/60 rounded-3xl shadow-xl shadow-pink-500/10",
    heavy: "bg-white border border-pink-300/70 rounded-3xl shadow-2xl shadow-pink-500/15"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        variants[variant],
        "transform hover:scale-[1.01] transition-transform duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}