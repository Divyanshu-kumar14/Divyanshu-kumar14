// Section headers, project rows, "also built" chips, footer and link buttons.

import { Doc, n, panel } from '../lib/doc.mjs';
import { measure, wrap } from '../lib/font.mjs';
import { led } from '../lib/matrix.mjs';
import { ICONS, coffee } from '../icons.mjs';
import { C, EASE, W } from '../theme.mjs';

export const arrow = (x, y, s, stroke, width = 1.5) =>
  `<path d="M${n(x)} ${n(y + s)}L${n(x + s)} ${n(y)}M${n(x + s * 0.3)} ${n(y)}H${n(x + s)}V${n(y + s * 0.7)}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`;

// Transparent background with mid-tone colours, so it reads on GitHub's
// light and dark themes alike.
export function sectionHeader({ index, title, note }) {
  const H = 40;
  const doc = new Doc(W, H, { title: `${index} ${title}`, desc: note });
  const y = 30;
  const i = doc.text(index, { font: 'mono-600', size: 12, tracking: 0.08, x: 2, y, fill: C.midAccent });
  const t = doc.text(title, { font: 'mono-600', size: 12, tracking: 0.18, x: 2 + i.width + 14, y, fill: C.midText });
  const noteT = doc.text(note, { font: 'mono-400', size: 11, x: W - 2, y, anchor: 'end', fill: C.midText });
  const lineX = 2 + i.width + 14 + t.width + 18;
  const lineW = noteT.x - 18 - lineX;
  doc.add(`<g style="animation:fade .8s ease both">${i.svg}${t.svg}</g>`);
  doc.add(
    `<rect x="${n(lineX)}" y="${y - 4}" width="${n(lineW)}" height="1" fill="${C.midText}" opacity=".35" style="transform-box:fill-box;transform-origin:left;animation:drawx 1.4s ${EASE} .2s both"/>`,
  );
  doc.add(`<g style="animation:fade .8s ease .5s both">${noteT.svg}</g>`);
  return doc.toString();
}

export function workRow(item, index) {
  const textX = 116;
  const lines = wrap(item.text, { font: 'sans-400', size: 15 }, 640);
  const H = 128 + Math.max(0, lines.length - 2) * 23;
  const doc = new Doc(W, H, { title: `${item.repo} — ${item.tags}`, desc: item.text });
  const delay = 0.15 + index * 0.09;

  const { frames, period } = ICONS[item.icon]();
  doc.add(panel(doc));
  doc.add(`<g style="animation:fade 1s ease ${n(delay)}s both">${led(doc, { x: 28, y: Math.round((H - 59) / 2), frames, period })}</g>`);

  const name = doc.text(item.repo, { font: 'sans-600', size: 20, x: textX, y: 48, fill: C.text });
  const tags = doc.text(item.tags, { font: 'mono-500', size: 10.5, tracking: 0.14, x: textX + name.width + 16, y: 47, fill: C.faint });
  const num = doc.text(String(index + 1).padStart(2, '0'), { font: 'mono-500', size: 11, tracking: 0.08, x: W - 28, y: 47, anchor: 'end', fill: C.faint });
  const desc = lines.map((l, i) => doc.text(l, { font: 'sans-400', size: 15, x: textX, y: 79 + i * 23, fill: C.muted }).svg).join('');

  doc.add(`<g style="animation:slide .9s ${EASE} ${n(delay)}s both">${name.svg}${tags.svg}${desc}</g>`);
  doc.add(`<g style="animation:fade .9s ease ${n(delay + 0.3)}s both">${num.svg}${arrow(W - 40, H - 40, 11, C.faint)}</g>`);
  return doc.toString();
}

export function chip(item, index) {
  const Wc = 211;
  const H = 104;
  const pad = 20;
  const max = Wc - pad * 2 - 16;
  const doc = new Doc(Wc, H, { title: item.label || item.repo, desc: item.text });
  let size = 14;
  while (measure(item.label || item.repo, { font: 'sans-600', size }) > max && size > 11) size -= 0.5;
  const name = doc.text(item.label || item.repo, { font: 'sans-600', size, x: pad, y: 33, fill: C.text });
  const desc = wrap(item.text, { font: 'sans-400', size: 12 }, Wc - pad * 2)
    .slice(0, 2)
    .map((l, i) => doc.text(l, { font: 'sans-400', size: 12, x: pad, y: 54 + i * 16, fill: C.muted }).svg)
    .join('');
  const lang = doc.text(item.lang, { font: 'mono-500', size: 9.5, tracking: 0.16, x: pad, y: H - 14, fill: C.faint });
  const delay = 0.1 + index * 0.06;
  // Inset horizontally so adjacent chips get a gap close to the vertical one
  // GitHub's line boxes add between rows.
  doc.add(`<rect x="4.5" y=".5" width="${Wc - 9}" height="${H - 1}" rx="10" fill="${C.bg}" stroke="${C.border}"/>`);
  doc.add(`<g style="animation:rise .9s ${EASE} ${n(delay)}s both">${name.svg}${desc}${lang.svg}${arrow(Wc - pad - 8, 22, 8, C.faint, 1.3)}</g>`);
  return doc.toString();
}

export function footerCard(content) {
  const H = 150;
  const doc = new Doc(W, H, { title: content.line, desc: content.sub });
  const { frames, period } = coffee();
  doc.add(panel(doc));
  doc.add(led(doc, { x: 48, y: Math.round((H - 59) / 2), frames, period }));
  const line = doc.text(content.line, { font: 'sans-500', size: 26, x: 136, y: 72, fill: C.text });
  const sub = doc.text(content.sub, { font: 'sans-400', size: 15, x: 136, y: 102, fill: C.muted });
  doc.add(`<g style="animation:rise 1s ${EASE} .1s both">${line.svg}</g>`);
  doc.add(`<g style="animation:rise 1s ${EASE} .22s both">${sub.svg}</g>`);
  return doc.toString();
}

export function linkButton({ label }) {
  const opts = { font: 'mono-600', size: 11, tracking: 0.16 };
  const tw = measure(label, opts);
  const Wb = Math.ceil(tw + 20 + 14 + 22);
  const H = 40;
  const doc = new Doc(Wb, H, { title: label, desc: `Open ${label.toLowerCase()}` });
  doc.add(`<rect x=".5" y=".5" width="${Wb - 1}" height="${H - 1}" rx="8" fill="${C.bg}" stroke="${C.border}"/>`);
  const t = doc.text(label, { ...opts, x: 20, y: 24, fill: C.text });
  doc.add(t.svg, arrow(20 + tw + 12, 15, 8, C.g[3], 1.4));
  return doc.toString();
}
