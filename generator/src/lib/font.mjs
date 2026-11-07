// Text-to-path rendering. SVGs shown through <img> cannot load web fonts and
// fall back to whatever the viewer has installed, so every glyph is converted
// to an outline once per document and reused with <use>.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'opentype.js/dist/opentype.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fontRoot = path.resolve(here, '../../node_modules/@fontsource');

const FILES = {
  'sans-400': ['ibm-plex-sans', 400],
  'sans-500': ['ibm-plex-sans', 500],
  'sans-600': ['ibm-plex-sans', 600],
  'mono-400': ['ibm-plex-mono', 400],
  'mono-500': ['ibm-plex-mono', 500],
  'mono-600': ['ibm-plex-mono', 600],
};

const SHORT = {
  'sans-400': 's4', 'sans-500': 's5', 'sans-600': 's6',
  'mono-400': 'm4', 'mono-500': 'm5', 'mono-600': 'm6',
};

const cache = new Map();

export function font(key) {
  if (!FILES[key]) throw new Error(`Unknown font "${key}"`);
  if (!cache.has(key)) {
    const [pkg, weight] = FILES[key];
    const file = path.join(fontRoot, pkg, 'files', `${pkg}-latin-${weight}-normal.woff`);
    const buf = fs.readFileSync(file);
    cache.set(key, parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return cache.get(key);
}

function glyphs(f, key, str) {
  return [...str].map((ch) => {
    const g = f.charToGlyph(ch);
    if (!g || g.index === 0) {
      throw new Error(`Font ${key} has no glyph for "${ch}" (U+${ch.codePointAt(0).toString(16)})`);
    }
    return g;
  });
}

function kern(f, a, b) {
  try {
    return f.getKerningValue(a, b) || 0;
  } catch {
    return 0;
  }
}

// Outline in font units with the y axis flipped for SVG.
export function glyphPath(g) {
  const r = Math.round;
  let d = '';
  for (const c of g.path.commands) {
    if (c.type === 'M' || c.type === 'L') d += `${c.type}${r(c.x)} ${r(-c.y)}`;
    else if (c.type === 'Q') d += `Q${r(c.x1)} ${r(-c.y1)} ${r(c.x)} ${r(-c.y)}`;
    else if (c.type === 'C') d += `C${r(c.x1)} ${r(-c.y1)} ${r(c.x2)} ${r(-c.y2)} ${r(c.x)} ${r(-c.y)}`;
    else if (c.type === 'Z') d += 'Z';
  }
  return d;
}

export function glyphId(key, g) {
  return `${SHORT[key]}_${g.index}`;
}

export function layout(str, { font: key = 'sans-400', size = 16, tracking = 0 }) {
  const f = font(key);
  const gs = glyphs(f, key, str);
  const track = tracking * f.unitsPerEm;
  const items = [];
  let x = 0;
  gs.forEach((g, i) => {
    items.push({ g, x });
    x += g.advanceWidth;
    if (i < gs.length - 1) x += kern(f, g, gs[i + 1]) + track;
  });
  const scale = size / f.unitsPerEm;
  return { key, items, scale, width: x * scale };
}

export function measure(str, opts) {
  return layout(str, opts).width;
}

export function wrap(str, opts, maxWidth) {
  const words = str.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next, opts) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function capHeight(key, size) {
  const f = font(key);
  return ((f.tables.os2?.sCapHeight || 700) / f.unitsPerEm) * size;
}
