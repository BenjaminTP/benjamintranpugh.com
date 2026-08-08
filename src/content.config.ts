import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Every project is one .mdx file in src/content/projects/.
 * Files starting with "_" (like _template.mdx) are ignored.
 * The frontmatter below is the whole sheet interface;
 * see EDITING.md for what each field controls.
 */
const projects = defineCollection({
  loader: glob({ pattern: '[^_]*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(), // sheet position: lowest = newest = sheet 01
    short: z.string().max(12), // bookmark tab label
    summary: z.string(), // one sentence, used for the meta description
    telemetry: z.string(), // spec string; splits on " | " for hero callouts
    tags: z.array(z.string()), // TOOLS chips; a trailing date entry becomes the sheet date
    cover: z.string(), // hero media, relative to public/images/
    heroLabel: z.string(), // caption bar under the hero
    heroPoster: z.string().optional(), // must not duplicate a figure
    // Which body figures appear on the index sheet, in the order given. A
    // drawing carries the hero plus at most two others; more than that and the
    // field turns to clutter. Omit for a project whose body already has two.
    indexFigures: z.array(z.string()).max(2).optional(),
    github: z.string().url().optional(),
    writeup: z.string().url().optional(),
    related: z
      .object({ href: z.string(), label: z.string() })
      .optional(), // a hand-picked sibling sheet
  }),
});

export const collections = { projects };
