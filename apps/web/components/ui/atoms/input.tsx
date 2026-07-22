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
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2',
          'bg-gray-900 text-white',
          'border border-gray-700 rounded',
          'focus:outline-none focus:border-white',
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
