import React, { useMemo } from 'react';

export interface ContourPathData {
  d: string;
  opacity: number;
}

export interface ContourGlyphOptions {
  stroke?: string;
  strokeWidth?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

/**
 * Deterministic 32-bit FNV-1a hash from any string or number seed.
 */
export function hashSeed(seed: string | number): number {
  const str = String(seed || 'plotline-default');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic mulberry32 PRNG seeded with a 32-bit integer.
 */
export function mulberry32(seedInt: number): () => number {
  let state = seedInt >>> 0;
  return function () {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Converts a closed loop of 2D points into a smooth closed Catmull-Rom spline
 * expressed as cubic Bezier segments (`M ... C ... Z`).
 */
function closedCatmullRomSpline(points: Array<{ x: number; y: number }>): string {
  const n = points.length;
  if (n < 3) return '';

  const fmt = (val: number) => Number(val.toFixed(2));
  let path = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`;
  }

  return `${path} Z`;
}

/**
 * Generates deterministic concentric contour path definitions for a given seed and size.
 * - 4 to 6 closed concentric paths per glyph
 * - Radii perturbed by seeded mulberry32 noise within ±18%
 * - Smoothed with a closed Catmull-Rom spline
 * - Opacity ramping outward
 */
export function computeContourPaths(
  seed: string | number,
  size: number,
  minOpacity = 0.28,
  maxOpacity = 0.96
): ContourPathData[] {
  const safeSize = Math.max(16, Number(size) || 36);
  const rand = mulberry32(hashSeed(seed));

  // 4–6 closed concentric paths per glyph
  const ringCount = 4 + Math.floor(rand() * 3); // 4, 5, or 6
  const vertexCount = 10;

  // Base angular profile so concentric rings share topographic family character
  const baseAngles: number[] = [];
  for (let k = 0; k < vertexCount; k++) {
    baseAngles.push((rand() * 2 - 1) * 0.18);
  }

  // Slight peak focal drift for inner rings
  const driftAngle = rand() * Math.PI * 2;
  const maxDrift = safeSize * 0.045;

  const minRadius = safeSize * 0.115;
  const maxRadius = safeSize * 0.405;

  const paths: ContourPathData[] = [];

  for (let rIdx = 0; rIdx < ringCount; rIdx++) {
    const t = ringCount === 1 ? 1 : rIdx / (ringCount - 1);
    const baseRadius = minRadius + t * (maxRadius - minRadius);

    // Inner rings drift slightly toward the topographic summit; outer rings center
    const ringDrift = (1 - t) * maxDrift;
    const cx = safeSize / 2 + Math.cos(driftAngle) * ringDrift;
    const cy = safeSize / 2 + Math.sin(driftAngle) * ringDrift;

    const ringPoints: Array<{ x: number; y: number }> = [];
    for (let k = 0; k < vertexCount; k++) {
      const theta = (k / vertexCount) * Math.PI * 2;
      const localNoise = (rand() * 2 - 1) * 0.18;
      // Blend shared angular profile and per-ring noise, clamped strictly within ±18%
      const combinedPerturbation = Math.max(
        -0.18,
        Math.min(0.18, baseAngles[k] * 0.68 + localNoise * 0.32)
      );
      const perturbedRadius = baseRadius * (1 + combinedPerturbation);
      ringPoints.push({
        x: cx + Math.cos(theta) * perturbedRadius,
        y: cy + Math.sin(theta) * perturbedRadius,
      });
    }

    const d = closedCatmullRomSpline(ringPoints);
    // Opacity ramps outward from minOpacity (inner) to maxOpacity (outer)
    const opacity = Number((minOpacity + t * (maxOpacity - minOpacity)).toFixed(3));
    paths.push({ d, opacity });
  }

  return paths;
}

/**
 * Pure function contourGlyph(seed, size) returning deterministic SVG markup:
 * - 4–6 closed concentric paths per glyph
 * - Radii perturbed by seeded noise (mulberry32 seeded from a hash of the id, ±18%)
 * - Smoothed with a closed Catmull-Rom spline
 * - Stroke var(--accent), 1.25px, opacity ramping outward
 */
export function contourGlyph(
  seed: string | number,
  size = 36,
  options?: ContourGlyphOptions
): string {
  const safeSize = Math.max(16, Number(size) || 36);
  const stroke = options?.stroke ?? 'var(--accent)';
  const strokeWidth = options?.strokeWidth ?? 1.25;
  const minOpacity = options?.minOpacity ?? 0.28;
  const maxOpacity = options?.maxOpacity ?? 0.96;

  const paths = computeContourPaths(seed, safeSize, minOpacity, maxOpacity);
  const pathsMarkup = paths
    .map(
      (p) =>
        `<path d="${p.d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${p.opacity}" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 ${safeSize} ${safeSize}" fill="none" data-seed="${String(
    seed
  )}">${pathsMarkup}</svg>`;
}

export interface ContourGlyphProps {
  seed: string | number;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  minOpacity?: number;
  maxOpacity?: number;
  className?: string;
}

export function ContourGlyph({
  seed,
  size = 36,
  stroke = 'var(--accent)',
  strokeWidth = 1.25,
  minOpacity = 0.28,
  maxOpacity = 0.96,
  className = '',
}: ContourGlyphProps) {
  const safeSize = Math.max(16, Number(size) || 36);
  const paths = useMemo(
    () => computeContourPaths(seed, safeSize, minOpacity, maxOpacity),
    [seed, safeSize, minOpacity, maxOpacity]
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={safeSize}
      height={safeSize}
      viewBox={`0 0 ${safeSize} ${safeSize}`}
      fill="none"
      data-seed={String(seed)}
      aria-hidden="true"
      className={`motion-contour ${className}`}
    >
      {paths.map((p, idx) => (
        <path
          key={idx}
          d={p.d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeOpacity={p.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
