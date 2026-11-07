import { Doc, dotGrid, n, panel } from '../lib/doc.mjs';
import { wrap } from '../lib/font.mjs';
import { led, rng } from '../lib/matrix.mjs';
import { pixelText } from '../lib/pixelfont.mjs';
import { creeper } from '../icons.mjs';
import { C, EASE, W } from '../theme.mjs';

export function heroCard(content) {
  const H = 460;
  const M = 48;
  const doc = new Doc(W, H, {
    title: `${content.name} — ${content.headline}`,
    desc: `${content.body} ${content.specs.map(([k, v]) => `${k}: ${v}.`).join(' ')}`,
  });

  doc.css(`
    .px{animation:drop .95s ${EASE} both}
    @keyframes drop{from{opacity:0;transform:translateY(-56px)}}
    .tw{opacity:0;animation:tw 9s ease-in-out infinite}
    @keyframes tw{0%,7%,100%{opacity:0}3.5%{opacity:.85}}
    .sheen{animation:sheen 8s ${EASE} 2.4s infinite backwards}
    @keyframes sheen{0%{transform:translateX(0)}24%,100%{transform:translateX(1100px)}}
    .breathe{animation:breathe 7s ease-in-out infinite}
    @keyframes breathe{0%,100%{opacity:.55}50%{opacity:1}}
    .fuse{transform-box:fill-box;transform-origin:center;animation:swell 10s ease-in-out 3s infinite}
    @keyframes swell{0%,80%,100%{transform:scale(1)}88%{transform:scale(1.1)}95%{transform:scale(1.16)}97%{transform:scale(1)}}
    .flash{opacity:0;animation:flash 10s linear 3s infinite}
    @keyframes flash{0%,82%,86%,90%,94%,100%{opacity:0}84%,92%{opacity:.95}}
  `);

  doc.def(
    `<radialGradient id="aura" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.g[3]}" stop-opacity=".16"/><stop offset="1" stop-color="${C.g[3]}" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="band" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  );

  doc.add(panel(doc), dotGrid(doc, { step: 14, ox: M - 1, oy: 96 - 1 }));
  doc.add(`<ellipse class="breathe" cx="${W / 2}" cy="150" rx="460" ry="150" fill="url(#aura)"/>`);

  // Meta row + creeper
  const meta = doc.text(content.meta, { font: 'mono-500', size: 11, tracking: 0.14, x: M, y: 49, fill: C.faint });
  doc.add(`<g style="animation:fade 1s ease .1s both">${meta.svg}</g>`);
  const cr = creeper();
  const cx = W - M - 39;
  const cy = 24;
  const flashRects = cr.flash
    .flatMap((row, r) => [...row].map((ch, c) => (ch === 'w' ? `M${cx + c * 5} ${cy + r * 5}h4v4h-4z` : '')))
    .join('');
  doc.add(
    `<g style="animation:fade 1s ease .3s both"><g class="fuse">${led(doc, { x: cx, y: cy, frames: [cr.skin], glow: true })}<path class="flash" d="${flashRects}" fill="${C.white}"/></g></g>`,
  );

  // Pixel name
  const p = 14;
  const size = 12;
  const top = 96;
  const { cells } = pixelText(content.name);
  const rand = rng(1959);
  const tones = [C.g[2], C.g[2], C.g[3], C.g[3], C.g[3], C.g[3], C.g[4], C.g[4], C.g[5], C.g[1]];
  const px = [];
  const tw = [];
  let clip = '';
  for (const cell of cells) {
    const x = M + cell.col * p;
    const y = top + cell.row * p;
    const fill = tones[Math.floor(rand() * tones.length)];
    const delay = 180 + cell.col * 16 + (6 - cell.row) * 22 + Math.floor(rand() * 140);
    px.push(`<rect class="px" x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" style="animation-delay:${delay}ms"/>`);
    clip += `M${x} ${y}h${size}v${size}h-${size}z`;
    if (rand() < 0.16) {
      tw.push(`<rect class="tw" x="${x}" y="${y}" width="${size}" height="${size}" fill="${C.g[5]}" style="animation-delay:${n(2.2 + rand() * 9, 2)}s"/>`);
    }
  }
  doc.def(`<clipPath id="name"><path d="${clip}"/></clipPath>`);
  doc.add(`<g>${px.join('')}${tw.join('')}</g>`);
  doc.add(`<g clip-path="url(#name)"><rect class="sheen" x="-240" y="${top}" width="220" height="${7 * p}" fill="url(#band)" opacity=".5"/></g>`);

  // Statement
  const head = doc.text(content.headline, { font: 'sans-500', size: 30, x: M, y: 262, fill: C.text });
  doc.add(`<g style="animation:rise 1s ${EASE} .9s both">${head.svg}</g>`);
  const body = wrap(content.body, { font: 'sans-400', size: 16 }, 690);
  body.forEach((line, i) => {
    const t = doc.text(line, { font: 'sans-400', size: 16, x: M, y: 300 + i * 26, fill: C.muted });
    doc.add(`<g style="animation:rise 1s ${EASE} ${n(1.05 + i * 0.1)}s both">${t.svg}</g>`);
  });

  // Spec row
  doc.add(
    `<rect x="${M}" y="364" width="${W - 2 * M}" height="1" fill="${C.hairline}" style="transform-box:fill-box;transform-origin:left;animation:drawx 1.4s ${EASE} 1.2s both"/>`,
  );
  const cols = [M, 428, 628];
  content.specs.forEach(([label, value], i) => {
    const l = doc.text(label, { font: 'mono-500', size: 10.5, tracking: 0.16, x: cols[i], y: 396, fill: C.faint });
    const v = doc.text(value, { font: 'sans-400', size: 14, x: cols[i], y: 420, fill: C.text });
    doc.add(`<g style="animation:rise .9s ${EASE} ${n(1.35 + i * 0.1)}s both">${l.svg}${v.svg}</g>`);
  });

  return doc.toString();
}
