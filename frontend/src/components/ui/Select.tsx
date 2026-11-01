import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const baseClass = 'w-full bg-white border border-slate-200/90 rounded-xl py-2 px-3.5 text-sm text-slate-800 transition-all duration-150 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer';
    const errorClass = error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : '';
    const selectClasses = `${baseClass} ${errorClass} ${className}`.trim();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
