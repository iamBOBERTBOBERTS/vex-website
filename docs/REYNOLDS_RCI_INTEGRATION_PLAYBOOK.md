# Reynolds RCI Integration Playbook

## 1) RCI certification + sandbox setup

- Submit RCI Participant Interest Form:
  - `https://www.reyrey.com/company/reynolds-data-management/rci-information-request`
- Complete certification and data-component approval.
- Configure:
  - `REYNOLDS_CLIENT_ID`
  - `REYNOLDS_CLIENT_SECRET`
  - `REYNOLDS_SUBSCRIPTION_ID`
  - `REYNOLDS_TOKEN_URL`
  - `REYNOLDS_API_BASE_URL`
  - `REYNOLDS_WEBHOOK_SECRET`
- Keep `REYNOLDS_SANDBOX=true` until production cutover.

## 2) Token smoke test

- Command:
  - `pnpm --filter @vex/api exec tsx -e "import('./src/lib/reynolds.ts').then(async (m) => { console.log(await m.getReynoldsToken()); })"`
- Success criteria:
  - command returns a non-empty bearer token.

## 3) Inventory + appraisal sync flow

- Outbound inventory push:
  - `POST /integrations/reynolds-inventory/sync`
  - queued job: `reynolds-inventory-sync`
- Outbound appraisal push:
  - `POST /integrations/reynolds-inventory/appraisal-push`
  - queued job: `reynolds-appraisal-push`

Expected data trail:

- `IntegrationLog` rows for `inventory.sync.requested`, `inventory.sync`, `appraisal.push.requested`, `appraisal.push`.
- `ExternalSync` rows keyed by `(tenantId, externalId, entityType)`.

## 4) Spark AI webhook ingest flow

- Endpoint:
  - `POST /integrations/webhooks/reynolds`
- Signature:
  - verified with `REYNOLDS_WEBHOOK_SECRET`
- Idempotency:
  - dedupe via integration log composite key + queue job IDs.

## 5) Pilot KPI slice

- `reynolds_sync_success_rate_24h`
- `reynolds_sync_failures_24h`
- `reynolds_inventory_jobs_queued`
- `reynolds_appraisal_jobs_queued`
- `reynolds_webhook_duplicates_24h`

## 6) Day-14 pilot acceptance gate

- Token retrieval succeeds in sandbox.
- 1 inventory sync and 1 appraisal push complete.
- 1 inbound webhook accepted + replay deduped.
- All writes remain tenant-scoped and RBAC-protected.