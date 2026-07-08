// Renders public/resume.pdf to page images (public/resume-page-N.png).
// Wired into the Astro build (see astro.config.mjs) so it runs automatically
// on every dev start and every deploy. Drop a new resume.pdf into public/,
// push, and the preview on /resume updates itself. No manual conversion.
//
// Can also be run by hand:  node scripts/render-resume.mjs
import { pdf } from 'pdf-to-img';
import { existsSync, readdirSync, unlinkSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PUB = path.join(process.cwd(), 'public');
const SRC = path.join(PUB, 'resume.pdf');
const PAGE_RX = /^resume-page-\d+\.png$/;

function existingPages() {
  return existsSync(PUB) ? readdirSync(PUB).filter((f) => PAGE_RX.test(f)) : [];
}

export async function renderResume() {
  const existing = existingPages();

  // no source PDF: clear any stale previews and bail
  if (!existsSync(SRC)) {
    existing.forEach((f) => unlinkSync(path.join(PUB, f)));
    return;
  }

  // skip if every preview is already at least as new as the PDF
  if (existing.length) {
    const pdfMtime = statSync(SRC).mtimeMs;
    const fresh = existing.every((f) => statSync(path.join(PUB, f)).mtimeMs >= pdfMtime);
    if (fresh) return;
  }

  existing.forEach((f) => unlinkSync(path.join(PUB, f)));

  const doc = await pdf(SRC, { scale: 2.5 });
  let n = 0;
  for await (const page of doc) {
    n += 1;
    writeFileSync(path.join(PUB, `resume-page-${n}.png`), page);
  }
  console.log(`[resume] rendered ${n} page(s) from resume.pdf`);
}

// run directly: node scripts/render-resume.mjs
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  renderResume();
}
