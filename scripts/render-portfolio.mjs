// Prints both portfolio PDFs, for Waterloo Works and anywhere else that wants
// a file: the drawing set, and the plain edition that pairs with the resume.
//
//   node scripts/render-portfolio.mjs
//
// Two steps, both needed before the print:
//   1. ffmpeg builds a print copy of every image in public/images, as
//      public/print/<slug>/<name>.jpg. Video gets a still frame, because a PDF
//      cannot play one, and everything is scaled to the width the sheet
//      actually uses. Embedding the originals gives an 11 MB file that job
//      boards reject; these bring it under 3 MB with no visible loss at print
//      size.
//   2. headless Edge loads the page off a local dev server and prints it.
// public/print is generated, gitignored, and rebuilt whenever a source is newer.
import { execFile, execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const IMAGES = path.join(process.cwd(), 'public', 'images');
const PRINT = path.join(process.cwd(), 'public', 'print');
const ORIGIN = 'http://localhost:4321';
const EDITIONS = [
  ['/portfolio-pdf/', 'portfolio.pdf'],            // the drawing set
  ['/portfolio-classic/', 'portfolio-classic.pdf'], // plain, pairs with the resume
];

const SOURCE = /\.(png|jpe?g|mp4)$/i;
const MAX_W = 1200; // the hero well is 685px wide, so this still has margin

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);

/**
 * The box the real picture sits in, so a sheet never frames a border instead
 * of a photograph. Video is padded to its canvas with black; a CAD render or a
 * plot is padded with white, so that one is probed inverted. A result that
 * throws away most of the frame is treated as a misread and ignored.
 */
function contentBox(src, video) {
  const probe = spawnSync(
    'ffmpeg',
    [
      ...(video ? ['-ss', '1'] : []),
      '-i', src,
      '-vf', `${video ? '' : 'negate,'}cropdetect=24:2:0`,
      '-frames:v', video ? '4' : '1',
      '-f', 'null', '-',
    ],
    { encoding: 'utf8' }
  );
  const found = [...(probe.stderr ?? '').matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)].pop();
  const size = (probe.stderr ?? '').match(/, (\d+)x(\d+)[ ,]/);
  if (!found || !size) return null;
  const [w, h] = [+found[1], +found[2]];
  if (w < +size[1] * 0.25 || h < +size[2] * 0.25) return null;
  return `crop=${found[1]}:${found[2]}:${found[3]}:${found[4]},`;
}

function printAssets() {
  let n = 0;
  for (const dir of readdirSync(IMAGES)) {
    const from = path.join(IMAGES, dir);
    if (!statSync(from).isDirectory()) continue;
    const to = path.join(PRINT, dir);

    for (const f of readdirSync(from).filter((f) => SOURCE.test(f))) {
      const src = path.join(from, f);
      const jpg = path.join(to, f.replace(/\.[^.]+$/, '.jpg'));
      if (existsSync(jpg) && statSync(jpg).mtimeMs >= statSync(src).mtimeMs) continue;
      mkdirSync(to, { recursive: true });
      const video = f.endsWith('.mp4');
      const trim = contentBox(src, video) ?? '';
      execFileSync(
        'ffmpeg',
        [
          '-y',
          // a frame a second in, past any fade-up on a video's first frame
          ...(video ? ['-ss', '1'] : []),
          '-i', src,
          '-frames:v', '1',
          '-vf', `${trim}scale='min(${MAX_W},iw)':-2`,
          '-q:v', '4',
          jpg,
        ],
        { stdio: 'ignore' }
      );
      n++;
    }
  }
  console.log(`[portfolio] ${n} print image(s) built`);
}

async function serve() {
  // astro's own entry, not the npm shim: a .cmd needs a shell on Windows and
  // then kill() would only reach the shell, leaving the port held
  const dev = spawn(process.execPath, ['node_modules/astro/astro.js', 'dev', '--port', '4321'], {
    stdio: 'ignore',
  });
  // a cold start that re-optimizes dependencies can take 20s or more
  for (let i = 0; i < 160; i++) {
    try {
      if ((await fetch(ORIGIN + EDITIONS[0][0])).ok) return dev;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  dev.kill();
  throw new Error('dev server never answered on 4321');
}

if (!EDGE) throw new Error('no Edge or Chrome found to print with');
printAssets();
const dev = await serve();
try {
  for (const [route, file] of EDITIONS) {
    const out = path.join(process.cwd(), 'public', file);
    await run(EDGE, [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=20000',
      `--print-to-pdf=${out}`,
      ORIGIN + route,
    ]);
    const mb = (statSync(out).size / 1e6).toFixed(1);
    console.log(`[portfolio] wrote public/${file} (${mb} MB)`);
  }
} finally {
  dev.kill();
}
