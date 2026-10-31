//#region src/rt.ts
var e, t;
function n(n) {
	t = n, e = n.react;
}
//#endregion
//#region src/tonal-params.ts
var r = {
	exposure: {
		min: -5,
		max: 5
	},
	contrast: {
		min: -100,
		max: 100
	},
	highlights: {
		min: -100,
		max: 100
	},
	highlightDetail: {
		min: -100,
		max: 100
	},
	shadows: {
		min: -100,
		max: 100
	},
	shadowDetail: {
		min: -100,
		max: 100
	},
	whites: {
		min: -100,
		max: 100
	},
	blacks: {
		min: -100,
		max: 100
	},
	texture: {
		min: -100,
		max: 100
	},
	clarity: {
		min: -100,
		max: 100
	},
	dehaze: {
		min: -100,
		max: 100
	},
	vibrance: {
		min: -100,
		max: 100
	},
	saturation: {
		min: -100,
		max: 100
	}
}, i = {
	blacks: {
		key: "blacks",
		...r.blacks
	},
	shadows: {
		key: "shadows",
		...r.shadows
	},
	exposure: {
		key: "exposure",
		...r.exposure
	},
	highlights: {
		key: "highlights",
		...r.highlights
	},
	whites: {
		key: "whites",
		...r.whites
	}
};
function a() {
	let { Histogram: n } = t.components, r = t.stores.useDevelopStore, a = r((e) => e.histogram), o = r((e) => e.setParam), s = r((e) => e.commitEdit), c = r((e) => e.showClipping), l = r((e) => e.toggleClipping), u = r((e) => e.setShowClipping), d = e.useRef(null), f = e.useRef(null), p = e.useRef(null), m = () => {
		let e = d.current;
		e && f.current != null && (o(e.key, f.current), f.current = null);
	};
	return /* @__PURE__ */ e.createElement(n, {
		data: a,
		onAdjust: (e, t, n) => {
			if (n === "start") {
				let t = i[e], n = r.getState().params[t.key];
				d.current = {
					...t,
					startValue: n
				};
				return;
			}
			let a = d.current;
			if (!a) return;
			if (n === "end") {
				p.current != null && (cancelAnimationFrame(p.current), p.current = null), m(), d.current = null, s("Histogram");
				return;
			}
			let o = a.max - a.min, c = Math.min(a.max, Math.max(a.min, a.startValue + t / 300 * o));
			f.current = Number(c.toFixed(2)), p.current ??= requestAnimationFrame(() => {
				p.current = null, m();
			});
		},
		onReset: (e) => {
			let t = i[e];
			o(t.key, 0), s("Histogram Reset");
		},
		showClipping: c,
		onToggleClipping: l,
		onSetClipping: u
	});
}
//#endregion
//#region src/index.tsx
var o = "core.histogram";
function s(e) {
	n(e), e.registerPanel({
		id: o,
		title: "Histogram",
		component: a,
		defaultDock: {
			module: "develop",
			direction: "right",
			order: 1,
			width: 280,
			height: 150
		}
	});
}
//#endregion
export { o as PANEL_ID, s as activate };

//# sourceMappingURL=index.js.map