"use client";

import Link from "next/link";
import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { ConfiguratorVehicleCanvas } from "@/components/configurator/ConfiguratorVehicleCanvas";
import type { CameraPreset } from "@/components/configurator/VehicleScene";
import {
  FINISH_CSS_GRADIENT,
  FINISH_SWATCHES,
  type EditionId,
  type FinishId,
  type PowertrainId,
} from "@/components/configurator/vehicleFinish";
import styles from "./ConfiguratorPreview.module.css";

const EDITIONS: readonly EditionId[] = ["Launch", "Heritage", "Track"];
const POWERTRAINS: readonly PowertrainId[] = ["V12", "Twin-turbo V8", "Hybrid"];

export function ConfiguratorPreview() {
  const ref = useReveal<HTMLElement>();
  const [edition, setEdition] = useState<EditionId>("Launch");
  const [powertrain, setPowertrain] = useState<PowertrainId>("V12");
  const [finish, setFinish] = useState<FinishId>("rosso");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const basePrice = edition === "Track" ? 348000 : edition === "Heritage" ? 312000 : 279000;
  const powertrainPrice = powertrain === "Hybrid" ? 42000 : powertrain === "Twin-turbo V8" ? 18000 : 0;
  const finishPrice = finish === "oro" ? 6500 : finish === "nero" ? 4800 : 3000;
  const livePrice = basePrice + powertrainPrice + finishPrice;

  const finishGlow = FINISH_CSS_GRADIENT[finish];

  return (
    <section id="configure" ref={ref} className={styles.section} data-reveal>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Interactive configuration</p>
        <h2 className={styles.title}>Dial in your spec before you commit</h2>
        <p className={styles.lede}>
          Edition, powertrain, and finish — orbit the studio model, jump to preset cameras, or let it
          auto-rotate. Every choice updates your deal sheet in the full builder.
        </p>
      </div>
      <div className={styles.layout}>
        <div className={styles.preview} style={{ "--finish": finishGlow } as React.CSSProperties}>
          <div className={styles.previewGlow} aria-hidden />
          <div className={styles.previewViewer}>
            <ConfiguratorVehicleCanvas
              finishId={finish}
              edition={edition}
              powertrain={powertrain}
              cameraPresetOverride={cameraPreset}
              autoRotateOverride={autoRotate}
              onAutoRotateChange={setAutoRotate}
              onCameraPresetChange={setCameraPreset}
            />
          </div>
          <ul className={styles.chips}>
            <li>
              <span className={styles.chipLabel}>Edition</span>
              <span className={styles.chipValue}>{edition}</span>
            </li>
            <li>
              <span className={styles.chipLabel}>Power</span>
              <span className={styles.chipValue}>{powertrain}</span>
            </li>
            <li>
              <span className={styles.chipLabel}>Finish</span>
              <span className={styles.chipValue}>
                {FINISH_SWATCHES.find((f) => f.id === finish)?.label}
              </span>
            </li>
          </ul>
        </div>
        <div className={styles.controls}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Camera choreography</legend>
            <div className={styles.btnRow}>
              <button type="button" className={styles.option} onClick={() => setCameraPreset("threeQuarter")}>
                Hero angle
              </button>
              <button type="button" className={styles.option} onClick={() => setCameraPreset("side")}>
                Profile
              </button>
              <button type="button" className={styles.option} onClick={() => setAutoRotate((v) => !v)}>
                {autoRotate ? "Stop motion" : "Start motion"}
              </button>
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Edition</legend>
            <div className={styles.btnRow}>
              {EDITIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={edition === t ? styles.optionActive : styles.option}
                  onClick={() => setEdition(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Powertrain</legend>
            <div className={styles.btnRow}>
              {POWERTRAINS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={powertrain === p ? styles.optionActive : styles.option}
                  onClick={() => setPowertrain(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Exterior finish</legend>
            <div className={styles.swatchRow}>
              {FINISH_SWATCHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={finish === f.id ? styles.swatchActive : styles.swatch}
                  style={{ background: FINISH_CSS_GRADIENT[f.id] }}
                  onClick={() => setFinish(f.id)}
                  aria-label={f.label}
                  title={f.label}
                />
              ))}
            </div>
          </fieldset>
          <Link href="/build" className={styles.cta}>
            Open full configurator →
          </Link>
          <div className={styles.confidencePanel}>
            <p className={styles.confidenceTitle}>Live build estimate</p>
            <p className={styles.confidenceValue}>${livePrice.toLocaleString("en-US")}</p>
            <p className={styles.confidenceMeta}>Financing and enclosed shipping options available at checkout.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
