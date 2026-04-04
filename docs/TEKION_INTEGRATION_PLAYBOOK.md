# Tekion Integration Playbook

## 1) APC partner + sandbox setup

- Register ISV/Strategic Partner account at `https://apc.tekioncloud.com`.
- Request sandbox access + OAuth credentials.
- Configure:
  - `TEKION_CLIENT_ID`
  - `TEKION_CLIENT_SECRET`
  - `TEKION_SUBSCRIPTION_ID`
  - `TEKION_TOKEN_URL`
  - `TEKION_API_BASE_URL`
  - `TEKION_WEBHOOK_SECRET`
- Keep `TEKION_SANDBOX=true` until production onboarding.

## 2) Token smoke test

- Command:
  - `pnpm --filter @vex/api exec tsx -e "import('./src/lib/tekion.ts').then(async (m) => { console.log(await m.getTekionToken()); })"`
- Success criteria:
  - command returns a non-empty bearer token.

## 3) Inventory + appraisal sync flow

- Outbound inventory push:
  - `POST /integrations/tekion-inventory/sync`
  - queued job: `tekion-inventory-sync`
- Outbound appraisal push:
  - `POST /integrations/tekion-inventory/appraisal-push`
  - queued job: `tekion-appraisal-push`

Expected data trail:

- `IntegrationLog` rows for `inventory.sync.requested`, `inventory.sync`, `appraisal.push.requested`, `appraisal.push`.
- `ExternalSync` rows keyed by `(tenantId, externalId, entityType)`.

## 4) Webhook ingest flow

- Endpoint:
  - `POST /integrations/webhooks/tekion`
- Signature:
  - verified with `TEKION_WEBHOOK_SECRET`
- Idempotency:
  - dedupe via integration log composite key + queue job IDs.

## 5) Pilot KPI slice

- `tekion_sync_success_rate_24h`
- `tekion_sync_failures_24h`
- `tekion_inventory_jobs_queued`
- `tekion_appraisal_jobs_queued`
- `tekion_webhook_duplicates_24h`

## 6) Day-14 pilot acceptance gate

- Token retrieval succeeds in sandbox.
- 1 inventory sync and 1 appraisal push complete.
- 1 inbound webhook accepted + replay deduped.
- All writes remain tenant-scoped and RBAC-protected.