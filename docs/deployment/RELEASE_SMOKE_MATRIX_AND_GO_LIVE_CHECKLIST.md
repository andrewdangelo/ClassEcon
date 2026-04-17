# Release Smoke Matrix and Go-Live Checklist

This checklist is the final release gate for production deploys of `Backend`, `PaymentService`, `Frontend`, and `admin`.

## 1) Smoke Matrix (Must Pass)

| Area | Service/App | Smoke Checks | Pass Criteria |
|---|---|---|---|
| API Health | `Backend` | Start service, confirm GraphQL endpoint responds, run assessment contract tests | Service boots cleanly and no failing contract tests |
| Billing Health | `PaymentService` | Start service, verify auth middleware paths, verify payment routes (`/plans`, `/checkout`, `/portal`, `/subscription`, `/invoices`) | Service boots cleanly and payment route contract remains intact |
| Teacher/Student UX | `Frontend` | Login flow, class selection, key route navigation (`/`, `/classes`, `/jobs`, `/requests`, `/store`, `/getting-started`) | No dead-end routes and core teacher/student pages render without blocking errors |
| Admin UX | `admin` | Dashboard load, subscription management page load, basic read queries | App builds and critical admin pages load without runtime or GraphQL errors |
| Economy Flow | `Backend` + `Frontend` | Pay request lifecycle: create -> approve -> submit (plus rebuke/deny paths) | Status transitions persist correctly and payroll transaction is written on submit |
| Store/Redemption Flow | `Backend` + `Frontend` | Purchase item, validate stock decrement, submit redemption, approve/deny redemption | Balance and stock integrity preserved; redemption state transitions are valid |
| Jobs/Payroll Flow | `Backend` | Create job, apply, approve application, verify employment active, verify salary processing updates `lastPaidAt` | Job lifecycle and payroll posting behavior complete without data integrity issues |
| Billing Flow | `Backend` + `PaymentService` + `Frontend` | Checkout session creation, billing portal session, invoice list retrieval, payment methods retrieval | Billing endpoints return successful responses for authenticated user context |

## 2) Pre-Deploy Gate

- Confirm latest branch has no unresolved critical/high defects.
- Run:
  - `node --test assessment/tests/*.mjs`
  - `pnpm --dir assessment run test:e2e:api`
  - `pnpm --dir assessment run test:e2e:smoke`
  - package builds for `Backend`, `PaymentService`, `Frontend`, and `admin`
- Confirm required production environment variables are present for all services.
- Confirm Stripe webhook endpoint and signing secret are configured for current environment.
- Confirm database backup/snapshot is complete and timestamped before deployment.
- Freeze non-release changes until go-live verification is complete.

## 3) Deployment Sequence

1. Deploy `PaymentService` first.
2. Deploy `Backend` second (depends on payment route contract).
3. Deploy `Frontend`.
4. Deploy `admin`.
5. Execute post-deploy smoke matrix immediately.

## 4) Rollback Plan

### Rollback Triggers

- Any critical smoke matrix failure in core economy flow.
- Any billing flow failure impacting checkout, portal, or invoice retrieval.
- Severe auth/session failure preventing teacher or student access.
- Elevated 5xx rates or repeated startup crashes after deploy.

### Rollback Procedure

1. Announce rollback start in release channel and freeze writes if needed.
2. Roll back `Frontend` and `admin` to previous stable release artifacts.
3. Roll back `Backend` to previous stable revision.
4. Roll back `PaymentService` to previous stable revision.
5. Verify previous stable environment health (`Backend`, `PaymentService`, `Frontend`, `admin`).
6. Re-run critical smoke checks from Section 1 on rolled-back version.
7. Document incident root cause, impact window, and corrective action before retry.

### Data Safety Notes

- Avoid destructive schema migrations in the same release as major flow changes.
- If data writes occurred during the failed window, validate affected records:
  - pay requests updated during deploy window
  - store purchases and redemption requests
  - jobs/applications/employment updates
  - subscription state changes and webhook events

## 5) Final Go-Live Checklist (Sign-Off)

- [ ] All four apps/services build successfully in release configuration.
- [ ] Smoke matrix checks all pass.
- [ ] `assessment/tests` pass in release candidate.
- [ ] `assessment/e2e` smoke and API permission suites pass in release candidate.
- [ ] No unresolved critical/high defects remain.
- [ ] Monitoring/alerts are green after deploy.
- [ ] Error budget and 5xx rate within acceptable threshold.
- [ ] Rollback artifacts and previous release tags are available.
- [ ] Deployment notes + known limitations posted to release channel.
- [ ] Product/engineering sign-off completed.
- [ ] Post-deploy verification completed after 15 and 60 minutes.

## 6) Runbook Ownership

- Release coordinator: owns deployment order and go/no-go calls.
- Backend owner: owns API and economy flow verification.
- Payment owner: owns billing and webhook verification.
- Frontend owner: owns teacher/student UX smoke checks.
- Admin owner: owns dashboard and admin-path validation.
