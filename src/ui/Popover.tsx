import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface AnchoredPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  role?: 'menu' | 'listbox' | 'dialog';
  align?: 'start' | 'end' | 'center';
  placement?: 'bottom' | 'top';
  matchTriggerWidth?: boolean;
  widthClass?: string;
  className?: string;
  autoFocusFirst?: boolean;
  enableMobileBottomSheet?: boolean;
  dataTestId?: string;
}

const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 6;

export function AnchoredPopover({
  isOpen,
  onClose,
  triggerRef,
  children,
  title,
  eyebrow,
  role = 'menu',
  align = 'end',
  placement = 'bottom',
  matchTriggerWidth = false,
  widthClass = 'w-56',
  className = '',
  autoFocusFirst = true,
  enableMobileBottomSheet = true,
  dataTestId,
}: AnchoredPopoverProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? enableMobileBottomSheet && window.innerWidth < 640 : false
  );
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    minWidth?: number;
    maxHeight: number;
  }>({
    top: -9999,
    left: -9999,
    maxHeight: 380,
  });

  const updatePosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = enableMobileBottomSheet && vw < 640;
    setIsMobile(mobile);

    if (mobile) return;

    const triggerEl = triggerRef.current;
    const menuEl = menuRef.current;
    if (!triggerEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const menuWidth = menuEl
      ? Math.max(menuEl.offsetWidth, matchTriggerWidth ? triggerRect.width : 0)
      : matchTriggerWidth
        ? triggerRect.width
        : 224;
    const menuHeight = menuEl ? menuEl.offsetHeight : 220;

    // Horizontal alignment + viewport clamping
    let left =
      align === 'end'
        ? triggerRect.right - menuWidth
        : align === 'center'
          ? triggerRect.left + triggerRect.width / 2 - menuWidth / 2
          : triggerRect.left;

    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - menuWidth - VIEWPORT_MARGIN));

    // Vertical placement + flip + viewport clamping
    const spaceBelow = vh - triggerRect.bottom - TRIGGER_GAP - VIEWPORT_MARGIN;
    const spaceAbove = triggerRect.top - TRIGGER_GAP - VIEWPORT_MARGIN;

    let placeAbove = placement === 'top';
    if (placement === 'bottom' && menuHeight > spaceBelow && spaceAbove > spaceBelow) {
      placeAbove = true;
    } else if (placement === 'top' && menuHeight > spaceAbove && spaceBelow > spaceAbove) {
      placeAbove = false;
    }

    let top = placeAbove
      ? triggerRect.top - TRIGGER_GAP - menuHeight
      : triggerRect.bottom + TRIGGER_GAP;

    const maxHeight = Math.max(
      180,
      placeAbove ? spaceAbove : Math.max(spaceBelow, vh - VIEWPORT_MARGIN * 2)
    );

    top = Math.max(
      VIEWPORT_MARGIN,
      Math.min(top, vh - Math.min(menuHeight, maxHeight) - VIEWPORT_MARGIN)
    );

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      minWidth: matchTriggerWidth ? Math.round(triggerRect.width) : undefined,
      maxHeight: Math.round(maxHeight),
    });
  }, [align, enableMobileBottomSheet, matchTriggerWidth, placement, triggerRef]);

  const updatePositionRef = useRef(updatePosition);
  updatePositionRef.current = updatePosition;

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const rafId = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, updatePosition, children]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = triggerRef.current || (document.activeElement as HTMLElement | null);

    const focusTimer = window.setTimeout(() => {
      if (!autoFocusFirst || !menuRef.current) return;
      const items = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="menuitem"]:not([disabled]), [role="option"]:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('data-sheet-close'));

      if (items.length > 0) {
        items[0].focus();
      } else {
        menuRef.current.focus();
      }
    }, 15);

    const handleScrollOrResize = () => {
      updatePositionRef.current();
    };

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onCloseRef.current();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (!menuRef.current) return;
      const items = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="menuitem"]:not([disabled]), [role="option"]:not([disabled])'
        )
      ).filter((el) => !el.hasAttribute('data-sheet-close'));

      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = currentIndex <= 0 ? items.length - 1 : (currentIndex - 1) % items.length;
        items[prevIndex]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        e.stopPropagation();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        e.stopPropagation();
        items[items.length - 1]?.focus();
      } else if (e.key === 'Tab') {
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handlePointerDownOutside);
    const currentTrigger = triggerRef.current;
    document.addEventListener('touchstart', handlePointerDownOutside);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      window.removeEventListener('keydown', handleKeyDown, true);

      if (autoFocusFirst) {
        const returnEl = currentTrigger || previousFocusRef.current;
        if (returnEl && typeof returnEl.focus === 'function') {
          returnEl.focus();
        }
      }
    };
  }, [autoFocusFirst, isOpen, triggerRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  if (isMobile) {
    return createPortal(
      <div
        style={{ zIndex: 'var(--z-popover)' }}
        className="fixed inset-0 flex items-end justify-center"
      >
        <div
          aria-hidden="true"
          onClick={() => onCloseRef.current()}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        />
        <div
          ref={menuRef}
          role={role}
          aria-label={title || 'Menu'}
          data-testid={dataTestId}
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`relative w-full max-h-[88dvh] rounded-t-[20px] bg-[var(--surface-elevated)] border-t border-[var(--border-strong)] shadow-2xl flex flex-col overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] outline-none ${className}`}
        >
          <div
            aria-hidden="true"
            className="w-9 h-1 rounded-full bg-[var(--border-strong)] mx-auto mt-2 shrink-0"
          />
          {title && (
            <div className="px-4 pt-2.5 pb-2.5 border-b border-[var(--border-hairline)] flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                {eyebrow && (
                  <span
                    className="block text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--accent)' }}
                  >
                    {eyebrow}
                  </span>
                )}
                <span className="block text-sm font-semibold text-[var(--ink-primary)] truncate">
                  {title}
                </span>
              </div>
              <button
                type="button"
                data-sheet-close="true"
                onClick={() => onCloseRef.current()}
                aria-label="Close menu"
                className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="p-2 overflow-y-auto min-h-0 [-webkit-overflow-scrolling:touch]">
            {children}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={menuRef}
      role={role}
      aria-label={title || 'Menu'}
      data-testid={dataTestId}
      tabIndex={-1}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        minWidth: coords.minWidth ? `${coords.minWidth}px` : undefined,
        maxHeight: `${coords.maxHeight}px`,
        zIndex: 'var(--z-popover)',
      }}
      className={`${widthClass} rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-1.5 shadow-xl overflow-y-auto outline-none ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}

export interface AnchorBox {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface AnchoredTooltipProps {
  isOpen: boolean;
  anchorRect: AnchorBox | null;
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
}

export function AnchoredTooltip({
  isOpen,
  anchorRect,
  children,
  className = '',
  dataTestId,
}: AnchoredTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: -9999,
    left: -9999,
  });

  useLayoutEffect(() => {
    if (!isOpen || !anchorRect || typeof window === 'undefined') return;
    const el = tooltipRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = el ? el.offsetWidth : 210;
    const height = el ? el.offsetHeight : 64;

    let left = anchorRect.left + anchorRect.width / 2 - width / 2;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - width - VIEWPORT_MARGIN));

    let top = anchorRect.top - TRIGGER_GAP - height;
    if (top < VIEWPORT_MARGIN) {
      top = anchorRect.bottom + TRIGGER_GAP;
    }
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - height - VIEWPORT_MARGIN));

    setPos({
      top: Math.round(top),
      left: Math.round(left),
    });
  }, [anchorRect, isOpen, children]);

  if (!isOpen || !anchorRect || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      data-testid={dataTestId}
      style={{
        position: 'fixed',
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        zIndex: 'var(--z-popover)',
      }}
      className={`pointer-events-none bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-lg ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}
