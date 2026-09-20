// Toast Notification System
// Provides global toast notifications throughout the app

'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles: Record<ToastType, string> = {
  success: 'bg-surface border-accent/25 text-ink',
  error: 'bg-surface border-red-200 text-red-800',
  info: 'bg-surface border-line text-ink',
  warning: 'bg-surface border-gold/50 text-ink',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-accent',
  error: 'text-red-500',
  info: 'text-ink-muted',
  warning: 'text-gold-text',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = icons[toast.type];
  const duration = toast.duration ?? 3500;

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      className={cn(
        'flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-card transition-all duration-300',
        styles[toast.type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', iconStyles[toast.type])} />
      <p className="flex-1 text-[13px] font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="shrink-0 text-ink-muted transition-colors hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  const success = useCallback((message: string, duration?: number) => toast(message, 'success', duration), [toast]);
  const error = useCallback((message: string, duration?: number) => toast(message, 'error', duration), [toast]);
  const info = useCallback((message: string, duration?: number) => toast(message, 'info', duration), [toast]);
  const warning = useCallback((message: string, duration?: number) => toast(message, 'warning', duration), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-36 right-4 z-[9999] flex flex-col items-end gap-2 md:bottom-20 md:right-6"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
