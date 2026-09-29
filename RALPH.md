# RALPH.md: build loop and task checklist

**Review gate**: stop after every phase and wait for the user to approve before starting the next.

**Loop**: the rules for the autonomous loop are in `ralphloop.md`. Run the agent with `PROMPT.md` repeatedly until `RALPH.md` contains the word LOOP_COMPLETE on its own line (or the loop stops at a review gate):

```bash
until grep -qx "LOOP_COMPLETE" RALPH.md; do claude -p "$(cat PROMPT.md)"; done
```

PowerShell:

```powershell
while (-not (Select-String -Path RALPH.md -Pattern '^LOOP_COMPLETE$' -Quiet)) { claude -p (Get-Content PROMPT.md -Raw) }
```

You can also run one iteration at a time in VS Code by pasting `PROMPT.md`. Each task has a verify step, so progress is checked, not assumed. Tasks marked **(human)** are for the owner; the loop never does them. LOOP_COMPLETE is written only when every non-human task is ticked.

## Phase 0: Setup
- [x] 0.1 Clone `yasinzia01-ops/Audiobook-Speed-Calculator`, install Astro 7 + `@astrojs/sitemap`, set `site`, `trailingSlash: 'always'`, `format: 'directory'`. Verify: `npm run build` passes.
- [x] 0.2 `.gitignore`, `tsconfig.json` (strict), npm scripts, dev server on :4322. Verify: `npm run dev` serves on http://localhost:4322.

## Phase 1: Capture the source
- [x] 1.1 Download rendered HTML of all 20 URLs from the Yoast sitemaps + 404. Record title, description, canonical, OG, Twitter, JSON-LD per page. Verify: 21 snapshots.
- [x] 1.2 Download all 63 stylesheets; drop the unused ones (Dashicons, ElementsKit widgets, Essential Addons, block library). Verify: every class used in the markup has its CSS.
- [x] 1.3 Download images (16 originals) and convert to WebP + 768px copies. Verify: no image 404 in the link check.
- [x] 1.4 Inventory every interactive feature (SOLUTION.md section 6).

## Phase 2: Foundations
- [x] 2.1 `global.css` in the original Elementor load order + `site.css` for JS replacements.
- [x] 2.2 `BaseLayout.astro`: head from Yoast data, JSON-LD, favicons, fonts, Google tag. Verify: title and schema equal the source for `/`.
- [x] 2.3 Header (mega menu) and Footer from Elementor templates 14 and 15. Verify: desktop hover, mobile drawer, submenu.

## Phase 3: Pages
- [x] 3.1 `/` home calculator page with the latest posts grid.
- [x] 3.2 `/speed-chart/`, `/audiobook-lengths/`, `/libby-speed-calculator/`
- [x] 3.3 `/about-us/`, `/privacy-policy/`, `/terms-condition/` (TOC generated at build time)
- [x] 3.4 Blog: content collection, 11 posts in two designs, `/blog/`, `/author/sarah-thelistener/`. Verify: post URLs identical to production.
- [x] 3.5 404 page.
- [x] 3.6 `/contact-us/` (new, sample details) and header Contact Us button.

## Phase 4: Functionality
- [x] 4.1 Mega menu, nested accordion and counters in `elementor.ts`.
- [x] 4.2 Calculators and lengths search (original inline JS). Verify: 8:30:00 at 1.5x = 5:40:00; lengths search filters; Libby calculator matches live.
- [x] 4.3 Post FAQ toggles for both designs.
- [ ] 4.4 Commit an automated Playwright test suite (`tests/`); the checks so far were run from a scratch script.

## Phase 5: SEO and delivery
- [x] 5.1 Sitemap (`/sitemap-index.xml`), `robots.txt`, `ads.txt`.
- [x] 5.2 SEO parity check on all pages. Verify: title, canonical, H1 count, schema types equal to live.
- [x] 5.3 Internal link check. Verify: no broken internal links. (No redirects from WordPress URLs, by owner decision; `vercel.json` has none.)
- [x] 5.4 Visual review against the live site. Verify: pixel diff 0.00–0.24% at 1440px and 390px.
- [x] 5.5 Deploy the demo to Vercel with noindex on `*.vercel.app`.
- [ ] 5.6 Lighthouse pass (performance, accessibility, SEO >= 90 on mobile).
- [ ] 5.7 **(human)** Connect GitHub to Vercel so pushes deploy automatically.
- [ ] 5.8 **(human)** Replace the sample contact details with real ones (`src/pages/contact-us.astro`).
- [ ] 5.9 **(human)** Domain cutover (after the hosting decision), then submit `/sitemap-index.xml` in Search Console.

## Blockers
- 5.7: Vercel could not connect the GitHub repo (Vercel GitHub app not installed on the account). User action: Vercel project → Settings → Git → Connect Git Repository.
- 5.9: needs the hosting decision. Ads are commercial use, so Vercel Pro (about $20/month) or Cloudflare Pages (free). The demo runs on the free plan with no ads.
- Mega menu items with no page yet (Audible, Spotify, Scribd, Overdrive, Hoopla, Apple Books, Android, Browser/Desktop calculators, two duplicate "Overdrive Calculator" entries): kept as plain text like the live site. Needs a decision: build the pages or remove the items.

## Progress log
- 2026-09-28 Phase 0-3 done: all 20 URLs rebuilt from Elementor markup + CSS; posts converted to Markdown; images to WebP.
- 2026-09-28 The live site was edited mid-build (blog card design changed); everything was re-downloaded fresh and reconverted.
- 2026-09-28 Phase 4-5 verified: pixel diffs 0.00–0.24%, functional checks pass, SEO parity equal, no JS errors. Pushed to GitHub, deployed to https://audiobook-speed-calculator.vercel.app with noindex.
- 2026-09-28 Contact Us page + header button added; `/contact` 404 fixed; 6 menu items linked; dead Audible link replaced. Deployed.
- 2026-09-29 Wrote SOLUTION.md and RALPH.md.
- 2026-09-29 Owner decision: no redirects from WordPress URLs. Removed all 67 redirects from `vercel.json` (old sitemap, image, feed, category, pagination and front-page-slug URLs now 404). Added `ralphloop.md` and `PROMPT.md`.
