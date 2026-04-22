# ClassEcon on Cloudflare

Each subfolder here is a standalone Cloudflare Worker. The four backend
services run as Cloudflare Containers (Docker images wrapped in Durable
Objects) and the three static SPAs are served directly from the edge as
Worker Assets.

## Layout

| Folder | Public | Runtime | Source | Purpose |
| --- | --- | --- | --- | --- |
| `auth-service/` | yes | container | `../AuthService/Dockerfile` | Auth REST API, port 4001 |
| `backend/` | yes | container | `../Backend/Dockerfile` | GraphQL API, port 4000 |
| `payment-service/` | yes | container | `../PaymentService/Dockerfile` | Stripe + subscriptions, port 4003 |
| `email-service/` | yes | container | `../EmailService/Dockerfile` | Email GraphQL API, port 4004 |
| `email-service-worker/` | no (cron) | container | `../EmailService/Dockerfile` (`ROLE=worker`) | Async email dispatcher |
| `frontend/` | yes | Worker Assets | `../Frontend/dist/` | React SPA |
| `landing-page/` | yes | Worker Assets | `../LandingPage/dist/` | Marketing site SPA |
| `admin/` | yes | Worker Assets | `../admin/dist/` | Admin SPA |

The three frontend services were originally shipped as nginx containers,
but moved to Worker Assets because Cloudflare's Containers beta has known
platform-level reliability issues with small nginx workloads (see
https://github.com/cloudflare/containers/issues/45 and #5996). Worker
Assets serves the same static `dist/` output from the edge, faster and
without cold starts.

## Secrets model

All runtime values live in Cloudflare as Worker secrets (`wrangler secret
put`). `cloudflare/.secrets.local` is a gitignored bootstrap file that
holds the shared values so the same `SERVICE_API_KEY`, `JWT_SECRET`, etc.
are pushed to every service that needs them. See [`SECRETS.md`](./SECRETS.md)
for the full per-service matrix and `push-secrets.sh` for the uploader.

The backend services also forward every string-valued Worker secret into
the container's runtime env via their `Container` subclass constructor —
see e.g. `backend/src/index.ts`.

## Deployment order

```
auth-service -> email-service (+ email-service-worker) -> payment-service -> backend
                                |
                                v
                 frontend + landing-page + admin    (need backend URL baked at Vite build time)
```

Build the Vite apps first with the production URLs as `VITE_*` env vars,
then deploy the Worker Assets targets. Example:

```sh
# 1. Deploy backend containers
cd cloudflare/auth-service         && ../wrangler.sh deploy
cd ../email-service                && ../wrangler.sh deploy
cd ../email-service-worker         && ../wrangler.sh deploy
cd ../payment-service              && ../wrangler.sh deploy
cd ../backend                      && ../wrangler.sh deploy

# 2. Push secrets
cd ..                              && ./push-secrets.sh

# 3. Build the Vite apps with the resolved URLs, then deploy the SPAs
cd ../Frontend && VITE_GRAPHQL_URL=... pnpm run build
cd ../LandingPage && VITE_GRAPHQL_URL=... pnpm run build
cd ../admin && VITE_GRAPHQL_URL=... pnpm exec vite build

cd ../cloudflare/frontend          && ../wrangler.sh deploy
cd ../landing-page                 && ../wrangler.sh deploy
cd ../admin                        && ../wrangler.sh deploy
```

## Smoke tests

```sh
# Backends all respond 200 with JSON status
for s in auth backend payment email; do
  curl -sS https://classecon-$s.classecon-prod.workers.dev/health
done

# Frontends serve index.html and fall back to it for SPA routes
for s in frontend landing admin; do
  curl -sS https://classecon-$s.classecon-prod.workers.dev/
done
```

## MongoDB Atlas

Every DB-connected service (backend, payment-service, email-service) uses
the Atlas `ce-prod-01` cluster over a `mongodb+srv://` URL. Cloudflare
Containers egress from a rotating pool of IPs, so Atlas → Network Access
must allow `0.0.0.0/0`. Without that rule, queries fail with
`Operation <op> buffering timed out after 10000ms`.

Databases used:
- `classecon` — backend + auth
- `classecon-payments` — payment-service
- `email_service` — email-service

## Beta gotchas

- Container cold starts take 2-3s; first request after idle (30m default)
  will feel slow.
- There is no autoscaling. Each container defaults to `max_instances: 2`.
  Raise it in the per-service `wrangler.jsonc` to scale out.
- Container disks are ephemeral; every service is stateless and persists
  to MongoDB Atlas.
- The email-service-worker has no public fetch handler — it is kept warm
  by a 5-minute cron trigger that opens a connection to the container.
- The three DB-backed backend containers start the HTTP listener
  **before** connecting to Mongo so they can pass Cloudflare's port-open
  health check even on cold start. Mongo connects in the background.
