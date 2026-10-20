import React from 'react';
import { AnimatedNumber } from '../../motion/primitives';

export interface CountUpNumeralProps {
  value: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUpNumeral({ value, suffix = '', className = '', style }: CountUpNumeralProps) {
  return (
    <span data-value={value} className={`font-display-num tabular-nums ${className}`} style={style}>
      <AnimatedNumber value={value} suffix={suffix} />
    </span>
  );
}
