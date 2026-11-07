// Minimal SVG document builder with a per-document glyph registry.

import { glyphId, glyphPath, layout } from './font.mjs';
import { C } from '../theme.mjs';

export const n = (v, p = 2) => {
  const s = Number(v).toFixed(p);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BASE_CSS = `
@keyframes fade{from{opacity:0}}
@keyframes rise{from{opacity:0;transform:translateY(12px)}}
@keyframes slide{from{opacity:0;transform:translateX(-14px)}}
@keyframes drawx{from{transform:scaleX(0)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

export class Doc {
  constructor(width, height, { title, desc = '' }) {
    this.width = width;
    this.height = height;
    this.title = title;
    this.desc = desc;
    this.styles = [BASE_CSS];
    this.defs = [];
    this.body = [];
    this.glyphs = new Map();
    this.seq = 0;
  }

  css(s) {
    this.styles.push(s);
    return this;
  }

  def(s) {
    this.defs.push(s);
    return this;
  }

  add(...parts) {
    this.body.push(...parts);
    return this;
  }

  uid(prefix = 'u') {
    this.seq += 1;
    return `${prefix}${this.seq}`;
  }

  glyph(key, g) {
    const id = glyphId(key, g);
    if (!this.glyphs.has(id)) this.glyphs.set(id, glyphPath(g));
    return id;
  }

  // Returns { svg, width }. `y` is the baseline. Never animate the returned
  // element's transform with CSS (it would replace the positioning transform);
  // wrap it in an animated <g> instead.
  text(str, { x = 0, y = 0, anchor = 'start', fill, opacity, attrs = '', ...opts }) {
    const L = layout(str, opts);
    let ox = x;
    if (anchor === 'middle') ox -= L.width / 2;
    else if (anchor === 'end') ox -= L.width;
    const uses = L.items
      .filter((it) => it.g.path.commands.length)
      .map((it) => `<use href="#${this.glyph(L.key, it.g)}" x="${Math.round(it.x)}"/>`)
      .join('');
    const fillAttr = fill ? ` fill="${fill}"` : '';
    const opAttr = opacity !== undefined ? ` opacity="${opacity}"` : '';
    return {
      svg: `<g transform="translate(${n(ox)} ${n(y)}) scale(${n(L.scale, 5)})"${fillAttr}${opAttr}${attrs}>${uses}</g>`,
      width: L.width,
      x: ox,
    };
  }

  toString() {
    const glyphDefs = [...this.glyphs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('');
    const css = this.styles.join('\n').replace(/\n\s*/g, '');
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" role="img" aria-labelledby="title desc">`,
      `<title id="title">${esc(this.title)}</title>`,
      `<desc id="desc">${esc(this.desc)}</desc>`,
      `<style>${css}</style>`,
      `<defs>${glyphDefs}${this.defs.join('')}</defs>`,
      ...this.body,
      '</svg>',
    ].join('\n');
  }
}

export function panel(doc, { rx = 12, y = 0, height = doc.height } = {}) {
  return `<rect x=".5" y="${n(y + 0.5)}" width="${doc.width - 1}" height="${height - 1}" rx="${rx}" fill="${C.bg}" stroke="${C.border}"/>`;
}

// Dotted grid texture used behind the hero and signal cards.
export function dotGrid(doc, { step = 14, ox = 0, oy = 0, id = 'dots' } = {}) {
  doc.def(
    `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse" x="${ox}" y="${oy}"><rect width="1" height="1" fill="${C.dotgrid}"/></pattern>`,
  );
  return `<rect x="1" y="1" width="${doc.width - 2}" height="${doc.height - 2}" rx="11" fill="url(#${id})"/>`;
}
