"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'top-right' | 'bottom-right';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

class ToastManager {
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private toasts: Toast[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(message: string, type: Toast['type'] = 'info', options?: ToastOptions) {
    const id = Math.random().toString(36);
    const toast: Toast = {
      id,
      message,
      type,
      duration: options?.duration || 3000
    };

    this.toasts.push(toast);
    this.notify();

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.notify();
    }, toast.duration);
  }

  success(message: string, options?: ToastOptions) {
    this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    this.show(message, 'error', options);
  }

  info(message: string, options?: ToastOptions) {
    this.show(message, 'info', options);
  }

  warning(message: string, options?: ToastOptions) {
    this.show(message, 'warning', options);
  }
}

export const toast = new ToastManager();

// مكونات إضافية للتوافق مع shadcn/ui
export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Toast = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastTitle = ({ children }: { children: React.ReactNode }) => <div className="font-semibold">{children}</div>;
export const ToastDescription = ({ children }: { children: React.ReactNode }) => <div className="text-sm opacity-90">{children}</div>;
export const ToastClose = () => <button className="ml-auto">×</button>;
export const ToastViewport = () => <div />;

function ToastComponent({ toast: t }: { toast: Toast }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, t.duration - 300);
    return () => clearTimeout(timer);
  }, [t.duration]);

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: '✅',
      border: 'border-green-400'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: '❌',
      border: 'border-red-400'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: 'ℹ️',
      border: 'border-blue-400'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: '⚠️',
      border: 'border-yellow-400'
    }
  }[t.type];

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white
        ${styles.bg}
        transition-all duration-300 transform pointer-events-auto
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
        min-w-[320px] max-w-[500px]
        backdrop-blur-md bg-opacity-95
        border ${styles.border} border-opacity-30
      `}
    >
      <span className="text-2xl">{styles.icon}</span>
      <p className="text-base font-medium flex-1">{t.message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 text-white/70 hover:text-white transition-colors"
        aria-label="إغلاق"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return toast.subscribe(setToasts);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <ToastComponent key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  );
}