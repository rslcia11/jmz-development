# SEO plan — Phase 4 (master plan §53)

Scope: the nine items of §53 for the current one-page landing. Nothing else
(multi-page SEO is parked until after deploy, per owner).

Sources are official documentation only, consulted 2026-09-27.

## Current state (audit)

| §53 item | State | Note |
| --- | --- | --- |
| title | ✅ | "Desarrollo de software a medida en Ecuador \| JMZ Development" |
| description | ✅ | Specific, human-readable |
| canonical | ❌ | Missing; needs `site` in `astro.config.mjs` |
| Open Graph | ❌ | Missing; no share image exists |
| Twitter/X | ❌ | Missing |
| semantic HTML | ✅ | `lang="es"`, one `h1`, `h2` per section, `h3` per item, `main`, `nav`, `footer`, labelled sections |
| sitemap | ❌ | Missing |
| robots | ❌ | Missing |
| structured data | ❌ | Missing |

Found during the audit:

- **The favicon is Astro's default logo** (`public/favicon.svg`, `favicon.ico`),
  and the layout has no `<link rel="icon">`.
- **The footer GitHub link is broken**: `github.com/jmz-development` returns 404.

## Plan

### 1. `site` (prerequisite)

Set `site: "https://<domain>"` in `astro.config.mjs`. Astro uses it "to
generate your sitemap and canonical URLs in your final build".
([Astro config](https://docs.astro.build/en/reference/configuration-reference/))
**Needs the final domain from the owner.**

### 2. Canonical

Self-referencing, absolute, in `<head>`, built from `Astro.url` + `Astro.site`.
Google: "Use absolute paths rather than relative paths" and "Do include a
`rel="canonical"` link on the canonical page itself". Never a `#fragment`.
([Google — canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls))

### 3. Title and description

Keep the current ones; they follow Google's guidance (descriptive, brand at
the end with a delimiter, no keyword stuffing). No fixed length limit; Google
truncates to the device width.
([Title links](https://developers.google.com/search/docs/appearance/title-link),
[Snippets](https://developers.google.com/search/docs/appearance/snippet))

### 4. Open Graph

The four required properties plus the useful optional ones:
`og:title`, `og:type` (`website`), `og:image`, `og:url` (= canonical),
`og:description`, `og:site_name`, `og:locale` (`es_EC`),
`og:image:width`, `og:image:height`, `og:image:alt`. Absolute URLs.
([Open Graph protocol](https://ogp.me/))

Share image: **1200×630 PNG** designed from the brand (wordmark + hero system
graphic), in `public/`. Note: 1200×630 is the common convention; X's image
spec page could not be read (their docs return 402/404 to automated access),
so the X size limits are **not verified** here.

### 5. X (Twitter)

`twitter:card = summary_large_image`. Title, description and image fall back
to the Open Graph tags, so no duplicates. Only one card type per page; if
repeated, the last one wins.
([X — Cards markup](https://developer.x.com/en/docs/x-for-websites/cards/overview/markup))

### 6. Sitemap

Google: a site of about 500 pages or fewer that is well linked may not need
one, but a sitemap helps when "your site is new and has few external links to
it" — our case.
([Google — sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview))

Use the official `@astrojs/sitemap` integration (`npx astro add sitemap`):
generates `sitemap-index.xml` + `sitemap-0.xml`, and will cover the 404 and
future pages (§55, §58) without manual upkeep. Add
`<link rel="sitemap" href="/sitemap-index.xml">` to the head.
([Astro — sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/))

### 7. robots.txt

At the site root, UTF-8, one file, allowing everything, with the sitemap as a
fully qualified URL. Generated from `site` (`src/pages/robots.txt.ts`) so the
domain lives in one place. robots.txt does **not** hide pages from the index.
([Google — robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt))

### 8. Structured data (JSON-LD, home page only)

- `WebSite`: `name`, `url` — tells Google the site name.
  ([Site names](https://developers.google.com/search/docs/appearance/site-names))
- `Organization`: `name`, `url`, `logo` (≥112×112), `description`, `email`,
  `sameAs` (only profiles that exist). Can influence knowledge panel and logo.
  ([Organization](https://developers.google.com/search/docs/appearance/structured-data/organization))
- **Not** `LocalBusiness`: it requires a full postal `address`, which JMZ does
  not publish.
  ([LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business))

Structured data does not guarantee rich results. Validate with the Rich
Results Test after deploy.
([Intro](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data))

### 9. Favicon

Replace Astro's logo with a JMZ icon. Google Search supports "BMP, GIF, ICO,
PNG, JPEG, PPM, and TIFF" (not SVG), square, recommended "larger than
48x48px", declared on the home page with `<link rel="icon">`. Keep an SVG for
browsers plus an ICO/PNG for Google, and an `apple-touch-icon` (180×180).
([Google — favicon](https://developers.google.com/search/docs/appearance/favicon-in-search))

## After deploy (phase 7, not now)

Verify the domain in Google Search Console, submit the sitemap, run the Rich
Results Test, and check the share preview.

## Owner decisions (2026-09-27)

1. **Domain: not bought yet.** `site` lives in one place (`astro.config.mjs`)
   with a placeholder; it **must** be set to the real domain before deploy
   (phase 7), otherwise canonical, og:url, sitemap and robots point to the
   wrong host.
2. **GitHub: `github.com/rslcia11`** for the footer link and `sameAs`.
3. **`@astrojs/sitemap`: approved.**
