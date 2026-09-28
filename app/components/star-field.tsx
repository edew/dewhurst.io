const COLUMNS = 160;
const SEED = 1337;
const DENSITY = 0.12;
const GLYPHS = [".", ".", ".", ".", "'", "*", "+"];

// A fixed seed keeps the prerendered HTML the same on every build.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The sky is drawn in characters on the same grid as the text: each cell is
// either a space or a star. Lines are wider than any screen and cut off by the
// container, so the sky fills the width without wrapping.
function sky(rows: number) {
  const random = mulberry32(SEED);

  return Array.from({ length: rows }, (_, row) => {
    const line: React.ReactNode[] = [];
    let gap = "";

    for (let column = 0; column < COLUMNS; column++) {
      if (random() >= DENSITY) {
        gap += " ";
        continue;
      }

      const glyph = GLYPHS[Math.floor(random() * GLYPHS.length)];
      const style = {
        "--wink": `${(2.5 + random() * 4.5).toFixed(2)}s`,
        "--peak": (0.85 + random() * 0.15).toFixed(2),
        animationDelay: `${(-random() * 7).toFixed(2)}s`,
      } as React.CSSProperties;

      line.push(gap, <i key={column} style={style}>{glyph}</i>);
      gap = "";
    }

    return <div key={row}>{line}{gap}</div>;
  });
}

export function StarField({ rows }: { rows: number }) {
  return (
    <pre id="stars" aria-hidden="true">
      {sky(rows)}
    </pre>
  );
}
