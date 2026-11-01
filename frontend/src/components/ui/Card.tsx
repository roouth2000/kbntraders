import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className = '', hoverEffect = false, children, ...props }: CardProps) {
  const base = 'bg-white rounded-2xl border border-slate-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.02)] p-5 md:p-6 transition-all duration-200';
  const hover = hoverEffect ? 'hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-slate-200/80' : '';

  return (
    <div
      className={`${base} ${hover} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold text-slate-800 tracking-tight ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}
