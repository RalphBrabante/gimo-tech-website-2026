# Gimo Tech NestJS Standards

Read this document before changing the API, server configuration, environment variables, validation, authentication, persistence, or deployment behavior.

## Current architecture

- NestJS 11 and TypeScript run from `server/`.
- `server/src/main.ts` bootstraps the application.
- `server/src/app.module.ts` is the root module.
- Feature modules live in dedicated directories such as `server/src/products/`.
- Production NestJS serves the compiled Angular application.
- Hostinger starts the compiled application through the root `server.js`.
- Preserve `/health`, `/api/health`, Hostinger's assigned `PORT`, proxy trust, Helmet, CORS rules, SPA fallback, and shutdown hooks.

## Module boundaries

- Organize each business capability as a feature module.
- Keep controllers thin: receive input, invoke a service, and return the result.
- Put business logic in injectable services.
- Keep persistence logic in repositories or dedicated data-access providers once a database is introduced.
- Do not import feature internals across modules. Export intentional providers from the owning module.
- Avoid placing unrelated providers or endpoints in `AppModule`.
- Shared infrastructure belongs in clearly named modules such as `ConfigModule`, `DatabaseModule`, or `AuthModule` when introduced.

Recommended feature structure:

```text
feature/
  dto/
    create-feature.dto.ts
    update-feature.dto.ts
  entities/ or models/
  feature.controller.ts
  feature.service.ts
  feature.module.ts
  feature.repository.ts      # when persistence is introduced
  feature.service.spec.ts
```

## Routes and response behavior

- Keep API routes under `/api` except operational routes such as `/health`.
- Use plural resource names: `/api/products`, `/api/orders`, `/api/customers`.
- Use standard HTTP verbs and status codes.
- `GET` reads, `POST` creates, `PATCH` partially updates, and `DELETE` removes.
- Return `201` for successful creation, `204` when a successful response intentionally has no body, and appropriate `4xx` errors for client mistakes.
- Keep response shapes stable. Treat breaking response changes as API versioning decisions.
- Use NestJS exceptions such as `NotFoundException`, `BadRequestException`, `ConflictException`, and `UnauthorizedException`.
- Do not expose stack traces, SQL errors, filesystem paths, or secret values.

## DTOs and validation

- Never accept untyped request bodies or trust query and path input.
- Use DTO classes for request bodies, meaningful query groups, and nontrivial parameters.
- Use `class-validator` and `class-transformer` when writable endpoints are introduced.
- Enable a global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true` when DTO validation is added.
- Use built-in pipes such as `ParseIntPipe`, `ParseBoolPipe`, `ParseUUIDPipe`, and `DefaultValuePipe` for simple parameters.
- Normalize user input deliberately; do not silently coerce ambiguous values.
- Put API contracts in explicit interfaces or classes. Avoid `any`.

## Services and business logic

- Services should have narrow, intention-revealing methods.
- Separate validation of business rules from transport concerns.
- Do not inject Express request or response objects into services.
- Use dependency injection rather than constructing infrastructure clients inside methods.
- Make operations idempotent where the domain and HTTP semantics require it.
- Handle money with integer minor units or an appropriate decimal type once checkout is implemented; never rely on floating-point arithmetic for transactions.

## Data and persistence

- The current product array is temporary seed/demo data.
- When adding a database, use migrations and environment-driven connection configuration.
- Never enable destructive schema synchronization in production.
- Add indexes for actual query patterns and preserve referential integrity.
- Use transactions for multi-write operations that must succeed or fail together.
- Do not return persistence entities directly when doing so leaks internal fields; map them to response models.
- Paginate collection endpoints before product, order, or customer data can grow unbounded.

## Authentication and authorization

- Keep authentication and authorization separate.
- Use guards for protected endpoints and role/policy checks.
- Store passwords only with a modern password hash designed for password storage.
- Never log passwords, tokens, secrets, payment details, or reset links.
- Use secure, HTTP-only, same-site cookies when cookie-based sessions are selected.
- Validate token issuer, audience, signature, and expiry when token authentication is selected.
- Apply authorization to the resource being accessed, not only to the route name.
- E-commerce administration endpoints must default to denied access unless explicitly authorized.

## Security

- Retain Helmet and remove unnecessary identifying headers.
- Keep CORS restricted to configured trusted origins; never use an unrestricted production wildcard with credentials.
- Validate and constrain uploaded file type, size, and destination before file-upload support is added.
- Apply rate limiting to login, password reset, contact, checkout, and other abuse-prone endpoints.
- Verify webhook signatures against the raw request body before processing payment or fulfillment events.
- Keep secrets in environment variables and out of source control.
- Add every required variable to `.env.example` with a safe placeholder and explanatory comment.
- Avoid leaking whether a customer email exists in authentication recovery flows.

## Configuration

- Access deployment-specific values through configuration providers or `process.env` during bootstrap.
- Validate required production configuration at startup when databases, authentication, email, storage, or payments are introduced.
- Keep sensible local defaults only for nonsecret development values.
- Never override the `PORT` supplied by Hostinger.
- Keep production and development behavior explicit through `NODE_ENV`.

## Errors and logging

- Use Nest's logger or an injected structured logger rather than scattered `console.log` calls.
- Include useful request or correlation context without logging sensitive data.
- Use exception filters when a consistent custom error envelope is required.
- Unexpected errors should return a generic message and be logged server-side.
- Do not turn programming failures into misleading `200` responses.

## Performance

- Avoid unbounded queries and large in-memory transformations.
- Paginate, filter, and select only needed fields.
- Cache only data with a clear invalidation strategy.
- Do not block the event loop with CPU-heavy work; move substantial jobs to a queue or worker.
- Serve immutable hashed Angular assets with long-lived caching while keeping HTML appropriately revalidated.
- Keep dependencies intentional and monitor production packages for vulnerabilities.

## Testing

- Add unit tests for meaningful service logic and business rules.
- Add controller or end-to-end tests for validation, authorization, status codes, and response contracts.
- Test success, invalid input, not found, conflict, unauthorized, and forbidden behavior as relevant.
- Mock only external boundaries; avoid tests that merely restate an implementation.
- Preserve live checks for `/health`, `/api/products`, API `404` responses, and production SPA fallback.

## API documentation

- Add OpenAPI/Swagger documentation when the API gains writable or external-consumer endpoints.
- Keep documented schemas aligned with DTOs and actual responses.
- Document authentication, pagination, filtering, errors, and examples without including real secrets or customer data.

## Deployment compatibility

- `npm run build` at the repository root must compile NestJS and Angular.
- `npm start` must launch the compiled NestJS server through `server.js`.
- Do not make production depend on TypeScript execution or globally installed CLI tools.
- Production must continue serving the Angular build and client-side route fallback.
- Use graceful shutdown hooks so Hostinger can replace application processes safely.

## API change checklist

Before handing off an API change, confirm:

- The feature has a focused module, thin controller, and injectable service.
- Input is typed, constrained, normalized, and validated.
- Status codes and error responses match HTTP and NestJS conventions.
- Authentication and authorization are applied where needed.
- Secrets and sensitive values are neither returned nor logged.
- Environment changes are reflected in `.env.example`.
- Relevant unit or endpoint tests were added or updated.
- `npm run build` passes.
- Existing health routes, Angular serving, SPA fallback, and Hostinger startup still work.
