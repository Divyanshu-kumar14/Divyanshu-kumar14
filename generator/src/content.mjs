// Everything the profile says lives here. Edit, then run `npm run build`
// inside generator/ to regenerate the static SVGs in assets/.

export const owner = 'Divyanshu-kumar14';

export const hero = {
  name: 'DIVYANSHU',
  meta: '@DIVYANSHU-KUMAR14 · NEW DELHI, IN · UTC+05:30',
  headline: "I write the part that checks the model's work.",
  body:
    'Parity gates for COBOL ports, interlocks for ER discharges, frame-cited defect reports for substations, and sealed incidents for liquid-cooled racks.',
  specs: [
    ['FOCUS', 'Verification · safety interlocks · accessibility'],
    ['WRITES', 'Python · TypeScript · Rust'],
    ['RUNS', 'Arch Linux · Omarchy'],
  ],
};

// Featured projects, in display order. `icon` picks an LED animation from icons.mjs.
export const work = [
  {
    repo: 'mainframe-ghost',
    icon: 'ghost',
    tags: 'PYTHON · GNUCOBOL · KIRO HOOKS',
    text: "Runs AI-ported COBOL against GnuCOBOL's own output inside a Kiro PreToolUse hook, and blocks the write if a single cent drifts.",
  },
  {
    repo: 'CryoGuard-AI',
    icon: 'drip',
    tags: 'PYTHON · OPENCV · SAM 3.1',
    text: 'Leak detection for 100 kW liquid-cooled racks. A deterministic pipeline closes the valve and powers down the node; the model only writes the explanation afterwards.',
  },
  {
    repo: 'SilentCatch',
    icon: 'ecg',
    tags: 'PYTHON · FASTAPI · NEXT.JS',
    text: 'Runs before the clinician clicks Sign & Discharge and flags what routine checks miss, like a nodule buried in a radiology report or an NSAID given to a failing kidney.',
  },
  {
    repo: 'GridSight',
    icon: 'track',
    tags: 'TYPESCRIPT · SAM 3.1 VIDEO',
    text: 'Turns drone footage of a substation into a severity-ranked defect list. Every finding cites the frame that shows it, or is marked voice-only.',
  },
  {
    repo: 'SonarTrace',
    icon: 'sonar',
    tags: 'PYTHON · TYPESCRIPT · WEBAUDIO',
    text: 'Lets blind developers hear a Python program run: pitch follows call depth, stereo follows coroutines, and a sub-bass drone swells when the event loop stalls.',
  },
  {
    repo: 'Verdict-Pay',
    icon: 'chain',
    tags: 'PYTHON · FASTAPI · SHA-256',
    text: 'Works out whether a PayPal dispute is worth fighting before the fee attaches, then builds an evidence dossier with a SHA-256 chain anyone can re-check.',
  },
];

// Smaller projects and things built for fun.
export const also = [
  { repo: 'CivicLens', text: 'Dashcams that file pothole tickets', lang: 'PYTHON' },
  { repo: 'DevSense', text: 'Voice-first CLI for blind developers', lang: 'PYTHON' },
  { repo: 'is-my-repo-compromised', label: 'is-my-repo-compromised', text: 'Supply-chain IOC scanner', lang: 'PYTHON' },
  { repo: 'apogee', text: 'ISS health and debris-risk dashboard', lang: 'PYTHON' },
  { repo: 'AOT-THEME', text: 'Attack on Titan theme for Omarchy', lang: 'THEME' },
  { repo: 'antigravity-theme', text: 'Minimal theme for Omarchy', lang: 'THEME' },
  { repo: 'LofiGirl-CLI', text: 'Lofi Girl radio in your terminal', lang: 'RUST' },
  { repo: 'Kazoe', text: 'Soroban mental-arithmetic trainer', lang: 'TYPESCRIPT' },
];

export const sections = {
  work: { index: '01', title: 'SELECTED WORK', note: 'each row opens the repository' },
  also: { index: '02', title: 'ALSO BUILT', note: 'smaller tools, and things made for fun' },
  signal: { index: '03', title: 'SIGNAL', note: 'redrawn every 12 hours from the GitHub API' },
};

export const footer = {
  line: 'Bring me a cup of coffee.',
  sub: 'Writing at dev.to/lazy_as_hell',
};

export const links = [
  { id: 'devto', label: 'DEV.TO', href: 'https://dev.to/lazy_as_hell' },
  { id: 'email', label: 'EMAIL', href: 'mailto:divyanshukumar0014@gmail.com' },
  { id: 'repos', label: 'ALL REPOSITORIES', href: `https://github.com/${owner}?tab=repositories` },
];

// Languages left out of the "languages by bytes" bar because generated or
// markup-heavy files would otherwise drown out the code.
export const ignoredLanguages = ['HTML', 'CSS', 'SCSS', 'Jupyter Notebook', 'Dockerfile', 'Makefile'];
