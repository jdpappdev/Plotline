import React from 'react';

/**
 * Generates a 32-bit FNV-1a hash of a given seed string.
 */
export function hashSeed(seed: string): number {
  if (!seed) return 0;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 PRNG function returning floats in [0, 1).
 */
export function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ContourGlyphResult {
  seed: string;
  size: number;
  viewBox: string;
  paths: string[];
  svgString: string;
  toString: () => string;
}

/**
 * Deterministically generates flowing Catmull-Rom cubic Bezier wave lines for a given seed and size.
 */
function isLargeGlyphUse(seed: string, size: number): boolean {
  return size > 120 || /empty|focus-|uncharted/i.test(seed);
}

export function contourGlyph(
  seed: string = 'plotline',
  size: number = 100,
  ringsCount?: number
): ContourGlyphResult {
  const resolvedSeed = seed || 'plotline';
  const hash = hashSeed(resolvedSeed);
  const prng = mulberry32(hash);

  const isLarge = isLargeGlyphUse(resolvedSeed, size);
  const width = isLarge ? Math.max(160, size) : size;
  const height = isLarge ? Math.max(88, Math.round(width * 0.55)) : size;

  // Derive wave parameters from mulberry32 PRNG:
  // amplitude: 8–13% of height
  // wavelength: 0.8–1.3x width
  // basePhase: [0, 2π)
  // phaseStep: 0.5–1.0 rad per line
  // tilt: ±0.2
  const amplitude = (0.08 + prng() * 0.05) * height;
  const wavelength = (0.8 + prng() * 0.5) * width;
  const basePhase = prng() * Math.PI * 2;
  const phaseStep = 0.5 + prng() * 0.5;
  const tilt = (prng() * 2 - 1) * 0.2;

  const numLines = isLarge
    ? ringsCount !== undefined
      ? Math.max(5, ringsCount)
      : Math.max(5, Math.floor((height - 16) / 16) + 1)
    : ringsCount !== undefined
      ? Math.max(5, ringsCount)
      : 5;

  const xStart = isLarge ? -0.1 * width : 0.17 * width;
  const xEnd = isLarge ? 1.1 * width : 0.83 * width;
  const numSamples = 7;

  const paths: string[] = [];

  for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
    let yBase: number;
    if (isLarge) {
      const lineSpacing = 16;
      const totalSpan = (numLines - 1) * lineSpacing;
      const startY = (height - totalSpan) / 2;
      yBase = startY + lineIdx * lineSpacing;
    } else {
      const u = numLines > 1 ? lineIdx / (numLines - 1) : 0.5;
      yBase = (0.22 + u * (0.78 - 0.22)) * height;
    }

    const pts: { x: number; y: number }[] = [];
    for (let j = 0; j < numSamples; j++) {
      const t = j / (numSamples - 1);
      const x = xStart + t * (xEnd - xStart);
      const dxCenter = x - width * 0.5;
      const phase = basePhase + lineIdx * phaseStep + (dxCenter / wavelength) * Math.PI * 2;
      const y = yBase + amplitude * Math.sin(phase) + tilt * dxCenter;
      pts.push({ x, y });
    }

    // Open Catmull-Rom spline with tension 1/6 converted to cubic Bezier (C) segments
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < numSamples - 1; i++) {
      const pPrev = pts[Math.max(0, i - 1)];
      const pCurr = pts[i];
      const pNext = pts[i + 1];
      const pNext2 = pts[Math.min(numSamples - 1, i + 2)];

      const cp1x = pCurr.x + (pNext.x - pPrev.x) / 6;
      const cp1y = pCurr.y + (pNext.y - pPrev.y) / 6;
      const cp2x = pNext.x - (pNext2.x - pCurr.x) / 6;
      const cp2y = pNext.y - (pNext2.y - pCurr.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${pNext.x.toFixed(2)} ${pNext.y.toFixed(2)}`;
    }
    paths.push(d);
  }

  const viewBox = `0 0 ${width} ${height}`;
  const computedStrokeWidth = Math.max(1.5, Number((size * 0.043).toFixed(2)));
  const svgString = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--accent-deep)" stroke-width="${computedStrokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths.map((p) => `<path d="${p}" stroke-linecap="round" stroke-linejoin="round" />`).join('')}</svg>`;

  return {
    seed,
    size,
    viewBox,
    paths,
    svgString,
    toString: () => svgString,
  };
}

export interface ContourGlyphProps extends Omit<React.SVGProps<SVGSVGElement>, 'size'> {
  seed?: string;
  size?: number | string;
  strokeWidth?: number;
  color?: string;
  rings?: number;
  minOpacity?: number;
  maxOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * React SVG component for rendering procedural flowing Catmull-Rom wave glyphs.
 * Fixed: Uses display: 'block' for proper flex container alignment on all viewports.
 */
export const ContourGlyph: React.FC<ContourGlyphProps> = ({
  seed = 'plotline',
  size = 40,
  strokeWidth,
  color,
  rings,
  minOpacity,
  maxOpacity,
  className = '',
  style,
  ...svgProps
}) => {
  const numericSize = typeof size === 'number' ? size : parseFloat(String(size)) || 100;
  const isLarge =
    isLargeGlyphUse(seed || 'plotline', numericSize) ||
    svgProps.stroke === '#ffffff' ||
    minOpacity !== undefined ||
    maxOpacity !== undefined;

  const glyphData = React.useMemo(
    () => contourGlyph(seed, numericSize, rings),
    [seed, numericSize, rings]
  );

  const resolvedStroke = svgProps.stroke ?? color ?? (isLarge ? '#ffffff' : 'var(--accent-deep)');
  const resolvedStrokeWidth = isLarge
    ? Math.max(1.5, strokeWidth ?? Number((numericSize * 0.043).toFixed(2)))
    : (strokeWidth ?? Math.max(1.5, Number((numericSize * 0.043).toFixed(2))));

  const svgWidth = isLarge && numericSize <= 120 ? Math.round(numericSize * 1.6) : numericSize;
  const svgHeight = numericSize;

  // FIX: Use display: 'block' for proper flex container alignment
  // Removed verticalAlign: 'middle' which conflicted with flex layout
  const tileStyle: React.CSSProperties = isLarge
    ? {
        display: 'block',
        ...style,
      }
    : {
        display: 'block',
        borderRadius: '21%',
        backgroundColor: 'var(--accent-tint-1)',
        ...style,
      };

  const lowOpacity = minOpacity ?? 0.35;
  const highOpacity = maxOpacity ?? 1.0;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={glyphData.viewBox}
      fill="none"
      stroke={resolvedStroke}
      strokeWidth={resolvedStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-hidden ${className}`.trim()}
      style={tileStyle}
      {...svgProps}
    >
      {glyphData.paths.map((pathD, idx) => {
        const count = glyphData.paths.length;
        const pathOpacity = isLarge
          ? count > 1
            ? Number((lowOpacity + (idx / (count - 1)) * (highOpacity - lowOpacity)).toFixed(3))
            : lowOpacity
          : count > 1
            ? Number((1.0 - (idx / (count - 1)) * (1.0 - 0.48)).toFixed(3))
            : 1.0;
        return (
          <path
            key={idx}
            d={pathD}
            opacity={pathOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
};

export default ContourGlyph;
