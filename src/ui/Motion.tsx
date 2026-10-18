import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
}

const DEFAULT_ANIMATION_DURATION_MS = 420;

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = DEFAULT_ANIMATION_DURATION_MS,
  formatter = (v) => String(Math.round(v)),
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayValue(endValue);
      return;
    }

    let rafId: number;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <span className={`tabular-nums ${className}`}>{formatter(displayValue)}</span>;
};

interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  hoverLift?: boolean;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  hoverLift = true,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`bento-card ${hoverLift ? 'bento-card-hover' : ''} motion-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
