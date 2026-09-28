// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://audiobookspeedcalculator.org',
  // WordPress URLs all end in a slash; keep them identical.
  trailingSlash: 'always',
  // 4321 is used by another local project.
  server: { port: 4322 },
  build: {
    format: 'directory',
    // Page CSS is small; inlining avoids extra render-blocking requests.
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
