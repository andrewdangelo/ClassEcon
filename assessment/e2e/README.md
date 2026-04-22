# ClassEcon E2E Suite

This folder contains hybrid end-to-end coverage:

- `specs/browser`: critical teacher/student browser journeys
- `specs/api`: authorization and cross-class permission matrix checks
- `specs/billing`: mock and Stripe test billing profiles
- `support`: shared setup, fixtures, GraphQL client helpers, and environment loading

## Run commands

```bash
cd assessment
cp .env.e2e.example .env.e2e
pnpm install

pnpm run test:e2e:api
pnpm run test:e2e:smoke
pnpm run test:e2e:full
pnpm run test:e2e
pnpm run test:e2e:billing:mock
pnpm run test:e2e:billing:stripe

# After a Playwright run, generate a short markdown summary from JUnit:
pnpm run report:e2e:summary
```

## Validation output (reports)

After any Playwright run, artifacts live under `assessment/e2e/artifacts/`:

| Output | Path |
|--------|------|
| HTML report | `artifacts/html-report/index.html` |
| JUnit (CI-friendly) | `artifacts/junit/results.xml` |
| Markdown summary | `artifacts/validation-summary.md` (from `report:e2e:summary`) |
| Traces, screenshots, video (on failure) | `artifacts/test-results/` |

Use `pnpm exec playwright show-trace <path-to-trace.zip>` to inspect a failed browser test.

- **`test:e2e:smoke`**: runs only tests with `@smoke` in the title (fast CI).
- **`test:e2e:full`**: all `specs/browser` tests except titles matching `@dev` (API and billing use `test:e2e:api` / `test:e2e:billing:*`).
- **Internal API**: tier tests call `POST /api/internal/subscription-update`. Set `E2E_INTERNAL_API_KEY` to match the Backend `INTERNAL_API_KEY` (Docker Compose default: `e2e-dev-internal-key`).

## Reliability model

- Uses deterministic persona naming with a run-id suffix to avoid account collisions.
- Global setup waits for `Frontend`, `Backend`, and `PaymentService` health endpoints before executing.
- API-only runs can skip frontend readiness with `E2E_REQUIRE_FRONTEND=false`.
- Mock billing mode (`BILLING_MODE=mock`) removes external Stripe dependencies for fast CI.
