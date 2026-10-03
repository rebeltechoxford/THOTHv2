# Mira sources and scientific interpretation

THOTH contains a complete snapshot of the Mira tables from the four listed OGLE releases and an unlimited query for the GCVS classification `M`. The snapshot is **75,916 catalog entries** retrieved on 2026-10-03 UTC. Different catalogs can describe the same star, so this is not a count of unique stars. The application does not claim to contain every known Mira from every survey.

| Catalog | Mira entries | Publication and archive |
| --- | ---: | --- |
| OGLE Galactic bulge | 40,356 | [Iwanek et al. 2022, ApJS 260, 46](https://arxiv.org/abs/2203.16552); [archive and schema](https://www.astrouw.edu.pl/ogle/ogle4/OCVS/blg/lpv/) |
| OGLE Galactic disk | 25,625 | [Iwanek et al. 2022](https://arxiv.org/abs/2203.16552); [archive and schema](https://www.astrouw.edu.pl/ogle/ogle4/OCVS/gd/lpv/) |
| OGLE Large Magellanic Cloud | 1,663 | Soszynski et al. 2009, Acta Astron. 59, 239; [archive and schema](https://ftp.astrouw.edu.pl/ogle/ogle3/OIII-CVS/lmc/lpv/) |
| OGLE Small Magellanic Cloud | 352 | Soszynski et al. 2011, Acta Astron. 61, 217; [archive and schema](https://ftp.astrouw.edu.pl/ogle/ogle3/OIII-CVS/smc/lpv/) |
| GCVS, exact classification M | 7,920 | Samus et al. 2017, Astronomy Reports 61, 80; [VizieR catalog](https://cdsarc.cds.unistra.fr/viz-bin/cat/B/gcvs); [full schema](https://cdsarc.cds.unistra.fr/viz-bin/ReadMe/B/gcvs?format=html&tex=true) |

The [OGLE collections page](https://ogle.astrouw.edu.pl/main/collections.html) links the upstream releases. Cite the corresponding OGLE papers when presenting scientific analyses. Credit GCVS and VizieR when using their entries.

The upstream OGLE release READMEs request references to the relevant OGLE papers for scientific use or presentation. GCVS requests its full reference: N. N. Samus, E. V. Kazarovets, O. V. Durlevich, N. N. Kireeva, and E. N. Pastukhova, *General Catalogue of Variable Stars: Version GCVS 5.1*, Astronomy Reports **61**, 80–88 (2017). The [official VizieR usage policy](https://cds.unistra.fr/vizier-org/licences_vizier.html) permits scientific use with citation of authors, publication and publisher, and asks for acknowledgment of CDS/VizieR. Acknowledge VizieR as CDS, Strasbourg, France, [DOI 10.26093/cds/vizier](https://doi.org/10.26093/cds/vizier), with Ochsenbein, Bauer, and Marcout (2000), A&AS **143**, 23. These third-party measurements retain their source attribution and usage conditions; the THOTH software license does not relicense them. The verified use here is scientific research and education.

## Reproducing the snapshot

The packaged `src/thoth/data/manifest.json` records exact download URLs, UTC retrieval time, row counts, references and SHA-256 checksums. `catalog.jsonl.gz` is the normalized complete snapshot. Downloads use each OGLE release's `Miras.dat` and `ident.dat`. The much larger cloud identifier files include other variable types; only the identifiers belonging to `Miras.dat` enter THOTH.

Run `python -m thoth.catalog` from the installed environment to regenerate package data, or `python -m thoth.catalog --output /path/to/data` to create a snapshot in another directory. The refresh validates all sources and observations before replacing files; unexpectedly small or invalid responses fail explicitly. No fallback records are synthesized. An alternate output directory is a reproducibility export; the application reads its packaged snapshot.

The GCVS query uses the VizieR ASU TSV endpoint with `-source=B/gcvs/gcvs_cat`, `VarType=M`, `-out.max=unlimited` and an explicit column list. The service labels the table “GCVS 5.1, version Oct, 2020,” while its history records later service updates. Retrieval dates and the raw query identify the actual snapshot more precisely than that label.

## Values, units and missing measurements

- Positions are equatorial coordinates at **equinox J2000**, converted from sexagesimal values to degrees. Equinox and position epoch are different concepts; these positions do not track present-day proper motion.
- Periods are in days. OGLE primary periods are the published values. GCVS flags can mark uncertain values or period limits and remain in `catalog_flags`.
- OGLE mean I and V magnitudes are **intensity means**. The amplitude is the published **I-band amplitude of the primary period**. Magnitudes use a logarithmic brightness scale; smaller magnitudes mean brighter stars.
- Missing observations, including the many missing V means, remain `null`. GCVS brightness extrema are stored separately with their band and flags; extrema are not substituted for intensity means. A bracketed minimum can represent an amplitude, and minimum-band overrides exist. THOTH exposes a normal minimum only when those flags allow it.
- GCVS maximum-light epochs omit the leading `24`: THOTH adds **2,400,000** to produce full Julian days. GCVS epochs are labeled JD; they should not be silently treated as heliocentrically corrected observations.
- The cloud catalogs' O/C field describes oxygen-rich/carbon-rich chemistry, stored as `chemistry`. It is not substituted for a spectroscopic spectral type.
- GCVS exact `M` selects catalog-confirmed Mira classifications. The live `M*` query also returns 1,266 `M:` uncertain classifications and 3 compound classifications in this snapshot; those are excluded from this confirmed-M selection. Other catalogs and future candidates can be added as separate provenance-bearing sources.

## Real light curves

Two complete, measured I-band curves are bundled for an offline first run:

- [OGLE-BLG-LPV-096697](https://www.astrouw.edu.pl/ogle/ogle4/OCVS/blg/lpv/phot_ogle4/I/OGLE-BLG-LPV-096697.dat): 8,369 OGLE-IV measurements, published primary period 91.97 days.
- [OGLE-LMC-LPV-04312](https://ftp.astrouw.edu.pl/ogle/ogle3/OIII-CVS/lmc/lpv/phot/I/OGLE-LMC-LPV-04312.dat): 465 OGLE-III measurements.

OGLE archive columns are observation time **HJD − 2,450,000**, magnitude, and magnitude uncertainty. `load_lightcurve` returns full heliocentric Julian dates as `time_jd` and labels the time system `HJD`. The supplied photometry retains its reported uncertainties and is sorted by time. Per-star curves outside these examples download on demand and are cached using a hash of the archive URL. `THOTH_CACHE_DIR` overrides the default local user cache. Not every source has every band or survey phase available: unavailable archives raise an explicit error. The linked Galactic curves use OGLE-IV I-band data; the cloud curves use the published OGLE-III archive. GCVS provides summary parameters rather than linked time-series photometry, so those entries require imported observations for numerical analysis.

## What the numerical results mean

Mira stars are long-period pulsating giants. The [OGLE Mira atlas](https://ogle.astrouw.edu.pl/atlas/Miras.html) describes their large amplitudes, variable light-curve shapes, and cycle-to-cycle changes. Survey footprint, extinction, crowding, saturation and detection thresholds affect which stars and measurements appear in these optical catalogs. Missing or faint phases and annual observing gaps can produce aliases in a period search.

Period searches, phase folding, harmonic fits and residual statistics describe the **measured light curve**. A strong periodogram peak is not a complete physical model, a significance probability or an uncertainty estimate. Compare candidate periods with the published period, check time coverage and inspect residuals. Optical amplitudes are band dependent and cannot be compared directly across filters. A catalog period and historical epoch should not be presented as an exact prediction of future maxima.

The fitted Fourier intercept and the uncertainty-weighted arithmetic mean of observed magnitudes are different statistics from the catalog's intensity mean. The kernel's reduced chi-square uses `N − (2 × harmonics + 1)` at the selected trial frequency; it does not account for selecting the frequency through a search. Its reference epoch centers the numerical basis in time and is not the physical date of maximum brightness. Reported observational uncertainties may omit systematic errors and intrinsic changes between Mira cycles, so a large reduced chi-square should prompt examination of the data and model assumptions.

The snapshot does not contain measured distances, masses, radii, luminosities or interior structures for all entries, and THOTH does not invent them. Converting periods or magnitudes into those quantities would need additional observations, extinction corrections and a stated calibrated model. Cluster execution distributes independent light-curve calculations; it does not turn a phenomenological fit into a stellar-evolution simulation.
