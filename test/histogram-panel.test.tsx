// The Histogram panel over a real zustand develop store, with core's Histogram
// component stubbed to the props it receives: the panel hands it the live
// histogram and clipping overlay, turns a zone drag into the zone's tonal param
// (full range over 300 px, clamped, two decimals, one store write per frame,
// one history step per drag) and a zone double-click into a reset to 0. The
// frame clock is a recorder the test runs by hand.

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DRAG_REF_PX, HistogramPanel } from "../src/HistogramPanel";
import { React, initRuntime } from "../src/rt";
import type { ClippingMask, DevelopParams, HistogramData, HistogramZone } from "../src/safelight";
import { fakeApi, histogramData, type Rig } from "./support/fake-api";

let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

beforeEach(() => {
  frames = new Map();
  nextFrame = 1;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = nextFrame++;
    frames.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => void frames.delete(id));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function runFrames(): void {
  const due = [...frames.values()];
  frames.clear();
  act(() => due.forEach((cb) => cb(0)));
}

function mount(
  options: { params?: Partial<DevelopParams>; histogram?: HistogramData | null; showClipping?: ClippingMask } = {},
): Rig {
  const rig = fakeApi(options);
  initRuntime(rig.api);
  render(<HistogramPanel />);
  return rig;
}

function drag(rig: Rig, zone: HistogramZone, ...moves: number[]): void {
  const { onAdjust } = rig.histogram();
  act(() => {
    onAdjust?.(zone, 0, "start");
    moves.forEach((px) => onAdjust?.(zone, px, "move"));
  });
}

function endDrag(rig: Rig, zone: HistogramZone, px: number): void {
  act(() => rig.histogram().onAdjust?.(zone, px, "end"));
}

describe("HistogramPanel", () => {
  it("renders core's Histogram with the store's histogram and clipping overlay", () => {
    const data = histogramData();
    const rig = mount({ histogram: data, showClipping: 5 });
    const props = rig.histogram();
    expect(props.data).toBe(data);
    expect(props.showClipping).toBe(5);
    expect(props.onAdjust).toBeTypeOf("function");
    expect(props.onReset).toBeTypeOf("function");
  });

  it("renders with no histogram before the first frame", () => {
    const rig = mount();
    expect(rig.histogram().data).toBeNull();
    expect(rig.histogram().showClipping).toBe(0);
  });

  it("follows new histograms from the renderer", () => {
    const rig = mount({ histogram: histogramData(1) });
    const next = histogramData(2);
    act(() => rig.develop.setState({ histogram: next }));
    expect(rig.histogram().data).toBe(next);
  });

  it("hands the clipping controls to the store", () => {
    const rig = mount();
    act(() => rig.histogram().onToggleClipping?.());
    expect(rig.calls).toEqual(["toggleClipping"]);
    expect(rig.histogram().showClipping).toBe(7);
    act(() => rig.histogram().onSetClipping?.(2));
    expect(rig.calls).toEqual(["toggleClipping", { setShowClipping: 2 }]);
    expect(rig.histogram().showClipping).toBe(2);
  });

  it("moves exposure across its full range over 300 px, from where it started", () => {
    const rig = mount({ params: { exposure: 1 } });
    drag(rig, "exposure", 30);
    runFrames();
    expect(rig.calls).toEqual([{ setParam: "exposure", value: 2 }]);
    expect(rig.develop.getState().params.exposure).toBe(2);
    expect(DRAG_REF_PX).toBe(300);
  });

  it("maps each zone to the tonal param of the same name", () => {
    const zones: HistogramZone[] = ["blacks", "shadows", "highlights", "whites"];
    for (const zone of zones) {
      const rig = mount();
      drag(rig, zone, -15);
      runFrames();
      expect(rig.calls).toEqual([{ setParam: zone, value: -10 }]);
      cleanup();
    }
  });

  it("clamps to the param's range", () => {
    const rig = mount({ params: { whites: 90 } });
    drag(rig, "whites", 600);
    runFrames();
    expect(rig.develop.getState().params.whites).toBe(100);
    drag(rig, "exposure", -1000);
    runFrames();
    expect(rig.develop.getState().params.exposure).toBe(-5);
  });

  it("rounds to two decimals", () => {
    const rig = mount();
    drag(rig, "exposure", 1);
    runFrames();
    expect(rig.calls).toEqual([{ setParam: "exposure", value: 0.03 }]);
  });

  it("writes the store once per frame, with the latest move", () => {
    const rig = mount();
    drag(rig, "shadows", 3, 6, 9);
    expect(frames.size).toBe(1);
    expect(rig.calls).toEqual([]);
    runFrames();
    expect(rig.calls).toEqual([{ setParam: "shadows", value: 6 }]);
    act(() => rig.histogram().onAdjust?.("shadows", 12, "move"));
    runFrames();
    expect(rig.calls).toEqual([
      { setParam: "shadows", value: 6 },
      { setParam: "shadows", value: 8 },
    ]);
  });

  it("ends a drag by writing any pending move and committing one 'Histogram' step", () => {
    const rig = mount();
    drag(rig, "highlights", 30);
    endDrag(rig, "highlights", 30);
    expect(frames.size).toBe(0);
    expect(rig.calls).toEqual([{ setParam: "highlights", value: 20 }, { commitEdit: "Histogram" }]);
  });

  it("commits a drag whose last move was already written", () => {
    const rig = mount();
    drag(rig, "blacks", 30);
    runFrames();
    endDrag(rig, "blacks", 30);
    expect(rig.calls).toEqual([{ setParam: "blacks", value: 20 }, { commitEdit: "Histogram" }]);
  });

  it("ignores moves and ends with no drag started", () => {
    const rig = mount();
    act(() => rig.histogram().onAdjust?.("exposure", 30, "move"));
    endDrag(rig, "exposure", 30);
    runFrames();
    expect(rig.calls).toEqual([]);
  });

  it("starts each drag from the param's value at that moment", () => {
    const rig = mount();
    drag(rig, "exposure", 30);
    endDrag(rig, "exposure", 30);
    act(() => rig.develop.getState().setParam("exposure", -2));
    drag(rig, "exposure", 60);
    endDrag(rig, "exposure", 60);
    expect(rig.develop.getState().params.exposure).toBe(0);
  });

  it("resets a double-clicked zone's param to 0 as a 'Histogram Reset' step", () => {
    const rig = mount({ params: { shadows: 40 } });
    act(() => rig.histogram().onReset?.("shadows"));
    expect(rig.calls).toEqual([{ setParam: "shadows", value: 0 }, { commitEdit: "Histogram Reset" }]);
    expect(rig.develop.getState().params.shadows).toBe(0);
  });

  it("re-renders only for the store fields it reads", () => {
    const rig = mount({ histogram: histogramData() });
    const before = rig.renders();
    act(() => rig.develop.setState({ params: { ...rig.develop.getState().params, contrast: 10 } }));
    expect(rig.renders()).toBe(before);
  });
});
