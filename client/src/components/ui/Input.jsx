import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ 
  label, 
  error, 
  className, 
  type = 'text', 
  icon: Icon,
  ...props 
}, ref) => {
  const cn = (...inputs) => twMerge(clsx(inputs));

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-semibold text-foreground ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-muted-foreground">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-background border border-border outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-foreground placeholder:text-muted-foreground shadow-sm',
            Icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
