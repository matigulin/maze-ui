const NAMED_EASES: Record<string, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (p: number) => {
    let t = p;
    for (let i = 0; i < 8; i++) {
      const x = sampleX(t) - p;
      const d = dX(t);
      if (Math.abs(x) < 1e-4 || Math.abs(d) < 1e-6) break;
      t -= x / d;
    }
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return sampleY(t);
  };
}

export function makeEase(ease: unknown) {
  if (Array.isArray(ease) && ease.length === 4) {
    const [x1, y1, x2, y2] = ease as [number, number, number, number];
    return cubicBezierEase(x1, y1, x2, y2);
  }
  const named =
    (typeof ease === "string" && NAMED_EASES[ease]) || NAMED_EASES.easeOut;
  return cubicBezierEase(named[0], named[1], named[2], named[3]);
}

export function durationOf(transition: { duration?: number } | undefined, fallback: number) {
  return typeof transition?.duration === "number" ? transition.duration : fallback;
}
