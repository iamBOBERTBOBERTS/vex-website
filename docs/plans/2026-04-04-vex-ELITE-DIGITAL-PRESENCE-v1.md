# VEX Elite Digital Presence v1 — North Star & Execution Plan

**Date:** 2026-04-04 (updated live snapshot)  
**Branch:** `elite-digital-presence-v1` (from `cursor/pilot-appraisal-loop` @ `1e84177`)  
**Status:** Active blueprint + **live partial implementation** (see §0). **Single source of truth (numbered corpus):** **§0–§30** — **VLR** halt, live snapshot (§0), perf + luxury UX (§21+), revenue + investor (§26–27), **Cox gap** (§28), **local machine autonomy** (§29), **Resource Arsenal + production-rate firepower** (§30). **Crown Jewel expanded spec:** [2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md](2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md); short checklist: [2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md](2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md). This file remains the **WebGL gate + perf budget** detail (§21+).

**Reality check:** The items below describe the **target experience** plus **what is already shipped**. Shipping requires multiple sprints: 3D performance budgets, asset pipelines, a11y fallbacks, and load testing. Each phase must pass `pnpm -w turbo run build` and scoped quality gates.

---

## VLR — Vault Launch Ready (official shippable halt)

**Owner halt command:** When every criterion your pilot **actually requires** in the four pillars below is **green on `main`**, declare: **“VAULT LAUNCH READY — PROJECT HALT. DEPLOY PREVIEW INITIATED.”**

**Canonical hero architecture (do not reinterpret):** The **WebGL hypercar vault** is **`DynamicHeroShell` → `ApexHeroScene` / `VortexHeroScene`** when **`NEXT_PUBLIC_ENABLE_HERO_WEBGL=true`** and **`useHeroWebglDisplayMode()`** resolves **`vortex`**. **`HeroCinematicLayer` is video-only** (legacy path). Mounting a **second** R3F `<Canvas>` inside **`HeroCinematicLayer`** is **out of scope for VLR** — it **duplicates** the gate, **doubles** GPU cost, and **conflicts** with §21. Narrative “vault in HeroCinematicLayer” = **product language**; **code** stays as shipped.

### Pillar 1 — Cinematic hero + configurator supremacy

| Criterion | Where it lives | VLR note |
|-----------|----------------|----------|
| R3F vault + particles ≤512 + cinematic post | **`vortex`** path: `ApexHeroScene`, `ParticleVortex` + `VortexBurstParticles` (shared **512** cap via `@vex/3d-configurator`), `VortexPostFXStack`, `useApexHeroOrchestration` | **Forward** `EffectComposer` + **highlight-weighted bloom** + **violet–gold `LensFlare`**; **true MRT / `SelectiveBloom` deferred pass** = optional profiling upgrade (§21) |
| Legacy + a11y | **`DealerProgramHero`**, **`HeroCinematicLayer`**, static fallbacks | Pristine video + CSS sheen; reduced motion |
| Configurator + flagship asset | **`ConfiguratorVehicleCanvas`**, **`/configure`**, **`/build`** (Apex Studio shell) | Real-time finish / material class swaps + pricing UX per product spec |
| Lighthouse **`/`** ≥ **98** perf + a11y | **Stretch / lab** | **CI merge bar** remains **0.8** perf / **0.9** a11y (`lighthouserc.json`). **98+ with live WebGL** is **not** currently asserted in automation — treat as **post-tuning** or **static-first** hero experiment before claiming VLR on this row |
| **60 fps** | Manual Chrome Performance + devices | Target, not CI-enforced |

### Pillar 2 — Enterprise backend + CRM cockpit

| Criterion | VLR note |
|-----------|----------|
| Tenant-scoped API + RBAC | Required for production pilot; verify with `ship:gate` + route audits (`AGENTS.md`) |
| Stripe Checkout + **verified** webhooks | Idempotent handlers; no client-trusted prices |
| BullMQ (PDF, 3D / demo asset jobs) | Queue specs in `@vex/shared`; workers wired per env |
| CRM glass + appraisal → PDF | Parity with marketing void; pipeline live for pilot tenants |
| **90 s** self-serve onboarding + branded 3D demo seed | Idempotent provision + audit (`§16` / revenue engine) |

### Pillar 3 — CI/CD + operational excellence

| Criterion | VLR note |
|-----------|----------|
| **`ci.yml`**, **`quality.yml`**, **`build-stability.yml`**, **`deploy-prod.yml`** | All **green** on **`main`** |
| **`pnpm -w turbo run build`**, **`quality:web`**, API **E2E** | As defined in repo; DB-backed gates need `DATABASE_URL` / CI Postgres |
| **Render / Vercel** (or chosen host) | Config files committed + **smoke** deploy verified |

### Pillar 4 — Single source of truth + investor magnet

| Criterion | VLR note |
|-----------|----------|
| **This file** §0–§30 + **VLR** | Locked blueprint through **§30** (Resource Arsenal + firepower doctrine); component tree §23, perf §21, revenue §26–§27, Cox §28, autonomy §29 |
| **Cross-links** | `README.md`, `AGENTS.md`, `PROJECT_SPACE.md`, `docs/SHIP.md` → v1 plan; other docs on touch (§25) |
| Investor / deck / MRR preview routes | **Live + shareable** for pilot narrative |

**Honest status:** The repo **does not** currently satisfy every stretch row (e.g. **Lighthouse 98** with **full WebGL hero**, **deferred** pipeline, **all** BullMQ + CRM cinematic items) **simultaneously**. Use this section as the **checklist**; issue **VLR** only when **your** required rows are objectively green.

---

## 0. Live implementation snapshot (apps/web + packages)

| Area | What is live now |
|------|------------------|
| **`DynamicHeroShell`** | **`legacy`** → `DealerProgramHero`; **`vortex`** → `ApexHeroScene` / R3F vault (**`NEXT_PUBLIC_ENABLE_HERO_WEBGL`** + eligibility). Single Canvas — **not** inside `HeroCinematicLayer`. |
| **`HeroCinematicLayer`** | Optional **MP4/WebM** background when `NEXT_PUBLIC_HERO_VIDEO_URL` is set; **off** when `prefers-reduced-motion: reduce` or URL unset. **Not** WebGL. |
| **`DealerProgramHero`** | Full hero: ambient + overlay + vignette + **CSS vault sheen** (violet/gold blur, GPU `transform`, respects reduced motion) + headline shimmer (reduced motion disables). |
| **`@vex/3d-configurator`** | `shouldUseWebGL()`, **`VEX_WEBGL_PERF`**, **`resolveConfiguratorMaxDpr`**, **`scheduleDeferredModelWarmup`**, **`probeWebGPU()`** + **`useWebglEligible`** on **`ConfiguratorVehicleCanvas`** / **`InventoryVehicleViewer`** → static finish-aware fallback when blocked. |
| **Design tokens** | `globals.css`: `--bg-elevated`, `--accent-violet*`, radii, shadows; body layered gradient; header/footer glass pass (see recent `style:` commits). |
| **CRM** | `Nav.module.css` glass nav; `globals.css` type smoothing + `main h1` baseline. |

**Still to certify for stretch VLR:** Lighthouse **98+** on **`/`** with **vortex** hero (vs current CI thresholds), **MRT-selective** bloom if profiling demands it, full **BullMQ** 3D seed automation for every tenant, **60 fps** sign-off on a defined device matrix — track in pillars above.

---

## 1. Vision (dual product)

| Surface | Role | Emotional target |
|--------|------|------------------|
| **apps/web** | Consumer + prospect | “$10M vault” — cinematic, scroll-stopping, trust + desire |
| **apps/crm** | Dealer staff / group admin | “Private jet cockpit” — density, clarity, zero ambiguity |
| **apps/api** | Invisible | Correctness, isolation, observability, cost caps |

---

## 2. apps/web — Component tree (target)

```
app/layout.tsx (fonts, AmbientShell, TenantTheme, Footer)
├── Header
├── / (home)
│   ├── HomeHero → DynamicHeroShell (vortex R3F **or** legacy DealerProgramHero + HeroCinematicLayer video)
│   ├── AutonomousAgentsShowcase
│   ├── PlatformEnginesSection
│   ├── MarketplaceSubletTeaser
│   ├── PaymentOrchestrationBar
│   ├── ScrollStorySection
│   ├── PrestigeMarquee
│   ├── ExoticPillars
│   ├── ConfiguratorPreview  → `ConfiguratorVehicleCanvas` + `@vex/3d-configurator` gating + static fallback
│   ├── FeaturedInventory
│   ├── PremiumServices
│   ├── TestDriveStrip
│   └── TrustStrip
├── /inventory, /inventory/[id]
├── /build (+ future full configurator route)
├── /checkout, /portal, /appraisal
└── /investor-deck (internal/ops)
```

**New / shared (phased):**

- `packages/3d-configurator` — `VehicleCanvas`, material presets, export hooks (360 / glTF), **Suspense** boundaries.
- `packages/ui` — luxury variants: glass panels, neon CTA, metric orbs (2D + optional R3F wrapper).

---

## 3. Visual language — tokens (proposal)

Map into `globals.css` / theme provider incrementally; avoid breaking existing `--accent` usage in one shot.

| Token | Value | Use |
|-------|--------|-----|
| `--vex-obsidian` | `#0A0A0A` | Page base |
| `--vex-violet` | `#A020F0` | Electric accent (sparingly) |
| `--vex-gold-foil` | `#FFD700` | Premium CTA foil / highlights |
| `--vex-glass` | `rgba(12,12,16,0.55)` + blur | Cards, nav orb |
| `--vex-noise` | SVG/CSS noise overlay | Luxury texture |

**Motion:** prefers-reduced-motion must disable particle trails, parallax, and cursor FX (see §6).

---

## 4. Animation — keyframes (conceptual)

| Name | Purpose | Tech |
|------|-----------|------|
| `hero-unveil` | Fleet reveal on scroll | GSAP timeline + Lenis |
| `orb-expand` | Nav orb → section anchors | CSS + optional R3F |
| `cta-shimmer` | Liquid metal on primary buttons | CSS gradient animation |
| `particle-exhaust` | Subtle GPU particles behind hero vehicle | drei `Points` + budget cap |

---

## 5. Accessibility matrix (non-negotiable)

| Area | Requirement |
|------|-------------|
| Color | WCAG 2.2 AA for body UI; decorative 3D exempt with text alternatives |
| Keyboard | All CTAs, nav, configurator controls tabbable |
| Motion | `prefers-reduced-motion: reduce` → static hero + no auto-play audio |
| WebGL | Fallback: static poster image / LQIP when WebGL unavailable |
| Audio | Engine hover: opt-in or mute by default with visible toggle |

---

## 6. Moodboard references (design intent)

- **Automotive craft:** Pininfarina, Rimac, Aston Martin — proportion, restraint, material honesty.
- **Product polish:** Linear, Vercel — typography rhythm, empty state quality, fast perceived performance.

---

## 7. User journeys

### 7.1 Consumer: hero → configurator → checkout

1. Land on `/` — hero establishes brand + proof (metrics, trust strip).
2. “Build / configure” → `/build` — PBR configurator, live price from API preview.
3. Stripe Checkout or deposit flow — tenant-scoped pricing; no client-trusted amounts.

### 7.2 Dealer: login → appraisal → deal desk close

1. CRM login → `/appraisals` queue.
2. Detail → PDF / valuation / deal desk actions (RBAC: STAFF, ADMIN, GROUP_ADMIN aligned on tenant + dealer routes).
3. Close → ERP order path (existing services); audit + notifications.

---

## 8. SEO / Open Graph / investor

- **Marketing:** Unique titles per route; `metadataBase` + OG image per major funnel (`/`, `/inventory`, `/build`).
- **Investor:** `/investor-deck` — token-gated package; live pilot metrics via `INTERNAL_PILOT_METRICS_KEY` proxy; no cross-tenant leakage in copy.

---

## 9. API — RBAC audit snapshot (2026-04-04)

**Finding:** Most tenant routes use `requireAuth` + `requireRole` / `requireStaffOrAbove` / `requireAnyAuthenticatedRole`. The latter is **intentional** for customer-inclusive routes (orders list scoped in controller, saved vehicles, etc.).

**Follow-up (next agent):**

- Grep `apps/api/src/routes` for handlers that are `requireAuth`-only without a second middleware — confirm controller enforces tenant + role.
- Do **not** add `requireRole` where product intent is “any authenticated user” with controller-side row scoping (e.g. `orders`, `savedVehicles`).

**Deal desk:** `GROUP_ADMIN` parity documented in `docs/TENANT_RBAC.md`; `isDealDeskAppraisalRole` aligns with `isDealerStaffRole`.

---

## 10. Strategic — revenue hooks (advisory)

| Tier | Price (illustrative) | Includes |
|------|----------------------|----------|
| **Apex** | $499/mo | White-label 3D embed, branded customer portal subdomain, priority valuation quota |
| **Pilot expansion** | — | On tenant create: seed 3D demo asset pack + demo inventory rows (idempotent job) |

**MRR narrative:** Position 3D configurator as **conversion lift** on qualified traffic (hypothesis for analytics — measure before claiming “42%”; use A/B or cohort once shipped).

---

## 11. Implementation phases (recommended)

| Phase | Scope | Gate |
|-------|--------|------|
| **P0** | Plan + `@vex/3d-configurator` stub + token docs | `turbo build` |
| **P1** | Configurator + inventory: `useWebglEligible` + finish-aware static fallback; hero video already gated on reduced motion (`HeroCinematicLayer`) | `turbo build`; Lighthouse incremental |
| **P2** | Configurator PBR + Stripe preview integration | E2E smoke on `/build` |
| **P3** | CRM glass variants + deal-desk kanban polish | Manual QA + a11y |

---

## 12. Success criteria (measurable)

- Build green on every merge (`pnpm -w turbo run build`).
- No regression on tenant isolation (`test:e2e` with Postgres).
- LCP / CLS tracked on `/` after hero changes (budget TBD).
- CRM task time for “appraisal → close” tracked in product analytics (baseline first).

---

## 13. Handoff — next agent checklist

1. `pnpm install` after pulling branch (new workspace package).
2. `pnpm -w turbo run build`.
3. With Postgres: `pnpm --filter @vex/api run test:e2e`.
4. Next visual: optional R3F hero strip (behind feature flag) **or** Lighthouse perf budget on `/`.

---

## 14. Documentation corpus policy

- **Do not** paste this entire blueprint into `AGENTS.md`, `SHIP.md`, or integration playbooks — it goes stale.
- **Do** add one line cross-links: “Elite digital presence north star: `docs/plans/2026-04-04-vex-ELITE-DIGITAL-PRESENCE-v1.md`.”
- Slide/deck markdown (if any) should **summarize** pillars and link here for depth.

---

## 15. Visual supremacy → revenue engine (hypotheses — measure)

| Lever | Hypothesis | Instrument |
|-------|------------|------------|
| Vault hero + configurator 3D | Higher **scroll depth** and **CTA click** on `/` and `/build` vs flat baseline | PostHog / GA4 events + cohort |
| Static fallback | **No** conversion penalty vs 3D when fallback copy is clear (A/B optional) | Same + funnel |
| CRM glass nav | Faster **time-to-task** for staff (qualitative + session replay) | Product analytics |

**Conversion-lift numbers** are **not** claimed until an experiment ships; use pre/post or A/B.

---

## 16. BullMQ — auto-provision 3D demo assets (job spec)

- **Queue name:** `tenant-3d-demo-seed` (example).
- **Trigger:** Idempotent hook after tenant provisioning (paid pilot / admin create) — **once per tenant**.
- **Payload:** `{ tenantId }`.
- **Worker steps:** (1) copy bundled glTF + poster URLs into tenant-scoped storage or reference public demo URLs; (2) insert `Inventory` / `Vehicle` demo rows with `source=DEMO`; (3) `AuditLog` entry `TENANT_3D_DEMO_SEEDED`.
- **Failure:** Retry with backoff; DLQ after N tries; never block HTTP response path.

---

## 17. Apex tier — feature matrix (illustrative $499/mo)

| Feature | Included |
|---------|----------|
| White-label **3D embed** (iframe / signed URL) for dealer site | Yes |
| Branded **customer portal** subdomain | Yes |
| **CRM** premium theme + priority support lane | Yes |
| Valuation **quota** bump vs Pro | Yes (exact # TBD pricing) |
| Custom **domain** + SSL | Yes (ops checklist) |

---

## 18. 90-second self-serve pilot onboarding (playbook)

1. **0:00–0:30** — Stripe checkout → tenant provision (idempotent).
2. **0:30–0:60** — Demo inventory + CRM login email; optional BullMQ demo 3D seed (§16).
3. **0:60–0:90** — Link to `/appraisals` + “first appraisal” checklist; `Tenant.onboardedAt` completion.

---

## 19. Investor attention magnet

- **Live site** as pitch: screen-record **hero sheen + optional video** + **configurator** (WebGL or graceful fallback) + **investor-deck** metrics proxy.
- **Narrative:** “Tenant-safe dealer OS + consumer-grade discovery — same product, two surfaces.”
- **Data room:** Token-gated `RaisePackage` + pilot network metrics — already API-backed.

---

## 20. Stakeholder “feel” description (QA script)

The first viewport should read as an **obsidian vault**: soft **violet–gold** light bleeding at the floor line, **champagne headline** shimmer (stops cold under reduced motion), optional **cinema-grade loop** behind the fold when env video is configured, and a **glass cockpit** column that sells enterprise depth. Scroll feels **layered**, not flat marketing.

---

*This document is the north star; execution remains incremental and reversible.*

---

## 21. WebGL performance budget (2026 — single source of truth)

| Metric | Target | Notes |
|--------|--------|--------|
| Frame budget | **60 fps** on mid-range laptop + flagship mobile | Chrome Performance panel; **`VEX_TARGET_FPS` / `VEX_TARGET_FRAME_MS`** in `@vex/3d-configurator`; throttle particles + cap DPR under load |
| Draw calls | **&lt;100 / frame** after batching | Instancing for fleets/particles; merge static meshes; avoid per-frame material churn; ubershader-style PBR where possible |
| Particles | **≤512** cap; **LOD via `drawRange`** | Live: `resolveParticlePointBudget()` → **128** hidden tab, **256** &lt;480px, **320** &lt;1024px, **512** desktop — `ParticleVortex` one `THREE.Points` buffer |
| Instancing | **`VEX_INSTANCING_SPEC`** | `heroFleetInstancesFull: 4`, `inventoryPreviewMaxDrawn: 12` — one `Points` + **`InstancedMesh`** bodies beats N full scenes (fleet previews) |
| DPR / pixel load | **Adaptive cap** | Live: `resolveConfiguratorMaxDpr()` — **1.25** reduced motion, **1.5** low-memory/low-core, else **2.2**; Canvas `dpr={[1, maxDpr]}` |
| Textures | **Mipmaps + anisotropy** | Live: `GltfVehicle` `enhanceLoadedMaps` (mipmap min filter, aniso ≤8); **KTX2/Basis** + **trim atlases** = roadmap |
| Post-processing | **Forward + `EffectComposer`** today | Showroom: bloom + chroma + vignette; hero: `VortexPostFXStack` (highlight-weighted bloom, DOF, god-rays, **violet–gold `LensFlare`**, chroma, grain). **MRT / `SelectiveBloom` “deferred-style” pass** = profiling-gated optional upgrade (cost vs clarity) |
| WebGPU | **Progressive enhancement** | `probeWebGPU()`; **WebGL2 canonical**; `data-vex-webgpu` on configurator wrapper |
| Model IO | **Idle-deferred preload** | Live: `scheduleDeferredModelWarmup` → `requestIdleCallback` (fallback `setTimeout`) before `preloadVehicleGltf`; **worker Draco/Meshopt** = roadmap |

**Feature flags:** `NEXT_PUBLIC_ENABLE_HERO_WEBGL` — when `0` / `false`, `useWebglEligible` forces **static** previews (configurator + inventory 3D off). Documented in `apps/web/.env.local.example`.

**Live — home hero gate (`DynamicHeroShell`):** `useHeroWebglDisplayMode()` composes the same flag + eligibility:

| Mode | UI |
|------|-----|
| `legacy` | **`DealerProgramHero`** — CSS vault sheen, optional **`HeroCinematicLayer`** video, **`VaultNeonCursorSheen`** (violet radial follow-cursor, **off** under `prefers-reduced-motion`), existing **`HeroParticleField`** |
| `pending` | Full-viewport `#0a0a0a` placeholder until client measures WebGL |
| `vortex` | **`ApexHeroScene`** → `@vex/ui/3d` **`VortexHeroScene`** — GLTF digital twin, **`ParticleVortex`** (**512** points, scroll + pointer-reactive; cap = `VEX_WEBGL_PERF.targetMaxParticlePoints`), **`VortexPostFXStack`** bloom/god-rays, **`useApexHeroOrchestration`** scroll velocity |

**Lighthouse CI:** `apps/web/lighthouserc.json` asserts performance ≥0.8, a11y ≥0.9 on **`/`**, **`/configure`**, **`/inventory`**, **`/build`**. **100/100 performance** with a live **WebGL** hero + configurator is **not** a guaranteed CI bar (GPU + main-thread cost); treat **0.8+ perf + 0.9+ a11y** as the **merge gate**. **100/100** remains an **aspirational** target for **static-first** or **LQIP** hero variants — validate only with powered A/B, not blocking ship.

**CI / merge hygiene (2026-04-05, `elite-digital-presence-v1` @ `ad0bbfe`+):** GitHub Actions failed on **pnpm setup** (`pnpm/action-setup` + `packageManager: pnpm@9.15.9` conflict) and a **missing** `turborepo/action@v2` reference. **Fix:** pin **`pnpm@9.15.9`** in `.github/workflows/*.yml` and **remove** the broken Turbo action step — remote cache still flows via **`TURBO_TOKEN` / `TURBO_TEAM`** env on `turbo` CLI. **`@vex/api#test:e2e`** needs a **materialized schema** on the workflow’s **service Postgres** before Turbo runs (empty DB → `P2021` on `tenants`). The committed **migration ledger** is not fresh-DB safe (early SQL references `users` before a baseline create). CI therefore runs **`db:generate` + `prisma db push`** once before the Turbo gate; **`scripts/ship-gate.sh` skips `migrate deploy` when `CI=true`** so the gate does not re-apply the broken ledger. **Local / pilot:** keep using **`prisma migrate deploy`** against real databases (see `docs/SHIP.md`). **`Web quality`** (`.github/workflows/quality.yml`) runs **`pnpm exec turbo run quality:web --filter=@vex/web`** — **`quality:web`** **`dependsOn: ["^build"]`** in **`turbo.json`**, so **`@vex/shared`**, **`@vex/ui`**, … **`dist/`** builds run in the **same** graph before Playwright smoke. After opening/updating a PR, **re-run checks**; merge to `main` only when CI is green.

**Architecture guardrail:** **`HeroCinematicLayer` stays video-only.** Do **not** embed a second R3F Canvas there — the **WebGL hero** is exclusively **`DynamicHeroShell` → `ApexHeroScene` / `VortexHeroScene`** when `vortex` mode is active; duplicating Canvas would fight z-order, double GPU cost, and break the gate model.

---

## 22. 2026 luxury automotive UX trend matrix → VEX components

| Trend (2026 luxury auto UX) | VEX mapping (live or phased) |
|------------------------------|------------------------------|
| **Phygital immersion & digital twins** | `ConfiguratorVehicleCanvas` + `InventoryVehicleViewer` — orbit = **vault walk**; static **LQIP** fallback; roadmap: AR placement, **360°** signed export, **BullMQ** tenant asset jobs |
| **Bespoke personalization at scale** | Tenant cinematic uniforms + CRM tokens; **context**: driving vs browse = camera presets + **`premium`/`compact`** scene modes; roadmap: AI co-pilot **surfaces** (tenant-scoped) |
| **Expressive yet accessible** | Obsidian void, **violet–gold** foil, **glass** toolbar, **`VaultNeonCursorSheen`** (off if reduced motion); **no** motion without `prefers-reduced-motion` respect |
| **Glanceable, safe, adaptive** | **44px+** configurator controls; CRM **`EnterpriseWidgetCard`** KPI “orbs”; roadmap: voice/gesture **hints** only with consent |
| **AI-first + multimodal** | Phased: copy-level **personalization** + configurator hints; multimodal = **touch + spatial** today; voice = backlog |
| **Quiet luxury / anti-template** | No generic dealer carousel; **LiquidMetalCTA** + **Apex Studio** `/build` as flagship path |
| **Performance as craft** | **60 fps** target, **`resolveConfiguratorMaxDpr`**, particle LOD, idle GLB warm — “expensive” = **buttery**, not particle soup |
| **Trust + motion safety** | `shouldUseWebGL()`, `useWebglEligible`, investor **`InvestorDeckBlocks`** factual tone + legal routes |

---

## 23. Component tree — Hero + Configurator + CRM orbs (reference)

```
apps/web
├── HomeHero
│   └── (NEXT_PUBLIC_CINEMATIC_HERO_V2 ≠ 0) DynamicHeroShell
│         ├── useHeroWebglDisplayMode()  ← NEXT_PUBLIC_ENABLE_HERO_WEBGL + shouldUseWebGL + DPR
│         ├── legacy → DealerProgramHero
│         │         HeroCinematicLayer (video-only; CSS transition polish)
│         │         VaultNeonCursorSheen + HeroParticleField (CSS)
│         └── vortex → ApexHeroScene → VortexHeroScene (@vex/ui/3d)
│                   ParticleVortex · VortexPostFXStack · useApexHeroOrchestration (rAF / ~60fps)
│   └── (CINEMATIC_HERO_V2 off) DealerProgramHero only
├── /configure → ConfigureExperienceClient + ConfiguratorVehicleCanvas → VehicleScene → GltfVehicle
│     └── @vex/3d-configurator: resolveParticlePointBudget, resolveConfiguratorMaxDpr, scheduleDeferredModelWarmup
│     └── useWebglEligible → Canvas | StaticVehicleFallback · probeWebGPU → data-vex-webgpu
├── /build → ApexStudioEngine (Apex Studio shell)
└── InventoryVehicleViewer (same WebGL gate + adaptive dpr + idle preload)

apps/crm
├── Dashboard / analytics — glass KPI cards, EnterpriseWidgetCard “metric orbs”
└── globals.css — cinematic void + --cinematic-void-marketing (brand parity with marketing)
```

---

## 24. Animation, reduced motion, phygital roadmap

| Layer | Reduced motion = `reduce` | Full motion | Key timing (target) |
|-------|-----------------------------|-------------|---------------------|
| Hero video | **Off** (`HeroCinematicLayer`) | Loop MP4/WebM + **opacity/filter** CSS ease (~1–1.2s) | Ease **cubic-bezier(0.22, 1, 0.36, 1)** |
| WebGL configurator | **Off** (`useWebglEligible`) | Orbit + PBR + **maxDpr** cap | rAF-aligned; no layout thrash |
| Vortex hero | **Off** (gate → legacy) | **Formation** 0→1 ~**1.8s** smoothstep (`useApexHeroOrchestration`) | Scroll velocity **low-pass** for streaks |
| Cinematic Apex (web) | Respect R3F + CSS hooks | Particles, god-rays, bloom ramp with **apexBoost** | Post stack **forward**; deferred TBD |
| CRM | No infinite CSS shimmer on critical paths | Glass hover **≤200ms** transitions | KPI orbs static-first |

**Phygital roadmap (ordered):** (1) stable WebGL + static fallback everywhere; (2) tenant HDR + uniforms live; (3) idle-deferred GLB warm + **worker decode** path; (4) AR Quick Look / USDZ export from API; (5) BullMQ branded 3D asset job + pilot checklist.

---

## 25. Documentation corpus — cross-links (policy)

- **Single source of truth:** this file (**§0–§30**): **`VLR`**, **WebGL perf + 2026 luxury UX**, **revenue / investor**, **Cox §28**, **local autonomy §29**, **§30 Resource Arsenal** (live tooling + asset links) **+ firepower doctrine** (CI, Turbo, honest automation claims). Do not fork competing matrices in Slack or Notion without linking back.
- **Entry points** (canonical one-liners already wired): `PROJECT_SPACE.md`, `AGENTS.md`, `README.md`, `docs/SHIP.md`, `docs/ENGINEERING_REALITY.md` → **§29** (zero-click IDE autonomy), **§30** (Resource Arsenal + **Turbo remote cache** copy/paste setup + perf tools), **§28** (Cox) as needed; plus [Crown Jewel v2.0](2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.0.md), [v2 summary](2026-04-05-vex-ELITE-DIGITAL-PRESENCE-v2.md), [Apex Studio `/build`](2026-04-05-vex-apex-studio-configurator-v1.0.md).
- **Other markdown:** add a pointer **when you touch** a file for marketing, web perf, 3D, or pilot narrative — **no** repo-wide mechanical edit of every `.md` (noise + merge pain). Pure API/vendor memos stay lean unless the change affects customer-facing surfaces.
- **Do not** duplicate §21–§30 into playbooks; **link** here for WebGL + luxury UX supremacy specs + **§30** velocity / tooling.

---

## 26. WebGL supremacy → revenue engine v3 (one-pager)

**One Solution → Revenue Engine v3:** one **tenant-safe** monorepo ships the **cinematic vault** (`vortex` + configure + `/build`) **and** the **GTM velocity stack** — **§29** (**zero-click** workspace autonomy), **§30** (**Turbo remote cache** + **`turbo.json`** graph + Resource Arsenal), plus **human + agent swarm** on this **§0–§30** spec. That combination is the **honest** luxury-segment **production-rate** edge vs **acquisition-siloed** mass-market stacks (**§28**); it is **not** a claim to Cox-scale **DMS / auction** breadth until **named** integrations exist.

| Pillar | Tie to performance |
|--------|---------------------|
| **Conversion** | **60 fps immersive** hero (`vortex`) + configurator (**adaptive DPR**, particle LOD, texture mips, idle preload) → **hypothesis**: deeper scroll, higher **hero→configure** and **configure→/build** intent vs **legacy** — instrument PostHog/GA4; **no** published “×3” or fixed **% lift** without powered experiments (see README hypothesis ranges for illustrative **lab** targets only). |
| **Provisioning** | **BullMQ** `tenant-3d-demo-seed` (§16): idempotent job seeds **branded 3D** demo assets + demo inventory; **phygital** handoff = live GLB + static fallback for email/social. **Instant cinematic demo** = positioning target when job + worker are **proven** per env (§28.3, §30.3). |
| **Apex tier (~$499/mo illustrative)** | **Instant access to the full VEX luxury OS** (retail slice) with **cinematic demo provisioning** when **`tenant-3d-demo-seed`** is **live** (else **target** — §30.3): white-label **3D portals** + embeddable **vault** aesthetic, **AR-ready** export path (roadmap), **bespoke CRM** cockpit (glass + metric orbs), **custom domains** + SSL, higher valuation / API caps vs Pro — **positioning:** the **unified cinematic layer** Cox does not productize for HNW (see §28); **not** a DMS replacement claim until §28 P2 ships. |
| **Pilot** | **90 s** playbook (§18): Stripe → tenant → **private vault** first paint (`legacy` or `vortex` per flags) + CRM login — **emotional hook** Cox’s throughput stack does not optimize for; **AI personalization** teaser on `/portal` (roadmap) stays **consent + tenant-scoped**. |
| **CI trust** | Green **`pnpm` + Turbo** workflows on `main` — ship narrative matches what automation proves (`build`, `quality:web`, API gates per repo). **Turbo remote cache** (**§30**) on **`TURBO_TOKEN` + `TURBO_TEAM`** speeds **repeat** CI + local builds; claim only what logs show. |
| **Velocity (luxury vs fragmented stacks)** | **One monorepo** + **shared tokens** + **Zod contracts** → fewer cross-vendor handoffs than **multi-product** retail stacks (§28). **Zero-friction production rate:** **§29** (**workspace** “don’t ask again” + **full Cursor quit/reopen** + background settings) + **§30** (**Resource Arsenal** — **`turbo.json` cache graph** + **remote cache** across devs + runners, GPU/perf tooling, 3D sources — plus **CI + doctrine**) + **human + agent swarm** on one blueprint → faster **cinematic** iteration in the **HNW** niche than siloed incumbents can align a coherent story — **not** Cox-scale **DMS** depth. |

---

## 27. Investor attention magnet v2

- **Optimized WebGL hero** (`vortex`) is the **live Series A asset**: screen-record **≤60 fps** — scroll → god-ray ramp → particle formation → **LiquidMetalCTA** burst; second clip with **`NEXT_PUBLIC_ENABLE_HERO_WEBGL=0`** showing **legacy** vault + neon sheen to prove **zero** broken layouts.
- **Pitch deck embed:** Use **full-screen** `https://<deployed-web>/` in deck tools that support live iframe, or **OBS / mmhmm** browser source; for **data room**, token-gated **read-only** tenant demo subdomain (same isolation narrative as API).
- **Narrative:** “Luxury commerce = **perceived performance** + trust; VEX ships both in one monorepo.”

---

## 28. Cox Automotive gap analysis (luxury segment — positioning, not “beat Cox at Cox”)

**Headline:** VEX does **not** win by cloning Cox Automotive’s **mass-market, full-stack empire** (DMS depth, auction infrastructure, national shopper volume). VEX wins by **owning the luxury / exotic emotional + digital-twin layer** where Cox’s products are **optimized for throughput**, not **white-glove desire, rarity narrative, and cinematic trust**.

### 28.1 Scale reality (why “reign over Cox” is the wrong frame)

Cox-scale operators combine **Dealertrack-class DMS**, **VinSolutions-class CRM**, **vAuto-class** velocity, **Manheim-class** wholesale, **Dealer.com-class** syndication, and **billions** of first-party shopper signals across **tens of thousands** of rooftops. VEX today is a **focused monorepo**: cinematic **`apps/web`**, dealer **`apps/crm`**, tenant-scoped **`apps/api`**, and **3D gating** in **`@vex/3d-configurator`** — aimed at **high-trust exotic retail**, not national used-car throughput. **Honest audit:** we are **not** “close” to Cox on **breadth**; we are **different by design**.

### 28.2 Capability matrix (illustrative — luxury lens)

| Dimension | Cox (representative portfolio) | VEX today (repo truth) | Luxury-segment intent |
|-----------|--------------------------------|-------------------------|------------------------|
| **Emotional / 3D flagship** | Functional digital retail; limited cinematic parity | **`vortex`** hero + **`ConfiguratorVehicleCanvas`** + **`/build`** Apex Studio shell | **Lead** — vault + digital twin as **category differentiator** |
| **Unified product feel** | Many brands / integrations (powerful, can feel **fragmented**) | **One** design system + shared tokens web ↔ CRM | **Lead** — “one solution” **DNA** for HNW dealers |
| **DMS / core F&I ledger** | **Dealertrack** depth | **Roadmap** / partner strategy (`AGENTS.md` Phase 7+) | **Partner or acquire path** — not P0 for VLR |
| **CRM + automation** | **VinSolutions** scale | CRM cockpit + **tenant RBAC** + phased AI (`AGENTS.md`) | **Tenant-scoped**, **consent-aware** luxury workflows |
| **Inventory intelligence** | **vAuto** velocity | Tenant inventory + APIs | **P1** exotic **syndication** + niche channels |
| **Wholesale / auctions** | **Manheim** + logistics | Not in product scope | **P2** exotic wholesale **connector** (optional) |
| **Digital retail checkout** | **MakeMyDeal** / Showroom apps | Stripe + portal + checkout routes | **Exotic** pacing + trust copy |
| **Service / Xtime-class** | **Xtime** scheduling | Not shipped as first-class | **P2** CRM service module |

### 28.3 Prioritized gap list (surgical — aligned to VLR + luxury GTM)

| Tier | Focus | Notes |
|------|--------|--------|
| **P0 (VLR)** | **WebGL vault on home** via **`DynamicHeroShell` → `vortex`** (not `HeroCinematicLayer` — see **VLR** §) + **legacy** video/CSS pristine | **Do not** duplicate R3F into `HeroCinematicLayer` |
| **P0** | **Flagship GLB** + **real-time material** class swaps + **pricing preview** in configure + `/build` | Harden **Apex Studio** + shared schemas |
| **P0** | **BullMQ** idempotent **tenant 3D / demo asset** provisioning | e.g. `tenant-3d-demo-seed` + **`apex-studio-360-export`** handler paths in `apps/api` — complete **worker coverage** + audit |
| **P1** | **Luxury syndication** exports, **trade-in 3D visualizer**, **white-label 3D embed** (Apex tier) | Revenue §26 **Apex** row |
| **P1** | **PWA** + future native wrapper | Offline appraisal queue (`AGENTS.md` Phase 6) |
| **P1** | **AI co-pilot** (mood / layout hints) in configurator | **Consent + tenant caps** |
| **P2** | **DMS** API hooks, **F&I + titling**, **service** scheduling, **wholesale** connector, **vAuto-style** velocity BI | Enterprise scale — **explicit** phase gates |

**P0/P1/P2 ↔ automation (production-rate firepower §30):**

| Job / route (target names) | Tier | Intent |
|----------------------------|------|--------|
| **`tenant-3d-demo-seed`** | **P0** | Idempotent queue job: branded default **GLB / HDR / theme** payload for new tenant; **AuditLog** row per successful seed; retries safe. |
| **`apex-studio-360-export`** (BullMQ handler + API trigger) | **P0** | Configurator / Apex Studio → packaged **turntable or glTF** export for sales + syndication handoff; tenant-scoped, capped cost. |
| **Stripe webhook → enqueue seed** | **P0** | Paid checkout → **non-blocking** enqueue of `tenant-3d-demo-seed` (must not block 90s onboarding UX). |
| **Valuation / PDF / analytics** jobs (existing roadmap) | **P1** | Keep **idempotent**; do not starve **P0** cinematic queues. |
| **DMS / auction connectors** | **P2** | Only after §28 **internal rule** — named integration + compliance review. |

### 28.4 One-solution → revenue engine v3 (competitive wording + Apex tier)

- **Revenue Engine v3 (internal frame):** **one unified luxury OS** (web + CRM + API) **plus** **production-rate firepower** — **local autonomy** (**§29**), **Turbo remote cache + `turbo.json`** (**§30**), and **swarm parallelism** on the **§0–§30** blueprint — is the **repeatable** way VEX **out-ships** fragmented retail conglomerates **in-segment** without pretending to **out-platform** Cox on **DMS / wholesale** depth.
- **Positioning line (external):** *“VEX is the unified luxury automotive OS: one cinematic customer vault, one dealer cockpit, one tenant-safe API — built for vehicles and buyers that Cox’s mass-market stack was never designed to romance.”*
- **Speed advantage (luxury segment):** **One monorepo** + **single design language** + **cinematic-first** roadmap means VEX can **ship** obsidian-vault UX and **digital-twin** surfaces faster than **acquisition-siloed** incumbents can align a **coherent** HNW story — **not** faster at Cox-scale **DMS** depth (§28.1). **Production-rate firepower** compounds that: **§29** locks **workspace-scoped** background runs (**modal checkbox + full Cursor quit/reopen**); **§30** adds **Resource Arsenal** plus **Turbo remote cache** (**`TURBO_TOKEN` / `TURBO_TEAM`** on **local `.env.local` + GitHub Actions**) and a **cache-aware `turbo.json`** (`build`, **`quality:web`**, **`cacheDir`**, safe **`globalPassThroughEnv`**) so **repeat builds / quality** amortize across **machines and CI**; **swarm parallelism** (people + agents) runs against **one** spec — still **honest** vs backend breadth gaps (verify with logs, not slogans).
- **Apex tier (~$499/mo illustrative):** **Instant access to the full VEX luxury OS** with **cinematic demo provisioning** (when **`tenant-3d-demo-seed`** is **live and audited** — else **target**, see §30.4): white-label **3D portals**, **tenant-scoped** API caps, **glass CRM** cockpit parity with marketing tokens, **custom domains** + SSL.
- **90-second self-serve pilot playbook:** Stripe → tenant + CRM login → **first paint** is either **`vortex`** (WebGL vault) or **`legacy`** (CSS + optional video) — **zero** broken layout; messaging leads with the **private hypercar vault** emotional hook Cox’s mass-market stack was not built to **romance**.
- **Investor attention magnet:** The **obsidian vault hero** (**Lenis**-synced scroll context, **Apex** orchestration, formation particles, **violet–gold** post stack) is the **definitive live pitch asset** — screen-record at **60 fps** (target hardware), then **`NEXT_PUBLIC_ENABLE_HERO_WEBGL=0`** to prove **legacy** parity; pair with **configure** + **/build** in one session to show **one OS**, not a microsite.
- **Internal rule:** Never claim **parity** with Cox on **DMS or auctions** until **named** integrations ship; **do** claim **differentiation** on **cinematic 3D**, **unified luxury UX**, and **tenant-isolated** trust **today**.

---

## 29. Local machine autonomy (Cursor — agent background, ~60s setup)

**Canonical:** **Zero-click launchpad** for the swarm — each developer applies **§29 once per machine** (and per trusted workspace). There is **no** org-wide remote toggle that can substitute; **background agent runs** are **local IDE policy** only.

**Purpose:** Long agent runs (`pnpm install`, `pnpm -w turbo run build`, `quality:web`, E2E) often trigger a **“Run in background / Unblock agent”** safety prompt. This section is the **onboarding shortcut** so developers stop fighting the IDE. **Exact menu strings vary by Cursor version** — use search in Settings if labels differ.

1. **When the prompt appears (workspace checkbox — required):** In the modal, enable **“Don’t ask again for this workspace”** / **“Remember my choice for this workspace”** (small checkbox at the bottom), then click **Run in background** / **Unblock and run in background**. Cursor stores this per **workspace**; skipping the checkbox is why the prompt **keeps coming back**.
2. **Full autonomy lock (quit — not just reload):** **Quit Cursor completely** (close **all** windows), then reopen the **VEX** repository folder. A partial reload or single window close may **not** persist the modal choice; a **full quit + reopen** is the usual **final fix** when prompts persist.
3. **Settings (recommended):** Open Settings (**macOS:** `Cmd + ,` · **Windows/Linux:** `Ctrl + ,`). Search **`background`** / **`agent`** and set agent **background execution** to **Always** (or your edition’s equivalent). Search **`auto run`** and keep **auto-run** permissive for trusted work (**“Run everything”** or team policy).
4. **Workspace trust:** If prompted, choose **Trust** and, if offered, **always trust this workspace**.
5. **Restart Cursor once more** if you changed Settings in step 3 after the full quit in step 2.

**Quick test after restart (terminal):** `pnpm -w turbo run build --dry-run=text` (fast task graph — no full compile), then optional `pnpm -w turbo run build` for a real build.

**Security note:** Only enable **always background** + **run everything** on **trusted** repos and machines (no third-party code you do not control).

**Product note:** This is **developer ergonomics**. It does **not** replace **VLR** technical gates or change the **hero architecture** (**`DynamicHeroShell` `vortex`**, not R3F inside **`HeroCinematicLayer`** — see **VLR** §).

**Handoff:** After §29 is applied, pair with **§30** for **verifiable** velocity (CI green, Turbo, queue jobs) — never confuse **local friction removal** with **production readiness**.

---

## 30. Resource Arsenal — Production-Rate Firepower (live links + immediate use)

- **3D assets:** [Poly Haven](https://polyhaven.com/) — CC0 **PBR HDRIs + textures**; [Sketchfab](https://sketchfab.com/) — PBR exotic references (filter e.g. *Porsche 911 GT3 RS*, *Ferrari SF90*, *Bugatti Tourbillon*); **verify license** before any ship to production tenants.
- **WebGL perf tools:** Chrome DevTools **Performance** tab; [Spector.js](https://spector.babylonjs.com/) (frame / draw capture); [@react-three/drei](https://github.com/pmndrs/drei) helpers used across hero + configurator (Bounds, Environment, etc.).
- **Turbo remote cache:** [Turbo](https://turbo.build) remote artifact cache — **local + CI** share hits once **`TURBO_TOKEN`** + **`TURBO_TEAM`** are set (see **zero-to-live steps** below). Typical effect: repeat **`pnpm -w turbo run build`** runs drop from **~20s → ~4–6s** when tasks are **cache hits** (hardware + graph dependent).
- **GPU testing:** Prefer a machine with **discrete GPU** (NVIDIA / AMD) for **60 fps** validation of **`vortex`** + configure; iGPU = still valid for **fallback** and **a11y** paths.
- **Asset pipeline (repo):** `packages/3d-configurator/assets/` — canonical home for **LOD**, **texture atlases**, and shared glTF-sidecar files; **large binaries** stay **out of plain git** or use **Git LFS** per team policy.

**Turbo remote cache — zero-to-live (~3 min, no secrets in git):**

1. Open [https://turbo.build](https://turbo.build) and sign in (**GitHub**).
2. Create or select a **team**; generate a **token**; copy **`TURBO_TOKEN`** and **`TURBO_TEAM`** (team slug / ID exactly as the dashboard shows).
3. **Local (once per machine):** append to **repo root** **`.env.local`** (preferred — Next.js convention; **`.env`** is also gitignored but avoid mixing Turbo secrets with app env you might copy between machines):

```bash
echo 'TURBO_TOKEN=your_actual_token_here' >> .env.local
echo 'TURBO_TEAM=your_team_slug_here' >> .env.local
```

4. **GitHub Actions:** **Settings → Secrets and variables → Actions** → add repository secrets **`TURBO_TOKEN`** and **`TURBO_TEAM`** (same values as Turbo dashboard). **`quality.yml`** passes these at **job** `env` so **`quality:web`** can **remote-cache** with the main CI graph.
5. **Verify:** run **`pnpm -w turbo run build`** twice; the second run should show **remote cache** usage and **must not** print **`Remote caching disabled`** (if it still does, secrets are missing or typo’d).

**Verified CLI (Turbo 2 — do not use `--dry`):**

- **Task graph only (no compile):** `pnpm -w turbo run build --dry-run=text` — prints **Packages in Scope**, **Global Hash Inputs** (including **Global Passed Through Env Vars** listing `TURBO_*` **names only**, not values), and per-task **Hash** / **Cached (Local|Remote)** flags. **`turbo run build --dry`** is **not** valid.
- **Local cache hit smoke (no remote token):** a repeat **`pnpm -w turbo run build`** often ends with a summary like **`Cached:    N cached, 7 total`** (N may be **0–7** depending on what changed). **Remote** hits additionally show tasks **restored** from **Vercel** / Turbo remote in logs when **`TURBO_TOKEN` + `TURBO_TEAM`** are set.
- **Optional debug:** **`TURBO_REMOTE_ONLY=true`** (see **§30** optional table) — use only when diagnosing remote hits; can slow **cold** runs.

**Turbo cache optimization (committed `turbo.json` + workflows):**

| Lever | What shipped | Why |
|-------|----------------|-----|
| **`cacheDir`** | `.turbo/cache` | Stable local cache path; aligns with Turbo defaults and docs. |
| **`build`** | `cache: true` + **`NEXT_PUBLIC_ENABLE_HERO_WEBGL`** in `env` | Hero WebGL gate changes **invalidate** `@vex/web` build hashes correctly. |
| **`quality:web`** | `dependsOn: ["^build"]`, `cache: true`, inputs = `apps/web` + **`tests/**`** + **`playwright.config.*`** + shared packages | Lets **`pnpm exec turbo run quality:web --filter=@vex/web`** participate in **remote cache** when secrets are set. |
| **`globalPassThroughEnv`** | **`TURBO_TOKEN`**, **`TURBO_TEAM`**, **`TURBO_REMOTE_ONLY`** | CLI / remote features work **without** putting secrets in **`globalEnv`** (which would **poison** the global hash on token rotation). |

**Do not (cache thrash / false misses):**

- Add `**/.env*` to **`globalDependencies`** — local env drift would **bust** remote cache for everyone.
- Add **`TURBO_TOKEN`** to **`globalEnv`** — rotating the token **invalidates** all cached tasks.

**Optional (local / CI only — not committed):**

- **`TURBO_REMOTE_ONLY=true`** — debug **remote** hits; can slow **cold** runs when local cache is ignored.
- **`turbo prune --scope=@vex/web`** — smaller **Docker** / deploy checkouts; see [Turbo prune](https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution-prune).

**CI:** `.github/workflows/quality.yml` runs **`pnpm exec turbo run quality:web --filter=@vex/web`** so the **same** Turbo graph (deps **`^build`** + smoke) can **hit** remote cache when **`TURBO_*`** secrets exist.

### 30.1 Strategic frame (doctrine — speed vs Cox)

**Strategic frame:** VEX chooses a **different battlefield** than Cox Automotive’s **mass-market throughput** stack (§28). **Firepower** here means **shipping speed** and **UX coherence** in the **luxury / exotic** niche — not headcount parity. **§30** pairs **live tooling** (above) with **verifiable** levers below — never substitute links for **tenant isolation** or **RBAC** truth.

### 30.2 Doctrine (how we out-iterate in-segment)

| Lever | What it means | Honest scope |
|-------|----------------|--------------|
| **Unified OS** | One repo: **`apps/web`** + **`apps/crm`** + **`apps/api`** + **`packages/*`** | Fewer integration seams than **multi-brand** retail conglomerates |
| **Cinematic first** | **`vortex`** hero + **3D** configure + **Apex Studio** `/build` | **Emotional moat** Cox does not optimize for HNW |
| **Automation** | **Turbo** task graph, **GitHub Actions**, **BullMQ** jobs | **Tenant 3D seed** = **target** when workers + queues fully wired per env (§26, §28.3) |
| **Human + agent parallelism** | Small team + AI-assisted coding (Cursor, etc.) | **Process** — not encoded in `git`; §29 reduces **local** prompt friction |

### 30.3 Technical levers (check these, don’t mythologize)

- **`pnpm@9.15.9`** pinned in workflows — **true** when YAML matches `package.json` `packageManager`.
- **Turbo remote cache + `turbo.json`:** CI logs **`Remote caching disabled`** when **`TURBO_TOKEN` / `TURBO_TEAM`** are unset. Follow **§30** “zero-to-live” + **cache optimization** table: **GitHub Actions secrets** + **local `.env.local`**; **`quality:web`** runs via **`turbo run … --filter=@vex/web`** in **`quality.yml`** for graph-level caching.
- **Parallelism:** `turbo run … --concurrency=N` (and default parallel package builds) — already how the monorepo runs.
- **`quality:web` + Lighthouse:** Run on **qualifying** PR paths (see **`quality.yml`**); **`lighthouserc.json`** enforces **≥0.8** perf / **≥0.9** a11y — **not** 98+ until product + config say so (**VLR**).
- **“Every tenant instantly gets branded 3D”:** **Roadmap / job design** (`tenant-3d-demo-seed`, **`apex-studio-360-export`**) — claim **live** only after **idempotent** worker + audit path is **proven** in staging.

### 30.4 What we do **not** do in the name of “firepower”

- **Do not** mount a **second** R3F **`Canvas`** in **`HeroCinematicLayer`** — breaks **VLR** / §21 (**`DynamicHeroShell`** owns **vortex**).
- **Do not** claim **Cox irrelevant** on **DMS / auctions** — §28 **internal rule** stands until **named** integrations ship.

---

**Visual QA script (one paragraph):** The visitor lands in an **obsidian vault** with **violet–gold** GPU sheen; optional **cinema loop** (soft video crossfade in CSS) or **vortex R3F hero** (formation particles + bloom/god-rays) reads as a **private hypercar gallery** — not a template dealer site. **Configure** and **inventory** 3D feel **dense and smooth** thanks to **adaptive DPR**, **mipmapped** PBR, and **idle** GLB warm — target **60 fps** on capable hardware. Reduced-motion users get **static** parity without broken layout. CRM echoes the **same void** and **glass metric orbs** so staff never context-switch brands.
