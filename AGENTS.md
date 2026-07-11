# Codex Project Standards

These instructions apply to every file and feature in this repository. Treat SEO, accessibility, and page performance as acceptance criteria, not optional cleanup.

## Required supporting standards

- For any visual, layout, form, component, responsive, or frontend change, read and follow `DESIGN_STANDARDS.md` before editing.
- For any API, server, validation, environment, deployment, or backend change, read and follow `NESTJS_STANDARDS.md` before editing.
- When a task affects both frontend and API behavior, both standards apply.
- These supporting standards are mandatory unless the user explicitly requests a deliberate redesign or architectural migration.

## Project context

- The storefront uses Angular in `client/`, but public website navigation must follow a multi-page architecture rather than SPA-style client routing.
- The NestJS server and API are in `server/`.
- Production NestJS serves the compiled Angular application.
- Keep local development and Hostinger deployment working through the root `package.json` scripts.
- Preserve unrelated user changes and never replace established functionality without a clear requirement.

## Required workflow

For every implementation:

1. Inspect the affected component, route, API, and existing styles before editing.
2. Design mobile-first and verify desktop, tablet, and mobile behavior.
3. Consider search intent, semantic structure, accessibility, and performance while implementing—not afterward.
4. Run `npm run build` before handing off changes.
5. When practical, test the rendered page and check browser console, network failures, keyboard navigation, and responsive layout.
6. Summarize SEO or performance implications in the handoff when they are material.

## SEO requirements

All public pages and meaningful routes must:

- Have one descriptive, visible `<h1>` and a logical heading hierarchy without skipped levels.
- Use semantic elements such as `header`, `nav`, `main`, `section`, `article`, and `footer` where appropriate.
- Provide a unique, human-readable page title and meta description aligned with the page's search intent.
- Set a canonical URL when the production domain is available.
- Include Open Graph and Twitter sharing metadata for indexable landing and product pages.
- Use descriptive URLs and link text. Avoid links such as “click here” without context.
- Keep important copy and links in rendered HTML. Do not place essential text only inside images, CSS backgrounds, or inaccessible scripts.
- Add relevant structured data in JSON-LD when supported by visible content, such as `Organization`, `WebSite`, `BreadcrumbList`, `Product`, and `Offer`.
- Never fabricate ratings, prices, inventory, reviews, addresses, or other structured-data claims.
- Ensure product names, descriptions, prices, availability, and structured data use the same source of truth.
- Prevent accidental indexing of private, account, cart, checkout, search-result, or duplicate-filter pages when those routes are introduced.
- Update `robots.txt` and `sitemap.xml` when public routes are added or removed.
- Use server rendering, static generation, or prerendering for every public landing, category, product, service, and marketing route.

## Multi-page navigation requirement

- This website must not behave as a single-page application for public, indexable content.
- Every primary navigation destination, category, product, service, and marketing page must have its own stable URL and independently indexable HTML document.
- Clicking a public navigation link must perform a normal browser document request and refresh the page. Do not intercept these links with Angular Router, History API navigation, or custom JavaScript.
- Use normal `<a href="/path">` links for page navigation. Do not use hash fragments such as `#shop` as substitutes for pages when the destination represents standalone content.
- Each document must return the correct HTTP status and contain its own title, meta description, canonical URL, headings, body content, social metadata, and applicable structured data in the initial HTML response.
- Prefer server rendering, static generation, or prerendered route output. Client-side JavaScript may enhance a page but must not be required for crawlers or users to receive its essential content.
- Product and category URLs must remain directly loadable and refresh-safe.
- Do not add a catch-all SPA fallback that returns the homepage with `200` for unknown public URLs. Unknown URLs must return a real `404` response and 404 document.
- Cart interactions, filters, dialogs, and similar in-page enhancements may update without a full refresh when appropriate, but they must not convert public page navigation into SPA routing.

## Images and icons

Every new image or icon must be optimized before it is committed.

- Prefer SVG for logos, interface icons, and simple illustrations. Remove unnecessary editor metadata and keep the SVG view box intact.
- Prefer AVIF for photographic assets, with WebP as a practical fallback when needed. Use PNG only for transparency that cannot be represented efficiently, and JPEG only when modern formats are unsuitable.
- Resize raster files to the largest size they are actually rendered at. Do not ship a multi-megapixel image for a small card or icon.
- Provide responsive variants with `srcset` and `sizes` when an image can render at materially different widths.
- Always specify intrinsic `width` and `height`, or use a stable `aspect-ratio`, to prevent layout shift.
- Use descriptive `alt` text for meaningful images. Use `alt=""` for purely decorative images so screen readers ignore them.
- Use `loading="lazy"` and `decoding="async"` for below-the-fold images.
- Do not lazy-load the above-the-fold hero or likely Largest Contentful Paint image. Give the primary hero image high priority when appropriate.
- Keep icons visually sharp and small. Avoid icon fonts and large third-party icon libraries when only a few icons are needed.
- Do not hotlink production images from Flaticon, stock sites, or other external hosts. Download only properly licensed assets, record attribution when required, optimize them locally, and serve them from `client/public/`.
- Use CSS shapes or an existing local icon only when it remains accessible and does not add needless complexity.
- As a working target, keep small icons below 10 KB, card thumbnails below 80 KB, and large hero images below 200 KB whenever acceptable visual quality allows. These are targets, not permission to degrade necessary quality.

## Performance and Core Web Vitals

- Optimize for current Core Web Vitals: LCP, INP, and CLS.
- Avoid render-blocking third-party assets. Self-host critical fonts and images where feasible.
- Limit font families, weights, and character sets. Use `font-display: swap` for custom fonts.
- Lazy-load noncritical Angular routes and heavy features.
- Avoid adding large libraries for functionality achievable with platform APIs or existing dependencies.
- Reserve space for dynamic content, banners, product cards, and media so page layout does not jump.
- Keep animations transform/opacity based, short, and respectful of `prefers-reduced-motion`.
- Avoid autoplaying media and unnecessary network requests.
- Use cache-friendly hashed assets in production and appropriate cache headers for static files.
- Never weaken an existing Angular bundle budget merely to hide unexpected growth. If a deliberate design requires a larger budget, document why and keep the increase narrow.
- Treat Lighthouse/PageSpeed findings as evidence to investigate, while prioritizing real-user Core Web Vitals and functional correctness over chasing a cosmetic score of 100.

## Accessibility

- Meet WCAG 2.2 AA expectations for color contrast, keyboard access, focus visibility, labels, error messages, and interactive controls.
- Use native HTML controls whenever possible.
- Every form field needs a programmatic label, not only placeholder text.
- Buttons must perform actions; links must navigate.
- Icon-only controls require an accessible name.
- Do not communicate state using color alone.
- Ensure touch targets are comfortably sized and layouts work at 200% zoom.

## Angular standards

- Keep components focused and strongly type API data.
- Prefer Angular bindings and services over direct DOM manipulation.
- Use Angular title and meta services for route-specific metadata.
- Avoid unsafe HTML injection.
- Preserve loading, empty, success, and error states for API-driven UI.
- Ensure public internal navigation uses normal document requests and remains usable without Angular client-side routing.

## NestJS and API standards

- Validate and sanitize untrusted input at the server boundary.
- Organize API features into focused NestJS modules, controllers, and injectable services.
- Use NestJS pipes, guards, interceptors, and exception filters instead of ad hoc middleware when they fit the concern.
- Return consistent status codes and JSON error shapes.
- Do not expose secrets, internal stack traces, or unnecessary server headers.
- Keep environment-specific values in environment variables and update `.env.example` when adding configuration.
- Preserve health checks, graceful shutdown, security headers, and Hostinger's assigned `PORT` behavior.

## Definition of done

A change is complete only when:

- The requested behavior works across relevant viewport sizes.
- Public-facing content follows the SEO rules above.
- New media is locally hosted, licensed, correctly sized, responsive where appropriate, and accessible.
- No avoidable layout shift or blocking asset was introduced.
- The production build passes.
- Any unavoidable SEO, accessibility, performance, or deployment tradeoff is clearly reported.
