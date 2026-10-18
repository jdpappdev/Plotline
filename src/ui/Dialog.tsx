import React, { useEffect, useRef } from 'react';
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

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
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

  // Resolve sizing tokens: sm = 440px, md = 560px
  const resolvedWidthClass =
    maxWidthClass ||
    (variant === 'hero' || size === 'md'
      ? 'sm:max-w-[560px]'
      : 'sm:max-w-[440px]');

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
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

          {/* Dialog Container */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${resolvedWidthClass} max-h-[90vh] sm:max-h-[85vh] rounded-t-[20px] sm:rounded-[20px] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] shadow-[0_2px_6px_rgba(0,0,0,.06),0_24px_60px_-12px_rgba(0,0,0,.28)] flex flex-col overflow-hidden z-10 outline-none`}
          >
            {/* Variant = Hero Header */}
            {variant === 'hero' && heroData ? (
              <>
                {/* 96px Banner with inner highlight & scaled ContourGlyph showing >=4 rings */}
                <div className="h-[96px] relative shrink-0 overflow-hidden surface-accent-fill flex items-center justify-between px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
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
                    className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/25 text-white hover:bg-black/40 transition-colors z-20 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Avatar Overlap + Eyebrow, Title, Subtitle, Meta */}
                <div className="px-6 pb-2 shrink-0 relative bg-[var(--surface-elevated)]">
                  <div className="flex items-end justify-between gap-4">
                    {/* Avatar Overlapping Banner by 32px */}
                    <div className="relative -mt-[32px] shrink-0">
                      <span
                        style={{ backgroundColor: 'var(--accent)' }}
                        className="w-[80px] h-[80px] rounded-full border-4 border-[var(--surface-elevated)] flex items-center justify-center text-2xl font-bold text-white shadow-md"
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

                  <div className="mt-3 space-y-0.5">
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
              </>
            ) : (
              /* Variant = Default Header (Eyebrow + Title + Subtitle + 1px Divider) */
              <div className="px-6 pt-5 pb-4 border-b border-[var(--border-hairline)] flex items-start justify-between gap-4 shrink-0">
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
                      className="text-lg font-semibold text-[var(--ink-primary)] leading-snug truncate"
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
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {children}
            </div>

            {/* Sticky Footer Slot */}
            {footer && (
              <div className="px-6 py-3.5 bg-[var(--surface-elevated)] border-t border-[var(--border-hairline)] shrink-0 flex items-center justify-end gap-2.5 z-10">
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
