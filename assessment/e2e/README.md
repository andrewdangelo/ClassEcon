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
pnpm run test:e2e
pnpm run test:e2e:billing:mock
pnpm run test:e2e:billing:stripe
```

## Reliability model

- Uses deterministic persona naming with a run-id suffix to avoid account collisions.
- Global setup waits for `Frontend`, `Backend`, and `PaymentService` health endpoints before executing.
- API-only runs can skip frontend readiness with `E2E_REQUIRE_FRONTEND=false`.
- Mock billing mode (`BILLING_MODE=mock`) removes external Stripe dependencies for fast CI.
