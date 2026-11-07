// LED-matrix pixel art. Every icon on the profile is a small dot-matrix
// display; multi-frame icons loop by toggling frame groups with CSS steps().

import { C, LED } from '../theme.mjs';
import { n } from './doc.mjs';

const sq = (x, y, s) => `M${n(x)} ${n(y)}h${s}v${s}h-${s}z`;

export function ensureGlow(doc) {
  if (doc._glow) return 'glow';
  doc._glow = true;
  doc.def(
    '<filter id="glow" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b"/>' +
      '<feComponentTransfer in="b" result="g"><feFuncA type="linear" slope=".7"/></feComponentTransfer>' +
      '<feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
  );
  return 'glow';
}

function ensureFrameKeyframes(doc, count) {
  doc._ledKeyframes ??= new Set();
  if (doc._ledKeyframes.has(count)) return;
  doc._ledKeyframes.add(count);
  const pct = n(100 / count, 4);
  doc.css(`@keyframes led${count}{0%{opacity:1}${pct}%{opacity:0}100%{opacity:0}}`);
}

// frames: array of frames; each frame is an array of strings, one char per
// pixel. '.' is an unlit dot, other characters map through `palette`.
export function led(doc, { x, y, frames, period = 2, p = 5, dot = 4, palette = LED, glow = true, off = C.off, offsetDelay = 0 }) {
  const rows = frames[0].length;
  const cols = frames[0][0].length;
  let offD = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) offD += sq(x + c * p, y + r * p, dot);
  const out = [`<path d="${offD}" fill="${off}"/>`];

  const count = frames.length;
  if (count > 1) ensureFrameKeyframes(doc, count);
  const groups = frames.map((frame, k) => {
    const byColour = new Map();
    frame.forEach((row, r) => {
      if (row.length !== cols) throw new Error(`Frame ${k} row ${r} has ${row.length} columns, expected ${cols}`);
      [...row].forEach((ch, c) => {
        if (ch === '.' || ch === ' ') return;
        const colour = palette[ch];
        if (!colour) throw new Error(`No palette colour for "${ch}"`);
        byColour.set(colour, (byColour.get(colour) || '') + sq(x + c * p, y + r * p, dot));
      });
    });
    const paths = [...byColour].map(([fill, d]) => `<path d="${d}" fill="${fill}"/>`).join('');
    if (count === 1) return `<g>${paths}</g>`;
    const delay = -((count - k) % count) * (period / count) + offsetDelay;
    return `<g${k ? ' opacity="0"' : ''} style="animation:led${count} ${n(period, 3)}s steps(1) infinite;animation-delay:${n(delay, 3)}s">${paths}</g>`;
  });
  const filter = glow ? ` filter="url(#${ensureGlow(doc)})"` : '';
  out.push(`<g${filter}>${groups.join('')}</g>`);
  return out.join('');
}

// Small grid helpers for authoring frames in code.
export const grid = (rows = 12, cols = 12) => Array.from({ length: rows }, () => Array(cols).fill('.'));

export function stamp(g, sprite, r0 = 0, c0 = 0) {
  sprite.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === '.' || ch === ' ') return;
      if (g[r0 + r] && g[r0 + r][c0 + c] !== undefined) g[r0 + r][c0 + c] = ch;
    }),
  );
  return g;
}

export const set = (g, r, c, ch) => {
  if (g[r] && g[r][c] !== undefined) g[r][c] = ch;
  return g;
};

export const lines = (g) => g.map((row) => row.join(''));

// Deterministic PRNG so rebuilds produce identical SVGs.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
