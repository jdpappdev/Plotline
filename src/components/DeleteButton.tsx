import React, { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AnchoredTooltip } from '../ui/Popover';

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
  const [hovered, setHovered] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipText = disabled
    ? disabledTooltip || "You can't delete your own profile."
    : `Delete ${name}`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        title={tooltipText}
        aria-label={disabled ? tooltipText : `Delete ${name}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (!disabled && onDelete) {
            onDelete();
          }
        }}
        className={`inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] sm:w-9 sm:h-9 sm:min-w-[36px] sm:min-h-[36px] rounded-full text-[var(--ink-muted)] transition-colors cursor-pointer ${
          disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:text-[#DC2626] hover:bg-[#DC2626]/10 focus-visible:text-[#DC2626] focus-visible:bg-[#DC2626]/10 active:text-[#DC2626] active:bg-[#DC2626]/20'
        } ${className}`}
      >
        <Trash2 className="w-4 h-4 shrink-0 pointer-events-none" />
      </button>
      <AnchoredTooltip
        isOpen={hovered}
        anchorRect={btnRef.current?.getBoundingClientRect() || null}
        className="px-2.5 py-1 rounded-[var(--radius-xs)] bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-md text-[11px] font-medium text-[var(--ink-primary)] whitespace-nowrap"
      >
        {tooltipText}
      </AnchoredTooltip>
    </>
  );
}
