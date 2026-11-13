# rokomaridiscountcode — Jekyll on GitHub Pages

This repository contains the static Jekyll conversion of the supplied PHP website.

## Deployment

1. Create a repository named **rokomaridiscountcode.github.io** under the GitHub account or organization that owns the `rokomaridiscountcode.github.io` address.
2. Upload the contents of this folder to the repository root and push to `main`.
3. In **Settings → Pages**, select **GitHub Actions** as the build and deployment source. The included workflow builds and deploys the site.
4. After deployment, check `https://rokomaridiscountcode.github.io/`, `/sitemap.xml` and `/robots.txt`.

## Notes

- GitHub Pages serves static HTML; PHP has been replaced with generated HTML pages and JavaScript.
- Product paths are preserved as directory URLs ending in `/`.
- Affiliate tracking parameters have been updated to `?affId=9A0ROR69O010Ai5&affs=72819&cma=604800`.
- Product prices and availability can change. Verify them on Rokomari before ordering.
- The supplied `rokomaridiscountcode.github.io` address is a GitHub Pages hostname, not a separately registered custom domain. No `CNAME` file is included.
- The original Google verification HTML file and site images/assets are retained.

## Navigation, category sliders and SEO updates

- The header uses a compact Categories dropdown on desktop and a two-column category panel on mobile.
- Homepage category rails show seven product cards followed by a See more card. Use the arrows to move by four cards on desktop (two on mobile).
- Coupon codes copied from the supplied PHP include are marked as unverified; check their current validity on Rokomari before using them.
- Product pages include product-name-aware buying guidance, visible FAQs, Product/Breadcrumb structured data, FAQPage structured data and canonical URLs.
- Category pages include category-specific buying guidance, category cross-links, FAQs and FAQPage structured data.
- No original video files or YouTube URLs were present in the supplied archive. The homepage therefore contains a written bilingual coupon-use guide rather than fabricated video embeds.
- Google indexing is not guaranteed by metadata or internal links alone. Keep product details accurate and useful, monitor Search Console, and avoid publishing thin or duplicate pages.

- Homepage product rails choose 11 products from each category feed using a deterministic local date/hour seed, then append a See more card. The selected products remain stable for the current hour and refresh at the next local hour without requiring a page reload.
- Product rails show four cards on desktop, three on medium screens and two on phones; arrow controls advance by the visible card count.

## SEO permalink migration

- Product pages now use `/products/<category>/<descriptive-product-slug>/` paths.
- The product database, search index, category feeds, internal links, canonical tags, Product schema, Breadcrumb schema and sitemap point to the new paths.
- Previous `/Product/.../` paths are retained as noindex HTML redirect pages pointing to the new canonical URL. GitHub Pages does not provide server-side 301 redirects for these static paths.
- Coupon buttons copy the coupon text and then navigate to the configured Rokomari affiliate landing URL.
- Product detail scripts are deferred, product images use asynchronous decoding and the primary product image is prioritized; supporting images are lazy-loaded.
