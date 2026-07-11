# Gimo Tech Design Standards

This document preserves the established Gimo Tech visual system. Read it before creating or changing pages, forms, cards, navigation, dialogs, product displays, or responsive layouts.

## Design direction

The storefront follows the supplied laboratory-services template translated into a modern technology retailer. The visual character is:

- Clean, trustworthy, precise, and service-oriented.
- Predominantly white and pale blue-gray with navy structure and aqua highlights.
- Spacious, rounded, and editorial rather than dense or dashboard-like.
- Image-led or illustration-led, with overlapping cards and soft geometric shapes.
- Professional and approachable; avoid neon gaming aesthetics, heavy black interfaces, or unrelated marketplace styling.

New work must feel like another section of the existing homepage, not a separate theme.

## Color system

Use existing CSS values whenever possible instead of creating near-duplicate colors.

- Primary navy: `#153f70` or `#173f70`
- Heading navy: `#183c6b` to `#204973`
- Aqua accent: `#22c7c4` to `#29d3c1`
- Bright blue accent: `#087bdd` to `#16aeda`
- Pale section background: `#eef3f8`
- Pale aqua background: `#d8f3f1`
- Body text: `#60778d` to `#718799`
- White surface: `#ffffff`
- Light borders: `#e7edf1`

Rules:

- Navy is the main structural and text color.
- Aqua marks actions, benefits, active states, and short eyebrow labels.
- Bright blue may appear in gradients and illustrations but should not replace aqua as the primary action accent.
- Use pale backgrounds to separate long page sections.
- Maintain WCAG 2.2 AA contrast. Do not place pale aqua text on white or body-gray text on weak tinted backgrounds without checking contrast.

## Typography

- Continue using the established Manrope-based sans-serif stack unless a deliberate brand change is requested.
- Headings use bold weights, compact line heights, and slightly negative letter spacing.
- Body copy uses regular weight, comfortable line height, and muted blue-gray.
- Eyebrows are short, uppercase, aqua, bold, and letter-spaced.
- Avoid introducing decorative, serif, script, or condensed display fonts.
- Limit the number of font weights and keep font loading optimized.

Suggested hierarchy:

- Page hero `h1`: `clamp(2.7rem, 5vw, 3.5rem)` or an equivalent responsive scale.
- Major section `h2`: approximately `2rem–2.5rem` on desktop.
- Card heading `h3`: approximately `.85rem–1.25rem` depending on context.
- Body: approximately `.85rem–1rem` with `1.6–1.7` line height.
- Eyebrow and metadata: approximately `.56rem–.7rem`.

Use exactly one visible `h1` per page and preserve a logical heading hierarchy.

## Layout and spacing

- Use the shared `.shell` pattern: maximum width near `1120px` with `20px` minimum side gutters.
- Major desktop sections normally use `70px–100px` vertical padding.
- Use two-column editorial sections for feature storytelling and collapse them to one column below approximately `900px`.
- Product and service card grids use four columns on large screens, two on tablets, and one on small phones.
- Maintain generous whitespace. Do not compress unrelated content into one card or crowded row.
- Overlaps may be used intentionally for editorial imagery, floating labels, or feature cards, but must not cause horizontal overflow or layout shift.
- Alternate white, pale blue-gray, and pale aqua backgrounds to retain the source template's long-page rhythm.

## Shapes, borders, and shadows

- Buttons are pill-shaped with approximately `24px` radius.
- Standard content cards use `7px–10px` radii.
- Illustrative shapes may use asymmetric rounded corners or organic blobs.
- Borders should be light and quiet.
- Shadows should be soft and blue-tinted, never harsh black or excessively large.
- Avoid glassmorphism, heavy gradients behind text, extreme border radii on every element, and excessive animation.

## Buttons and links

Primary actions:

- Navy background with white text, or aqua background with white text.
- Pill shape, compact uppercase label, bold weight, and generous horizontal padding.
- Use a `<button>` for actions and an `<a>` for navigation.

Secondary links:

- Short descriptive text with an arrow when appropriate.
- Aqua or navy with a visible hover and keyboard-focus state.
- Never use vague labels such as “Click here.”

All interactive controls need a visible `:focus-visible` treatment and a comfortable touch target.

## Forms

Forms must look consistent with the aqua consultation panel already used on the homepage.

- Place short lead-generation forms on aqua or white cards with a soft shadow.
- Inputs are white, approximately `42px–48px` high, and pill-shaped or softly rounded.
- Use persistent `<label>` elements. Placeholders may provide examples but must not replace labels.
- Group related controls with `fieldset` and `legend` when appropriate.
- Show validation close to the affected control using text and an icon; never use color alone.
- Preserve entered values after validation failures.
- Provide clear loading, success, and server-error states.
- Keep forms short. Move optional or advanced fields behind progressive disclosure.
- On mobile, use a single-column layout and full-width primary action.

## Cards and commerce components

- Product cards use a stable media aspect ratio so API loading does not shift the page.
- Category, price, rating, and action placement must be consistent across a grid.
- Prices and availability come from the API; do not hardcode conflicting values in structured data or UI.
- Add-to-cart buttons must have an accessible name containing the product name.
- Bundle/pricing cards use white surfaces on pale blue-gray sections, with aqua highlighting for the recommended option.
- Modal or drawer additions should use navy headings, aqua actions, white surfaces, and the same spacing rhythm.

## Imagery and icons

- Follow all image performance rules in `AGENTS.md`.
- Prefer optimized local SVG icons with simple aqua/blue line work.
- Icons should share stroke weight, corner style, and visual scale.
- Use CSS illustration only for simple decorative geometry; do not use text characters as permanent production icons when a proper accessible SVG is warranted.
- Photographic assets should feature clean technology, workspaces, products, or helpful people in bright, cool-toned settings.
- Do not introduce unrelated medical imagery even though the original reference was a laboratory template; preserve its composition, not its industry content.

## Motion

- Motion is optional and subtle.
- Animate only opacity and transforms where possible.
- Typical duration: `150ms–300ms`.
- Respect `prefers-reduced-motion`.
- Never animate layout dimensions for decorative effect or create continuous distracting motion.

## Responsive behavior

- Design mobile-first and verify at approximately `360px`, `768px`, `1024px`, and wide desktop sizes.
- Navigation must remain usable when desktop links collapse; add an accessible menu before the number of primary links grows further.
- Prevent horizontal scrolling at 200% zoom.
- Do not simply hide important content on small screens.
- Keep forms, pricing, product cards, and CTA blocks readable in one column.

## Accessibility and SEO

- Meet the accessibility and SEO requirements in `AGENTS.md`.
- Decorative shapes must be hidden from assistive technologies.
- Meaningful illustrations and product imagery require useful alternative text.
- Content order in the DOM must remain logical without relying on CSS position.
- Keep important marketing copy as HTML text rather than embedding it in an image.

## Design change checklist

Before handing off a visual change, confirm:

- It uses the existing navy, aqua, white, and pale blue-gray system.
- Typography and spacing match neighboring sections.
- Desktop, tablet, mobile, keyboard, and zoom behavior remain usable.
- Forms have labels, validation states, and accessible controls.
- Images and icons are licensed, local, responsive, and optimized.
- No avoidable CLS, unnecessary library, or render-blocking asset was introduced.
- The change looks like part of the original template-derived theme.
