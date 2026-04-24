"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vex_saved_vehicle_ids";

function readSavedVehicles() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function SaveVehicleButton({ vehicleId }: { vehicleId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSavedVehicles().includes(vehicleId));
  }, [vehicleId]);

  const toggleSaved = () => {
    const current = readSavedVehicles();
    const next = current.includes(vehicleId) ? current.filter((id) => id !== vehicleId) : [...current, vehicleId];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(next.includes(vehicleId));
  };

  return (
    <button
      type="button"
      onClick={toggleSaved}
      aria-pressed={saved}
      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
        saved
          ? "border-[#f1d38a]/45 bg-[#d4af37]/16 text-[#fff6de]"
          : "border-white/10 bg-white/[0.04] text-[#d8d0c2] hover:border-[#f1d38a]/22 hover:text-[#fff8eb]"
      }`}
    >
      {saved ? "Saved" : "Save to Vault"}
    </button>
  );
}
