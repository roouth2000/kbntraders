import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'teal' | 'neutral' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ className = '', variant = 'neutral', size = 'sm', children, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    teal: 'bg-teal-50 text-teal-700 border-teal-200/70',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/60',
  };

  const sizes: Record<string, string> = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  const badgeClass = `inline-flex items-center gap-1 border border-solid ${variants[variant] || variants.neutral} ${sizes[size] || sizes.sm} ${className}`.trim();

  return (
    <span
      className={badgeClass}
      {...props}
    >
      {children}
    </span>
  );
}
