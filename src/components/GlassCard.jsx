import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

export default function GlassCard({ children, className, variant = 'heavy', ...props }) {
  const variants = {
    light: "backdrop-blur-lg bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-3xl shadow-2xl shadow-purple-900/10",
    heavy: "backdrop-blur-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/30 rounded-3xl shadow-2xl shadow-purple-900/20"
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