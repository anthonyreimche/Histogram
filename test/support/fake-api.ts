// A stand-in Safelight API over real React and zustand. The develop store holds
// the tonal params, the histogram and the clipping overlay the way core's does,
// and records every write. core's Histogram component is replaced by a stub that
// keeps the props it was last rendered with, so a test can drive its callbacks
// (a zone drag, a double-click reset, a clipping toggle) the way the real one
// would.

import * as React from "react";
import { create } from "zustand";
import type {
  ClippingMask,
  DevelopParams,
  DevelopStoreState,
  HistogramData,
  HistogramProps,
  PanelContribution,
  SafelightAPI,
  StoreApi,
} from "../../src/safelight";

export type DevelopCall =
  | { setParam: keyof DevelopParams; value: number }
  | { commitEdit: string }
  | "toggleClipping"
  | { setShowClipping: ClippingMask };

export interface Rig {
  api: SafelightAPI;
  develop: StoreApi<DevelopStoreState>;
  /** Every develop store write, in order. */
  calls: DevelopCall[];
  panels: PanelContribution[];
  /** The props core's Histogram was last rendered with; throws before a render. */
  histogram(): HistogramProps;
  renders(): number;
}

export const DEFAULT_PARAMS: DevelopParams = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  highlightDetail: 0,
  shadows: 0,
  shadowDetail: 0,
  whites: 0,
  blacks: 0,
  texture: 0,
  clarity: 0,
  dehaze: 0,
  vibrance: 0,
  saturation: 0,
};

export function histogramData(fill = 1): HistogramData {
  const bins = new Uint32Array(256).fill(fill);
  return { r: bins, g: bins, b: bins, luma: bins };
}

export function fakeApi({
  params = {},
  histogram = null,
  showClipping = 0,
}: { params?: Partial<DevelopParams>; histogram?: HistogramData | null; showClipping?: ClippingMask } = {}): Rig {
  const calls: DevelopCall[] = [];
  const panels: PanelContribution[] = [];
  let lastProps: HistogramProps | null = null;
  let renderCount = 0;

  const develop: StoreApi<DevelopStoreState> = create<DevelopStoreState>()((set) => ({
    params: { ...DEFAULT_PARAMS, ...params },
    histogram,
    setParam: (key, value) => {
      calls.push({ setParam: key, value });
      set((s) => ({ params: { ...s.params, [key]: value } }));
    },
    commitEdit: async (label) => {
      calls.push({ commitEdit: label });
    },
    showClipping,
    setShowClipping: (mode) => {
      calls.push({ setShowClipping: mode });
      set({ showClipping: mode });
    },
    toggleClipping: () => {
      calls.push("toggleClipping");
      set((s) => ({ showClipping: s.showClipping === 0 ? 7 : 0 }));
    },
  }));

  function Histogram(props: HistogramProps) {
    lastProps = props;
    renderCount++;
    return React.createElement("div", { "data-testid": "histogram" });
  }

  const api: SafelightAPI = {
    version: 1,
    extensionId: "safelight.histogram",
    react: React,
    registerPanel: (c) => void panels.push(c),
    components: { Histogram },
    stores: { useDevelopStore: develop },
  };

  return {
    api,
    develop,
    calls,
    panels,
    histogram: () => {
      if (!lastProps) throw new Error("Histogram has not rendered");
      return lastProps;
    },
    renders: () => renderCount,
  };
}
