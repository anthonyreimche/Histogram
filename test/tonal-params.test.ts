// The copied ranges must match core's Basic panel sliders, or a zone drag
// would stop short of (or past) where the slider does.

import { describe, expect, it } from "vitest";
import { TONAL_PARAM_RANGE } from "../src/tonal-params";

describe("TONAL_PARAM_RANGE", () => {
  it("matches core's tonal slider ranges", () => {
    const hundred = { min: -100, max: 100 };
    expect(TONAL_PARAM_RANGE).toEqual({
      exposure: { min: -5, max: 5 },
      contrast: hundred,
      highlights: hundred,
      highlightDetail: hundred,
      shadows: hundred,
      shadowDetail: hundred,
      whites: hundred,
      blacks: hundred,
      texture: hundred,
      clarity: hundred,
      dehaze: hundred,
      vibrance: hundred,
      saturation: hundred,
    });
  });
});
