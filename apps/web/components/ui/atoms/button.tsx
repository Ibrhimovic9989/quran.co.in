// Button Atom Component
// Single responsibility: Render a button with consistent styling
// Follows Atomic Design & SRP

import { cn } from '@/lib/utils/cn';
import { tokens } from '@/lib/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white border-accent hover:bg-accent-strong',
  secondary: 'bg-surface text-accent-strong border-line hover:bg-accent-soft/60 hover:border-accent/30',
  ghost: 'bg-transparent border-transparent text-ink-muted hover:bg-accent-soft/50 hover:text-accent-strong',
  danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-6 py-3 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-paper',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
