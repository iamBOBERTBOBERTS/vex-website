# VEX Production Quality Checklist

Every release must prove deployment integrity, runtime health, and luxury-platform quality before it ships.

| Metric | Target | Validation |
| --- | --- | --- |
| Build | pass | `corepack pnpm --filter @vex/web run build` |
| Lint | pass | `corepack pnpm --filter @vex/web run lint` |
| Design system | pass | `corepack pnpm --filter @vex/design-system run build` |
| UI package | pass when touched | `corepack pnpm --filter @vex/ui run build` |
| Lighthouse | 85+ | Lighthouse CI or browser Lighthouse |
| Console errors | 0 | Browser DevTools production and local |
| API failures | 0 | Network tab, live API health, no localhost calls |
| Mobile responsive | yes | Playwright or manual mobile viewport review |
| Hydration warnings | 0 | Browser console during route transitions |
| Luxury score | 8+/10 | Review luxury feel, cinematic feel, trust, depth, originality, smoothness, performance, cohesion |

## Production Truth

- Public frontend: `https://vortex-exotics.netlify.app`
- Expected public API env: `NEXT_PUBLIC_API_URL=https://<real-railway-domain>`
- Expected backend health path: `/health`
- Any production request to `localhost`, any CORS failure, or any silent API fallback fails release validation.

## Release Review

Capture and review:

- Desktop hero
- Homepage mid-scroll
- Collection narrative section
- Inventory page
- Appraisal page
- Mobile hero
- Mobile navigation
- Mobile CTA

Score each surface for luxury feel, cinematic feel, information depth, trust, originality, smoothness, mobile quality, and visual cohesion.
