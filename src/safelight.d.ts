// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The slice of Safelight's extension API this extension touches, mirrored from
// the app's src/extensions/types.ts, src/state/develop-store.ts,
// src/state/develop-slices/view-slice.ts, src/rendering/histogram.ts and
// src/ui/components/Histogram.tsx. Extensions are standalone bundles, so the
// host's source is not on the type path; React types come from @types/react
// (dev only).

import type { ComponentType } from "react";

export interface StoreApi<T> {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState(): T;
  setState(partial: Partial<T> | ((s: T) => Partial<T>)): void;
  subscribe(listener: (state: T, prev: T) => void): () => void;
}

/** 256-bin counts per channel of the rendered frame. */
export interface HistogramData {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  luma: Uint32Array;
  extended?: ExtendedHistogramData;
}

export interface ExtendedHistogramData {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  luma: Uint32Array;
  rangeMin: number;
  rangeMax: number;
  clipLow: number;
  clipHigh: number;
}

/** Clipping overlay bits: 1 shadows, 2 highlights, 4 gamut warning. */
export type ClippingMask = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Tonal zones across the histogram, left (dark) to right (light). */
export type HistogramZone = "blacks" | "shadows" | "exposure" | "highlights" | "whites";

export type HistogramDragPhase = "start" | "move" | "end";

export interface HistogramProps {
  data: HistogramData | null;
  /** Makes the zones draggable; `deltaPx` is the horizontal travel since "start". */
  onAdjust?: (zone: HistogramZone, deltaPx: number, phase: HistogramDragPhase) => void;
  /** Double-clicking a zone. */
  onReset?: (zone: HistogramZone) => void;
  showClipping?: ClippingMask;
  onToggleClipping?: () => void;
  onSetClipping?: (mode: ClippingMask) => void;
}

/** The tonal develop params. Core's params carry many more fields, which this
 *  extension never reads. */
export interface DevelopParams {
  exposure: number;
  contrast: number;
  highlights: number;
  highlightDetail: number;
  shadows: number;
  shadowDetail: number;
  whites: number;
  blacks: number;
  texture: number;
  clarity: number;
  dehaze: number;
  vibrance: number;
  saturation: number;
}

export interface DevelopStoreState {
  params: DevelopParams;
  /** The last rendered frame's histogram; null before the first frame. */
  histogram: HistogramData | null;
  setParam<K extends keyof DevelopParams>(key: K, value: DevelopParams[K]): void;
  /** End a gesture: one undoable history step under `label`. */
  commitEdit(label: string): Promise<void>;
  showClipping: ClippingMask;
  setShowClipping(mode: ClippingMask): void;
  toggleClipping(): void;
}

export interface PanelDockDefault {
  module: "library" | "develop";
  direction: "left" | "right" | "bottom";
  order?: number;
  width?: number;
  height?: number;
}

export interface PanelContribution {
  /** Globally unique, e.g. "core.histogram" or "my-ext.fancy-curves". */
  id: string;
  title: string;
  component: ComponentType;
  defaultDock?: PanelDockDefault;
  /** Right-clicking the panel's dock header offers "Reset to defaults". */
  onReset?: () => void;
}

export interface SafelightAPI {
  version: 1;
  extensionId: string;
  react: typeof import("react");
  registerPanel(c: PanelContribution): void;
  components: {
    /** Core's histogram: channel modes, clipping triangles, draggable zones. */
    Histogram: ComponentType<HistogramProps>;
  };
  stores: {
    useDevelopStore: StoreApi<DevelopStoreState>;
  };
}

export interface ExtensionModule {
  activate(api: SafelightAPI): void;
  deactivate?(): void;
}
