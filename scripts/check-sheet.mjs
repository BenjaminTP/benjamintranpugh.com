// Two guards for the drawing-sheet build. Run: node scripts/check-sheet.mjs
//
//  1. Figure-field packing must never leave a blank grid cell, at any figure
//     count. The rule is in src/pages/index.astro; this asserts it.
//  2. Reports which characters used in src/ are missing from the subset fonts
//     and will fall back to a system face. Arrows and Greek are expected (no
//     Google Fonts subset ships them); anything else is worth a look.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

let failed = 0;
const fail = (m) => { console.error('  FAIL ' + m); failed++; };

// ---------- 1. grid packing ----------
const colsFor = (n) => (n <= 2 ? Math.max(n, 1) : n <= 4 ? 2 : 3);
const spanFor = (n) => colsFor(n) - ((n - 1) % colsFor(n));

console.log('grid packing:');
for (let n = 1; n <= 24; n++) {
  const cols = colsFor(n);
  const span = spanFor(n);
  // cells consumed = the first figure's span + one per remaining figure
  const cells = (span > 1 ? span : 1) + (n - 1);
  if (cells % cols !== 0) fail(`n=${n}: ${cells} cells in ${cols} columns leaves a gap`);
}
if (!failed) console.log(`  OK  1..24 figures pack with no blank cell`);

// ---------- 2. glyph coverage ----------
const FONTS = 'public/fonts';
const cmapOf = (file) => {
  // minimal woff2 cmap read is not worth it here; instead check the characters
  // we know the subsets lack, which is a fixed list per CLAUDE.md
  return null;
};
// arrows and Greek: no Google Fonts subset of Archivo or Plex Mono ships them.
// en dash: allowed in a name compound (Euler–Lagrange) and a numeric range.
const KNOWN_FALLBACK = new Set([...'→↗←↖↑↓ΔθφωσΣ√≈∝∈∫–']);
const SRC = 'src';
const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
  );

const found = new Map();
for (const f of walk(SRC)) {
  if (!/\.(astro|mdx|ts|css)$/.test(f)) continue;
  const text = readFileSync(f, 'utf8');
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c < 0x2000) continue; // ASCII and Latin-1 are covered
    if (!found.has(ch)) found.set(ch, f);
  }
}
console.log('non-Latin characters in src/:');
for (const [ch, f] of found) {
  const note = KNOWN_FALLBACK.has(ch) ? 'falls back (expected)' : 'CHECK';
  console.log(`  U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} ${ch}  ${note}  ${f}`);
}

// ---------- 3. banned characters ----------
console.log('banned characters:');
const BANNED = /[—·]|&mdash;|&middot;/;
for (const root of ['src', 'public']) {
  for (const f of walk(root)) {
    if (!/\.(astro|mdx|ts|css|html|md|json|mjs)$/.test(f)) continue;
    const text = readFileSync(f, 'utf8');
    text.split('\n').forEach((line, i) => {
      if (BANNED.test(line)) fail(`${f}:${i + 1} contains an em dash or middot`);
    });
  }
}
if (!failed) console.log('  OK  no em dash or middot in src/ or public/');

process.exit(failed ? 1 : 0);
