// Input Atom Component
// Single responsibility: Render an input field with consistent styling
// Follows Atomic Design & SRP

import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-muted mb-2">{label}</label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2',
          'bg-surface text-ink',
          'border border-line rounded',
          'focus:outline-none focus:border-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
