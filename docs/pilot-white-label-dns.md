# Pilot white-label: DNS, Host → tenant, and env

There is **no** `publicInventoryController` in this repo. Inventory APIs live under `/inventory` and require auth + tenant context (JWT / tenant middleware). **Public** white-label surfaces today are:

1. **Branding** — `GET /public/branding`
2. **Quick appraisal (trade-in estimate)** — `POST /public/quick-appraisal`, `GET /public/quick-appraisal/:id`

## How Host maps to a tenant

Both flows resolve the dealer tenant using **`Tenant.customDomain`** (normalized hostname, no port, lowercased).

### `publicBrandingController.getPublicBranding`

Resolution order:

1. Query `?domain=dealer.example.com` (optional override for local testing).
2. Header `X-Forwarded-Host` (first hop if present).
3. Header `Host`.

Then `findTenantByCustomDomain(host)` looks up `tenant.customDomain === host`.

### `publicAppraisalController` (quick appraisal)

Resolution order:

1. Query `?tenantId=<cuid>` (explicit pilot / tooling).
2. Same Host / `X-Forwarded-Host` path as branding → `findTenantByCustomDomain`.
3. Fallback env `PUBLIC_APPRAISAL_TENANT_ID` when the host is not a custom domain (e.g. shared marketing domain).

## DNS for pilots

For `dealer.example.com` (customer site) and optionally `crm.dealer.example.com`:

1. Set **`Tenant.customDomain`** in the database to the **exact** hostname the browser uses (e.g. `dealer.example.com`), matching normalization (no scheme, no path, no port).
2. **CNAME** (or A/AAAA) `dealer.example.com` → your web front door (Vercel/Fly/Railway/etc.).
3. Ensure the edge/proxy forwards **`Host`** and, if TLS terminates at the edge, sets **`X-Forwarded-Host`** to the original hostname so the API sees the dealer domain when web/CRM call `GET /public/branding`.

## Environment variables (summary)

| Variable | Role |
|----------|------|
| `PUBLIC_APPRAISAL_TENANT_ID` | Default tenant for quick appraisal when Host does not match any `customDomain`. |
| `NEXT_PUBLIC_API_URL` | Same API origin on **web** and **crm** so branding and public routes hit the correct backend. |
| `CORS_ORIGIN` | API: comma-separated allowed origins for web + CRM + pilot domains (required in production for a tight policy). |

## Related code

- `apps/api/src/controllers/publicBrandingController.ts` — Host / `?domain=` → branding.
- `apps/api/src/controllers/publicAppraisalController.ts` — Host / `?tenantId=` / `PUBLIC_APPRAISAL_TENANT_ID` → quick appraisal.
- `apps/api/src/lib/tenant.ts` — `normalizeHost`, `findTenantByCustomDomain`.
