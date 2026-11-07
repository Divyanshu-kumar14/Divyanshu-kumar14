// Shared visual system. Every card pulls colours and sizes from here so the
// profile reads as one piece.

export const W = 846; // GitHub profile README content width at desktop sizes

export const C = {
  bg: '#0b0f0c',
  border: '#1c2620',
  hairline: '#1f2a23',
  dotgrid: '#16201a',
  text: '#e7ede8',
  muted: '#97a39a',
  faint: '#5f6c63',
  off: '#131b16', // unlit LED
  ink: '#070a08', // "black" lit pixel (creeper face, ghost pupils)
  white: '#eef6ef',
  // Creeper greens, dark to light
  g: ['#0f3d18', '#1a6b28', '#2a9a37', '#45c247', '#7fe060', '#c4f5a3'],
  // Mid-tones that stay readable on both GitHub light and dark backgrounds
  midText: '#8b949e',
  midAccent: '#3fae4a',
};

export const EASE = 'cubic-bezier(.16,1,.3,1)';

// Colour keys usable in LED matrix frames
export const LED = {
  a: C.g[1],
  b: C.g[2],
  c: C.g[3],
  d: C.g[4],
  e: C.g[5],
  w: C.white,
  k: C.ink,
};
