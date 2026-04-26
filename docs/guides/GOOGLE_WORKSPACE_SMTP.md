# Google Workspace SMTP for EmailService

ClassEcon’s **EmailService** sends mail through Nodemailer. You can use Google Workspace in either of these ways:

1. **Authenticated mailbox** — `smtp.gmail.com` with the Workspace user and an **App Password**.
2. **SMTP relay (IP-based)** — `smtp-relay.gmail.com` with your server’s **public IP allowlisted** in Admin; **no** SMTP username/password in `.env`.

Official reference: [Route outgoing SMTP relay messages through Google](https://support.google.com/a/answer/2956491).

## Shared steps

1. **DNS** — In Google Admin, turn on **SPF** / **DKIM** (and ideally **DMARC**) for `classecon.net` so OTP and list mail are less likely to land in spam.
2. **EmailService** — Set `EMAIL_TRANSPORT=smtp` (or `auto` without `RESEND_API_KEY` so SMTP is chosen).
3. **From address** — Set `FROM_EMAIL` to an address you are allowed to send as (for example `hello@classecon.net`). For relay, that address must still be valid for your domain per your relay rules in Admin.
4. **Backend** — Set `EMAIL_SERVICE_URL` and `EMAIL_SERVICE_TOKEN` to match this service (`SERVICE_TOKEN` in EmailService). See `Backend/.env.example`.

## Option A: `smtp.gmail.com` + App Password

Use this when the service authenticates **as a mailbox** (good for development, small volume, or when you do not have a static egress IP for relay).

### Google Admin / account

1. Sign in to Google Admin as a super admin.
2. Ensure **2-Step Verification** is enabled for the sending account (`hello@classecon.net`) if you use App Passwords (Google requires this for app passwords on consumer-style flows; Workspace policies may restrict app passwords — check **Security** → **Authentication** → **App passwords** or your admin policy).
3. Create an **App Password** for the account (Google Account → Security → App passwords, or Admin-controlled equivalent).

### EmailService `.env`

```env
EMAIL_TRANSPORT=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hello@classecon.net
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_REJECT_UNAUTHORIZED=true
FROM_EMAIL=hello@classecon.net
```

Leave `RESEND_API_KEY` unset if you want `auto` to use SMTP only.

## Option B: SMTP relay (IP-based) — `smtp-relay.gmail.com`

Use this for **servers with a fixed public outbound IP** (typical production VM, NAT gateway, or Railway/static egress if available). Google accepts mail from that IP **without** SMTP AUTH, per your relay policy.

### Google Admin

1. **Admin console** → **Apps** → **Google Workspace** → **Gmail** → **Routing** (or **Default routing** / **SMTP relay service** depending on UI version).
2. Add an **SMTP relay service** rule:
   - **Allowed senders**: e.g. only addresses in your domain, or the pattern your app uses.
   - **Authentication**: choose **Only accept mail from the specified IP addresses** and add your EmailService host’s **public egress IP** (the IP Google sees when the app connects outbound).
   - If the UI offers **Require SMTP Authentication** for some paths, leave that disabled for the IP-only policy (per Google’s “printer, scanner, or app” / relay documentation).
3. Save and allow a few minutes for propagation.

### EmailService `.env`

**Do not** set `SMTP_USER` or `SMTP_PASS` (leave them empty). The app sends with **no** SMTP `AUTH`, which matches IP-based relay.

```env
EMAIL_TRANSPORT=smtp
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_REJECT_UNAUTHORIZED=true
FROM_EMAIL=hello@classecon.net
```

Google also documents ports **25** and **465** for relay; **587** with STARTTLS is the usual choice for application code.

### Caveats

- **Dynamic IPs** (home ISP, many PaaS without static egress) will break IP allowlisting. Use Option A or a static egress / VPN endpoint.
- **Volume and policy** — Relay policies and sending limits are governed by Workspace; review Google’s limits and your compliance needs.

## Verify

1. Start EmailService and the worker (`pnpm dev` / `pnpm worker:dev` or your process manager).
2. Trigger a flow that sends mail (password reset, 2FA, or a test mutation from GraphQL with `x-service-token`).
3. Check Mailgun-style logs in your app and the recipient inbox (and spam folder first time).

## Resend webhooks vs SMTP

Bounce/complaint **webhooks** in this repo are oriented toward **Resend**. If you use **only** SMTP + Google, suppression on bounces may not mirror Resend’s webhook behavior unless you add separate handling. For production deliverability monitoring, consider Google’s Postmaster Tools and Workspace logs alongside your app logs.
