# SOLUTION.md: architecture and approach

## 1. Goal
Reproduce audiobookspeedcalculator.org exactly (pages, content, look, calculators) as a custom Astro site with no WordPress or Elementor dependency, hosted on Vercel. Rankings must not drop, so URLs, titles, meta, schema and the sitemap URLs stay the same.

## 2. Findings about the current site
- WordPress 7.0 + Hello Elementor theme + Elementor / Elementor Pro 4.2, **Yoast SEO** (titles, meta, sitemaps) and **Schema Pro** (JSON-LD).
- Other plugins: Site Kit (Google tag `GT-TWQZ6LTG`), Ad Inserter (installed but outputs no ads), ACF, AI Engine, ElementsKit Lite, Essential Addons, LiteSpeed Cache, WP File Manager, Classic Editor.
- Yoast sitemap index `sitemap_index.xml` → `post-sitemap.xml` (11), `page-sitemap.xml` (8), `author-sitemap.xml` (1). robots.txt allows everything.
- 8 pages, 11 posts, 1 author archive (`/author/sarah-thelistener/`), custom 404. 4 categories (no category archives are linked).
- Every blog post is **one Elementor HTML widget** with its own `<style>` and FAQ script, in two designs:
  - **libby** (7 posts): breadcrumb, cyan tag, answer box, cluster links at the end.
  - **guide** (4 posts): "Direct Answer" boxes, callouts, CTA box.
- Static pages use native Elementor widgets (headings, icon boxes, counters, nested accordion, loop grid, table of contents) plus HTML widgets holding the calculators.

## 3. Stack decision: Astro
Content site with a few interactive calculators. Astro ships no JS by default, gives full control of `<head>`, supports trailing-slash URLs and builds to static files Vercel serves directly.

- Static output, `trailingSlash: 'always'`, `build.format: 'directory'` so URLs match WordPress.
- Dev server on **port 4322** (4321 is used by another local project).
- Blog posts in a Markdown **content collection** (`src/content/blog/*.md`). Adding a post = adding a `.md` file.
- No framework islands: the calculators are the original vanilla JS; Elementor's JS is replaced by `src/scripts/elementor.ts`.

## 4. Design parity strategy (1:1 copy)
1. Download the rendered HTML of every URL and all Elementor/Hello CSS.
2. **Keep Elementor's markup and CSS** instead of re-creating the design. Strip only WordPress noise (data attributes, srcset, comments), rewrite URLs to local ones.
3. CSS split: shared bundle in the original load order (`src/styles/global.css`) + per-page Elementor CSS imported by each page. Safe because Elementor page CSS uses page-unique selectors.
4. Dropped unused CSS: Dashicons, ElementsKit widgets, Essential Addons, WP block library. Kept the ElementsKit icon font (used by 3 pages).
5. Each migrated post keeps its exact original CSS (`src/styles/posts/<slug>.css`); new posts use `_libby.css` / `_guide.css`.
6. Verified with pixel diffs against the live site (see section 8).

## 5. SEO parity strategy
- Titles, meta descriptions, canonicals, Open Graph, Twitter labels and robots copied from the Yoast output.
- Schema Pro JSON-LD copied verbatim per page (HowTo, SoftwareApplication, WebPage, FAQPage). Posts generate `Article` from frontmatter (same fields as Schema Pro, with `@type` capitalisation fixed).
- Sitemap: `@astrojs/sitemap` → `/sitemap-index.xml`. The old Yoast sitemap URLs redirect there.
- `vercel.json` redirects: front-page slug, feeds, category/tag archives, extra author pages, pagination, every old `/wp-content/uploads/...` image URL (to the WebP copies), old sitemap URLs.
- Demo domain protection: `X-Robots-Tag: noindex, nofollow` only on `*.vercel.app` hosts, so the demo never competes with the live site.

## 6. Feature inventory and mapping
| Feature | Implementation |
|---|---|
| Home calculator (h/m/s steppers, 0.5–5x slider, presets, reset, time saved) | original inline JS, unchanged |
| Libby calculator (deadline and speed panels) | original inline JS, unchanged |
| Audiobook Lengths searchable table (65 books) | original inline JS, unchanged |
| Speed Chart table | original inline JS, unchanged |
| Mega menu (hover on desktop, drawer below 1025px, full-width dropdown) | `elementor.ts` (replaces Elementor Pro n-menu JS) |
| Nested accordion (one item open) | native `<details>` + `elementor.ts` |
| Counters (Speed Chart, Audiobook Lengths) | `elementor.ts`, IntersectionObserver + swing easing |
| Table of contents (Privacy, Terms) | generated at build time, sticky with CSS |
| Latest posts grid (home 6, blog all) | `PostGrid.astro` from the collection |
| Author archive | `src/pages/author/[author].astro` from the collection |
| Post FAQ toggles (2 variants) | inline scripts in `PostLayout.astro`, as authored |
| Google tag | plain gtag.js snippet, same ID |
| Contact Us page + header button | new (not on the live site), sample details |

## 7. Structure
```
Audiobook-Speed-Calculator/
  README.md  SOLUTION.md  RALPH.md
  astro.config.mjs  vercel.json  package.json  tsconfig.json
  public/        images/ (WebP), fonts/elementskit.woff, ads.txt, robots.txt
  src/
    content.config.ts          blog collection schema
    content/blog/*.md          11 posts
    data/site.ts               site name, Google tag ID, authors
    layouts/                   BaseLayout.astro (head), PostLayout.astro
    components/                Header.astro, Footer.astro, PostGrid.astro
    pages/                     index, speed-chart, audiobook-lengths, libby-speed-calculator,
                               about-us, blog, contact-us, privacy-policy, terms-condition,
                               404, [slug], author/[author]
    scripts/elementor.ts       mega menu, accordion, counters
    styles/                    global.css, site.css, elementor/*.css, posts/*.css
```

## 8. Verification
- Pixel diff (Playwright + Chrome, full page, 1440px and 390px) of all 20 URLs against the live site: 0.00–0.24% difference (anti-aliasing) on every page except the intended changes in section 10.
- Functional checks: home calculator (8:30:00 at 1.5x = 5:40:00), Libby calculator identical to live, lengths search, counters, accordion, both FAQ variants, mega menu (desktop hover, mobile drawer and submenu). No JS errors.
- SEO check: title, canonical, H1 count and schema types equal to live on all pages.
- Link check: no broken internal links; external links checked (Google Play returns 403 to bots only).

## 9. Deployment
- Vercel project `audiobook-speed-calculator` (account yasinzia01-ops), deployed with the Vercel CLI: https://audiobook-speed-calculator.vercel.app
- GitHub is **not yet connected** to Vercel (Vercel GitHub app missing), so pushes do not deploy automatically.
- Domain cutover later: needs a paid host decision first (ads are commercial use: Vercel Pro or Cloudflare Pages). When the domain moves, the noindex rule stops applying automatically.

## 10. Decisions log
- Exact copy of the Elementor design; no redesign.
- Content editing: Markdown files edited directly and pushed to GitHub (no CMS).
- AI Engine chatbot dropped.
- WordPress stays untouched and live; the Astro site is a separate demo until cutover.
- Images converted to WebP (~17 MB → ~1.4 MB) with 768px copies for cards.
- Meta descriptions: live Yoast values kept; the 6 posts with none get the description drafted in their own notes.
- Blog page lists all posts (was 6); author page lists all posts with descriptions instead of WordPress auto-excerpts.
- "How Long Can You Keep a Libby Audiobook?": the live page prints stray `═══… -->` text from a broken HTML comment; not copied, and the post's negative offset removed so it sits like the other posts.
- Mega menu: 6 items with matching pages were linked; items without pages stay plain text as on live. Resources > Contact Us fixed (`/contact` was a 404).
- Dead Audible help link replaced with the current "Set narration speed" article.
