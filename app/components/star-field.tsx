const STAR_COUNT = 110;
const SEED = 1337;

// A fixed seed keeps the prerendered HTML and the hydrated output identical.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const stars = (() => {
  const random = mulberry32(SEED);
  return Array.from({ length: STAR_COUNT }, () => {
    const left = (random() * 100).toFixed(2);
    const top = (random() * 100).toFixed(2);
    const size = (0.8 + random() * 2.4).toFixed(1);
    const wink = (2.5 + random() * 4.5).toFixed(2);
    const delay = (-random() * 7).toFixed(2);
    const peak = (0.5 + random() * 0.5).toFixed(2);
    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      "--wink": `${wink}s`,
      "--peak": peak,
      animationDelay: `${delay}s`,
    } as React.CSSProperties;
  });
})();

export function StarField() {
  return (
    <div id="stars" aria-hidden="true">
      {stars.map((star, i) => (
        <i key={i} style={star} />
      ))}
    </div>
  );
}
