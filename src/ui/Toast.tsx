import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { ToastNotice } from '../domain/types';

interface ToastViewportProps {
  toasts: ToastNotice[];
  onDismiss: (id: string) => void;
}

export const ToastViewport: React.FC<ToastViewportProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 max-w-[380px] w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 text-white rounded-2xl px-4 py-3.5 shadow-xl border border-white/10 flex items-start gap-3 animate-modal-pop"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold leading-snug">{toast.title}</div>
            {toast.detail && (
              <div className="text-[11px] text-slate-300 mt-0.5 truncate">{toast.detail}</div>
            )}
          </div>
          {toast.undoAction && (
            <button
              type="button"
              onClick={() => {
                toast.undoAction?.();
                onDismiss(toast.id);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
