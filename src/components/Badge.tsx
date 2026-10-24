import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'tpopt' | 'tprpt' | 'ongoing' | 'upcoming' | 'completed' | 'rep' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-sm font-semibold';

  let variantClasses = 'bg-surface-lighter text-text-secondary border border-surface-border';

  switch (variant) {
    case 'tpopt':
      variantClasses = 'bg-orange-500/15 text-orange-400 border border-orange-500/35 font-bold tracking-wide';
      break;
    case 'tprpt':
      variantClasses = 'bg-sky-500/15 text-sky-400 border border-sky-500/35 font-bold tracking-wide';
      break;
    case 'ongoing':
      variantClasses = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      break;
    case 'upcoming':
      variantClasses = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      break;
    case 'completed':
      variantClasses = 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
      break;
    case 'rep':
      variantClasses = 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full uppercase ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}
