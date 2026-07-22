import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Every project is one .mdx file in src/content/projects/.
 * Files starting with "_" (like _template.mdx) are ignored.
 * The frontmatter below is the whole card/page interface;
 * see EDITING.md for what each field controls.
 */
const projects = defineCollection({
  loader: glob({ pattern: '[^_]*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(), // position on the home grid: 1 = first
    featured: z.boolean().default(false),
    summary: z.string(), // one sentence shown on the card
    telemetry: z.string(), // mono spec line, e.g. "DOF:4 | IK:FULL | MCU:ESP32"
    tags: z.array(z.string()),
    cover: z.string().optional(), // image path relative to public/images/
    github: z.string().url().optional(),
    // link to a writeup Benjamin authored (derivations, method, results).
    // When set it becomes the primary call to action on the project page,
    // ahead of the source link, because it is the original work.
    writeup: z.string().url().optional(),
  }),
});

export const collections = { projects };
