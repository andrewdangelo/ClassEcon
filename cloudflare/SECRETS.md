# Cloudflare deployment — secrets matrix

Every value listed below is pushed to Cloudflare via `wrangler secret put`
after the service has been deployed at least once. The actual values live
in the gitignored file [`.secrets.local`](./.secrets.local) so that shared
values (e.g. `SERVICE_API_KEY` must match between AuthService, Backend,
and PaymentService) stay in sync.

Run [`push-secrets.sh`](./push-secrets.sh) after the first `wrangler deploy`
of each service to push the entire secret bundle at once.

## Regenerate all shared secrets

```
node -e "const c=require('crypto');['JWT_SECRET','REFRESH_JWT_SECRET','SERVICE_API_KEY','PAYMENT_SERVICE_API_KEY','INTERNAL_API_KEY','EMAIL_SERVICE_TOKEN','EMAIL_ADMIN_TOKEN','EMAIL_WEBHOOK_SECRET','UNSUBSCRIBE_HMAC_SECRET'].forEach(k=>console.log(k+'='+c.randomBytes(32).toString('hex')))"
```

## Per-service matrix

Legend: `S` = shared across services (must be identical), `U` = unique to
that service, `X` = required, blank = not needed.
`X*` = required only when using SMTP transport.

| Secret | auth | email | email-worker | payment | backend |
| --- | :---: | :---: | :---: | :---: | :---: |
| `DATABASE_URL` (Mongo Atlas — different db per service) | X (`classecon`) | X (`email_service`) | X (`email_service`) | X (`classecon-payments`) | X (`classecon`) |
| `JWT_SECRET` (S) | X | | | X | X |
| `REFRESH_JWT_SECRET` (S) | X | | | | X |
| `SERVICE_API_KEY` (S) | X | | | X | X |
| `PAYMENT_SERVICE_API_KEY` (S) | | | | X | X |
| `INTERNAL_API_KEY` (U) | | | | | X |
| `EMAIL_SERVICE_TOKEN` (S, backend ↔ email) | | X | X | | X |
| `EMAIL_ADMIN_TOKEN` (U email) | | X | X | | |
| `EMAIL_WEBHOOK_SECRET` (U email) | | X | X | | |
| `UNSUBSCRIBE_HMAC_SECRET` (U email) | | X | X | | |
| `EMAIL_TRANSPORT` (`auto` / `smtp` / `resend`) | | X | X | | |
| `RESEND_API_KEY` (required when transport resolves to Resend) | | X | X | | |
| `SMTP_HOST` | | X* | X* | | |
| `SMTP_PORT` | | X* | X* | | |
| `SMTP_SECURE` | | X* | X* | | |
| `SMTP_USER` | | X* | X* | | |
| `SMTP_PASS` | | X* | X* | | |
| `SMTP_REJECT_UNAUTHORIZED` | | X* | X* | | |
| `STRIPE_SECRET_KEY` | | | | X | |
| `STRIPE_WEBHOOK_SECRET` | | | | X | |
| `STRIPE_PRICE_*_MONTHLY` / `_YEARLY` (6 total) | | | | X | |
| `STRIPE_COUPON_FOUNDING` | | | | X | |
| `FROM_EMAIL` (plain var) | | X | X | | |

## Non-secret environment variables

These belong in the `containers[].image_vars` block of each wrangler.jsonc
(build-time, baked into the image) or pushed as non-secret vars through
the Cloudflare dashboard later. They're the `workers.dev` URLs captured
after the initial backend deploys.

### auth-service image_vars / envVars on Container class

- `NODE_ENV=production`
- `CORS_ORIGIN=https://classecon-frontend.<sub>.workers.dev`

### backend

- `NODE_ENV=production`
- `CORS_ORIGIN=https://classecon-frontend.<sub>.workers.dev`
- `CORS_ORIGINS=https://classecon-frontend.<sub>.workers.dev,https://classecon-landing.<sub>.workers.dev,https://classecon-admin.<sub>.workers.dev`
- `FRONTEND_URL=https://classecon-frontend.<sub>.workers.dev`
- `LANDING_PAGE_URL=https://classecon-landing.<sub>.workers.dev`
- `AUTH_SERVICE_URL=https://classecon-auth.<sub>.workers.dev`
- `PAYMENT_SERVICE_URL=https://classecon-payment.<sub>.workers.dev`
- `EMAIL_SERVICE_URL=https://classecon-email.<sub>.workers.dev`

### payment-service

- `NODE_ENV=production`
- `BILLING_MODE=stripe`
- `BACKEND_URL=https://classecon-backend.<sub>.workers.dev`
- `FRONTEND_URL=https://classecon-frontend.<sub>.workers.dev`
- `ADMIN_URL=https://classecon-admin.<sub>.workers.dev`
- `CORS_ORIGINS=https://classecon-frontend.<sub>.workers.dev,https://classecon-landing.<sub>.workers.dev,https://classecon-admin.<sub>.workers.dev`

### email-service + worker

- `NODE_ENV=production`
- `MONGODB_URI=` (same base as `DATABASE_URL`, no `/<db>` suffix)
- `MONGODB_DB_NAME=email_service`
- `EMAIL_TRANSPORT=auto` (or explicit `smtp` / `resend`)
- For SMTP mode (Google Workspace app-password or relay), set `SMTP_*` values.
- For Resend mode, set `RESEND_API_KEY`.
- `APP_URL=https://classecon-frontend.<sub>.workers.dev`
- `ALLOWED_REDIRECT_ORIGINS=https://classecon-frontend.<sub>.workers.dev,https://classecon-landing.<sub>.workers.dev,https://classecon-admin.<sub>.workers.dev`

### frontend / landing-page / admin

See the `image_vars` block inside their respective `wrangler.jsonc` —
these are build-time Vite variables. Update the `REPLACE` subdomain
placeholder after the first `wrangler whoami`.
