# VEX Elite Digital Presence v1 — North Star & Execution Plan

**Date:** 2026-04-04  
**Branch:** `elite-digital-presence-v1` (from `cursor/pilot-appraisal-loop` @ `1e84177`)  
**Status:** Active blueprint — phased implementation; no single PR delivers the full vision.

**Reality check:** The items below describe the **target experience**. Shipping requires multiple sprints: 3D performance budgets, asset pipelines, a11y fallbacks, and load testing. Each phase must pass `pnpm -w turbo run build` and scoped quality gates.

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
│   ├── DealerProgramHero (+ HeroCinematicLayer, WebGL optional layer)
│   ├── AutonomousAgentsShowcase
│   ├── PlatformEnginesSection
│   ├── MarketplaceSubletTeaser
│   ├── PaymentOrchestrationBar
│   ├── ScrollStorySection
│   ├── PrestigeMarquee
│   ├── ExoticPillars
│   ├── ConfiguratorPreview  → future: @vex/3d-configurator VehicleCanvas
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
| **P1** | Hero WebGL performance budget + reduced-motion fallback | Lighthouse CI threshold (incremental) |
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
4. Pick **one** P1 visual task (e.g. hero reduced-motion fallback) — surgical PR.

---

*This document is the north star; execution remains incremental and reversible.*
