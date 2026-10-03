# THOTHv2 interactive frontend

This is the editable TypeScript source for the Python-served observatory. It has no third-party browser runtime dependencies. Production assets are built by Vite and checked by TypeScript in strict mode.

```sh
npm ci
npm run build
```

Build output goes to `../src/thoth/web/`. `vite.config.mjs` verifies the resolved output is exactly this repository's generated web directory before allowing Vite to empty it. Edit `index.html` and `src/`, then rebuild; do not edit the generated assets.

For development, run the Python application on port 8765, then run `npm run dev`. Vite proxies `/api` to that Python server. The Docker build performs the same frontend build before packaging the application.

## Interactive experiments

- **Discovery Lab:** asynchronous native Fourier searches, chronological model-selection holdout, candidate phase folding, cadence window, residual diagnostics, early/late fits, and conditional observation planning. Phase and planning sliders explore the computed evidence without repeating the expensive search.
- **Pulsation Sandbox:** actual C++ RK4 integration at two resolutions. Parameter changes rerun the native solver after a short debounce. The motion, phase portrait, and energy views share one scrubbable trajectory. The animated disc illustrates a dimensionless oscillator; it does not predict a Mira's physical radius.
- **Beowulf compute lab:** deterministic tasks measured serially and across processes, individual worker results, bootstrap distribution, and interactive Amdahl/Gustafson theory. The MPI execution path and scheduler examples live in the Python project.
- **Catalogue:** existing search, filtering, sky selection, observed/folded light curves, native period fitting, and export capabilities remain available.

## Observation import

The upload form accepts a single-band CSV with `time_jd,magnitude,error_mag` headers. It requires at least 30 measurements, positive uncertainties, and full Julian dates. The time standard and photometric band are explicit. Data stays on the application server. Uploaded measurements become a selectable research source; the catalogue is not required to investigate them.

Planning offsets start at the final measured timestamp in the selected dataset, which can be historical. Holdout data selects the harmonic order; a fresh, untouched dataset is required for final predictive validation. Alternative period curves use full-data fits and must not be interpreted as independently validated forecasts.

The layout supports narrow phone viewports and large touch controls. Scrollable tables contain their own horizontal overflow. Fonts are local system fonts, so the interface does not require a font CDN.
