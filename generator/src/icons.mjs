// 12x12 LED icons, one per featured project. Each returns a list of frames.

import { grid, lines, rng, set, stamp } from './lib/matrix.mjs';

// mainframe-ghost: a ghost that bobs, wiggles its skirt and looks around.
function ghost() {
  const skirts = ['cc..cc..cc', '.cc.cc.cc.'];
  const body = (look, skirt) => [
    '...cccc...',
    '.cdcccccc.',
    'cccccccccc',
    'ccwwccwwcc',
    look === 'L' ? 'cckwcckwcc' : 'ccwkccwkcc',
    'cccccccccc',
    'cccccccccc',
    'cccccccccc',
    skirts[skirt],
  ];
  const frames = [];
  for (let k = 0; k < 8; k++) {
    const g = grid();
    stamp(g, body(k < 4 ? 'L' : 'R', k % 2), [1, 1, 2, 2][k % 4] + 1, 1);
    frames.push(lines(g));
  }
  return { frames, period: 2.8 };
}

// CryoGuard-AI: coolant drips from a manifold and the leak fluoresces.
function drip() {
  const base = () => {
    const g = grid();
    stamp(g, ['aaaaaaaaaaaa', 'aaaaaaaaaaaa', '.....bb.....'], 0, 0);
    return g;
  };
  const steps = [
    (g) => stamp(g, ['bb'], 3, 5),
    (g) => stamp(g, ['cc', 'cc'], 3, 5),
    (g) => stamp(g, ['cc', 'cc'], 5, 5),
    (g) => stamp(g, ['cc', 'cc'], 7, 5),
    (g) => stamp(g, ['dd', 'dd'], 9, 5),
    (g) => stamp(g, ['..e......e..', '...eeeeee...'], 10, 0),
    (g) => stamp(g, ['.eeeeeeeeee.'], 11, 0),
    (g) => stamp(g, ['.dddddddddd.'], 11, 0),
    (g) => stamp(g, ['..cccccccc..'], 11, 0),
    (g) => stamp(g, ['...bbbbbb...'], 11, 0),
  ];
  return { frames: steps.map((f) => lines(f(base()))), period: 2.6 };
}

// SilentCatch: a patient monitor sweep that overwrites the previous trace.
function ecg() {
  const y = [7, 7, 7, 6, 7, 7, 8, 2, 10, 7, 6, 7];
  const trace = (g, c, ch) => {
    const prev = c > 0 ? y[c - 1] : y[c];
    const [lo, hi] = [Math.min(prev, y[c]), Math.max(prev, y[c])];
    if (hi - lo > 1) for (let r = lo + 1; r < hi; r++) set(g, r, c, ch);
    set(g, y[c], c, ch);
  };
  const frames = [];
  for (let h = 0; h < 12; h++) {
    const g = grid();
    for (let c = 0; c < 12; c++) {
      if (c <= h) trace(g, c, c >= h - 1 ? 'e' : 'c');
      else if (c > h + 2) trace(g, c, 'a');
    }
    frames.push(lines(g));
  }
  return { frames, period: 1.6 };
}

// GridSight: tracking brackets close in on a fault on a power symbol.
function track() {
  const bolt = [
    '......aaaa..',
    '.....aaaa...',
    '....aaaa....',
    '...aaaa.....',
    '..aaaaaaaa..',
    '......aaa...',
    '.....aaa....',
    '....aaa.....',
    '...aa.......',
    '..a.........',
  ];
  const boxes = [
    [0, 0, 11, 11, 'c', 'a'],
    [2, 1, 10, 9, 'c', 'a'],
    [4, 3, 9, 8, 'c', 'b'],
    [5, 4, 8, 7, 'e', 'e'],
    [5, 4, 8, 7, 'c', 'e'],
    [5, 4, 8, 7, 'e', 'e'],
    [5, 4, 8, 7, 'c', 'd'],
    [5, 4, 8, 7, 'c', 'd'],
  ];
  const frames = boxes.map(([x0, y0, x1, y1, ch, target]) => {
    const g = grid();
    stamp(g, bolt, 1, 0);
    for (const [r, c] of [[5, 6], [5, 7], [6, 6], [6, 7]]) if (g[r][c] !== '.') set(g, r, c, target);
    const arm = x1 - x0 >= 5 ? 2 : 1;
    for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      for (let i = 0; i <= arm; i++) {
        set(g, cy, cx + dx * i, ch);
        set(g, cy + dy * i, cx, ch);
      }
    }
    return lines(g);
  });
  return { frames, period: 2.7 };
}

// SonarTrace: pings radiating from a source.
function sonar() {
  const frames = [];
  const R = [0.9, 2, 3.1, 4.2, 5.3, 6.4];
  for (let k = 0; k < R.length; k++) {
    const g = grid();
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const d = Math.hypot(c + 0.5 - 6, r + 0.5 - 6);
        if (d < 0.8) set(g, r, c, 'e');
        else if (Math.abs(d - R[k]) < 0.5) set(g, r, c, 'd');
        else if (k >= 1 && Math.abs(d - R[k - 1]) < 0.5) set(g, r, c, 'b');
        else if (k >= 2 && Math.abs(d - R[k - 2]) < 0.5) set(g, r, c, 'a');
      }
    }
    frames.push(lines(g));
  }
  return { frames, period: 1.8 };
}

// Verdict-Pay: a hash pulse walks a chain of custody, then the chain verifies.
function chain() {
  const blocks = [0, 5, 10];
  const links = [[2, 3, 4], [7, 8, 9]];
  const base = (blockCh = 'b', linkCh = 'a') => {
    const g = grid();
    for (const c of blocks) for (let r = 4; r <= 7; r++) { set(g, r, c, blockCh); set(g, r, c + 1, blockCh); }
    for (const l of links) for (const c of l) { set(g, 5, c, linkCh); set(g, 6, c, linkCh); }
    return g;
  };
  const lightBlock = (g, i, ch) => {
    for (let r = 4; r <= 7; r++) { set(g, r, blocks[i], ch); set(g, r, blocks[i] + 1, ch); }
    return g;
  };
  const lightLink = (g, c, ch) => { set(g, 5, c, ch); set(g, 6, c, ch); return g; };
  const frames = [
    lightBlock(base(), 0, 'e'),
    lightLink(lightBlock(base(), 0, 'd'), 2, 'e'),
    lightLink(base(), 3, 'e'),
    lightLink(base(), 4, 'e'),
    lightBlock(base(), 1, 'e'),
    lightLink(lightBlock(base(), 1, 'd'), 7, 'e'),
    lightLink(base(), 8, 'e'),
    lightLink(base(), 9, 'e'),
    lightBlock(base(), 2, 'e'),
    base('d', 'c'),
    base('d', 'c'),
    base(),
  ].map(lines);
  return { frames, period: 2.6 };
}

// Footer: a cup of coffee with rising steam.
export function coffee() {
  const cup = [
    '.cccccccc...',
    '.bbbbbbbbbb.',
    '.bbbbbbbb.b.',
    '.bbbbbbbbbb.',
    '.bbbbbbbb...',
    '..bbbbbb....',
    'aaaaaaaaaaa.',
  ];
  const wobble = [0, 1, 0, -1];
  const frames = [];
  for (let k = 0; k < 4; k++) {
    const g = grid();
    stamp(g, cup, 4, 0);
    for (const base of [3, 6]) {
      for (let r = 0; r < 4; r++) set(g, r, base + wobble[(r + k) % 4], r < 2 ? 'a' : 'b');
    }
    frames.push(lines(g));
  }
  return { frames, period: 1.6 };
}

// Hero easter egg: the creeper from the avatar.
export function creeper(seed = 7) {
  const face = [
    'GGGGGGGG',
    'GGGGGGGG',
    'GkkGGkkG',
    'GkkGGkkG',
    'GGGkkGGG',
    'GGkkkkGG',
    'GGkkkkGG',
    'GGkGGkGG',
  ];
  const rand = rng(seed);
  const tones = ['b', 'c', 'c', 'd', 'c', 'b', 'e'];
  const skin = face.map((row) => [...row].map((ch) => (ch === 'G' ? tones[Math.floor(rand() * tones.length)] : ch)).join(''));
  const flash = face.map((row) => row.replace(/G/g, 'w').replace(/k/g, '.'));
  return { skin, flash };
}

export const ICONS = { ghost, drip, ecg, track, sonar, chain };
