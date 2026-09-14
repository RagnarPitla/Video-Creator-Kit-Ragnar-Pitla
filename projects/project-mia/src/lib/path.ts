export type Pt = {x: number; y: number};

export type SampledPath = {
  d: string;
  length: number;
  at: (progress: number) => {x: number; y: number; angle: number};
};

const cubicAt = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + e * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + e * p3.y,
  };
};

/**
 * Converts waypoints into a smooth Catmull-Rom spline expressed as cubic
 * beziers, then samples it so the head position at any progress is exact.
 */
export const buildPath = (
  points: Pt[],
  options?: {samples?: number; tension?: number},
): SampledPath => {
  const samples = options?.samples ?? 600;
  const tension = options?.tension ?? 1;
  const pts = points;

  const segments: [Pt, Pt, Pt, Pt][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1 = {
      x: p1.x + ((p2.x - p0.x) / 6) * tension,
      y: p1.y + ((p2.y - p0.y) / 6) * tension,
    };
    const c2 = {
      x: p2.x - ((p3.x - p1.x) / 6) * tension,
      y: p2.y - ((p3.y - p1.y) / 6) * tension,
    };
    segments.push([p1, c1, c2, p2]);
  }

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (const [, c1, c2, p2] of segments) {
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }

  const flat: Pt[] = [];
  const cumulative: number[] = [0];
  let total = 0;
  for (let s = 0; s < segments.length; s++) {
    const [p0, c1, c2, p3] = segments[s];
    const steps = Math.max(2, Math.round(samples / segments.length));
    for (let i = s === 0 ? 0 : 1; i <= steps; i++) {
      const pt = cubicAt(p0, c1, c2, p3, i / steps);
      if (flat.length > 0) {
        const prev = flat[flat.length - 1];
        total += Math.hypot(pt.x - prev.x, pt.y - prev.y);
        cumulative.push(total);
      }
      flat.push(pt);
    }
  }

  const at = (progress: number) => {
    const target = Math.min(Math.max(progress, 0), 1) * total;
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const i = Math.max(1, lo);
    const span = cumulative[i] - cumulative[i - 1] || 1;
    const f = (target - cumulative[i - 1]) / span;
    const a = flat[i - 1];
    const b = flat[i];
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
    };
  };

  return {d, length: total, at};
};
