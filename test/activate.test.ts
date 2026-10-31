// What activate() registers: the Histogram panel under core's old panel id,
// title and dock spot (so saved layouts keep it), and nothing else: core gave it
// no dock-header reset and it draws only core's Histogram, so it has no styles
// of its own.

import { describe, expect, it } from "vitest";
import { HistogramPanel } from "../src/HistogramPanel";
import { PANEL_ID, activate } from "../src/index";
import { fakeApi } from "./support/fake-api";

describe("activate", () => {
  it("registers exactly the Histogram panel, as core's core.histogram did", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.panels).toEqual([
      {
        id: "core.histogram",
        title: "Histogram",
        component: HistogramPanel,
        defaultDock: { module: "develop", direction: "right", order: 1, width: 280, height: 150 },
      },
    ]);
    expect(PANEL_ID).toBe("core.histogram");
  });

  it("offers no dock-header reset", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.panels[0].onReset).toBeUndefined();
  });
});
