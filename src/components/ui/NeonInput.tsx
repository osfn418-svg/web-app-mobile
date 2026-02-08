import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NeonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full px-4 py-3 bg-muted border border-border rounded-xl',
              'text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'input-glow transition-all duration-200',
              icon && 'pr-10',
              error && 'border-destructive focus:border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

NeonInput.displayName = 'NeonInput';

export default NeonInput;
