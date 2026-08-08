/**
 * Reads a project's MDX body and returns what the index sheet needs:
 * the figure list, each figure's passage of prose, and the general notes.
 *
 * The rule for pairing a figure with its prose (see CLAUDE.md):
 *   - a floated figure (align="left"|"right") explains the paragraph AFTER it,
 *     because that is the text the float sits beside;
 *   - a full-width figure explains the paragraph ABOVE it.
 * Either way the search stops at a heading, so a figure never borrows prose
 * from another section. If a pairing looks wrong, move the <Figure> tag in
 * the MDX. Prose is never duplicated into frontmatter.
 */
import type { CollectionEntry } from 'astro:content';

export interface Figure {
  src: string;
  caption: string;
  isVideo: boolean;
  passage: Passage | null;
}
export interface Passage {
  kind: 'p' | 'ul';
  items: string[];
}
type Block = { kind: 'h' | 'p' | 'ul' | 'fig' | 'set' | 'other'; text: string };

const VIDEO = ['.mp4', '.webm', '.mov'];
export const isVideo = (s: string) => VIDEO.some((e) => s.toLowerCase().endsWith(e));

const FIGURE_TAG = /<Figure\s[^>]*?\/>/g;
const ATTR = /(\w+)="([^"]*)"/g;

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(ATTR)) out[m[1]] = m[2];
  return out;
}

/** Strip markdown/MDX inline syntax so a paragraph can render as plain text. */
function plain(s: string): string {
  return s
    .replace(/\$\$?([^$]+)\$\$?/g, '$1')       // math delimiters, keep the content
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // links keep their text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\\([_{}])/g, '$1')
    .split(/\s+/)
    .join(' ')
    .trim();
}

/** Split the body into ordered blocks. Consecutive <Compare> blocks merge into one set. */
function blocks(body: string): Block[] {
  const out: Block[] = [];
  for (const raw of body.split(/\n\s*\n/)) {
    const b = raw.trim();
    if (!b) continue;
    let kind: Block['kind'];
    if (b.startsWith('#')) kind = 'h';
    else if (b.startsWith('<Figure')) kind = 'fig';
    else if (b.startsWith('<Compare')) kind = 'set';
    else if (b.startsWith('<')) kind = 'other';
    else if (b.startsWith('- ')) kind = 'ul';
    else if (b.startsWith('$$') || b.startsWith('```') || b.startsWith('|')) kind = 'other';
    else kind = 'p';

    // a run of adjacent <Compare> blocks is one set sharing one passage
    const prev = out[out.length - 1];
    if (kind === 'set' && prev?.kind === 'set') prev.text += '\n' + b;
    else out.push({ kind, text: b });
  }
  return out;
}

/** Nearest prose block on one side, stopping at a heading. */
function scan(bl: Block[], from: number, step: -1 | 1): Passage | null {
  for (let i = from; i >= 0 && i < bl.length; i += step) {
    const b = bl[i];
    if (b.kind === 'h') return null;
    if (b.kind === 'p') return { kind: 'p', items: [plain(b.text)] };
    if (b.kind === 'ul')
      return { kind: 'ul', items: b.text.split('\n').map((l) => plain(l.replace(/^-\s*/, ''))) };
  }
  return null;
}

function passageFor(bl: Block[], i: number, floated: boolean): Passage | null {
  const ahead = () => scan(bl, i + 1, 1);
  const behind = () => scan(bl, i - 1, -1);
  const first = floated ? ahead() : behind();
  if (first) {
    // a bare lead-in ("...moving:") carries no information on its own;
    // reach one further back for the paragraph that actually explains the set
    if (first.kind === 'p' && first.items[0].endsWith(':') && !floated) {
      const more = scan(bl, i - 2, -1);
      if (more?.kind === 'p') return { kind: 'p', items: [more.items[0], first.items[0]] };
    }
    return first;
  }
  return floated ? behind() : ahead();
}

/** How many non-hero figures a single index sheet may carry. */
export const MAX_INDEX_FIGURES = 2;

/**
 * The figures the index sheet shows for a project, in display order.
 *
 * A drawing carries the hero plus at most two others. `indexFigures` in the
 * frontmatter picks which ones and in what order, which need not match body
 * order: a project may want its result first and its method second. Without
 * that field the first two body figures are used. The project page is not
 * affected; it always renders every figure in the body.
 */
export function figuresOf(project: CollectionEntry<'projects'>): Figure[] {
  const bl = blocks(project.body ?? '');
  const all: Figure[] = [];
  bl.forEach((b, i) => {
    if (b.kind !== 'fig' && b.kind !== 'set') return;
    const tags = b.text.match(FIGURE_TAG) ?? [];
    // a set shares one passage; a lone figure uses its own alignment
    const floated = b.kind === 'fig' && ['left', 'right'].includes(attrs(tags[0] ?? '').align);
    const passage = passageFor(bl, i, floated);
    for (const t of tags) {
      const a = attrs(t);
      if (!a.src) continue;
      all.push({ src: a.src, caption: a.caption ?? '', isVideo: isVideo(a.src), passage });
    }
  });

  const picked = project.data.indexFigures;
  if (!picked?.length) return all.slice(0, MAX_INDEX_FIGURES);
  return picked.map((src) => {
    const f = all.find((x) => x.src === src);
    if (!f) throw new Error(`${project.id}: indexFigures lists "${src}", which is not a <Figure> in the body`);
    return f;
  });
}

/**
 * General notes: the intro prose, before any figure or second heading.
 * One note per paragraph; a single paragraph splits into its sentences so the
 * block reads as a numbered list. Wording is never altered.
 */
export function notesOf(project: CollectionEntry<'projects'>): string[] {
  const bl = blocks(project.body ?? '');
  const paras: string[] = [];
  let seenHeading = 0;
  for (const b of bl) {
    if (b.kind === 'h') {
      if (++seenHeading > 1) break;
      continue;
    }
    if (b.kind === 'fig' || b.kind === 'set') break;
    if (b.kind === 'p') paras.push(plain(b.text));
  }

  let notes = paras;
  if (paras.length === 1) {
    const sentences = paras[0].match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? paras;
    notes =
      sentences.length <= 3
        ? sentences
        : [...sentences.slice(0, 2), sentences.slice(2).join(' ')];
  }

  // A one-line notes block reads like a mistake on a drawing. When the intro is
  // that short, close with the project's own last paragraph, which is always
  // the outcome, so the block states what it is and how it ended.
  if (notes.length < 2) {
    const last = [...bl].reverse().find((b) => b.kind === 'p');
    const tail = last && plain(last.text);
    if (tail && !notes.includes(tail)) notes = [...notes, tail];
  }
  return notes;
}

/** Sheet identity derived from position: lowest order is sheet 01. */
export function sheetOf(index: number, total: number) {
  const nn = String(index + 1).padStart(2, '0');
  return {
    code: `BTP-${nn}`,
    sheet: `${nn} / ${String(total).padStart(2, '0')}`,
    stamp: `SHEET ${nn}`,
    n: nn,
  };
}

/** tags carry the tools plus a trailing date entry; split them apart. */
const DATE_TAG = /^[A-Z][a-z]{2}(-[A-Z][a-z]{2})?\s+\d{4}$/;
export function toolsAndDate(tags: string[]) {
  const date = tags.find((t) => DATE_TAG.test(t));
  return { tools: tags.filter((t) => t !== date), date: (date ?? '').toUpperCase() };
}
