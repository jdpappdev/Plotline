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
 * Deterministically generates stacked, continuous waved straight lines for a given seed and size.
 */
export function contourGlyph(
  seed: string = 'plotline',
  size: number = 100,
  ringsCount: number = 5
): ContourGlyphResult {
  const hash = hashSeed(seed || 'plotline');
  const prng = mulberry32(hash);
  const numLines = Math.max(3, Math.min(8, ringsCount));
  const paths: string[] = [];

  // Deterministic wave frequencies & phase offsets for stacked horizontal wave lines
  const freq1 = 2 + Math.floor(prng() * 2); // 2 or 3 wave crests across width
  const freq2 = 3 + Math.floor(prng() * 2); // 3 or 4 wave crests across width
  const basePhase1 = prng() * Math.PI * 2;
  const basePhase2 = prng() * Math.PI * 2;

  const topMargin = size * 0.15;
  const bottomMargin = size * 0.15;
  const usableHeight = size - topMargin - bottomMargin;
  const lineSpacing = numLines > 1 ? usableHeight / (numLines - 1) : usableHeight / 2;

  const leftMargin = size * 0.08;
  const rightMargin = size * 0.08;
  const usableWidth = size - leftMargin - rightMargin;
  const numSamples = 32;

  for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
    const yBase = topMargin + lineIdx * lineSpacing;
    const phaseShift = (lineIdx * Math.PI) / 4;
    // Amplitude scales proportionally to line spacing so lines wave gracefully
    const maxAmp = Math.min(lineSpacing * 0.38, size * 0.08);

    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < numSamples; i++) {
      const normX = i / (numSamples - 1); // 0 to 1
      const x = leftMargin + normX * usableWidth;

      // Calculate continuous wave y displacement
      const theta = normX * Math.PI * 2;
      const waveVal =
        0.65 * Math.sin(freq1 * theta + basePhase1 + phaseShift) +
        0.35 * Math.cos(freq2 * theta + basePhase2 - phaseShift * 0.5);

      // Dampen wave amplitude near edges (left & right) for smooth line terminations
      const edgeDamping = Math.sin(normX * Math.PI);
      const y = yBase + waveVal * maxAmp * (0.4 + 0.6 * edgeDamping);

      pts.push({ x, y });
    }

    // Convert sample points into open smooth Catmull-Rom cubic bezier SVG path
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < numSamples - 1; i++) {
      const pPrev = pts[Math.max(0, i - 1)];
      const pCurr = pts[i];
      const pNext = pts[i + 1];
      const pNext2 = pts[Math.min(numSamples - 1, i + 2)];

      const cp1x = pCurr.x + (pNext.x - pPrev.x) / 6;
      const cp1y = pCurr.y + (pNext.y - pPrev.y) / 6;
      const cp2x = pNext.x - (pNext2.x - pCurr.x) / 6;
      const cp2y = pNext.y - (pNext2.y - pCurr.x) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${pNext.x.toFixed(2)} ${pNext.y.toFixed(2)}`;
    }
    paths.push(d);
  }

  const viewBox = `0 0 ${size} ${size}`;
  const svgString = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${paths.map((p) => `<path d="${p}" stroke-linecap="round" stroke-linejoin="round" />`).join('')}</svg>`;

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
 * React SVG component for rendering stacked waved straight line glyphs.
 */
export const ContourGlyph: React.FC<ContourGlyphProps> = ({
  seed = 'plotline',
  size = 40,
  strokeWidth = 1.25,
  color,
  rings = 5,
  minOpacity = 0.35,
  maxOpacity = 1.0,
  className = '',
  style,
  ...svgProps
}) => {
  const numericSize = typeof size === 'number' ? size : parseFloat(String(size)) || 100;
  const glyphData = React.useMemo(
    () => contourGlyph(seed, numericSize, rings),
    [seed, numericSize, rings]
  );

  return (
    <svg
      viewBox={glyphData.viewBox}
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-hidden ${className}`.trim()}
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 'inherit', ...style }}
      {...svgProps}
    >
      {glyphData.paths.map((pathD, idx) => {
        const pathOpacity =
          glyphData.paths.length > 1
            ? minOpacity + (idx / (glyphData.paths.length - 1)) * (maxOpacity - minOpacity)
            : minOpacity;
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
