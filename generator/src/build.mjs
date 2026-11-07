// Usage (from generator/):
//   node src/build.mjs static                 -> ../assets/*.svg
//   node src/build.mjs signal                 -> $OUT_DIR/signal.svg (default ../dist)
//   node src/build.mjs signal --data f.json   -> render from saved data, no API call
//   node src/build.mjs signal --save f.json   -> also save the fetched data

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as content from './content.mjs';
import { heroCard } from './cards/hero.mjs';
import { chip, footerCard, linkButton, sectionHeader, workRow } from './cards/small.mjs';
import { signalCard } from './cards/signal.mjs';
import { fetchProfile } from './data/github.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

function write(file, svg) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${svg}\n`);
  console.log(`${path.relative(repoRoot, file).padEnd(36)} ${(Buffer.byteLength(svg) / 1024).toFixed(1).padStart(6)} KB`);
}

function buildStatic() {
  const out = path.join(repoRoot, 'assets');
  write(path.join(out, 'hero.svg'), heroCard(content.hero));
  for (const [key, s] of Object.entries(content.sections)) write(path.join(out, `section-${key}.svg`), sectionHeader(s));
  content.work.forEach((item, i) => write(path.join(out, 'work', `${item.repo}.svg`), workRow(item, i)));
  content.also.forEach((item, i) => write(path.join(out, 'also', `${item.repo}.svg`), chip(item, i)));
  write(path.join(out, 'footer.svg'), footerCard(content.footer));
  for (const l of content.links) write(path.join(out, 'links', `${l.id}.svg`), linkButton(l));
}

async function buildSignal() {
  const dataFile = flag('--data');
  const data = dataFile
    ? { ...JSON.parse(fs.readFileSync(dataFile, 'utf8')), generatedAt: new Date().toISOString() }
    : await fetchProfile(process.env.PROFILE_USER || content.owner, process.env.GITHUB_TOKEN || process.env.GH_TOKEN, {
        ignoredLanguages: content.ignoredLanguages,
      });
  const save = flag('--save');
  if (save) fs.writeFileSync(save, JSON.stringify(data, null, 2));
  const outDir = path.resolve(process.env.OUT_DIR || path.join(repoRoot, 'dist'));
  write(path.join(outDir, 'signal.svg'), signalCard(data));
}

const targets = args.filter((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
if (!targets.length) targets.push('static');
for (const t of targets) {
  if (t === 'static') buildStatic();
  else if (t === 'signal') await buildSignal();
  else throw new Error(`Unknown target "${t}"`);
}
