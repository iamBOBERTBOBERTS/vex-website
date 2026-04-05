# VEX Cinematic Apex v4.0 — engagement electrification

**Status:** Phase 1 (GLSL foundation) complete. Phase 2 (Apex layer) in repo: scroll-orchestrated post-FX, particle logo formation, velocity streaks, `dev:apex` / `cinematic:apex` tasks.

## Strategic KPI targets (hypothesis — instrument in analytics)

| Metric | Target | Apex lever |
|--------|--------|------------|
| Hero dwell | +60% vs baseline | Logo formation, god-ray ramp, CTA flash |
| Configurator depth | 4× | Glass panel + live uniforms + “garage” intent |
| Stripe session start | 2.5× | Emotional peak before checkout funnel |
| White-label velocity | 6× | Tenant uniforms + env presets |
| Revenue | **Cinematic Ultra** tier | Custom flake HDRIs, compute floors, velocity-reactive lighting (Phase 3–4) |

## Phases

| Phase | Scope |
|-------|--------|
| **1** | GLSL moat (`@vex/cinematic`), configure sliders, tenant JSON |
| **2 (Apex)** | Scroll boost → Bloom/GodRays; particle VEX formation on load; speed streaks ∝ scroll velocity; `data-apex-hero`; `NEXT_PUBLIC_CINEMATIC_APEX` |
| **3** | CRM shader customizer, white-label engine |
| **4** | Autonomous visuals (MRR / valuation → glow + bursts) |

## Acceptance

- 60 fps on mid-range hardware (manual); CI: `quality:web` + canvas smoke.
- Lighthouse 98+ on marketing routes (existing budget).
- a11y: no duplicate `id`, landmarks preserved.
- Dynamic 3D: `ssr: false` / client-only Canvas.

## Verification

```bash
pnpm install --frozen-lockfile
pnpm --filter @vex/cinematic build
pnpm --filter @vex/shared build
pnpm -w turbo run build
pnpm --filter @vex/web run quality:web
pnpm dev:apex   # root — shaders + cinematic mode + apex
```

## Internal narrative

See [docs/internal/vex-cinematic-investor-narrative-v4.md](../internal/vex-cinematic-investor-narrative-v4.md) and [v4.1 GLSL narrative](../internal/vex-cinematic-investor-narrative-v4.1.md).

---

## Advanced GLSL exploration log (v4.1)

**Status:** v4.1 deepens `@vex/cinematic` with Belcour-style thin-film phases, 3D fbm flake + specular glints, dual clear-coat + analytic env blend, anisotropic chrome with `uAnisotropyStrength`, and **shared `uMouseInfluence`** (R3F pointer → uniform) for hero + configurator.

### Technique inventory

| Technique | Role | Implementation |
|-----------|------|----------------|
| Thin-film iridescence | Angle-dependent hue (RGB phase paths) | `IridescentPaintGLSL.ts` — optical path ∝ `d·cos(θ) / λ` + mouse/time |
| Procedural metallic flake | Pearl sparkle, diamond glints | `MetallicFlakeLayer.ts` — `vex_fbm3` + `pow` sparkle + `N·H` glint |
| Anisotropic chrome | Stretched wheel/exhaust highlights | `AnisotropicChromeGLSL.ts` — bitangent from `cross(n,up)` × `uAnisotropicChrome` × `uAnisotropyStrength` |
| Multi-layer clear-coat | Fresnel stack + refraction feel | `MultiLayerClearCoat.ts` — dual lobe + warm/cool analytic “env” blend × `uClearCoatRefraction` |

### Integration roadmap

- **Chunks:** `onBeforeCompile` on `MeshPhysicalMaterial`; body = iridescent + flake + clear-coat; chrome meshes = anisotropic layer only (`applyCinematicLuxuryPaint`).
- **Uniforms:** `CinematicPaintUniforms` in `types.ts` — tenant JSON / CRM → same keys as `/configure` sliders.
- **Mouse:** `CinematicMouseUniform` + `root.userData.__cinematicMouse` shared with time ticker.

### Phase 2 acceptance (v4.1)

- 60 fps target on mid-range GPUs (manual); CI unchanged (`quality:web`).
- Lighthouse 98+ on marketing routes (existing LHCI budget).
- Tenant theming: `@vex/shared` `TenantCinematic3dSchema` includes `clearCoatRefraction`, `anisotropyStrength`.
- Dynamic 3D: client-only Canvas; shaders ship in `@vex/cinematic` (no inline shader strings in app routes).

### Resource matrix (research pointers)

- **Belcour / Barla** — multilayer BRDF / thin-film (SIGGRAPH course notes; Belcour library patterns for phase-accurate films).
- **Shadertoy** — iridescence / thin-film search terms for phase stacking intuition (not copied verbatim; VEX uses analytic RGB phases).
- **Three.js** — `onBeforeCompile` + `#include <output_fragment>` injection (r169 `MeshPhysicalMaterial`).
- **fbm / sparkle** — classic IQ-style hash/fbm expanded to 3D domain for flake variation.

### KPI targets (v4.1 hypothesis)

| Metric | Target | Lever |
|--------|--------|--------|
| Hero dwell | +70% | Mouse-driven iridescence + flake + god-ray ramp (Apex) |
| Configurator depth | 5× | New uniforms + glass sliders |
| Stripe session start | 3× | Liquid-metal CTA + burst sync (existing) |
| White-label velocity | 7× | Extended tenant uniform schema |

### Verification

```bash
pnpm install --frozen-lockfile
pnpm --filter @vex/cinematic build
pnpm --filter @vex/shared build
pnpm -w turbo run build
pnpm --filter @vex/web run quality:web
pnpm dev:glsl-apex   # max cinematic: shaders + mode + apex
```

---

## Next phase: Full GLSL Apex integration & engagement electrification (v4.2)

**Status:** Full advanced suite **live** in `@vex/cinematic` + hero + `/configure`: analytic thin-film **plus** 1D spectral **LUT** (`uIridescenceLUT` / `createIridescenceLUTTexture`), mouse + time, flake/clear/chrome layers; **ApexHeroScene** is the dynamic-import entry; **CTA** pulse interval syncs burst particles on hover (Apex); **exploded** configure path uses **pointer raycast** emissive highlight (`ExplodedRaycastHighlight`).

### GLSL chunks activated (body paint)

| Chunk | Uniforms / assets |
|-------|-------------------|
| Thin-film + LUT fallback | `uIridescenceLUTBlend`, `sampler2D uIridescenceLUT` (256×1 DataTexture), `uIridescenceStrength`, `uIridescenceAngle`, `uMouseInfluence` |
| Procedural flake sparkle | `uFlakeDensity`, 3D fbm + glint, time scroll |
| Anisotropic chrome (wheels) | `uAnisotropicChrome`, `uAnisotropyStrength` |
| Multi-layer clear-coat | `uClearCoatIntensity`, `uClearCoatRefraction` (dual-lobe + analytic warm/cool) |

### Engagement electrification primitives (wired)

- **Cursor-reactive speed streaks** — `apexScrollVelocity` → `SpeedStreaks` (Apex).
- **Scroll-orchestrated god-ray / bloom** — `apexScrollBoost` → `VortexPostFXStack`.
- **Particle vortex logo formation** — `formationProgress` when `NEXT_PUBLIC_CINEMATIC_APEX=true` (use `dev:glsl-apex` for full stack).
- **Magnetic liquid-metal CTA** — hover burst + **periodic** `triggerBurstFlash` while primary CTA hovered (Apex).
- **Lenis** — global smooth scroll in `CinematicMotionProvider` (scroll refs still drive Apex math).

### White-label theming hooks

- `@vex/shared` `TenantCinematic3dSchema`: includes `iridescenceLUTBlend` and all v4.1 uniforms.
- Runtime: same `CinematicPaintUniforms` merged in `HeroGltfCar` / `VortexCarMaterialGLSL`.

### KPI dashboard (v4.2 hypothesis)

| Metric | Target | Lever |
|--------|--------|--------|
| Hero dwell | +75% | LUT + mouse + flake + scroll god-rays |
| Configurator depth | 5.5× | All uniforms + exploded raycast + glass UI |
| Magnetic CTA → Stripe intent | 3.2× | CTA burst pulse + paint sync |
| White-label velocity | 8× | Tenant JSON + presets |
| Revenue | **Cinematic Apex GLSL Ultra** | Custom LUT / HDRI tier (roadmap) |

### Acceptance (v4.2)

- 60 fps target mid-range (manual); CI: `quality:web` smoke.
- Lighthouse 98+ (existing LHCI).
- Zero **new** console errors in happy path (shader compile); dynamic imports for 3D routes.
- Playwright: `tests/cinematic-v42.spec.ts` — hero scroll + `data-cinematic-glsl` / canvas.

### Verification

```bash
pnpm install --frozen-lockfile
pnpm --filter @vex/cinematic build
pnpm --filter @vex/shared build
pnpm -w turbo run build
pnpm --filter @vex/web run quality:web
pnpm dev:apex-v42    # shaders on (see .env); combine with CINEMATIC_APEX in dev:glsl-apex for full Apex
pnpm glsl:apex-v42   # turbo pipeline
```

### Investor narrative (v4.2)

See [docs/internal/vex-cinematic-investor-narrative-v4.2.md](../internal/vex-cinematic-investor-narrative-v4.2.md).
