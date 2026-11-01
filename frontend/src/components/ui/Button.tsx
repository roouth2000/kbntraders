import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal-light';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const variants: Record<string, string> = {
      primary: 'bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-sm hover:shadow active:scale-[0.99]',
      secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs',
      outline: 'bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs',
      'teal-light': 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/60',
    };

    const sizes: Record<string, string> = {
      sm: 'text-xs px-2.5 py-2 min-h-[36px] rounded-lg gap-1.5 active:scale-[0.98]',
      md: 'text-sm px-4 py-2.5 min-h-[42px] rounded-xl gap-2 active:scale-[0.98]',
      lg: 'text-base px-5 py-3 min-h-[48px] rounded-xl gap-2.5 active:scale-[0.98]',
      icon: 'p-2 min-h-[40px] min-w-[40px] rounded-xl active:scale-[0.95]',
    };

    const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`.trim();

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
