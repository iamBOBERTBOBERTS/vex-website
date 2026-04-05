"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CinematicPaintUniforms } from "@vex/cinematic";
import { DEFAULT_CINEMATIC_UNIFORMS } from "@vex/cinematic";
import { DEFAULT_PUBLIC_VEHICLE_GLB } from "@/lib/vehicle3d/defaults";
import { resolveTenantConfigureGlb } from "@/lib/tenantConfigureAssets";
import styles from "./ConfigureExperience.module.css";

const CinematicCarViewer = dynamic(
  () => import("@vex/ui/3d").then((m) => ({ default: m.CinematicCarViewer })),
  { ssr: false, loading: () => <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading 3D…</div> },
);

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
  const glbUrl = tenantSlug ? resolveTenantConfigureGlb(tenantSlug) : DEFAULT_PUBLIC_VEHICLE_GLB;
  const [flake, setFlake] = useState(DEFAULT_CINEMATIC_UNIFORMS.flakeDensity);
  const [irid, setIrid] = useState(DEFAULT_CINEMATIC_UNIFORMS.iridescenceStrength);
  const [clear, setClear] = useState(DEFAULT_CINEMATIC_UNIFORMS.clearCoatIntensity);
  const [chrome, setChrome] = useState(DEFAULT_CINEMATIC_UNIFORMS.anisotropicChrome);
  const [angle, setAngle] = useState(DEFAULT_CINEMATIC_UNIFORMS.iridescenceAngle);
  const [refraction, setRefraction] = useState(DEFAULT_CINEMATIC_UNIFORMS.clearCoatRefraction);
  const [anisoStr, setAnisoStr] = useState(DEFAULT_CINEMATIC_UNIFORMS.anisotropyStrength);
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
    }),
    [flake, irid, clear, chrome, angle, refraction, anisoStr],
  );

  const displayPrice = useMemo(() => {
    const bump =
      flake * 4200 +
      irid * 3800 +
      clear * 2100 +
      chrome * 2600 +
      angle * 800 +
      refraction * 1800 +
      anisoStr * 900;
    return Math.round(BASE_PRICE + bump);
  }, [flake, irid, clear, chrome, angle, refraction, anisoStr]);

  const estPayment = useMemo(() => Math.round(displayPrice / 72), [displayPrice]);

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
          className={`${styles.toggle} ${exploded ? styles.toggleActive : ""}`}
          onClick={() => setExploded((e) => !e)}
          aria-pressed={exploded}
        >
          Exploded view
        </button>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Hotspots highlight finish zones (preview — raycast wiring in CRM slice).
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
      </div>
      <div className={styles.viewerWrap}>
        <CinematicCarViewer glbUrl={glbUrl} paintMode="cinematicLuxury" cinematicUniforms={cinematicUniforms} />
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
          <Link
            href="/contact?intent=garage-save"
            className={styles.garageLink}
            data-save-garage="1"
          >
            Save to My Garage →
          </Link>
        </div>
      </div>
    </div>
  );
}
