import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { ContourGlyph } from '../utils/contourGlyph';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'hero';
  heroData?: {
    glyphSeed: string;
    avatarInitials: string;
    presence: 'online' | 'away' | 'offline';
    meta: string;
  };
  maxWidthClass?: string;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdropClick?: boolean;
}

let openDialogCount = 0;

function presenceDotColor(presence: 'online' | 'away' | 'offline'): string {
  switch (presence) {
    case 'online':
      return '#16A34A';
    case 'away':
      return '#D97706';
    case 'offline':
    default:
      return '#9CA3AF';
  }
}

export function Dialog({
  isOpen,
  onClose,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  variant = 'default',
  heroData,
  maxWidthClass,
  size = 'sm',
  closeOnBackdropClick = true,
}: DialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const triggerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [vvState, setVvState] = useState<{ height: number; offsetTop: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      openDialogCount += 1;
      document.body.classList.add('dialog-open');

      const timer = setTimeout(() => {
        const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables && focusables.length > 0) {
          focusables[0].focus();
        } else {
          containerRef.current?.focus();
        }
      }, 30);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab' && containerRef.current) {
          const focusables = Array.from(
            containerRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(
            (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
          );

          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      const updateVisualViewport = () => {
        const vv = typeof window !== 'undefined' ? window.visualViewport : null;
        if (vv) {
          setVvState({
            height: vv.height,
            offsetTop: vv.offsetTop,
          });
        }
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && containerRef.current?.contains(activeEl)) {
          if (['INPUT', 'SELECT', 'TEXTAREA'].includes(activeEl.tagName)) {
            activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      };

      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && containerRef.current?.contains(target)) {
          if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
            setTimeout(() => {
              target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 60);
          }
        }
      };

      const vv = typeof window !== 'undefined' ? window.visualViewport : null;
      if (vv) {
        updateVisualViewport();
        vv.addEventListener('resize', updateVisualViewport);
        vv.addEventListener('scroll', updateVisualViewport);
      }
      document.addEventListener('focusin', handleFocusIn);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('focusin', handleFocusIn);
        if (vv) {
          vv.removeEventListener('resize', updateVisualViewport);
          vv.removeEventListener('scroll', updateVisualViewport);
        }
        setVvState(null);
        openDialogCount = Math.max(0, openDialogCount - 1);
        if (openDialogCount === 0) {
          document.body.classList.remove('dialog-open');
        }
        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  const titleId = title ? `dialog-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  // Resolve sizing tokens: full-width on <640px, constrained on >=640px
  const resolvedWidthClass =
    maxWidthClass ||
    (size === 'lg'
      ? 'sm:max-w-[640px]'
      : variant === 'hero' || size === 'md'
      ? 'sm:max-w-[560px]'
      : 'sm:max-w-[440px]');

  const wrapperStyle: React.CSSProperties =
    vvState && typeof window !== 'undefined' && vvState.height < window.innerHeight - 40
      ? {
          height: `${vvState.height}px`,
          top: `${vvState.offsetTop}px`,
          bottom: 'auto',
        }
      : {};

  const dialogMaxHeightStyle: React.CSSProperties =
    vvState && typeof window !== 'undefined' && vvState.height < window.innerHeight - 40
      ? {
          maxHeight: `${Math.max(220, Math.floor(vvState.height * 0.92))}px`,
        }
      : {};

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          style={{ ...wrapperStyle, zIndex: 'var(--z-dialog)' }}
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          {/* Full Viewport Scrim: Neutral dark with hint of accent at 38% opacity + 6px blur */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              if (closeOnBackdropClick) onClose();
            }}
            style={{
              backgroundColor:
                'color-mix(in oklab, color-mix(in oklab, #0b1220 82%, var(--accent) 18%), transparent 62%)',
            }}
            className="absolute inset-0 backdrop-blur-[6px] cursor-pointer"
          />

          {/* Dialog Container: full-width bottom sheet on <640px, max 92dvh */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            style={{ ...dialogMaxHeightStyle, zIndex: 'var(--z-content)' }}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-sm:!max-w-none ${resolvedWidthClass} max-h-[92dvh] sm:max-h-[calc(100dvh-32px)] rounded-t-[20px] sm:rounded-[20px] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] shadow-[0_2px_6px_rgba(0,0,0,.06),0_24px_60px_-12px_rgba(0,0,0,.28)] flex flex-col overflow-hidden outline-none`}
          >
            {/* Mobile Bottom Sheet Grab Bar */}
            {variant !== 'hero' && (
              <div
                aria-hidden="true"
                className="sm:hidden w-9 h-1 rounded-full bg-[var(--border-strong)] mx-auto mt-2 shrink-0"
              />
            )}

            {/* Variant = Hero Header (Sticky) */}
            {variant === 'hero' && heroData ? (
              <div
                style={{ zIndex: 'var(--z-sticky-header)' }}
                className="shrink-0 sticky top-0 bg-[var(--surface-elevated)]"
              >
                {/* 96px Banner with inner highlight & scaled ContourGlyph showing >=4 rings */}
                <div className="h-[88px] sm:h-[96px] relative shrink-0 overflow-hidden surface-accent-fill flex items-center justify-between px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                  <div className="absolute inset-0 text-white pointer-events-none flex items-center justify-center overflow-hidden">
                    <ContourGlyph
                      seed={heroData.glyphSeed}
                      size={440}
                      strokeWidth={1.25}
                      className="opacity-[0.24] w-full h-[220px] object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    style={{ zIndex: 'var(--z-sticky-header)' }}
                    className="absolute top-2.5 right-2.5 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/25 text-white hover:bg-black/40 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Avatar Overlap + Eyebrow, Title, Subtitle, Meta */}
                <div className="px-5 sm:px-6 pb-2 shrink-0 relative bg-[var(--surface-elevated)] border-b border-[var(--border-hairline)]">
                  <div className="flex items-end justify-between gap-4">
                    {/* Avatar Overlapping Banner by 32px */}
                    <div className="relative -mt-[32px] shrink-0">
                      <span
                        style={{ backgroundColor: 'var(--accent)' }}
                        className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full border-4 border-[var(--surface-elevated)] flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-md"
                      >
                        {heroData.avatarInitials}
                      </span>
                      <span
                        style={{
                          backgroundColor: presenceDotColor(heroData.presence),
                        }}
                        className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[var(--surface-elevated)]"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-0.5">
                    {eyebrow && (
                      <span
                        className="block text-xs font-semibold uppercase tracking-wider mb-0.5"
                        style={{ color: 'var(--accent)' }}
                      >
                        {eyebrow}
                      </span>
                    )}
                    {title && (
                      <h2
                        id={titleId}
                        className="text-lg sm:text-xl font-bold text-[var(--ink-primary)] leading-snug truncate"
                      >
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-xs sm:text-sm font-medium text-[var(--ink-secondary)] truncate">
                        {subtitle}
                      </p>
                    )}
                    {heroData.meta && (
                      <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                        {heroData.meta}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Variant = Default Sticky Header (Eyebrow + Title + Subtitle + 1px Divider) */
              <div
                style={{ zIndex: 'var(--z-sticky-header)' }}
                className="px-5 sm:px-6 pt-3.5 sm:pt-5 pb-3.5 border-b border-[var(--border-hairline)] bg-[var(--surface-elevated)] flex items-start justify-between gap-4 shrink-0 sticky top-0"
              >
                <div className="min-w-0">
                  {eyebrow && (
                    <span
                      className="block text-xs font-semibold uppercase tracking-wider mb-0.5"
                      style={{ color: 'var(--accent)' }}
                    >
                      {eyebrow}
                    </span>
                  )}
                  {title && (
                    <h2
                      id={titleId}
                      className="text-base sm:text-lg font-semibold text-[var(--ink-primary)] leading-snug truncate"
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5 truncate">
                      {subtitle}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 -mt-1.5 rounded-[var(--radius-sm)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>

            {/* Sticky Footer Slot */}
            {footer && (
              <div
                style={{ zIndex: 'var(--z-sticky-header)' }}
                className="px-5 sm:px-6 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] bg-[var(--surface-elevated)] border-t border-[var(--border-hairline)] shrink-0 sticky bottom-0 flex items-center justify-end gap-2.5"
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
