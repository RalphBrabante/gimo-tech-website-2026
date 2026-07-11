# Gimo Tech Internal Dashboard

The internal dashboard is available at `/internal/dashboard` after a successful sign-in at `/internal/`.

## Authentication flow

1. The login form sends the username and password to `POST /api/auth/login`.
2. The API verifies the stored bcrypt password hash and sets an HTTP-only, SameSite session cookie.
3. The browser navigates to `/internal/dashboard`.
4. In production, NestJS verifies the session cookie before sending the dashboard HTML document.
5. The dashboard also calls `GET /api/auth/session` before revealing its interface. An invalid or expired session redirects to `/internal/`.
6. Signing out calls `POST /api/auth/logout`, clears the cookie, and returns to the login page.

The dashboard document uses `noindex`, `nofollow`, private no-store caching, and must never contain secrets or privileged data in its static HTML. Every future administrative API endpoint must enforce authorization on the server; hiding a control in the browser is not authorization.

## Bootstrap and Bootstrap Icons

Internal pages use Bootstrap 5 and Bootstrap Icons, with Gimo Tech-specific navigation and color styling in `client/public/internal/assets/internal.css`.

- Bootstrap assets: `client/public/internal/assets/bootstrap.min.css`
- Bootstrap Icons assets: `client/public/internal/assets/bootstrap-icons.css`
- Shared internal styling: `client/public/internal/assets/internal.css`
- Dashboard markup: `client/public/dashboard/index.html`

The normal root `npm run build` command copies the locally installed Bootstrap CSS, icon CSS, and font files into the public assets directory before compiling Angular. No CDN or Tailwind CSS is used.

During local development, Angular proxies `/internal/dashboard` to NestJS using `client/proxy.conf.json`. This keeps the authenticated document route and its CSS/JavaScript assets on the same path as production and prevents Angular's SPA fallback from returning HTML for dashboard asset requests. Restart `npm run dev` after changing the proxy configuration.

## Dashboard behavior

The initial overview displays the authenticated username and retrieves the product count from `/api/products`. Orders and customer metrics are intentionally placeholders until those API capabilities exist; the dashboard does not fabricate commerce data.

## Product management

`/internal/products` is a protected catalog-management page with full CRUD. It uses `GET`, multipart `POST`, multipart `PATCH`, and `DELETE` requests to `/api/internal/products` (and `/api/internal/products/:id`), all of which require a valid internal session. Products have a unique SKU, name, category, description, price in integer cents, rating, active flag, and `created_by_user_id` / `updated_by_user_id` relationships to `users`. Each product can have up to eight images stored in the related `product_images` table.

Uploaded product images are validated as AVIF, JPEG, PNG, or WebP, limited to 5 MB each, assigned server-generated filenames, and saved under `uploads/products/`. NestJS serves them from `/uploads/products/`. The upload directory is ignored by Git and must be included in deployment backup and persistent-storage planning.

Editing a product reuses the create form: selecting a product's edit action populates the fields and shows its current images, each with a toggle to mark it for removal. `PATCH` accepts the same fields as `POST` (all optional), plus a `removeImageIds` field (comma-separated image IDs) and newly uploaded files, which are appended after existing images are removed. A product must always retain between 1 and 8 images. Deleting a product removes its database row (cascading to its `product_images` rows) and its files under `uploads/products/`.

The layout is responsive: it uses a compact stacked layout on small screens and a fixed sidebar on large screens. New controls must retain visible keyboard focus, accessible names, sufficient contrast, and comfortable touch targets.

## Store settings

`/internal/settings` manages the singleton `app_settings` record. It controls the three-letter currency code, store name, support email, and optional free-shipping threshold. Changes use `PATCH /api/internal/settings` and record the internal user who made the change. The public `GET /api/settings` endpoint exposes only non-sensitive store settings so the storefront can format prices in the configured currency.
