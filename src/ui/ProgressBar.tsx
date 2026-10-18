import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  trackClassName?: string;
  fillClassName?: string;
  heightClassName?: string;
  rx?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  trackClassName = 'bg-slate-100',
  fillClassName = 'fill-[var(--accent)]',
  heightClassName = 'h-1.5',
  rx = 3,
}) => {
  const safeMax = Math.max(1, max);
  const clampedPct = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <svg
      className={`w-full ${heightClassName} rounded-full overflow-hidden block ${trackClassName}`}
      aria-hidden="true"
    >
      <rect
        width={`${clampedPct}%`}
        height="100%"
        rx={rx}
        className={`transition-all duration-300 ${fillClassName}`}
      />
    </svg>
  );
};
