import React from 'react';
import { Trash2 } from 'lucide-react';

export interface DeleteButtonProps {
  name: string;
  onDelete?: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  className?: string;
}

export function DeleteButton({
  name,
  onDelete,
  disabled = false,
  disabledTooltip,
  className = '',
}: DeleteButtonProps) {
  const tooltipText = disabled
    ? disabledTooltip || "You can't delete your own profile."
    : `Delete ${name}`;

  return (
    <button
      type="button"
      disabled={disabled}
      title={tooltipText}
      aria-label={disabled ? tooltipText : `Delete ${name}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onDelete) {
          onDelete();
        }
      }}
      className={`inline-flex items-center justify-center w-9 h-9 min-w-[36px] min-h-[36px] rounded-full text-[var(--ink-muted)] transition-colors cursor-pointer ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:text-[#DC2626] hover:bg-[#DC2626]/10 focus-visible:text-[#DC2626] focus-visible:bg-[#DC2626]/10 active:text-[#DC2626] active:bg-[#DC2626]/20'
      } ${className}`}
    >
      <Trash2 className="w-4 h-4 shrink-0 pointer-events-none" />
    </button>
  );
}
