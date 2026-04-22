#!/usr/bin/env bash
#
# Push every secret from .secrets.local into each Cloudflare Worker using
# `wrangler secret put --name <worker>`. Safe to re-run; wrangler overwrites.
#
# Usage:
#   ./push-secrets.sh                             # prod, all services
#   ./push-secrets.sh backend                     # prod, one service
#   ./push-secrets.sh --env staging               # staging, all services
#   ./push-secrets.sh --env staging backend       # staging, one service
#
# Prereqs:
#   1. wrangler authenticated (`wrangler login`)
#   2. Each target worker has been deployed at least once (`wrangler deploy`)
#   3. .secrets.local filled in (Stripe, Resend, SUB)

set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE"

# Parse --env flag (defaults to prod).
ENV_NAME="prod"
if [[ "${1:-}" == "--env" ]]; then
  ENV_NAME="${2:-}"
  shift 2
fi

# Prefer the local wrapper (Cursor's node >= 20) if the system wrangler isn't
# on a supported Node version.
WRANGLER="${WRANGLER_CMD:-$HERE/wrangler.sh}"

# In local development we load secrets from .secrets.local. In CI (e.g.
# GitHub Actions) the required variables are already exported into the
# environment, so the file is optional.
if [[ -f .secrets.local ]]; then
  # shellcheck disable=SC1091
  source .secrets.local
elif [[ -z "${SUB:-}" ]]; then
  echo "ERROR: .secrets.local not found and SUB env var is not set." >&2
  echo "Either create cloudflare/.secrets.local (see SECRETS.md) or export" >&2
  echo "the required variables before running this script." >&2
  exit 1
fi

# ----- Environment-specific URL / DB selection -----
case "$ENV_NAME" in
  prod|production)
    APEX_URL="https://classecon.net"
    WWW_URL="https://www.classecon.net"
    APP_URL="https://app.classecon.net"
    ADMIN_URL="https://admin.classecon.net"
    API_URL="https://api.classecon.net"
    AUTH_URL="https://auth.classecon.net"
    PAYMENTS_URL="https://payments.classecon.net"
    EMAIL_URL="https://email.classecon.net"
    DB_BACKEND="$DATABASE_URL_BACKEND"
    DB_AUTH="$DATABASE_URL_AUTH"
    DB_PAYMENT="$DATABASE_URL_PAYMENT"
    DB_EMAIL="$MONGODB_URI_EMAIL"
    SUFFIX=""
    WORKERS_DEV_SUFFIX="${SUB}.workers.dev"
    ;;
  staging|stg)
    # Staging lives on workers.dev only (no custom domain).
    WORKERS_DEV_SUFFIX="${SUB}.workers.dev"
    APEX_URL="https://classecon-landing-staging.${WORKERS_DEV_SUFFIX}"
    WWW_URL="$APEX_URL"
    APP_URL="https://classecon-frontend-staging.${WORKERS_DEV_SUFFIX}"
    ADMIN_URL="https://classecon-admin-staging.${WORKERS_DEV_SUFFIX}"
    API_URL="https://classecon-backend-staging.${WORKERS_DEV_SUFFIX}"
    AUTH_URL="https://classecon-auth-staging.${WORKERS_DEV_SUFFIX}"
    PAYMENTS_URL="https://classecon-payment-staging.${WORKERS_DEV_SUFFIX}"
    EMAIL_URL="https://classecon-email-staging.${WORKERS_DEV_SUFFIX}"
    DB_BACKEND="$DATABASE_URL_BACKEND_STAGING"
    DB_AUTH="$DATABASE_URL_AUTH_STAGING"
    DB_PAYMENT="$DATABASE_URL_PAYMENT_STAGING"
    DB_EMAIL="$MONGODB_URI_EMAIL_STAGING"
    SUFFIX="-staging"
    ;;
  *)
    echo "ERROR: unknown --env value: $ENV_NAME (expected prod|staging)" >&2
    exit 1
    ;;
esac

CORS_ALL="${APEX_URL},${APP_URL},${ADMIN_URL}"
if [[ "$ENV_NAME" == "prod" || "$ENV_NAME" == "production" ]]; then
  CORS_ALL="${APEX_URL},${WWW_URL},${APP_URL},${ADMIN_URL}"
fi

put() {
  # $1 worker name (from wrangler.jsonc "name"), $2 secret key, $3 value
  local worker=$1 key=$2 value=$3
  if [[ -z "$value" || "$value" == *REPLACE* ]]; then
    echo "  SKIP $worker::$key (value still a REPLACE placeholder)"
    return
  fi
  echo "  -> $worker::$key"
  printf '%s' "$value" | "$WRANGLER" secret put "$key" --name "$worker" > /dev/null
}

push_auth() {
  local w="classecon-auth${SUFFIX}"
  echo "[$w]"
  put "$w" DATABASE_URL "$DB_AUTH"
  put "$w" JWT_SECRET "$JWT_SECRET"
  put "$w" REFRESH_JWT_SECRET "$REFRESH_JWT_SECRET"
  put "$w" SERVICE_API_KEY "$SERVICE_API_KEY"
  put "$w" NODE_ENV production
  put "$w" CORS_ORIGIN "$APP_URL"
  put "$w" CORS_ORIGINS "$CORS_ALL"
}

push_backend() {
  local w="classecon-backend${SUFFIX}"
  echo "[$w]"
  put "$w" DATABASE_URL "$DB_BACKEND"
  put "$w" JWT_SECRET "$JWT_SECRET"
  put "$w" REFRESH_JWT_SECRET "$REFRESH_JWT_SECRET"
  put "$w" SERVICE_API_KEY "$SERVICE_API_KEY"
  put "$w" PAYMENT_SERVICE_API_KEY "$PAYMENT_SERVICE_API_KEY"
  put "$w" INTERNAL_API_KEY "$INTERNAL_API_KEY"
  put "$w" EMAIL_SERVICE_TOKEN "$EMAIL_SERVICE_TOKEN"
  put "$w" NODE_ENV production
  put "$w" CORS_ORIGIN "$APP_URL"
  put "$w" CORS_ORIGINS "$CORS_ALL"
  put "$w" FRONTEND_URL "$APP_URL"
  put "$w" LANDING_PAGE_URL "$APEX_URL"
  put "$w" AUTH_SERVICE_URL "$AUTH_URL"
  put "$w" PAYMENT_SERVICE_URL "$PAYMENTS_URL"
  put "$w" EMAIL_SERVICE_URL "$EMAIL_URL"
}

push_payment() {
  local w="classecon-payment${SUFFIX}"
  echo "[$w]"
  put "$w" DATABASE_URL "$DB_PAYMENT"
  put "$w" JWT_SECRET "$JWT_SECRET"
  put "$w" SERVICE_API_KEY "$SERVICE_API_KEY"
  put "$w" PAYMENT_SERVICE_API_KEY "$PAYMENT_SERVICE_API_KEY"
  put "$w" STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
  put "$w" STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"
  put "$w" STRIPE_PRICE_STARTER_MONTHLY "$STRIPE_PRICE_STARTER_MONTHLY"
  put "$w" STRIPE_PRICE_STARTER_YEARLY "$STRIPE_PRICE_STARTER_YEARLY"
  put "$w" STRIPE_PRICE_PROFESSIONAL_MONTHLY "$STRIPE_PRICE_PROFESSIONAL_MONTHLY"
  put "$w" STRIPE_PRICE_PROFESSIONAL_YEARLY "$STRIPE_PRICE_PROFESSIONAL_YEARLY"
  put "$w" STRIPE_PRICE_SCHOOL_MONTHLY "$STRIPE_PRICE_SCHOOL_MONTHLY"
  put "$w" STRIPE_PRICE_SCHOOL_YEARLY "$STRIPE_PRICE_SCHOOL_YEARLY"
  put "$w" STRIPE_COUPON_FOUNDING "$STRIPE_COUPON_FOUNDING"
  put "$w" NODE_ENV production
  # If Stripe keys are still placeholders, run in mock mode so the service
  # can start up. Flip to "stripe" after filling in real keys.
  if [[ "$STRIPE_SECRET_KEY" == *REPLACE* ]]; then
    put "$w" BILLING_MODE mock
  else
    put "$w" BILLING_MODE stripe
  fi
  put "$w" BACKEND_URL "$API_URL"
  put "$w" BACKEND_API_KEY "$PAYMENT_SERVICE_API_KEY"
  put "$w" FRONTEND_URL "$APP_URL"
  put "$w" ADMIN_URL "$ADMIN_URL"
  put "$w" CORS_ORIGINS "$CORS_ALL"
}

push_email() {
  local w="${1:-classecon-email${SUFFIX}}"
  echo "[$w]"
  put "$w" MONGODB_URI "$DB_EMAIL"
  put "$w" MONGODB_DB_NAME email_service
  put "$w" SERVICE_TOKEN "$EMAIL_SERVICE_TOKEN"
  put "$w" ADMIN_TOKEN "$EMAIL_ADMIN_TOKEN"
  put "$w" WEBHOOK_SECRET "$EMAIL_WEBHOOK_SECRET"
  put "$w" UNSUBSCRIBE_HMAC_SECRET "$UNSUBSCRIBE_HMAC_SECRET"
  # EmailService validates env at startup and exits if neither a working SMTP
  # host nor a Resend API key is configured. If the operator hasn't filled in
  # a real Resend key yet, push a non-placeholder stub so the container can
  # start and pass its health check. Actual sending will fail until a real
  # key is pushed, which is acceptable for initial smoke tests.
  if [[ -z "$RESEND_API_KEY" || "$RESEND_API_KEY" == *REPLACE* ]]; then
    put "$w" RESEND_API_KEY "re_smoketest_placeholder_not_for_sending"
  else
    put "$w" RESEND_API_KEY "$RESEND_API_KEY"
  fi
  put "$w" FROM_EMAIL "$FROM_EMAIL"
  put "$w" EMAIL_TRANSPORT resend
  put "$w" NODE_ENV production
  put "$w" APP_URL "$APP_URL"
  put "$w" ALLOWED_REDIRECT_ORIGINS "$CORS_ALL"
}

case "${1:-all}" in
  auth|auth-service) push_auth ;;
  backend) push_backend ;;
  payment|payment-service) push_payment ;;
  email|email-service) push_email "classecon-email${SUFFIX}" ;;
  email-worker|email-service-worker) push_email "classecon-email-worker${SUFFIX}" ;;
  all)
    push_auth
    push_email "classecon-email${SUFFIX}"
    push_email "classecon-email-worker${SUFFIX}"
    push_payment
    push_backend
    ;;
  *)
    echo "Unknown target: $1" >&2
    echo "Valid: auth | backend | payment | email | email-worker | all" >&2
    exit 1
    ;;
esac

echo "Done (env=$ENV_NAME)."
