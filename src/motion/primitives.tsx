import { motion, useReducedMotion, type MotionProps } from 'motion/react';
import type { PropsWithChildren } from 'react';

export const PLOTLINE_EASE = [0.22, 1, 0.36, 1] as const;
export const PLOTLINE_DURATION = { fast: 0.18, normal: 0.32, slow: 0.7 } as const;

export function AnimatedNumber({
  value,
  className = '',
  suffix = '',
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className={`font-ui-tabular tabular-nums inline-block ${className}`}
      animate={reduced ? { opacity: 1 } : { opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.4, ease: PLOTLINE_EASE }}
    >
      {value}
      {suffix}
    </motion.span>
  );
}

export function MotionCard({
  children,
  className = '',
  ...props
}: PropsWithChildren<MotionProps & { className?: string }>) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      {...props}
      className={`motion-card ${className}`}
      whileHover={reduced ? undefined : { y: -2, boxShadow: '0 10px 24px rgba(22, 22, 21, 0.08)' }}
      transition={{ duration: reduced ? 0 : PLOTLINE_DURATION.fast, ease: PLOTLINE_EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Pressable({
  children,
  className = '',
  ...props
}: PropsWithChildren<MotionProps & { className?: string }>) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      {...props}
      className={className}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: reduced ? 0 : PLOTLINE_DURATION.fast, ease: PLOTLINE_EASE }}
    >
      {children}
    </motion.div>
  );
}
