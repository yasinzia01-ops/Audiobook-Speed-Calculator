# Audiobook Speed Calculator

Astro version of [audiobookspeedcalculator.org](https://audiobookspeedcalculator.org), migrated from WordPress + Elementor. The design is a 1:1 copy: the Elementor CSS and markup are kept, and the Elementor JavaScript is replaced by a small script.

## Run it

```bash
npm install
npm run dev       # http://localhost:4322
npm run build     # static site in dist/
npm run preview   # serve dist/
```

## Add or edit a blog post

Posts are Markdown files in `src/content/blog/`. The file name is the URL: `my-post.md` becomes `/my-post/`.

1. Copy an existing post of the same style:
   - **`design: libby`**: Libby cluster posts (breadcrumb, cyan tag, answer box, cluster links at the end).
   - **`design: guide`**: general guides (Direct Answer boxes, callouts, CTA box).
2. Edit the frontmatter (title, description, dates, category, image) and write the body in Markdown.
3. Styled boxes are plain HTML inside the Markdown. Keep each box on consecutive lines, with no blank line inside it:

   ```html
   <div class="answer-box"><p><strong>Quick Answer:</strong> …</p></div>
   <div class="tip-box"><p><strong>Tip:</strong> …</p></div>
   ```

   To see the other components (tables, FAQ, cluster nav, callouts, CTA), look at the existing posts.
4. Put the featured image in `public/images/` as WebP, 1424×752, plus a `-768.webp` copy for the cards. Example: `my-image.webp` and `my-image-768.webp`.
5. Commit and push. Vercel rebuilds automatically. The post appears on the home page, the blog page, the author page and the sitemap.

New posts use `src/styles/posts/_libby.css` or `_guide.css`. The migrated posts keep their original per-post CSS in `src/styles/posts/<slug>.css`.

## Where things are

| Path | What |
|---|---|
| `src/pages/*.astro` | Static pages (home calculator, speed chart, lengths, Libby calculator, about, legal, blog, 404) |
| `src/pages/[slug].astro`, `src/layouts/PostLayout.astro` | Blog post pages |
| `src/pages/author/[author].astro` | Author archive |
| `src/components/Header.astro`, `Footer.astro` | Site header (mega menu) and footer |
| `src/components/PostGrid.astro` | "Latest posts" cards (home + blog) |
| `src/layouts/BaseLayout.astro` | `<head>`: SEO meta, Open Graph, schema, fonts, Google tag |
| `src/scripts/elementor.ts` | Mega menu, accordions, counters (replaces Elementor JS) |
| `src/styles/elementor/` | Original Elementor CSS |
| `src/data/site.ts` | Site name, Google tag ID, authors |
| `public/` | Images, icon font, `ads.txt`, `robots.txt` |
| `vercel.json` | Redirects for old WordPress URLs and cache headers |
