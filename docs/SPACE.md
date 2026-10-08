# The three-dimensional observatory

THOTH links three-dimensional views to the measurements and numerical models
that produced them. It keeps known values, inferred values, model assumptions
and missing evidence distinct. A plausible-looking mesh alone cannot recover
a star's physical structure.

## Every catalog entry has an identity

The sky atlas retains all **75,916 catalog entries** in the bundled snapshot.
Equatorial directions are projected in C++ onto a unit celestial sphere:

```text
x = cos(declination) * cos(right ascension)
y = sin(declination)
z = -cos(declination) * sin(right ascension)
```

This Y-up convention matches the browser's three-dimensional scene. The
Galactic view rotates the same directions with the fixed equatorial-to-Galactic
matrix. It does not translate to a Galactocentric origin. Catalog J2000
coordinates are treated as ICRS directions for this rotation; detailed
FK5/ICRS frame-bias corrections and proper-motion propagation are not applied.
The coordinate definitions follow the reference-frame discussion in
[ESA's Hipparcos and Tycho Catalogues, volume 1](https://www.cosmos.esa.int/documents/532822/552851/vol1_all.pdf),
section 1.5.1.

Rows with missing or invalid coordinates keep their IDs and null positions.
They are excluded from geometric density calculations. Entries from different
catalogs remain separate, even when two entries might describe one physical
star. A catalog entry count is therefore not a unique physical star census.

The angular density layer counts entries in longitude/latitude bins and
divides each count by the bin's solid angle:

```text
area_sr = delta_longitude_radians * (sin(latitude_upper) - sin(latitude_lower))
density = entries_in_bin / area_sr
```

This correction removes the geometric latitude dependence of rectangular
angular bins. It does not remove survey footprint, selection, extinction,
crowding or incompleteness. Density is in **catalog entries per steradian**, not
stars per cubic parsec.

Survey regions, including the Galactic bulge, disk and Magellanic Clouds, have
group counts and spherical mean directions. These groupings reflect catalog
labels. They are not newly identified bound clusters. Antipodal or otherwise
degenerate mean directions yield a null centroid rather than an invented one.

## Three-dimensional models constrained by observed brightness

For a star with measured time-series photometry, the workflow fits a C++
weighted two-harmonic Fourier model. It searches 256 uniformly spaced
frequencies between periods `0.7 * published_period` and
`1.3 * published_period`. A missing published period uses a clearly bounded
50–1,000 day search. Wider period alternatives can be examined in the research
and transform labs.

At most 3,000 sorted measured rows enter this preview fit. A deterministic
subset preserves the first and last observations and the full baseline.
Provenance records the original row count, used count, single band, time
standard, source URL and SHA-256 of the complete selected-band observations.
Immutable measurement tuples and period bounds identify the reusable fit;
scrubbing the three-dimensional model phase does not rerun the period search.

The model view reports the period, reduced chi-square and used observation
count. A large reduced chi-square means this periodic curve leaves residuals
well above the reported photometric errors. Waveform underfit, cycle changes,
outliers, measurement systematics or underestimated errors can contribute;
this statistic alone cannot distinguish those causes. Examine residuals and
evolving-period alternatives before interpreting the family physically.

The fitted magnitude curve gives relative band flux:

```text
F_relative(phase) = 10 ^ [-0.4 * (m_model(phase) - mean_phase_magnitude)]
```

Flux at the mean fitted magnitude is one. This is not an absolute flux
calibration or a bolometric luminosity. Phase zero is the fit's numerical
reference epoch and need not coincide with maximum brightness.

The reconstruction then solves an explicit *family* of spherical,
monochromatic blackbody models:

```text
F_relative = (R/R0)^2 * B_lambda(T) / B_lambda(T0)
R/R0 = F_relative ^ (radius_fraction / 2)
B_lambda(T) / B_lambda(T0) = F_relative ^ (1 - radius_fraction)
```

Here `B_lambda` is Planck's monochromatic radiance. C++ analytically inverts
Planck's law for the temperature at each phase and checks that the resulting
radius and temperature reconstruct the fitted flux. The default reference
temperature `T0 = 3,000 K` is an assumption; `R0 = 1` is an unknown reference
radius expressed in relative units.
For the underlying radiance law and wavelength/frequency distinction, see
[Astropy's physical-model documentation](https://docs.astropy.org/en/stable/modeling/physical_models.html).

- `radius_fraction = 0`: fixed radius; temperature accounts for all the
  relative flux variation.
- `radius_fraction = 1`: fixed temperature; radius accounts for all the
  relative flux variation.
- Values between zero and one share the flux variation between the two.

All these solutions reproduce the same fitted single-band phase curve. Moving the
radius/temperature split changes the three-dimensional star while preserving
the reconstructed flux. That difference exposes an unresolved inverse problem
and indicates why another calibrated band, spectroscopy or interferometry is
valuable. It does not establish which model is physically correct.

Radiative flux closure checks algebraic consistency with that fitted curve.
It does not validate agreement with every observation or with the physical
star. A tiny closure error can coexist with a poor photometric fit; the
default demonstration star exhibits this distinction.

The report also predicts relative monochromatic curves at V, I and K proxy
wavelengths (`0.55`, `0.806`, `2.2 micrometers`). Each prediction uses the selected
radius/temperature family and its assumed reference state; it is an unmeasured
counterfactual, not an additional observation or a calibrated color. Different
families reproduce the same original I curve while predicting different K
curves. That disagreement identifies a measurable way to distinguish the
models. A log-domain calculation keeps magnitude differences stable; fluxes
beyond supported floating-point range are explicit nulls rather than zeros.

The default mesh is a smooth sphere whose computed vertices follow the
selected conditional `R/R0`. Optional angular contrast and displacement are
exploratory controls without observational support. They are not resolved
starspots, measured convection cells, or a recovered hidden hemisphere.

Representative wavelengths of `0.806 micrometers` for I and `0.55 micrometers`
for V are explicit monochromatic approximations. An unrecognized band keeps
its measured Fourier fit but has no radiative family until a representative
wavelength is supplied. Full filter integration, extinction correction,
molecular spectra, dust emission and shocks are absent from this approximation.
The fitted curve and assumed radiative model do not provide calibrated
uncertainties on radius or temperature.

A star without usable measured photometry still has its catalog identity and
angular position, and can display a labeled normalized geometry placeholder.
Its brightness fit and radiative reconstruction remain null. An unavailable
archive is never replaced with a synthetic light curve.

## Actual three-dimensional distance needs additional evidence

The bundled Mira catalog supplies directions but no distances. Plotting every
entry at an invented depth would therefore create a false physical map.
An acquired parallax can instead support a conditional distance posterior,
with its measurement uncertainty and prior assumptions displayed. The spatial
distance layer is separate from the complete angular atlas. A positional
crossmatch alone does not guarantee that an archive candidate is the same star.

The native distance solver checks whether posterior mass concentrated at an
integration boundary can be resolved by its grid. An unresolved case returns
an explicit error instead of misleading distance intervals. Increase numerical
resolution or examine the distance bounds; keep the reported measurement error.
Corrupt or stale acquisition caches are excluded and counted. Candidates whose
posteriors cannot be computed remain in the acquisition receipt and are listed
as skipped in the spatial-map response.

Absolute stellar radius remains a different inference problem from distance:
relative photometry, even with a distance estimate, needs flux calibration,
extinction information and an appropriate physical model to determine size.

## Lift the computed transform maps into surfaces

The chirp and localized-spectrum maps become indexed three-dimensional
surfaces. Horizontal axes carry frequency and either frequency derivative or
observation time; height is the original computed relative chi-square
improvement. The normalized horizontal mesh coordinates remain linked to the
raw numerical axes and powers for readouts and exports.

Rank-deficient cells stay null in the evidence grid. C++ omits every triangle
touching a missing vertex. GPU storage uses finite placeholders for unused
vertices, with an explicit missing-vertex list; those placeholders are never
drawn and never represent a zero-power measurement.

Surface height is a diagnostic statistic, not probability, physical terrain,
distance, or a reconstruction of a stellar interior. The same caution applies
to apparent peaks and valleys when the scene is rotated.

## Compute clusters have a different meaning

A three-dimensional view of the worker farm can show real process IDs,
hostnames, MPI ranks, completed jobs and elapsed time from an actual run.
Node positions in that view are a logical visualization, not measured rack
locations, physical machine distances or an automatically discovered network
topology. A single-host MPI run remains a single-host run even when each rank
has its own visible node.

## Reproduce the geometry from Python

```python
from thoth.catalog import EXAMPLE_STAR_ID, get_star, load_catalog, load_lightcurve
from thoth.space import prepare_space_catalog, build_star_model

atlas = prepare_space_catalog(load_catalog(), longitude_bins=72, latitude_bins=36,
                              threads=4)
model = build_star_model(get_star(EXAMPLE_STAR_ID), load_lightcurve(EXAMPLE_STAR_ID),
                         phase=0.25, resolution=48, radius_fraction=0.5,
                         reference_temperature_k=3000)

print(atlas["counts"])
print(model["selected_model"])
print(model["radiative_family"]["identifiability"])
```

The native kernels release the Python GIL. Celestial projection uses OpenMP;
surface construction and radiative inversion use C++ arrays and return indexed
mesh buffers with measured timings. Mesh previews bound latitude resolution
to 8–128 segments, longitude to twice that number, and phase curves to 301
samples. These limits keep mobile interaction practical while the heavier
period, drift and ensemble calculations remain in the compute workflows.

Tests verify complete entry retention, solid-angle accounting, source hashes,
missing-data behavior, deterministic fit reuse, actual measured OGLE data,
surface scaling, and flux closure for mutually distinct radius/temperature
families. Scientific validation of a unique physical stellar reconstruction
would require the additional measurements described above.
