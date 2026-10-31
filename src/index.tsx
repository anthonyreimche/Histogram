// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Registers the Develop "Histogram" panel. It was core's built-in
// `core.histogram` until Safelight 3.2.0 and keeps that panel id, so saved
// layouts keep it where it was.

import { HistogramPanel } from "./HistogramPanel";
import { initRuntime } from "./rt";
import type { SafelightAPI } from "./safelight";

export const PANEL_ID = "core.histogram";

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  host.registerPanel({
    id: PANEL_ID,
    title: "Histogram",
    component: HistogramPanel,
    defaultDock: { module: "develop", direction: "right", order: 1, width: 280, height: 150 },
  });
}
