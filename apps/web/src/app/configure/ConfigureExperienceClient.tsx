"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { CinematicPaintUniforms } from "@vex/cinematic";
import { DEFAULT_CINEMATIC_UNIFORMS } from "@vex/cinematic";
import { tenantCinematicUniformPatch } from "@vex/shared";
import { useWebglEligible } from "@/hooks/useWebglEligible";
import { DEFAULT_PUBLIC_VEHICLE_GLB } from "@/lib/vehicle3d/defaults";
import { resolveTenantCinematic3d, resolveTenantConfigureGlb } from "@/lib/tenantConfigureAssets";
import styles from "./ConfigureExperience.module.css";

function ConfigureViewerFallback() {
  return (
    <div
      style={{
        minHeight: 420,
        display: "grid",
        alignItems: "center",
        gap: "1rem",
        borderRadius: "1.25rem",
        border: "1px solid rgba(255,255,255,0.1)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)), rgba(7,7,8,0.78)",
        padding: "2rem",
        color: "var(--text-primary)",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: "0.72rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Configure fallback
        </p>
        <h2 style={{ marginTop: "0.9rem", marginBottom: "0.75rem", fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
          The live 3D preview is unavailable in this browser.
        </h2>
        <p style={{ margin: 0, maxWidth: "42rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
          Configuration can continue through the full build flow or a concierge-guided handoff while the preview surface recovers.
        </p>
      </div>
    </div>
  );
}

const CinematicCarViewer = dynamic(
  async () => {
    try {
      const mod = await import("@vex/ui/3d");
      return { default: mod.CinematicCarViewer };
    } catch {
      return { default: ConfigureViewerFallback };
    }
  },
  { ssr: false, loading: () => <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading 3D…</div> },
);

class ConfigureViewerBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ConfigureViewerFallback />;
    }

    return this.props.children;
  }
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles.sliderLabel}>
      <span>
        {label}: <strong style={{ color: "var(--text-secondary)" }}>{value.toFixed(2)}</strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

const BASE_PRICE = 124900;

export function ConfigureExperienceClient({ tenantSlug }: { tenantSlug?: string } = {}) {
  const router = useRouter();
  const webglEligible = useWebglEligible();
  const glbUrl = tenantSlug ? resolveTenantConfigureGlb(tenantSlug) : DEFAULT_PUBLIC_VEHICLE_GLB;
  const tenantCinematic = useMemo(
    () => (tenantSlug ? resolveTenantCinematic3d(tenantSlug) : {}),
    [tenantSlug],
  );
  const [flake, setFlake] = useState(DEFAULT_CINEMATIC_UNIFORMS.flakeDensity);
  const [irid, setIrid] = useState(DEFAULT_CINEMATIC_UNIFORMS.iridescenceStrength);
  const [clear, setClear] = useState(DEFAULT_CINEMATIC_UNIFORMS.clearCoatIntensity);
  const [chrome, setChrome] = useState(DEFAULT_CINEMATIC_UNIFORMS.anisotropicChrome);
  const [angle, setAngle] = useState(DEFAULT_CINEMATIC_UNIFORMS.iridescenceAngle);
  const [refraction, setRefraction] = useState(DEFAULT_CINEMATIC_UNIFORMS.clearCoatRefraction);
  const [anisoStr, setAnisoStr] = useState(DEFAULT_CINEMATIC_UNIFORMS.anisotropyStrength);
  const [lutBlend, setLutBlend] = useState(DEFAULT_CINEMATIC_UNIFORMS.iridescenceLUTBlend);
  const [exploded, setExploded] = useState(false);
  const priceRef = useRef<HTMLSpanElement>(null);

  const cinematicUniforms = useMemo<Partial<CinematicPaintUniforms>>(
    () => ({
      flakeDensity: flake,
      iridescenceStrength: irid,
      clearCoatIntensity: clear,
      anisotropicChrome: chrome,
      iridescenceAngle: angle,
      clearCoatRefraction: refraction,
      anisotropyStrength: anisoStr,
      iridescenceLUTBlend: lutBlend,
    }),
    [flake, irid, clear, chrome, angle, refraction, anisoStr, lutBlend],
  );

  const displayPrice = useMemo(() => {
    const bump =
      flake * 4200 +
      irid * 3800 +
      clear * 2100 +
      chrome * 2600 +
      angle * 800 +
      refraction * 1800 +
      anisoStr * 900 +
      lutBlend * 1200;
    return Math.round(BASE_PRICE + bump);
  }, [flake, irid, clear, chrome, angle, refraction, anisoStr, lutBlend]);

  const estPayment = useMemo(() => Math.round(displayPrice / 72), [displayPrice]);
  const shouldRenderViewer =
    webglEligible === true &&
    !(typeof navigator !== "undefined" && navigator.webdriver);

  const handleSaveToGarage = () => {
    router.push("/contact?intent=garage-save");
  };

  const toggleExplodedView = () => {
    setExploded((e) => !e);
  };

  useEffect(() => {
    if (!tenantSlug) return;
    const patch = tenantCinematicUniformPatch(resolveTenantCinematic3d(tenantSlug));
    if (patch.flakeDensity != null) setFlake(patch.flakeDensity);
    if (patch.iridescenceStrength != null) setIrid(patch.iridescenceStrength);
    if (patch.clearCoatIntensity != null) setClear(patch.clearCoatIntensity);
    if (patch.anisotropicChrome != null) setChrome(patch.anisotropicChrome);
    if (patch.iridescenceAngle != null) setAngle(patch.iridescenceAngle);
    if (patch.clearCoatRefraction != null) setRefraction(patch.clearCoatRefraction);
    if (patch.anisotropyStrength != null) setAnisoStr(patch.anisotropyStrength);
    if (patch.iridescenceLUTBlend != null) setLutBlend(patch.iridescenceLUTBlend);
  }, [tenantSlug]);

  useEffect(() => {
    let cancelled = false;
    import("gsap").then(({ gsap }) => {
      if (cancelled || !priceRef.current) return;
      gsap.fromTo(
        priceRef.current,
        { opacity: 0.4, y: 5, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.42, ease: "power2.out" },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [displayPrice]);

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`glassmorphic magnetic-cta ${styles.ctaExploded} ${exploded ? styles.explodedActive : ""}`}
          onClick={toggleExplodedView}
          aria-pressed={exploded}
          {...{ "data-exploded-view": "true" }}
        >
          Exploded View
        </button>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Exploded: pointer raycast + emissive pulse on mesh under cursor; decorative hotspots when on.
        </span>
      </div>
      <div className={styles.glassSliders}>
        <Slider label="Metallic flake" value={flake} min={0} max={1.5} step={0.01} onChange={setFlake} />
        <Slider label="Iridescence" value={irid} min={0} max={1.2} step={0.01} onChange={setIrid} />
        <Slider label="Clear-coat boost" value={clear} min={0} max={2} step={0.02} onChange={setClear} />
        <Slider label="Chrome anisotropy" value={chrome} min={0} max={1.5} step={0.02} onChange={setChrome} />
        <Slider label="Iridescence angle" value={angle} min={0} max={2.5} step={0.02} onChange={setAngle} />
        <Slider label="Clear-coat refraction" value={refraction} min={0} max={1.2} step={0.02} onChange={setRefraction} />
        <Slider label="Anisotropy strength" value={anisoStr} min={0} max={1.5} step={0.02} onChange={setAnisoStr} />
        <Slider label="Thin-film LUT blend" value={lutBlend} min={0} max={1} step={0.02} onChange={setLutBlend} />
      </div>
      <div className={styles.viewerWrap}>
        {shouldRenderViewer ? (
          <ConfigureViewerBoundary>
            <CinematicCarViewer
              glbUrl={glbUrl}
              paintMode="cinematicLuxury"
              cinematicUniforms={cinematicUniforms}
              explodedInteractive={exploded}
              environmentPreset={tenantCinematic.heroEnvPreset ?? "city"}
              environmentMapURL={tenantCinematic.environmentMapURL}
            />
          </ConfigureViewerBoundary>
        ) : (
          <ConfigureViewerFallback />
        )}
        {exploded ? (
          <div className={styles.hotspots} aria-hidden>
            <span className={styles.hotspot} title="Body finish" />
            <span className={styles.hotspot} title="Glass / trim" />
            <span className={styles.hotspot} title="Wheels" />
          </div>
        ) : null}
      </div>
      <div className={styles.priceTeaser}>
        <div className={styles.priceRow}>
          <span>Configured MSRP (preview)</span>
          <span ref={priceRef} className={styles.priceValue}>
            ${displayPrice.toLocaleString()}
          </span>
        </div>
        <div className={styles.priceRow} style={{ marginTop: "0.35rem", fontSize: "0.78rem" }}>
          <span>Est. finance / mo @ 4.9% APR · 72 mo</span>
          <span style={{ color: "var(--text-primary)" }}>${estPayment.toLocaleString()}/mo</span>
        </div>
        <div className={styles.garageRow}>
          <button
            type="button"
            data-save-garage="1"
            className={`glassmorphic magnetic-cta ${styles.ctaGarage}`}
            onClick={handleSaveToGarage}
          >
            Save to My Garage
          </button>
        </div>
      </div>
    </div>
  );
}
