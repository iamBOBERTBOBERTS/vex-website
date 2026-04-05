"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { apexStudioBuildSnapshotSchema, type ApexStudioBuildSnapshot } from "@vex/shared";
import type { Vehicle } from "@/lib/api";
import type { ConfigOption } from "@/lib/api";
import type { EditionId, FinishId, PowertrainId } from "@/components/configurator/vehicleFinish";

export interface BuildState {
  vehicle: Vehicle | null;
  inventoryId: string | null;
  selectedOptions: Record<string, string>;
  options: ConfigOption[];
  /** Visual + order snapshot — synced with 3D configurator */
  finishId: FinishId;
  edition: EditionId;
  powertrain: PowertrainId;
}

const defaultState: BuildState = {
  vehicle: null,
  inventoryId: null,
  selectedOptions: {},
  options: [],
  finishId: "rosso",
  edition: "Launch",
  powertrain: "V12",
};

type BuildContextValue = BuildState & {
  setVehicle: (v: Vehicle | null) => void;
  setInventoryId: (id: string | null) => void;
  setSelectedOption: (category: string, optionId: string) => void;
  setOptions: (opts: ConfigOption[]) => void;
  setFinishId: (id: FinishId) => void;
  setEdition: (e: EditionId) => void;
  setPowertrain: (p: PowertrainId) => void;
  totalPrice: number;
  /** Serializable snapshot for CRM handoff, share URLs, and Apex Studio export jobs. */
  getApexStudioSnapshot: () => ApexStudioBuildSnapshot;
  reset: () => void;
};

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BuildState>(defaultState);

  const setVehicle = useCallback((vehicle: Vehicle | null) => {
    setState((s) => ({
      ...s,
      vehicle,
      options: [],
      selectedOptions: {},
      finishId: "rosso",
      edition: "Launch",
      powertrain: "V12",
    }));
  }, []);

  const setFinishId = useCallback((finishId: FinishId) => {
    setState((s) => ({ ...s, finishId }));
  }, []);

  const setEdition = useCallback((edition: EditionId) => {
    setState((s) => ({ ...s, edition }));
  }, []);

  const setPowertrain = useCallback((powertrain: PowertrainId) => {
    setState((s) => ({ ...s, powertrain }));
  }, []);

  const setInventoryId = useCallback((inventoryId: string | null) => {
    setState((s) => ({ ...s, inventoryId }));
  }, []);

  const setSelectedOption = useCallback((category: string, optionId: string) => {
    setState((s) => ({
      ...s,
      selectedOptions: { ...s.selectedOptions, [category]: optionId },
    }));
  }, []);

  const setOptions = useCallback((options: ConfigOption[]) => {
    setState((s) => ({ ...s, options }));
  }, []);

  const basePrice = state.vehicle?.basePrice ?? 0;
  const optionsTotal = state.options
    .filter((o) => state.selectedOptions[o.category] === o.id)
    .reduce((sum, o) => sum + o.priceDelta, 0);
  const totalPrice = basePrice + optionsTotal;

  const getApexStudioSnapshot = useCallback((): ApexStudioBuildSnapshot => {
    return apexStudioBuildSnapshotSchema.parse({
      schemaVersion: 1,
      vehicleId: state.vehicle?.id ?? null,
      inventoryId: state.inventoryId,
      finishId: state.finishId,
      edition: state.edition,
      powertrain: state.powertrain,
      selectedOptions: { ...state.selectedOptions },
      totalPriceUsd: totalPrice,
    });
  }, [
    state.vehicle?.id,
    state.inventoryId,
    state.finishId,
    state.edition,
    state.powertrain,
    state.selectedOptions,
    totalPrice,
  ]);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  const value: BuildContextValue = {
    ...state,
    setVehicle,
    setInventoryId,
    setSelectedOption,
    setOptions,
    setFinishId,
    setEdition,
    setPowertrain,
    totalPrice,
    getApexStudioSnapshot,
    reset,
  };

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used within BuildProvider");
  return ctx;
}
