import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import { renderResume } from './scripts/render-resume.mjs';

// Renders public/resume.pdf to page images before every dev start and build,
// so the /resume preview always matches the current PDF with no manual step.
function resumePreview() {
  return {
    name: 'resume-preview',
    hooks: {
      'astro:config:setup': async () => {
        await renderResume();
      },
    },
  };
}

export default defineConfig({
  site: 'https://benjamintranpugh.com',
  integrations: [mdx(), sitemap(), resumePreview()],
  // Code blocks are styled from tokens.css in global.css. Shiki's own theme
  // would inject a second palette, so highlighting stays off site-wide.
  //
  // Math: write $inline$ or $$display$$ LaTeX in any .mdx. MathJax renders it
  // to inline SVG at build time, so there is no runtime script, no stylesheet,
  // and no webfont to load — which keeps the self-hosted-fonts rule intact.
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeMathjax],
  },
});
