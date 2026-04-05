# VEX — Vortex Exotic Exchange

Luxury automotive marketplace: customer-facing site, build-your-own configurator, CRM, and full deal flow (inventory, financing, shipping, trade-in).

## Run every command from the repo root

**`pnpm`, `turbo`, and workspace filters only work after `cd` into this repository** (e.g. `~/Documents/vex-website`). Running from your home directory (`~`) causes `ERR_PNPM_NO_PKG_MANIFEST`, missing `package.json`, and cascading exit code 1/2 failures — not Prisma or 3D code.

```bash
cd ~/Documents/vex-website   # or: cd /path/to/your/vex-website
```

## Start Here

- **Project command center:** [PROJECT_SPACE.md](PROJECT_SPACE.md)

## Docs

- **Elite digital presence v2.0 (Crown Jewel Protocol — full wireframes, paths, Gantt, Quantum tier):** [docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md](docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md)
- **Elite v2 summary (quick checklist):** [docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md](docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md)
- **Apex Studio — `/build` configurator expansion (v2.1):** [docs/plans/2026-04-05-vex-apex-studio-configurator-v1.0.md](docs/plans/2026-04-05-vex-apex-studio-configurator-v1.0.md)
- **Elite digital presence v1 + WebGL gate / §21+ (operational detail):** [docs/plans/2026-04-04-vex-ELITE-DIGITAL-PRESENCE-v1.md](docs/plans/2026-04-04-vex-ELITE-DIGITAL-PRESENCE-v1.md)
- **Design:** [docs/plans/2025-03-15-vex-luxury-marketplace-design.md](docs/plans/2025-03-15-vex-luxury-marketplace-design.md)
- **Implementation plan:** [docs/plans/2025-03-15-vex-luxury-marketplace-implementation.md](docs/plans/2025-03-15-vex-luxury-marketplace-implementation.md) (includes **Digital Presence v2 — Cinematic Layer**)
- **Digital presence v2 (elite framework):** [docs/plans/2026-04-05-vex-DIGITAL-PRESENCE-v2-ELITE.md](docs/plans/2026-04-05-vex-DIGITAL-PRESENCE-v2-ELITE.md)
- **Moat expansion (luxury vs legacy DMS giants):** [docs/plans/2026-04-05-vex-moat-expansion.md](docs/plans/2026-04-05-vex-moat-expansion.md)
- **Shader moat (GLSL + WebGPU roadmap):** [docs/plans/2026-04-05-vex-shader-moat-expansion.md](docs/plans/2026-04-05-vex-shader-moat-expansion.md)
- **Site generation v3 (WebGPU strategy):** [docs/plans/2026-04-05-vex-website-generation-v3.md](docs/plans/2026-04-05-vex-website-generation-v3.md)

### v4.2 — Full advanced GLSL Apex integration + quality gate fixed

- **Live stack:** Thin-film analytic + **256×1 spectral LUT** (`uIridescenceLUT` / `iridescenceLUTBlend`), 3D flake fbm, clear-coat dual lobe + refraction term, anisotropic chrome; **mouse** uniform on hero + configurator; **Apex** scroll/god-rays/particles unchanged; **primary CTA** optional burst pulse while hovered (Apex).
- **Configure:** All uniforms on glass sliders; **exploded** mode enables **pointer raycast** mesh highlight (`ExplodedRaycastHighlight` in `@vex/ui/3d`). **Smoke contract:** `<button data-save-garage="1">`, `<button data-exploded-view>Exploded view</button>` — no longer clipped by outer `overflow: hidden` on `/configure`.
- **KPI targets (hypothesis):** hero dwell +75%; configurator depth 5.5×; CTA→Stripe 3.2×; white-label velocity 8×; **Cinematic Apex GLSL Ultra** tier — see [v4.2 narrative](docs/internal/vex-cinematic-investor-narrative-v4.2.md).
- **Hero entry:** dynamic import via `ApexHeroScene.tsx` (re-export of `VortexHeroScene`).
- **Dev:** `pnpm dev:apex-v42` — `NEXT_PUBLIC_CINEMATIC_SHADERS_V3=true` (full shader path). For **Apex + Mode + particles**, use `pnpm dev:glsl-apex`.
- **Build:** `pnpm glsl:apex-v42` or `pnpm cinematic:apex-v42` (Turbo tasks → `@vex/web` next build).
- **Docs:** [docs/plans/2026-04-05-vex-cinematic-apex-v4.md](docs/plans/2026-04-05-vex-cinematic-apex-v4.md) (v4.2 + quality gate section) · [internal v4.2 narrative](docs/internal/vex-cinematic-investor-narrative-v4.2.md).

### v4.4 — The engagement electrification layer (tenant uniforms + hero ramp)

- **White-label engine:** `@vex/shared` **`tenantCinematicUniformPatch`** + **`TenantCinematic3d`** (adds optional **`environmentMapURL`**) → **`CinematicCarViewer`** (`environmentPreset` / HDR) + **`VortexHeroBrand`** (`cinematicUniforms`, **`environmentMapURL`**). Demo map: `resolveTenantCinematic3d` in `apps/web/src/lib/tenantConfigureAssets.ts`.
- **Hero:** Particle **VEX** vortex (formation on load), **Apex** scroll → god-rays / bloom / speed streaks, **LiquidMetalCTA** burst; **rim light** intensity follows scroll boost + pointer. **Lenis** + GSAP remain in app shell (`CinematicMotionProvider` / hero orchestration).
- **KPI targets (hypothesis):** hero dwell **+85%**; configurator **6.5×**; CTA → Stripe **3.8×**; white-label velocity **10×** vs legacy DMS; **Cinematic Apex GLSL Ultra** tier — **custom flake textures**, **iridescence presets**, **dealer-specific HDRIs**, **compute-particle showroom floors** (roadmap); investor framing: [v4.2 narrative](docs/internal/vex-cinematic-investor-narrative-v4.2.md).
- **Dev / build:** **`pnpm dev:apex-v44`** · **`pnpm cinematic:apex-v44`** / **`pnpm glsl:apex-v44`** (Turbo → `@vex/web` next build).
- **Docs:** [docs/plans/2026-04-05-vex-cinematic-apex-v4.md](docs/plans/2026-04-05-vex-cinematic-apex-v4.md) — **“Full engagement electrification layer (v4.4)”**.

### v4.3 — Advanced GLSL techniques (visual moat) + quality gate + configure CTA hooks

- **Shader suite:** **Belcour/Barla-style** cosine hue modulation on thin-film output; **diamond `pow(·,12)`** flake sparkle + **time/mouse twinkle**; **tangent × light** anisotropic spec on chrome; **fbm micro-perturbation** on clear-coat / env blend — see `@vex/cinematic` `IridescentPaintGLSL`, `MetallicFlakeLayer`, `AnisotropicChromeGLSL`, `MultiLayerClearCoat`, composed in `iridescentCarPaint.ts`.
- **Quality gate + configure:** **`[data-save-garage="1"]`** (`Save to My Garage`) and **`[data-exploded-view]`** (`Exploded View`) use **`glassmorphic`**, **`magnetic-cta`**, and CSS-module sizing (Tailwind-equivalent `px-8 py-4` / `px-6 py-3`); **`CinematicCarViewer`** `paintMode="cinematicLuxury"` + **`explodedInteractive`**. **`pnpm --filter @vex/web run quality:web`** must pass.
- **Mouse → shaders:** `CinematicMouseUniform` lerps R3F pointer into **`uMouseInfluence`** on the car root (hero + configurator) for iridescence + flake motion.
- **KPI targets (locked hypothesis):** hero dwell **+80%**; configurator engagement **6×**; magnetic CTA → Stripe session **3.5×**; white-label dealer velocity **9×** vs legacy DMS; **Cinematic Apex GLSL Ultra** — custom **flake textures**, **iridescence presets**, **dealer HDRIs** (roadmap); investor framing extends [v4.2 narrative](docs/internal/vex-cinematic-investor-narrative-v4.2.md).
- **Docs:** [docs/plans/2026-04-05-vex-cinematic-apex-v4.md](docs/plans/2026-04-05-vex-cinematic-apex-v4.md) — **v4.3** + **“Quality gate resolution + full advanced GLSL activation”**.

### Advanced GLSL shader exploration — the visual moat

- **`@vex/cinematic`** — Modular GLSL: thin-film iridescence (RGB optical-path phases), **3D fbm** metallic flake + high-exponent glints, **anisotropic chrome** (tangent-frame stretch × `anisotropyStrength`), **multi-layer clear-coat** (dual Fresnel + analytic warm/cool env blend × `clearCoatRefraction`). Injected via `onBeforeCompile` on `MeshPhysicalMaterial`; PBR base preserved.
- **Mouse uniform** — `CinematicMouseUniform` drives `uMouseInfluence` for iridescence + flake (hero + configurator).
- **Turbo:** `pnpm glsl:apex` — production web build through the `glsl:apex` task. **Dev:** `pnpm dev:glsl-apex` — `CINEMATIC_SHADERS_V3` + `CINEMATIC_APEX` + `CINEMATIC_MODE` for maximum cinematic stack locally.
- **Blueprint + log:** [docs/plans/2026-04-05-vex-cinematic-apex-v4.md](docs/plans/2026-04-05-vex-cinematic-apex-v4.md) (includes **Advanced GLSL exploration log**). Internal narrative: [docs/internal/vex-cinematic-investor-narrative-v4.1.md](docs/internal/vex-cinematic-investor-narrative-v4.1.md).

### Cinematic Apex v4.0 — the engagement electrification layer

- **What it is:** Scroll-orchestrated bloom + god-ray weight, particle “VEX” formation on load, velocity-driven speed streaks, and CTA-synced burst flash — wired through `@vex/ui/3d` `VortexHeroScene` + `useApexHeroOrchestration` in `apps/web`.
- **Run locally:** `pnpm dev:apex` from repo root (`NEXT_PUBLIC_CINEMATIC_SHADERS_V3` + `NEXT_PUBLIC_CINEMATIC_APEX`). Set `NEXT_PUBLIC_CINEMATIC_APEX=0` to disable Apex without losing GLSL paint.
- **Build task:** `pnpm cinematic:apex` (Turbo → `@vex/web` production build with the `cinematic:apex` pipeline).
- **Blueprint + KPI framing:** [docs/plans/2026-04-05-vex-cinematic-apex-v4.md](docs/plans/2026-04-05-vex-cinematic-apex-v4.md) · internal narrative: [docs/internal/vex-cinematic-investor-narrative-v4.md](docs/internal/vex-cinematic-investor-narrative-v4.md).

### WebGPU-powered cinematic engine (luxury moat)

- **`@vex/cinematic`** — GLSL `onBeforeCompile` iridescent / flake / clear-coat / chrome patches; `hasWebGPU()` / `WebGPUEngine` (WebGL2 renderer today; native WebGPU + TSL in Phase 2).
- **Configure:** `/configure` — live sliders → `cinematicUniforms` (flake, iridescence, clear-coat, chrome).
- **Env:** `NEXT_PUBLIC_CINEMATIC_SHADERS_V3` — set `0` to use standard PBR only (no custom fragment inject).

### Advanced GLSL shader engine — the visual moat

- **Modular GLSL:** `IridescentPaintGLSL`, `MetallicFlakeLayer`, `MultiLayerClearCoat`, `AnisotropicChromeGLSL` composed in `iridescentCarPaint.ts` — pixel control on WebGL2, ports to TSL later.
- **`VortexCarMaterialGLSL`** — declarative `applyCinematicLuxuryPaint` + `CinematicPaintTimeTicker` for hero / configurator GLTF.
- **Turbo:** `pnpm glsl:build` — same as web production build (shader strings ship with `@vex/cinematic` + Next).

### Investor + cinematic surfaces

- **Cinematic Hero Conversion Multiplier (hypothesis — measure before claiming):** Treat the **vortex** path (`DynamicHeroShell` → `ApexHeroScene` + **Apex Studio** `/build` 3D) as a **conversion multiplier** on **qualified** traffic: model **1.15–1.40×** improvement on hero→configurator steps vs a flat CSS-only baseline; **>1.45×** hero→studio and **>1.60×** studio→quote are **stretch lab targets** for Apex/Quantum GTM — validate with powered experiments only. See [v2.0 acceptance](docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md#performance-budgets--acceptance-criteria) and [Apex Studio plan](docs/plans/2026-04-05-vex-apex-studio-configurator-v1.0.md#monetization-tie-in-apex--quantum).
- **Why Apex Studio (investor collateral):** Named 3D configurator surface (`ApexStudioEngine` on `/build`) positions **Apex** tier as the **high-margin** cinematic SKU — export queues, tenant HDR parity, and CRM snapshot JSON (`getApexStudioSnapshot`) are the proof points for “digital twin factory,” not slide fiction.
- **Cinematic hero → conversion (legacy bullet):** Same framing as v2 summary — [monetization + hypothesis table](docs/plans/2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md#monetization-tiers-illustrative--product--gtm).
- **Primary investor preview:** the **cinematic homepage** at `/` — full-viewport `VortexHeroScene` (`@vex/ui/3d`) + liquid-metal CTAs + tenant-tinted particles/iridescent paint; best “live product” demo for decks and pilots (run `pnpm dev:web`, `pnpm dev:web:cinematic`, or `pnpm --filter @vex/web run dev:moat` from repo root).
- **Investor (lightweight):** [apps/web/src/app/investor/page.tsx](apps/web/src/app/investor/page.tsx) → `/investor` when deployed.
- **Investor deck:** `/investor-deck`.
- **Env toggles:** `apps/web/.env.local.example` — `NEXT_PUBLIC_CINEMATIC_HERO_V2`, `NEXT_PUBLIC_CINEMATIC_MODE` (see implementation plan).
- **Pitch deck route:** `/pitch` is not in this tree yet; use `/investor-deck` or add a `pitch` route when the deck is promoted to production.
- **Leads (SMS/email → CRM):** [docs/leads-webhooks.md](docs/leads-webhooks.md)
- **Pilot white-label (custom domain, DNS):** [docs/pilot-white-label-dns.md](docs/pilot-white-label-dns.md)
- **Shipping a pilot (overview):** [docs/SHIP.md](docs/SHIP.md)
- **Pilot ship runbook (ordered steps + branch protection):** [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md)
- **What’s already built vs. common gap myths:** [docs/ENGINEERING_REALITY.md](docs/ENGINEERING_REALITY.md)
- **Tenant isolation + RBAC notes:** [docs/TENANT_RBAC.md](docs/TENANT_RBAC.md)

## Repo structure

- **apps/api** — Node/Express API (auth, inventory, orders, etc.)
- **apps/web** — Next.js customer site (dark luxury theme)
- **apps/crm** — Next.js CRM for staff
- **packages/shared** — Shared TypeScript types and Zod schemas
- **packages/ui** — Shared UI primitives for web + CRM (`@vex/ui`); **elite** surfaces: `NeonCard`, `VortexButton` (alias of `LiquidMetalCTA`), `GlassKPI`, `Luxury3DCard`; **3D** entry: `@vex/ui/3d` (`VortexHeroScene`, `CinematicCarViewer`, post stack)
- **packages/cinematic** — Luxury car shaders (`@vex/cinematic`) consumed by `@vex/ui` `HeroGltfCar`

## Fresh clone: full build verification

After `pnpm install`, generate the Prisma client (required for `apps/api` TypeScript) and build everything:

```bash
pnpm install
pnpm --filter @vex/api run db:generate
pnpm -w turbo run build
```

If you add or change workspace packages, run `pnpm install` again so `pnpm-lock.yaml` stays in sync (CI may use a frozen lockfile).

## Prerequisites

- Node 20+
- pnpm (install globally: `npm install -g pnpm`, or use `npx pnpm` for every command)
- PostgreSQL (for API)

## Setup

1. **Install dependencies**

   If `pnpm` is not in your PATH, use `npx pnpm`:

   ```bash
   npx pnpm install
   ```

   Or after installing pnpm globally (`npm install -g pnpm`):

   ```bash
   pnpm install
   ```

2. **API**

   - Copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL` and `JWT_SECRET`.
   - Run migrations: `cd apps/api && npx prisma migrate deploy` (or `migrate dev` for a fresh DB).
   - Seed the database (admin user, sample vehicles, inventory): `cd apps/api && npx pnpm run db:seed` or `npx prisma db seed`.
   - Start API: `pnpm dev:api` (or `cd apps/api && npx tsx src/index.ts`)

3. **Shared package** (required before API or apps that use it)

   ```bash
   pnpm --filter @vex/shared build
   ```

4. **Customer site (web)**

   - Optional: add the VEX logo (no background) as `apps/web/public/vex-logo.png` for the header.
   - Start: `pnpm dev:web` → [http://localhost:3000](http://localhost:3000)
   - Cinematic tuning (stronger bloom / particles): `pnpm dev:web:cinematic` (root `package.json`)

5. **CRM** (staff only)

   - Set `NEXT_PUBLIC_API_URL` (and optionally `NEXT_PUBLIC_WEB_URL` for “View on site” links).
   - After seeding, sign in with **admin@vex.demo** or **staff@vex.demo** (password: `admin-vex-demo` — change in production).
   - Start: `pnpm dev:crm` → [http://localhost:3002](http://localhost:3002)

## Environment variables

| App   | Variable              | Description                    |
|-------|------------------------|--------------------------------|
| API   | `DATABASE_URL`         | PostgreSQL connection string (pooler or Accelerate) |
| API   | `DIRECT_DATABASE_URL`  | Direct Postgres URL for migrations / long scripts |
| API   | `REDIS_URL`              | Redis for BullMQ, cache, refresh tokens, rate limits |
| API   | `JWT_SECRET`           | Secret for signing JWTs         |
| API   | `PORT`                 | Server port (default 3001)      |
| API   | `CORS_ORIGIN`          | Allowed origin (e.g. http://localhost:3000) |
| Web   | `NEXT_PUBLIC_API_URL`  | API base URL (e.g. http://localhost:3001)   |
| Web   | `INTERNAL_PILOT_METRICS_KEY` | Same value as API — enables `/api/investor/pilot-network` (server proxy to `GET /dealer/pilots`). Optional locally; set in staging/prod for live pilot counters on `/investor` and `/investor-deck`. |
| Web   | `INTERNAL_API_URL` | Optional server-only API origin for that proxy (defaults to `NEXT_PUBLIC_API_URL`). |
| Web   | `NEXT_PUBLIC_SITE_URL` | Public site origin for metadata / Open Graph (e.g. https://your-domain.com). Falls back to `VERCEL_URL` on Vercel, else `http://localhost:3000`. |
| Web   | `NEXT_PUBLIC_HERO_VIDEO_URL` | Optional: looped hero background video URL (muted). Omit for gradient + 3D only. |
| Web   | `NEXT_PUBLIC_HERO_VIDEO_POSTER` | Optional: poster image for hero video. |
| CRM   | `NEXT_PUBLIC_API_URL`  | API base URL (same host as web in production). |
| CRM   | `NEXT_PUBLIC_WEB_URL`  | Customer site URL (for “View on site” links). |
| Ops   | `PILOT_VERIFY_API_URL`  | Deployed API origin for `pnpm run pilot:verify` ([docs/PILOT_SHIP.md](docs/PILOT_SHIP.md)). |
| Ops   | `PILOT_VERIFY_BRANDING_DOMAIN` | Optional: pilot `customDomain` to assert `GET /public/branding`. |

## Production deployment

- **API (Docker-first):** See [deploy/docker-compose.yml](deploy/docker-compose.yml), [deploy/.env.example](deploy/.env.example), and [deploy/README.md](deploy/README.md). With `NODE_ENV=production`, the process **exits on boot** if `CORS_ORIGIN` is empty or `*`, if `SKIP_VALUATION_ENV_CHECK` is set, or if valuation keys are missing — by design. Set `JWT_SECRET`, `REDIS_URL` (recommended), `PUBLIC_WEB_URL` (Stripe return URLs), and Stripe secrets if billing is live.
- **Next.js (web + CRM):** Run `apps/web` and `apps/crm` on a second platform (Vercel, Fly.io, Railway, etc.) with the **same** `NEXT_PUBLIC_API_URL` pointing at the API origin. Compose in this repo targets the API and backing services by design.
- **Pilot white-label (custom domain → tenant):** [docs/pilot-white-label-dns.md](docs/pilot-white-label-dns.md)
- **Full pilot checklist (ordered):** [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md). After the API is live, `PILOT_VERIFY_API_URL=… pnpm run pilot:verify` is the line between “builds” and “dealer-ready.”

## Pilot release gate

Follow [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md) end-to-end. Quick compile + DB isolation check:

```bash
pnpm -w turbo run build && pnpm --filter @vex/api run test:e2e
```

Or: `pnpm run release:pilot-check` (same commands). E2E needs a reachable Postgres (`DATABASE_URL`). For the **deployed** API, run `pnpm run pilot:verify` with `PILOT_VERIFY_API_URL` set.

## Quality gates

| Gate | What it proves |
|------|----------------|
| **GitHub: `ci / build-and-api-e2e`** (workflow `ci.yml`) | Postgres + migrate + full `turbo` build + tenant isolation E2E on every PR / `main` push. Set branch protection to **require** this check. |
| **`pnpm run ship:gate`** | Same sequence locally: `db:generate` → build → `migrate deploy` → `test:e2e` (appraisal + inventory isolation; needs `DATABASE_URL`). Not the same as `release:pilot-check` (build + E2E, no migrate). |
| **`pnpm run pilot:verify`** | Deployed API is reachable and healthy (`PILOT_VERIFY_API_URL`). Dealer-ready line — see [docs/PILOT_SHIP.md](docs/PILOT_SHIP.md). |

## Scripts (from repo root)

Use `pnpm` or `npx pnpm` if pnpm isn’t installed globally:

| Command | Description |
|---------|--------------|
| `pnpm dev:api` or `npx pnpm run dev:api` | Start API on port 3001 |
| `pnpm dev:web` or `npx pnpm run dev:web` | Start customer site on 3000 |
| `pnpm dev:crm` or `npx pnpm run dev:crm` | Start CRM on 3002 |
| `pnpm build` or `npx pnpm run build` | Build all packages |
| `pnpm run release:pilot-check` | Turbo build + appraisal E2E (needs `DATABASE_URL`) |
| `pnpm run ship:gate` | Generate + build + migrate + appraisal E2E — same bar as CI ([docs/PILOT_SHIP.md](docs/PILOT_SHIP.md)) |
| `pnpm run pilot:verify` | After API is deployed: set `PILOT_VERIFY_API_URL`, then run ([docs/PILOT_SHIP.md](docs/PILOT_SHIP.md) Step 5) |
| `pnpm run git:save -- "type: message"` | Stage all, commit, push current branch (default message if omitted). Use `GIT_SAVE_MSG` or pass a message after `--`. |
| `pnpm run git:save:verify -- "type: message"` | Run `pnpm -w turbo run build`, then same as `git:save` (recommended before sharing). |
| `cd apps/api && pnpm run db:seed` or `npx prisma db seed` | Seed DB (admin, vehicles, inventory) |

## Logo

Place your **VEX logo (no background)** at `apps/web/public/vex-logo.png`. The header will use it; if the file is missing, the text “VEX” is shown as fallback.


## Valuation API cost model
- Pro/Enterprise tiers include API-powered appraisals.
- Daily guardrail: max `$5/day` external valuation spend per tenant before fallback/manual flow.
- Cached valuations (24h TTL) reduce duplicate API calls and cost.

## Billion-scale operations (targets)
- **Cost / MRR**: target **~$0.02/tenant/month** at 100k tenants via PgBouncer/Accelerate-style pooling, Redis cache-aside, BullMQ async work, and read replicas (`READ_REPLICA_URLS` for future read routing).
- **Infra**: `DIRECT_DATABASE_URL` for migrations when `DATABASE_URL` uses a pooler or Prisma Accelerate; `REDIS_URL` for queues, refresh tokens, JWT denylist, and rate limits; optional `OTEL_EXPORTER_OTLP_ENDPOINT` for traces.
- **Partitioning / cron**: declarative Postgres partitions and `pg_cron` retention are documented in `apps/api/prisma/sql/` (ops-applied).
- **Verification**: `pnpm --filter @vex/api run test:e2e`, `pnpm --filter @vex/api run load-test:scale`, `GET /metrics` (Prometheus).

## Investor sharing links
- **Primary story asset:** production `/` — cinematic luxury hero + conversion funnel (position vs Dealertrack/Cox as the beautiful front-end layer).
- Live MRR dashboard URL: `https://app.vex.example/admin` (replace with your production domain).
- Pilot signup link: `https://app.vex.example/pilot` (replace with your production domain).
- Live seed metrics dashboard URL: `https://app.vex.example/seed-metrics` (replace with your production domain).
- Enterprise pilot signup link: `https://app.vex.example/pilot?segment=enterprise` (replace with your production domain).
- Live SOC2 status: `https://app.vex.example/compliance/soc2-report` (replace with your production domain).
- Live MRR dashboard URL: `https://app.vex.example/admin/mrr` (replace with your production domain).
- Secure investor data-room URL: `https://app.vex.example/capital` (replace with your production domain).
- Scaling dashboard URL: `https://app.vex.example/scaling` (replace with your production domain).
- Secure investor CRM URL: `https://app.vex.example/raise/series-a` (replace with your production domain).
- Forecasting suite URL: `https://app.vex.example/forecasting` (replace with your production domain).
- Autonomous operations dashboard URL: `https://crm.vex.example/autonomous` (replace with your production domain).
- Exit readiness dashboard URL: `https://app.vex.example/raise/exit` (replace with your production domain).
