# Gimo Tech Internal Dashboard

The internal dashboard is available at `/internal/dashboard` after a successful sign-in at `/internal/`.

## Authentication flow

1. The login form sends the username and password to `POST /api/auth/login`.
2. The API verifies the stored bcrypt password hash and sets an HTTP-only, SameSite session cookie.
3. The browser navigates to `/internal/dashboard`.
4. In production, NestJS verifies the session cookie before sending the dashboard HTML document.
5. The dashboard also calls `GET /api/auth/session` before revealing its interface. An invalid or expired session redirects to `/internal/`.
6. Signing out calls `POST /api/auth/logout`, clears the cookie, and returns to the login page.

## Profile and password recovery

Authenticated users manage their username, recovery email, and password at `/internal/profile/`. Every credential change requires the current password. New passwords must contain 12–128 characters with uppercase, lowercase, and a number. Updating credentials issues a refreshed signed session cookie.

Five invalid password attempts against an active username set `password_reset_required` for that account. A correct password cannot bypass this state. The fifth failure automatically attempts to email a reset link when the account has a recovery email, and the sign-in page also links to `/internal/reset-password/` for manual recovery requests. Request responses are intentionally generic so they do not disclose whether a username or email exists.

Reset links use 32 random bytes, store only a SHA-256 token hash, expire after 30 minutes, and are cleared after use. Reset request and completion endpoints have additional rate limits. Emails are sent from the Hostinger-managed `sales@gimosupplies.com` mailbox using `HOSTINGER_MAIL_API_TOKEN`; `PUBLIC_BASE_URL` controls the origin in the reset link.

The `AddAuthSecurity1784520000000` migration adds the recovery and lockout fields. Existing users keep their current credentials but initially have no recovery email, so each existing account should open Profile and save a valid email before relying on self-service recovery. The `npm run user:create --prefix server` script now requires a recovery email for newly created or updated users.

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

The overview displays the authenticated username and loads operational metrics from the protected product and Helpdesk APIs. It shows total and active products, loaded Inbox messages, unread messages, and messages assigned to a client. A locally hosted Chart.js bundle renders products by category and the Inbox read/unread split. Each data source fails independently, so a temporary mailbox error does not prevent product analytics from loading. The dashboard does not fabricate orders, customers, or other commerce data that the application does not store.

## Product management

`/internal/products` is a protected catalog-management page with full CRUD. It uses `GET`, multipart `POST`, multipart `PATCH`, and `DELETE` requests to `/api/internal/products` (and `/api/internal/products/:id`), all of which require a valid internal session. Products have a unique SKU, name, category, description, price in integer cents, rating, active flag, and `created_by_user_id` / `updated_by_user_id` relationships to `users`. Each product can have up to eight images stored in the related `product_images` table.

Uploaded product images are validated as AVIF, JPEG, PNG, or WebP, limited to 5 MB each, assigned server-generated filenames, and saved under `uploads/products/`. NestJS serves them from `/uploads/products/`. The upload directory is ignored by Git and must be included in deployment backup and persistent-storage planning.

Editing a product reuses the create form: selecting a product's edit action populates the fields and shows its current images, each with a toggle to mark it for removal. `PATCH` accepts the same fields as `POST` (all optional), plus a `removeImageIds` field (comma-separated image IDs) and newly uploaded files, which are appended after existing images are removed. A product must always retain between 1 and 8 images. Deleting a product removes its database row (cascading to its `product_images` rows) and its files under `uploads/products/`.

The layout is responsive: it uses a compact stacked layout on small screens and a fixed sidebar on large screens. New controls must retain visible keyboard focus, accessible names, sufficient contrast, and comfortable touch targets.

## Store settings

`/internal/settings` manages the singleton `app_settings` record. It controls the three-letter currency code, store name, support email, and optional free-shipping threshold. Changes use `PATCH /api/internal/settings` and record the internal user who made the change. The public `GET /api/settings` endpoint exposes only non-sensitive store settings so the storefront can format prices in the configured currency.

## Helpdesk and Hostinger Agentic Mail

`/internal/helpdesk/` is the primary protected sales inbox workspace; `/internal/desk/` remains available for backward compatibility. The browser calls only `/api/internal/desk/*`; the NestJS server holds the Hostinger token and proxies authenticated mailbox reads to the Hostinger Mail REST API. Never put the token in Helpdesk HTML, JavaScript, the database, or a public Angular environment file.

To enable Helpdesk in production:

1. In hPanel, open **Emails → gimosupplies.com → Agentic mail → API**.
2. Create a token with **Selected mailboxes** access and select only `sales@gimosupplies.com`.
3. Add `HOSTINGER_MAIL_API_TOKEN` to the Node.js application environment in hPanel.
4. Keep `HOSTINGER_MAILBOX_ADDRESS=sales@gimosupplies.com` unless the Desk mailbox changes.
5. Redeploy or restart the application. The `CreateDesk1784433600000` migration creates the local client-category tables automatically when migrations are enabled.

Desk reads messages from Hostinger on demand and stores only client definitions and message-to-client assignments in MySQL. An optional client sender email or email domain provides automatic matching; a manual per-message assignment overrides that rule. Message bodies are returned as plain text and escaped before display so email HTML cannot execute inside the internal portal. Common quoted-reply blocks (including `On … wrote:`, `Original Message`, Outlook header blocks, and trailing `>` quotes) are removed from the visible message body to keep each conversation entry concise.

Selecting an inbox item opens `/internal/desk/messages/:uid/`, a dedicated helpdesk-style conversation page. The server combines messages from `INBOX` and the folder marked with the IMAP `\Sent` special-use attribute, matching the requester and normalized subject so staff can see both sides of the exchange. Hostinger's send schema does not currently expose custom `In-Reply-To` or `References` headers, so Desk cannot force RFC header threading for newly sent mail; it uses the message metadata Hostinger provides and the participant/subject relationship for its internal conversation view.

Replies are sent as multipart form data by `POST /api/internal/desk/messages/:uid/replies`. The API derives the recipient from the selected inbound message and ignores browser-supplied recipient addresses. This prevents an authenticated browser request from turning the endpoint into an arbitrary mail sender. A reply can include up to five common business-document or image attachments, limited to 5 MB per file and 15 MB total. Hostinger sends from the managed `sales@gimosupplies.com` mailbox and saves its copy to `INBOX.Sent`.

Received attachments are streamed through the protected Desk API, never directly from Hostinger with a browser-visible token. JPEG, PNG, WebP, GIF, PDF, plain-text, and CSV files can be previewed; other received types are forced to download. Responses include `nosniff`, private no-store caching, a sanitized filename, and a 15 MB Desk download ceiling. HTML, SVG, and other active-content formats are not rendered inline.

The current implementation refreshes when Desk opens or a staff member selects **Refresh inbox**. Hostinger's `message.received` webhook can be added later for real-time refresh notifications; its Bearer secret must be validated by a dedicated public HTTPS webhook endpoint before accepting an event.
