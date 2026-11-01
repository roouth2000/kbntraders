import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const baseClass = 'w-full min-h-[42px] bg-white border border-slate-200/90 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-150 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';
    const iconClass = icon ? 'pl-10' : '';
    const errorClass = error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : '';
    const inputClasses = `${baseClass} ${iconClass} ${errorClass} ${className}`.trim();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={inputClasses}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
