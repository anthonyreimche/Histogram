// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The tonal develop sliders' ranges, copied from core's
// src/modules/develop/panels/tonal-params.ts (the Basic panel's limits), so a
// zone drag stops where the matching slider does.

import type { DevelopParams } from "./safelight";

export type NumericParamKey = {
  [K in keyof DevelopParams]: DevelopParams[K] extends number ? K : never;
}[keyof DevelopParams];

export const TONAL_PARAM_RANGE = {
  exposure: { min: -5, max: 5 },
  contrast: { min: -100, max: 100 },
  highlights: { min: -100, max: 100 },
  highlightDetail: { min: -100, max: 100 },
  shadows: { min: -100, max: 100 },
  shadowDetail: { min: -100, max: 100 },
  whites: { min: -100, max: 100 },
  blacks: { min: -100, max: 100 },
  texture: { min: -100, max: 100 },
  clarity: { min: -100, max: 100 },
  dehaze: { min: -100, max: 100 },
  vibrance: { min: -100, max: 100 },
  saturation: { min: -100, max: 100 },
} satisfies Record<string, { min: number; max: number }> &
  Partial<Record<NumericParamKey, { min: number; max: number }>>;

export type TonalParamKey = keyof typeof TONAL_PARAM_RANGE;
