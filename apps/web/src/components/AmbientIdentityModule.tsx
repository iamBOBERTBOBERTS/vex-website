"use client";

import { useState } from "react";
import styles from "./AmbientIdentityModule.module.css";

export function AmbientIdentityModule() {
  const [active, setActive] = useState(false);

  return (
    <aside className={styles.module} aria-label="Ambient identity module">
      <p className={styles.label}>Now playing</p>
      <p className={styles.track}>{active ? "Provenance Meets Velocity" : "Ambient muted"}</p>
      <button type="button" className={styles.toggle} onClick={() => setActive((v) => !v)} aria-pressed={active}>
        {active ? "Pause ambient" : "Play ambient"}
      </button>
    </aside>
  );
}
