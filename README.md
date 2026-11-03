# Histogram for Safelight

The Develop **Histogram** panel: a live RGB histogram of the rendered image.

- **Channels:** switch between luminance, RGB and the single red, green or
  blue channel. The choice is remembered.
- **Clipping:** the triangles at each end show clipped shadows and
  highlights; click one to show or hide that end's overlay on the image, or
  use **Clip** (J) for the whole overlay.
- **Tonal zones:** drag across the histogram to adjust the zone under the
  pointer (Blacks, Shadows, Exposure, Highlights or Whites). A drag of about
  300 px covers the slider's whole range, and each drag is one Undo step.
  Double-click a zone to set it back to 0.

The histogram itself is drawn by Safelight's own Histogram component, so it
looks and behaves the same as everywhere else in the app.

Until Safelight 3.2.0 this panel was built in. It keeps the built-in panel's
id (`core.histogram`), so layouts saved before then keep it where it was.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```

Safelight hands the extension its own React through `api.react`, so the
bundle never includes React. `src/safelight.d.ts` mirrors the part of the
app's extension API the extension uses.

## Licence

GPL-3.0-only with an attribution term (GPL v3 §7b), the same licence as Safelight; see LICENSE. Copyright (C) 2026 Anthony Reimche.
