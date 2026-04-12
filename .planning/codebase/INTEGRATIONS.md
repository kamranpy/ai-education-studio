# External Integrations

**Analysis Date:** 2026-04-12

## APIs & External Services

**Email Providers:**
- Postmark - Email delivery (`config/services.php`)
  - Auth: `POSTMARK_API_KEY`
- Resend - Email delivery (`config/services.php`)
  - Auth: `RESEND_API_KEY`
- AWS SES - Email delivery (`config/services.php`)
  - Auth: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`

**Messaging:**
- Slack - Notifications (`config/services.php`)
  - Auth: `SLACK_BOT_USER_OAUTH_TOKEN`
  - Config: `SLACK_BOT_USER_DEFAULT_CHANNEL`

## Data Storage

**Databases:**
- SQLite (Default)
  - Connection: `DB_CONNECTION=sqlite` in `.env`
  - Client: Eloquent ORM

**File Storage:**
- Local filesystem only (Default)
  - Configured via `FILESYSTEM_DISK=local` in `.env`

**Caching:**
- Database (Default)
  - Configured via `CACHE_STORE=database` in `.env`
  - Redis available via `phpredis` extension (`REDIS_CLIENT=phpredis`)

## Authentication & Identity

**Auth Provider:**
- Custom / Laravel Fortify
  - Implementation: Headless authentication backend via `laravel/fortify`
  - Session Driver: `database` (`SESSION_DRIVER=database` in `.env`)

## Monitoring & Observability

**Error Tracking:**
- None explicitly configured in core stack

**Logs:**
- Stack channel (single file)
  - Configured via `LOG_CHANNEL=stack` in `.env`

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured (Standard Laravel deployment)

**CI Pipeline:**
- None explicitly configured, but `ci:check` script exists in `composer.json` running lint, format, types, and tests.

## Environment Configuration

**Required env vars:**
- `APP_KEY`
- `DB_CONNECTION`
- `VITE_APP_NAME`

**Secrets location:**
- Stored in `.env` file (not committed to version control)

## Webhooks & Callbacks

**Incoming:**
- None explicitly detected

**Outgoing:**
- None explicitly detected

---

*Integration audit: 2026-04-12*