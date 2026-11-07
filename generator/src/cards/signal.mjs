// The live card: a year of contributions as an isometric voxel field, with
// an odometer for the yearly total and a language bar drawn in blocks.

import { Doc, n, panel } from '../lib/doc.mjs';
import { C, EASE, W } from '../theme.mjs';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// [top, left, right] faces per activity level
const LEVELS = [
  ['#2a9a37', '#1f7a2b', '#155a1f'],
  ['#45c247', '#329f37', '#23762a'],
  ['#7fe060', '#5bc04a', '#3e9034'],
  ['#c4f5a3', '#8fdc6e', '#5aa847'],
];
const LANG_COLOURS = [C.g[5], C.g[3], C.g[1], '#6b7a70', '#2f3a32'];

const pts = (arr) => arr.map(([x, y]) => `${n(x, 1)},${n(y, 1)}`).join(' ');
const monthDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};

export function signalCard(data) {
  const H = 532;
  const doc = new Doc(W, H, {
    title: `${data.total} contributions in the past year`,
    desc:
      `${data.commits} commits this year, ${data.prsTotal} pull requests in total, longest streak ${data.longestStreak} days, busiest on ${WEEKDAYS[data.busiestWeekday]}. ` +
      `Languages by bytes: ${data.languages.slice(0, 4).map((l) => l.name).join(', ')}.`,
  });

  doc.css(`
    .t{transform-box:fill-box;transform-origin:50% 100%;animation:grow 1.1s ${EASE} both}
    @keyframes grow{from{transform:scaleY(0)}}
    .roll{animation:roll 2.2s ${EASE} both}
    @keyframes roll{from{transform:translateY(0)}}
    .pulse{animation:pulse 2.2s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:.2}50%{opacity:1}}
  `);
  doc.add(panel(doc));

  // ---- Isometric field -------------------------------------------------
  const a = 12;
  const k = 0.8;
  const weeks = data.weeks;
  const wk = weeks.length;
  const x0 = (W - (wk + 7) * a) / 2 + 7 * a;
  const y0 = 122;
  const max = Math.max(1, ...weeks.flat().map((d) => d.count));
  const cellTop = (c, r) => [x0 + (c - r) * a, y0 + ((c + r) * a) / 2];

  let floor = '';
  const towers = [];
  const cells = [];
  weeks.forEach((week, c) => week.forEach((d) => cells.push({ ...d, c, r: d.weekday })));
  cells.sort((p, q) => p.c + p.r - (q.c + q.r) || p.c - q.c);

  let tallest = null;
  for (const cell of cells) {
    const [X, Y] = cellTop(cell.c, cell.r);
    const Yc = Y + a / 2;
    const hw = a * k;
    const hh = (a * k) / 2;
    floor += `M${n(X, 1)} ${n(Yc - hh, 1)}l${n(hw, 1)} ${n(hh, 1)}l${n(-hw, 1)} ${n(hh, 1)}l${n(-hw, 1)} ${n(-hh, 1)}z`;
    cell.X = X;
    cell.Yc = Yc;
    if (!cell.count) continue;
    const ratio = cell.count / max;
    const h = 4 + 56 * ratio ** 0.7;
    const level = Math.min(4, Math.max(1, Math.ceil(4 * ratio ** 0.6))) - 1;
    const [top, left, right] = LEVELS[level];
    const delay = 300 + cell.c * 24 + cell.r * 10;
    cell.h = h;
    if (!tallest || cell.count > tallest.count) tallest = cell;
    towers.push(
      `<g class="t" style="animation-delay:${delay}ms">` +
      `<polygon points="${pts([[X - hw, Yc - h], [X, Yc + hh - h], [X, Yc + hh], [X - hw, Yc]])}" fill="${left}"/>` +
      `<polygon points="${pts([[X, Yc + hh - h], [X + hw, Yc - h], [X + hw, Yc], [X, Yc + hh]])}" fill="${right}"/>` +
      `<polygon points="${pts([[X, Yc - hh - h], [X + hw, Yc - h], [X, Yc + hh - h], [X - hw, Yc - h]])}" fill="${top}"/>` +
      '</g>',
    );
  }
  doc.add(`<path d="${floor}" fill="#131b16" style="animation:fade 1s ease .1s both"/>`);
  doc.add(`<g>${towers.join('')}</g>`);

  // Today
  const last = cells.reduce((m, c) => (c.date > m.date ? c : m), cells[0]);
  const lh = last.h || 0;
  doc.add(
    `<polygon class="pulse" points="${pts([[last.X, last.Yc - a * 0.55 - lh], [last.X + a * 1.1, last.Yc - lh], [last.X, last.Yc + a * 0.55 - lh], [last.X - a * 1.1, last.Yc - lh]])}" fill="none" stroke="${C.g[4]}" stroke-width="1.2"/>`,
  );

  // Best-day callout
  if (tallest) {
    const tx = tallest.X;
    const ty = tallest.Yc - a * k * 0.5 - tallest.h;
    const label = doc.text(`${tallest.count} ON ${monthDay(tallest.date)}`, { font: 'mono-500', size: 10, tracking: 0.12, x: tx, y: ty - 30, anchor: 'middle', fill: C.text });
    doc.add(
      `<g style="animation:fade .8s ease 2.2s both">` +
      `<rect x="${n(tx, 1)}" y="${n(ty - 24, 1)}" width="1" height="20" fill="${C.g[4]}" opacity=".7"/>` +
      `<rect x="${n(label.x - 7, 1)}" y="${n(ty - 45, 1)}" width="${n(label.width + 14, 1)}" height="22" rx="4" fill="${C.bg}" stroke="${C.border}"/>` +
      `${label.svg}</g>`,
    );
  }

  // Month ticks along the front-left edge
  let prevMonth = null;
  const ticks = [];
  weeks.forEach((week, c) => {
    const first = week[0];
    const m = Number(first.date.slice(5, 7));
    if (prevMonth !== null && m !== prevMonth) {
      const X = x0 + (c - 6) * a - a;
      const Y = y0 + ((c + 6) * a) / 2 + a / 2;
      ticks.push(doc.text(MONTHS[m - 1], { font: 'mono-500', size: 9.5, tracking: 0.12, x: X - 4, y: Y + 18, anchor: 'end', fill: C.faint }).svg);
    }
    prevMonth = m;
  });
  doc.add(`<g style="animation:fade 1s ease .8s both">${ticks.join('')}</g>`);

  // ---- Range label (top-left) -----------------------------------------
  const firstDate = weeks[0][0].date;
  const lastDate = last.date;
  const range = `${MONTHS[Number(firstDate.slice(5, 7)) - 1]} ${firstDate.slice(0, 4)} — ${MONTHS[Number(lastDate.slice(5, 7)) - 1]} ${lastDate.slice(0, 4)}`;
  const rangeT = doc.text(range, { font: 'mono-500', size: 11, tracking: 0.14, x: 48, y: 50, fill: C.faint });
  doc.add(`<g style="animation:fade 1s ease both">${rangeT.svg}</g>`);

  // ---- Stats (top-right) ----------------------------------------------
  const SX = 520;
  const lbl = (s, x, y, fill = C.faint) => doc.text(s, { font: 'mono-500', size: 9.5, tracking: 0.14, x, y, fill }).svg;
  doc.add(`<g style="animation:fade 1s ease .2s both">${lbl('CONTRIBUTIONS, PAST YEAR', SX, 80)}</g>`);

  // Odometer
  const digits = String(data.total).split('').map(Number);
  const size = 56;
  const adv = 0.6 * size;
  const base = 140;
  const step = 64;
  doc.def(`<clipPath id="odo"><rect x="${SX - 2}" y="${base - 46}" width="${n(digits.length * adv + 4)}" height="56"/></clipPath>`);
  const strips = digits.map((d, i) => {
    const x = SX + i * adv;
    let glyphs = '';
    for (let j = 0; j < 20; j++) glyphs += doc.text(String(j % 10), { font: 'mono-500', size, x, y: base + j * step, fill: C.text }).svg;
    const dur = 1.6 + i * 0.35;
    return `<g class="roll" style="transform:translateY(${-(10 + d) * step}px);animation-duration:${n(dur)}s;animation-delay:.35s">${glyphs}</g>`;
  });
  doc.add(`<g clip-path="url(#odo)">${strips.join('')}</g>`);

  const small = [
    [String(data.commits), 'COMMITS'],
    [String(data.prsTotal), 'PRS'],
    [`${data.longestStreak}D`, 'STREAK'],
    [WEEKDAYS[data.busiestWeekday], 'BUSIEST'],
  ];
  small.forEach(([v, l], i) => {
    const x = SX + i * 72;
    const val = doc.text(v, { font: 'mono-500', size: 20, x, y: 180, fill: C.text }).svg;
    doc.add(`<g style="animation:rise .9s ${EASE} ${n(0.9 + i * 0.1)}s both">${val}${lbl(l, x, 198)}</g>`);
  });
  if (data.latest) {
    const t = doc.text(`LATEST PUSH  ${data.latest.name}  ·  ${data.latest.pushedAt.slice(0, 10)}`, { font: 'mono-400', size: 10, tracking: 0.06, x: SX, y: 228, fill: C.muted });
    doc.add(`<g style="animation:fade 1s ease 1.4s both">${t.svg}</g>`);
  }

  // ---- Languages (bottom-left) ----------------------------------------
  const LX = 48;
  doc.add(`<g style="animation:fade 1s ease .6s both">${lbl('LANGUAGES BY BYTES, PUBLIC REPOS', LX, 390)}</g>`);
  const totalBytes = data.languages.reduce((s, l) => s + l.bytes, 0) || 1;
  const top = data.languages.slice(0, 4);
  const rest = data.languages.slice(4).reduce((s, l) => s + l.bytes, 0);
  const groups = [...top.map((l) => ({ name: l.name, bytes: l.bytes })), ...(rest ? [{ name: 'Other', bytes: rest }] : [])];
  const blocks = 30;
  const raw = groups.map((g) => (g.bytes / totalBytes) * blocks);
  const counts = raw.map(Math.floor);
  let left = blocks - counts.reduce((s, v) => s + v, 0);
  raw
    .map((v, i) => [v - Math.floor(v), i])
    .sort((p, q) => q[0] - p[0])
    .forEach(([, i]) => {
      if (left > 0) {
        counts[i] += 1;
        left -= 1;
      }
    });
  let bi = 0;
  const bar = [];
  counts.forEach((cnt, gi) => {
    for (let j = 0; j < cnt; j++, bi++) {
      bar.push(`<rect x="${LX + bi * 11}" y="404" width="9" height="9" fill="${LANG_COLOURS[gi]}" style="animation:fade .4s ease ${n(0.8 + bi * 0.035, 3)}s both"/>`);
    }
  });
  doc.add(`<g>${bar.join('')}</g>`);
  groups.forEach((g, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = LX + col * 170;
    const y = 446 + row * 22;
    const pct = `${((g.bytes / totalBytes) * 100).toFixed(1)}%`;
    const name = doc.text(g.name, { font: 'sans-400', size: 12.5, x: x + 16, y, fill: C.text }).svg;
    const p = doc.text(pct, { font: 'mono-400', size: 10.5, x: x + 150, y, anchor: 'end', fill: C.faint }).svg;
    doc.add(`<g style="animation:fade .8s ease ${n(1.2 + i * 0.08)}s both"><rect x="${x}" y="${y - 8}" width="8" height="8" fill="${LANG_COLOURS[i]}"/>${name}${p}</g>`);
  });

  // ---- Stamp (bottom-right) -------------------------------------------
  const stamp = `UPDATED ${data.generatedAt.slice(0, 16).replace('T', ' ')} UTC`;
  doc.add(doc.text(stamp, { font: 'mono-400', size: 9.5, tracking: 0.12, x: W - 48, y: H - 24, anchor: 'end', fill: C.faint }).svg);

  return doc.toString();
}
