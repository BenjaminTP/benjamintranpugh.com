import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
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
});
