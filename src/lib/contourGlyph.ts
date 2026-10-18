export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function contourGlyph(seedString: string, accentHex = '#204282'): string {
  const seed = hashSeed(seedString || 'plotline-default');
  const rand = mulberry32(seed);

  const cx = 36 + (rand() - 0.5) * 14;
  const cy = 36 + (rand() - 0.5) * 14;
  const ringCount = 4 + Math.floor(rand() * 2);
  const paths: string[] = [];

  for (let r = 0; r < ringCount; r++) {
    const baseRadius = 8 + r * 7.2;
    const points = 8;
    const coords: Array<[number, number]> = [];
    for (let p = 0; p < points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const wobble = 1 + (rand() - 0.5) * 0.28;
      const rx = cx + Math.cos(angle) * baseRadius * wobble;
      const ry = cy + Math.sin(angle) * baseRadius * wobble * (0.82 + rand() * 0.25);
      coords.push([Number(rx.toFixed(1)), Number(ry.toFixed(1))]);
    }

    let d = `M ${coords[0][0]} ${coords[0][1]}`;
    for (let i = 0; i < coords.length; i++) {
      const p0 = coords[i];
      const p1 = coords[(i + 1) % coords.length];
      const midX = ((p0[0] + p1[0]) / 2).toFixed(1);
      const midY = ((p0[1] + p1[1]) / 2).toFixed(1);
      d += ` Q ${p0[0]} ${p0[1]} ${midX} ${midY}`;
    }
    d += ' Z';
    const opacity = (0.28 - r * 0.04).toFixed(2);
    paths.push(
      `<path d="${d}" fill="none" stroke="${accentHex}" stroke-width="1.2" stroke-opacity="${opacity}"/>`
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="72" height="72"><rect width="72" height="72" rx="14" fill="${accentHex}" fill-opacity="0.06"/>${paths.join('')}<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2" fill="${accentHex}" fill-opacity="0.45"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
