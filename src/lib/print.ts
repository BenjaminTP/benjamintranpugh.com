/**
 * What both print editions put on paper. There are two of them, the drawing
 * set (/portfolio-pdf/) and the plain one that pairs with the resume
 * (/portfolio-classic/), and they must never disagree about which projects
 * ship or what those projects say, so the whole selection lives here.
 *
 * scripts/render-portfolio.mjs prints both routes and builds the images.
 */
import { getCollection } from 'astro:content';
import { briefOf, figuresOf, sheetOf, toolsAndDate } from './sheet';

export const SITE = 'benjamintranpugh.com';

/** Projects the print editions leave out. The site still carries them. */
const OMIT = new Set(['nordic-bench', 'robot-arm-1']);

/**
 * Images come from the print copies in public/print: a video cannot play on
 * paper, the originals embed at a size job boards reject, and the copies have
 * the black and white borders baked into the sources trimmed off.
 */
export const printed = (src: string) => `/print/${src.replace(/\.[^.]+$/, '.jpg')}`;

export async function printProjects() {
  const all = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  const shown = all.filter((p) => !OMIT.has(p.id));

  return shown.map((p, i) => {
    const { tools, date } = toolsAndDate(p.data.tags);
    return {
      d: p.data,
      // the drawing number is the project's identity and matches the site; the
      // sheet number is only its position in this document, which is a subset
      code: sheetOf(all.indexOf(p), all.length).code,
      ...sheetOf(i, shown.length),
      tools,
      date,
      figs: figuresOf(p),
      brief: briefOf(p),
      hero: printed(p.data.heroPoster ?? p.data.cover),
      path: `/projects/${p.id}/`,
    };
  });
}
