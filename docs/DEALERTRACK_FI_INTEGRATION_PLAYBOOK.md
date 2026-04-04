# Dealertrack F&I Integration Playbook

## 1) Cox/OpenTrack partner + sandbox setup

- Register partner account at `https://developer.coxautoinc.com/`.
- Request OpenTrack F&I / Digital Retailing sandbox credentials.
- Configure:
  - `DEALERTRACK_CLIENT_ID`
  - `DEALERTRACK_CLIENT_SECRET`
  - `DEALERTRACK_SUBSCRIPTION_ID`
  - `DEALERTRACK_TOKEN_URL`
  - `DEALERTRACK_API_BASE_URL`
  - `DEALERTRACK_WEBHOOK_SECRET`
- Keep `DEALERTRACK_SANDBOX=true` until production onboarding.

## 2) Token smoke test

- Command:
  - `pnpm --filter @vex/api exec tsx -e "import('./src/lib/dealertrack.ts').then(async (m) => { console.log(await m.getDealertrackToken()); })"`
- Success criteria:
  - command returns a non-empty bearer token.

## 3) F&I sync flow

- Outbound credit application push:
  - `POST /integrations/dealertrack-fi/credit-app-sync`
  - queued job: `dealertrack-credit-app-sync`
- Outbound finance quote push:
  - `POST /integrations/dealertrack-fi/finance-quote-sync`
  - queued job: `dealertrack-finance-quote-sync`

Expected data trail:

- `IntegrationLog` rows for `fi.credit_app_sync.requested`, `fi.credit_application.sync`, `fi.finance_quote_sync.requested`, `fi.finance_quote.sync`.
- `ExternalSync` rows keyed by `(tenantId, externalId, entityType)`.

## 4) Webhook + deal jacket flow

- Endpoint:
  - `POST /integrations/webhooks/dealertrack`
- Signature:
  - verified with `DEALERTRACK_WEBHOOK_SECRET`
- Idempotency:
  - dedupe via integration log composite key + queue job IDs.

## 5) Pilot KPI slice

- `dealertrack_fi_sync_success_rate_24h`
- `dealertrack_fi_sync_failures_24h`
- `dealertrack_credit_apps_queued`
- `dealertrack_finance_quotes_queued`
- `dealertrack_webhook_duplicates_24h`

## 6) Day-14 pilot acceptance gate

- Token retrieval succeeds in sandbox.
- 1 credit app sync and 1 finance quote sync complete.
- 1 inbound webhook accepted + replay deduped.
- All writes remain tenant-scoped and RBAC-protected.