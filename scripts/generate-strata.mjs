#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../gradient.html", import.meta.url);
const SEED = 20260829;
const VIEW_W = 1440;
const VIEW_H = 120;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rand;

function billowPath(scale = 1) {
  const n = 144;
  const waves = [
    [(16 + rand() * 10) * scale, 1.6 + rand() * 1.2],
    [(8 + rand() * 5) * scale, 4 + rand() * 2.5],
    [3 + rand() * 3, 9 + rand() * 5],
  ].map(([amp, freq]) => [amp, freq, rand() * Math.PI * 2]);

  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * VIEW_W;
    const t = (i / n) * Math.PI * 2;
    let y = 58;
    for (const [amp, freq, phase] of waves)
      y += amp * Math.sin(freq * t + phase);
    pts.push([x, y]);
  }

  let d = `M0 ${VIEW_H} L0 ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [cx, cy] = pts[i];
    const mx = (cx + pts[i + 1][0]) / 2;
    const my = (cy + pts[i + 1][1]) / 2;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` L${lx.toFixed(1)} ${ly.toFixed(1)} L${VIEW_W} ${VIEW_H} Z`;
  return d;
}

function lerpHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return (
    "#" +
    pa
      .map((v, i) =>
        Math.round(v + (pb[i] - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

const PALETTE = [
  "#111838",
  "#182146",
  "#202b55",
  "#293663",
  "#324272",
  "#3c4f81",
  "#475d90",
  "#526b9f",
  "#5e79ae",
  "#6a88bd",
];
function paletteAt(t) {
  const f = Math.min(0.9999, Math.max(0, t)) * (PALETTE.length - 1);
  const i = Math.floor(f);
  return lerpHex(PALETTE[i], PALETTE[i + 1], f - i);
}

const LIGHT = [
  { fill: "#b9c9dd", bodyBackground: "linear-gradient(#b9c9dd, #c9d7e6)" },
  { fill: "#c7d5e6", bodyBackground: "linear-gradient(#c7d5e6, #d5e0ec)" },
  { fill: "#d6e1ee", bodyBackground: "linear-gradient(#d6e1ee, #e0e9f2)" },
  { fill: "#e3ebf4", bodyBackground: "linear-gradient(#e3ebf4, #ebf1f7)" },
  { fill: "#f0f5fa", bodyBackground: "linear-gradient(#f0f5fa, #f0f5fa)" },
];

const BANDS = ["60vh", "41%", "58%", "76%", "88%"];

const bands = BANDS.map((top, i) => {
  const t = i / (BANDS.length - 1);
  const fill = paletteAt(t);
  const fillNext = paletteAt((i + 1) / (BANDS.length - 1));
  const sweep = 1 + t * 0.25;
  rand = mulberry32(SEED ^ ((i + 1) * 0x9e3779b9));
  const back = billowPath(sweep);
  const front = billowPath(sweep);
  const next = BANDS[i + 1];

  return {
    top,
    bottom: next ? `calc(${100 - parseFloat(next)}% - 8.34vw)` : "0",
    fill,
    bodyBackground: `linear-gradient(${fill}, ${lerpHex(fill, fillNext, 0.65)})`,
    lightFill: LIGHT[i].fill,
    lightBodyBackground: LIGHT[i].bodyBackground,
    back,
    front,
  };
});

writeFileSync(
  new URL("../app/strata-data.json", import.meta.url),
  JSON.stringify(bands, null, 2) + "\n",
);
console.log(`wrote ${bands.length} bands into app/strata-data.json`);

let html = `<div id="strata" aria-hidden="true">\n`;
for (const b of bands) {
  html +=
    `      <div class="band" style="top: ${b.top}; bottom: ${b.bottom}">\n` +
    `        <svg class="back" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="none"><path d="${b.back}" fill="${b.fill}" fill-opacity="0.45"/></svg>\n` +
    `        <svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="none"><path d="${b.front}" fill="${b.fill}"/></svg>\n` +
    `        <div class="body" style="background: ${b.bodyBackground}"></div>\n` +
    `      </div>\n`;
}
html += `    </div>`;

const src = readFileSync(FILE, "utf8");
const re =
  /<div id="strata" aria-hidden="true"><\/div>|<div id="strata" aria-hidden="true">[\s\S]*?\n {4}<\/div>/;
if (!re.test(src)) {
  console.error("could not find the #strata block in gradient.html");
  process.exit(1);
}
writeFileSync(FILE, src.replace(re, html));
console.log(`wrote ${BANDS.length} bands into gradient.html`);
