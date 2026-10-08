import { api, post } from './api';
import { errorMessage } from './dom';
import type { Dataset, TransformGrid, TransformJob, TransformResult } from './types';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing transform element: ${id}`);
  return node as T;
};
const input = (id: string): HTMLInputElement | HTMLSelectElement => element(id);
const number = (id: string): number => Number(input(id).value);
const fmt = (value: number | null | undefined, digits = 3): string =>
  typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—';
const html = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
const example = 'OGLE-BLG-LPV-096697';
const datasetMap = new Map<string, Dataset>();
let result: TransformResult | null = null;
let jobId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let chirpCell = { frequency: 0, row: 0 };
let localCell = { frequency: 0, row: 0 };

element('transform-lab').innerHTML = `
  <div class="section-heading"><div><p class="eyebrow">A RHYTHM IS A LANDSCAPE. EXPLORE ITS DIMENSIONS.</p><h2>The Transform Foundry</h2></div><span class="data-badge"><span class="status-dot"></span>C++ grids · Python ensembles · TypeScript lenses</span></div>
  <p class="transform-intro">Make the computation work for a question. Does the rhythm drift? Where does it disappear? Could the cadence recover a weaker signal? Search thousands of models, then challenge the evidence with independently seeded experiments.</p>
  <div class="transform-setup-grid">
    <article class="card transform-control-card"><div class="card-heading"><div><p class="eyebrow">BUILD A COMPUTATIONAL EXPERIMENT</p><h3>Give the unknown another dimension</h3></div><span class="subtle-pill amethyst">Irregular observing times</span></div><div class="transform-body">
      <form id="transform-form">
        <label class="transform-source-label">Measured observations<select id="transform-source"><option value="example">OGLE-BLG-LPV-096697 · bundled Mira</option></select></label>
        <div class="transform-presets" role="group" aria-label="Computation presets"><button type="button" data-transform-preset="quick">Quick survey</button><button type="button" data-transform-preset="deep" aria-pressed="true">Deep field</button><button type="button" data-transform-preset="research">Research grid</button></div>
        <div class="transform-controls"><label>Minimum period / days<input id="transform-min" type="number" min="0.5" max="99999" step="any" value="60" required></label><label>Maximum period / days<input id="transform-max" type="number" min="0.5" max="100000" step="any" value="140" required></label></div>
        <details class="transform-resolution"><summary>Shape the search &amp; compute budget <span>+</span></summary>
          <div class="transform-controls"><label>Frequency cells<input id="transform-frequency" type="number" min="32" max="384" step="1" value="128" required></label><label>Drift cells<input id="transform-drifts" type="number" min="3" max="81" step="2" value="31" required></label><label>Time windows<input id="transform-times" type="number" min="8" max="64" step="1" value="24" required></label><label>Null / injection trials each<input id="transform-surrogates" type="number" min="1" max="64" step="1" value="12" required></label><label>Maximum phase curvature / cycles<input id="transform-curvature" type="number" min="0" max="8" step="0.25" value="2" required></label><label>Gaussian window scale / cycles<input id="transform-window" type="number" min="0.5" max="8" step="0.25" value="3" required></label><label>Fourier harmonics<select id="transform-harmonics"><option>1</option><option selected>2</option><option>3</option></select></label><label>Worker processes<select id="transform-workers"><option>1</option><option selected>2</option><option>4</option><option>6</option><option>8</option></select></label><label>Observation cap<input id="transform-observations" type="number" min="30" max="3000" step="1" value="1200" required></label><label>Reproducible random seed<input id="transform-seed" type="number" min="0" max="2147483647" step="1" value="1729" required></label></div>
        </details>
        <div class="transform-budget"><span>UPPER WORK ESTIMATE</span><strong id="transform-budget">—</strong><p id="transform-budget-detail">Observation visits across the search grid, ensemble, and pairwise structure function.</p></div>
        <button id="transform-run" type="submit" class="fit-button transform-run">✦ Fire the transform foundry</button>
        <p class="transform-note">Increasing the grid creates more real fits. Local workers run on this computer; MPI can distribute the same seeded experiments across machines. No hardware cost is inferred from an operation count.</p>
      </form>
    </div></article>
    <article class="card transform-console"><div class="card-heading"><div><p class="eyebrow">FOLLOW THE ACTUAL WORK</p><h3 id="transform-heading">Four lenses. One observed sky.</h3></div><span id="transform-state" class="subtle-pill">Idle</span></div><div class="transform-body">
      <div class="transform-kernel-list"><div><span>01</span><p>Chirped phase search<small>Frequency × frequency derivative</small></p></div><div><span>02</span><p>Gaussian localized spectrum<small>Time × frequency · irregular observations</small></p></div><div><span>03</span><p>Phase dispersion &amp; structure<small>Folded scatter · all observation pairs</small></p></div><div><span>04</span><p>Noise &amp; injection ensembles<small>Independent seeds · actual worker processes</small></p></div></div>
      <div class="cluster-progress"><div id="transform-progress"></div></div><div class="cluster-progress-label"><span id="transform-detail">Ready to calculate from measured photometry.</span><span id="transform-percent">0%</span></div>
      <ol id="transform-events" class="transform-events" aria-live="polite"><li>Awaiting an experiment.</li></ol><div id="transform-error" class="notice" role="alert" hidden></div>
      <p class="transform-question">An evolving peak is a question to investigate. It can also arise from aliases, gaps, changing amplitude, or an incomplete model.</p>
    </div></article>
  </div>
  <div id="transform-results" hidden>
    <div id="transform-metrics" class="transform-metrics"></div>
    <div class="transform-results-grid">
      <article class="card"><div class="card-heading"><div><p class="eyebrow">FREQUENCY × PHASE CURVATURE</p><h3>What if the clock is changing?</h3></div><span class="subtle-pill amber-pill">Empirical chirp</span></div><div class="transform-body">
        <div class="transform-map"><canvas id="transform-chirp-map" aria-label="Chirped period search heatmap. Use the two sliders below for accessible cell selection."></canvas></div>
        <div class="transform-legend"><span>Unidentifiable</span><i></i><span>Higher χ² improvement</span></div><div id="transform-chirp-readout" class="transform-cell-readout" aria-live="polite"></div>
        <label class="transform-scrub">Frequency column <strong id="transform-chirp-frequency-label"></strong><input id="transform-chirp-frequency" type="range" min="0" max="0" step="1" value="0"></label><label class="transform-scrub">Frequency derivative row <strong id="transform-chirp-row-label"></strong><input id="transform-chirp-row" type="range" min="0" max="0" step="1" value="0"></label>
        <p class="transform-note">Tap the map or use the sliders. Phase = fΔt + ½ḟΔt². A fitted ḟ is an uncalibrated empirical candidate; it does not establish stellar evolution or a physical period-change rate.</p>
      </div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">TIME × FREQUENCY</p><h3>Where does the rhythm hold?</h3></div><span class="subtle-pill amethyst">Gaussian localization</span></div><div class="transform-body">
        <div class="transform-map"><canvas id="transform-local-map" aria-label="Gaussian localized spectrum heatmap. Use the two sliders below for accessible cell selection."></canvas></div>
        <div class="transform-legend"><span>Unidentifiable</span><i></i><span>Higher local χ² improvement</span></div><div id="transform-local-readout" class="transform-cell-readout" aria-live="polite"></div>
        <label class="transform-scrub">Frequency column <strong id="transform-local-frequency-label"></strong><input id="transform-local-frequency" type="range" min="0" max="0" step="1" value="0"></label><label class="transform-scrub">Window center <strong id="transform-local-row-label"></strong><input id="transform-local-row" type="range" min="0" max="0" step="1" value="0"></label>
        <p class="transform-note">Every cell fits observations near a time center with Gaussian weights. Effective support can fall below the actual count. Gaps and edge windows can produce fragile peaks; colors are not calibrated probabilities.</p>
      </div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">FOLD WITHOUT A SINUSOID</p><h3>How much scatter survives?</h3></div><span class="subtle-pill">Phase dispersion</span></div><div class="transform-body"><div id="transform-pdm-chart" class="transform-chart"></div><p id="transform-pdm-note" class="transform-note">Lower phase-bin variance relative to total variance indicates a more coherent fold.</p></div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">ALL PAIRS OF OBSERVATIONS</p><h3>How does the star forget its past?</h3></div><span class="subtle-pill">Structure function</span></div><div class="transform-body"><div id="transform-structure-chart" class="transform-chart"></div><p class="transform-note"><span class="transform-dot copper"></span>Mean squared magnitude difference <span class="transform-dot cyan"></span>Quoted-noise-subtracted difference. Negative corrected values can occur; pair counts and cadence determine support.</p><div id="transform-pair-support" class="transform-small-facts"></div></div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">CHALLENGE THE STATIONARY SEARCH</p><h3>Can independent noise do this?</h3></div><span id="transform-null-badge" class="subtle-pill amethyst">Gaussian null</span></div><div class="transform-body"><div id="transform-null-chart" class="transform-chart"></div><div id="transform-null-facts" class="transform-small-facts"></div><p class="transform-note">Each null trial draws independent Gaussian noise using the supplied measurement errors at the real observing times, then repeats the stationary frequency search. The tail estimate is conditional on this noise model; it does not calibrate the chirp or localized maps.</p></div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">PUT A KNOWN SIGNAL INTO THE CADENCE</p><h3>What could these observations recover?</h3></div><span id="transform-injection-badge" class="subtle-pill amber-pill">Injection recovery</span></div><div class="transform-body"><div id="transform-injection-chart" class="transform-chart"></div><div id="transform-recovery-groups" class="transform-recovery-groups"></div><p class="transform-note"><span class="transform-dot cyan"></span>Recovered <span class="transform-dot purple"></span>Missed or aliased. Each trial injects a sinusoid plus quoted-error Gaussian noise. Recovery reflects this experiment’s period tolerance, search range, amplitude, and cadence.</p></div></article>
    </div>
    <article class="card transform-workers"><div class="card-heading"><div><p class="eyebrow">THE COMPUTATION HAS A RECEIPT</p><h3>Show the workers, the work, and the assumptions</h3></div><button id="transform-export" type="button" class="export-button">Evidence JSON ↓</button></div><div class="transform-body"><div id="transform-work-facts" class="transform-small-facts"></div><div class="table-scroll"><table><thead><tr><th>HOST / PROCESS</th><th>TASKS</th><th>COMPUTE / s</th></tr></thead><tbody id="transform-worker-table"></tbody></table></div>
      <div class="transform-scale"><div><p class="eyebrow">MEASURE HERE. PROJECT A BIGGER QUESTION.</p><h3>Scale this experiment</h3><p class="transform-note">Project repeated seeded ensemble experiments using the average task time measured above. These controls calculate a scenario; they do not launch more computation.</p></div><div class="transform-controls"><label>Equivalent ensemble repetitions<input id="transform-repeat" type="number" min="1" max="1000000" step="1" value="1000"></label><label>Ideal MPI ranks<input id="transform-ranks" type="number" min="1" max="256" step="1" value="80"></label></div><div id="transform-scale-facts" class="transform-small-facts"></div><p class="transform-note">Projected times assume equal-speed ranks and balanced independent tasks, with no startup, communication, I/O, or shared-memory penalty. 80 MPI ranks are 80 processes; placement determines the number of physical machines. They are not 80 clusters. A real multi-node run is needed to measure scaling.</p></div>
      <details class="transform-math"><summary>Inspect mathematics, provenance &amp; limits <span>+</span></summary><div class="transform-equations"><code>φ(t) = f(t − t₀) + ½ḟ(t − t₀)²</code><code>wᵢ(t₀,f) ∝ exp[−½((tᵢ − t₀)f / window_cycles)²] / σᵢ²</code><code>D₂(τ) = mean[(mⱼ − mᵢ)²] within each lag bin</code><code>p̂ = (1 + null maxima ≥ observed maximum) / (trials + 1)</code></div><div id="transform-provenance" class="transform-provenance"></div><div id="transform-caveats" class="transform-caveats"></div><p class="transform-note">Operation counts measure these kernels’ work. They are not FLOP counts or evidence of a historical price tag. Use the measured runtime and an actual multi-node scaling run to assess a cluster.</p></details></div></article>
  </div>`;

function settings() {
  const source = input('transform-source').value;
  return {
    ...(datasetMap.has(source) ? { dataset_id: datasetMap.get(source)!.dataset_id } : { star_id: example }),
    min_period: number('transform-min'), max_period: number('transform-max'),
    frequency_samples: number('transform-frequency'), drift_samples: number('transform-drifts'),
    time_samples: number('transform-times'), drift_cycles: number('transform-curvature'), window_cycles: number('transform-window'),
    surrogates: number('transform-surrogates'), workers: number('transform-workers'), observations_limit: number('transform-observations'),
    harmonics: number('transform-harmonics'), seed: number('transform-seed'),
  };
}

function updateBudget(): void {
  const s = settings();
  const rows = Math.min(s.observations_limit, datasetMap.get(input('transform-source').value)?.observations_count ?? s.observations_limit);
  const visits = rows * s.frequency_samples * (2 * s.harmonics + s.harmonics * s.drift_samples + s.time_samples + 2 * s.surrogates * s.harmonics) + rows * (rows - 1) / 2;
  element('transform-budget').textContent = `${fmt(visits, 0)} observation / harmonic visits`;
  element('transform-budget-detail').textContent = `${fmt(s.frequency_samples * s.drift_samples, 0)} chirp cells · ${fmt(s.frequency_samples * s.time_samples, 0)} localized cells · ${fmt(s.surrogates * 2, 0)} seeded ensemble tasks · ≤${fmt(rows, 0)} observations`;
}

const presets: Record<string, number[]> = { quick: [64, 15, 16, 4, 600, 2], deep: [128, 31, 24, 12, 1200, 2], research: [256, 61, 40, 32, 2400, 3] };
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-transform-preset]')) {
  button.addEventListener('click', () => {
    const values = presets[button.dataset.transformPreset ?? 'deep'];
    ['frequency', 'drifts', 'times', 'surrogates', 'observations', 'harmonics'].forEach((key, index) => input(`transform-${key}`).value = String(values[index]));
    document.querySelectorAll('[data-transform-preset]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    updateBudget();
  });
}

async function loadDatasets(): Promise<void> {
  try {
    const response = await api<{ items: Dataset[] }>('/api/datasets');
    const select = element<HTMLSelectElement>('transform-source');
    for (const dataset of response.items) {
      const key = `dataset:${dataset.dataset_id}`;
      datasetMap.set(key, dataset);
      if (!Array.from(select.options).some(option => option.value === key)) select.add(new Option(`${dataset.name} · ${dataset.band} · ${dataset.observations_count.toLocaleString()} points`, key));
    }
    updateBudget();
  } catch (error) {
    element('transform-detail').textContent = `Saved datasets unavailable: ${errorMessage(error)}`;
  }
}

function fail(message: string): void {
  clearTimeout(timer);
  jobId = null;
  element('transform-error').textContent = message;
  element('transform-error').hidden = false;
  element('transform-state').textContent = 'Failed';
  element('transform-heading').textContent = 'The computation needs attention';
  element<HTMLButtonElement>('transform-run').disabled = false;
  element('transform-run').textContent = '✦ Fire the transform foundry';
}

async function start(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (jobId) return;
  const request = settings();
  if (!(request.min_period < request.max_period)) { fail('Choose a maximum period greater than the minimum.'); return; }
  element('transform-error').hidden = true;
  element('transform-results').hidden = true;
  element<HTMLButtonElement>('transform-run').disabled = true;
  element('transform-run').textContent = 'Native computation in progress…';
  element('transform-state').textContent = 'Queued';
  element('transform-progress').style.width = '0%';
  element('transform-percent').textContent = '0%';
  element('transform-events').innerHTML = '<li>Experiment submitted. Waiting for the coordinator.</li>';
  try {
    const response = await post<{ job_id: string }>('/api/transforms/jobs', request);
    jobId = response.job_id;
    await poll();
  } catch (error) { fail(errorMessage(error)); }
}

async function poll(): Promise<void> {
  if (!jobId) return;
  try {
    const job = await api<TransformJob>(`/api/transforms/jobs/${encodeURIComponent(jobId)}`);
    const percent = job.state === 'complete' ? 100 : Math.max(0, Math.min(100, job.progress?.percent ?? 0));
    element('transform-state').textContent = job.state === 'complete' ? 'Complete' : job.state === 'running' ? 'Computing' : 'Queued';
    element('transform-percent').textContent = `${fmt(percent, 0)}%`;
    element('transform-progress').style.width = `${percent}%`;
    element('transform-detail').textContent = job.progress?.detail ?? job.state;
    element('transform-heading').textContent = job.state === 'complete' ? 'Evidence, ready to explore' : (job.progress?.stage ?? 'Preparing observations').replaceAll('_', ' ');
    if (job.events?.length) element('transform-events').innerHTML = job.events.slice(-6).map(event => `<li><span>${html(event.stage.replaceAll('_', ' '))}</span><small>${html(event.detail)}</small></li>`).join('');
    if (job.state === 'failed') { fail(job.error ?? 'The scientific computation failed.'); return; }
    if (job.state === 'complete' && job.result) {
      result = job.result;
      jobId = null;
      renderResult(result);
      element<HTMLButtonElement>('transform-run').disabled = false;
      element('transform-run').textContent = '✦ Run another experiment';
      return;
    }
    timer = setTimeout(() => { void poll(); }, 700);
  } catch (error) { fail(errorMessage(error)); }
}

type PlotPoint = { x: number; y: number; color?: string; label?: string };
type PlotSeries = { points: (PlotPoint | null)[]; color: string; scatter?: boolean };
function graph(label: string, xLabel: string, yLabel: string, series: PlotSeries[], diagonal = false): string {
  const w = 540, h = 300, left = 75, right = 20, top = 20, bottom = 65;
  const all = series.flatMap(s => s.points.filter((point): point is PlotPoint => point !== null && Number.isFinite(point.x) && Number.isFinite(point.y)));
  if (!all.length) return '<p class="empty-message">No identifiable values for this experiment.</p>';
  const xs = all.map(p => p.x), ys = all.map(p => p.y);
  let xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
  if (diagonal) { xmin = ymin = Math.min(xmin, ymin); xmax = ymax = Math.max(xmax, ymax); }
  const padx = (xmax - xmin) * .05 || 1, pady = (ymax - ymin) * .1 || .05;
  xmin = !diagonal && xmin >= 0 ? Math.max(0, xmin-padx) : xmin-padx;
  xmax += padx; ymin -= pady; ymax += pady;
  const x = (value: number): number => left + (value - xmin) / (xmax - xmin) * (w - left - right);
  const y = (value: number): number => top + (ymax - value) / (ymax - ymin) * (h - top - bottom);
  let body = '';
  for (let i = 0; i <= 3; i++) {
    const xv = xmin + i / 3 * (xmax - xmin), yv = ymin + i / 3 * (ymax - ymin);
    body += `<line x1="${left}" x2="${w-right}" y1="${y(yv)}" y2="${y(yv)}" stroke="#273448"/><text x="${left-10}" y="${y(yv)+5}" text-anchor="end">${html(fmt(yv, Math.abs(ymax-ymin) < 1 ? 3 : 1))}</text><text x="${x(xv)}" y="${h-bottom+26}" text-anchor="middle">${html(fmt(xv, Math.abs(xmax-xmin) < 1 ? 4 : 1))}</text>`;
  }
  if (diagonal) body += `<path d="M${x(xmin)},${y(xmin)} L${x(xmax)},${y(xmax)}" stroke="#56677b" stroke-dasharray="5 5" fill="none"/>`;
  for (const s of series) {
    if (s.scatter) body += s.points.filter((p): p is PlotPoint => p !== null).map(p => `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="4" fill="${p.color ?? s.color}" opacity=".8"><title>${html(p.label ?? `${fmt(p.x)} · ${fmt(p.y)}`)}</title></circle>`).join('');
    else {
      let move = true;
      const path = s.points.map(p => { if (!p || !Number.isFinite(p.y)) { move = true; return ''; } const command = `${move ? 'M' : 'L'}${x(p.x)},${y(p.y)}`; move = false; return command; }).join(' ');
      body += `<path d="${path}" stroke="${s.color}" stroke-width="2" fill="none"/>`;
    }
  }
  body += `<text x="${(left+w-right)/2}" y="${h-12}" text-anchor="middle" class="axis-label">${html(xLabel)}</text><text transform="translate(19 ${(top+h-bottom)/2}) rotate(-90)" text-anchor="middle" class="axis-label">${html(yLabel)}</text>`;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${html(label)}">${body}</svg>`;
}

function point(x: number, y: number | null): PlotPoint | null { return y !== null && Number.isFinite(y) ? { x, y } : null; }
function facts(items: [string, string][]): string { return items.map(([label, value]) => `<span>${html(label)} <b>${html(value)}</b></span>`).join(''); }

function renderResult(report: TransformResult): void {
  element('transform-results').hidden = false;
  const c = report.computation, e = report.ensemble, p = report.provenance;
  element('transform-metrics').innerHTML = [
    ['SEARCHED OBSERVATION VISITS', fmt(c.total_observation_evaluations, 0), 'Measured kernel work; not FLOPs'],
    ['SUMMED NATIVE SERVICE TIME', `${fmt(c.native_seconds)} s`, `Pipeline wall time ${fmt(c.pipeline_seconds)} s`],
    ['CHIRP CANDIDATE PERIOD', `${fmt(report.chirp.best_period_days)} d`, 'At the reference epoch; empirical model'],
    ['SEEDED ENSEMBLE TASKS', fmt(e.task_count, 0), `${e.workers.length} actual processes · ${e.execution}`],
  ].map(([label, value, note]) => `<div><span>${html(label)}</span><strong>${html(value)}</strong><small>${html(note)}</small></div>`).join('');
  chirpCell.frequency = nearest(report.chirp.frequencies, report.chirp.best_frequency);
  chirpCell.row = nearest(report.chirp.frequency_derivatives, report.chirp.best_frequency_derivative);
  localCell = { frequency: chirpCell.frequency, row: Math.floor(report.localized.time_centers_jd.length / 2) };
  for (const kind of ['chirp', 'local'] as const) {
    const grid = kind === 'chirp' ? report.chirp : report.localized;
    const cell = kind === 'chirp' ? chirpCell : localCell;
    element<HTMLInputElement>(`transform-${kind}-frequency`).max = String(grid.frequencies.length - 1);
    element<HTMLInputElement>(`transform-${kind}-row`).max = String(grid.powers.length - 1);
    input(`transform-${kind}-frequency`).value = String(cell.frequency);
    input(`transform-${kind}-row`).value = String(cell.row);
    renderCell(kind);
  }
  const pdm = report.phase_dispersion;
  element('transform-pdm-chart').innerHTML = graph('Phase dispersion over the trial frequencies', 'Frequency / cycles per day', 'Phase dispersion θ', [{ points: pdm.frequencies.map((f, i) => point(f, pdm.theta[i])), color: '#b09aec' }]);
  element('transform-pdm-note').textContent = `Lowest phase-dispersion candidate: ${fmt(pdm.best_period_days)} days. Lower within-bin scatter relative to total scatter indicates a more coherent fold. Phase binning and incomplete coverage can favor aliases; θ is not a probability.`;
  const sf = report.structure_function;
  element('transform-structure-chart').innerHTML = graph('Mean squared brightness differences grouped by observation lag', 'Pair lag / days', 'Squared difference / mag²', [
    { points: sf.lag_centers_days.map((lag, i) => point(lag, sf.mean_squared_difference[i])), color: '#efac7d' },
    { points: sf.lag_centers_days.map((lag, i) => point(lag, sf.noise_corrected_difference[i])), color: '#61d7de' },
  ]);
  element('transform-pair-support').innerHTML = facts([['Pairs in plotted bins', fmt(sf.pair_counts.reduce((a, b) => a+b, 0), 0)], ['Populated lag bins', `${sf.pair_counts.filter(n => n > 0).length} / ${sf.pair_counts.length}`]]);
  element('transform-null-chart').innerHTML = graph('Maximum stationary-search power from each independent Gaussian null trial', 'Null experiment index', 'Maximum χ² improvement', [
    { points: e.null_max_powers.map((power, i) => ({ x: i+1, y: power })), color: '#b09aec', scatter: true },
    { points: [{ x: 1, y: e.observed_max_power }, { x: Math.max(2, e.null_max_powers.length), y: e.observed_max_power }], color: '#efac7d' },
  ]);
  element('transform-null-badge').textContent = `${fmt(e.surrogates, 0)} null searches`;
  element('transform-null-facts').innerHTML = facts([['Conditional tail estimate', fmt(e.empirical_p_value, 4)], ['Resolution floor', fmt(e.p_value_floor, 4)], ['Exceedances', `${fmt(e.exceedances, 0)} / ${fmt(e.surrogates, 0)}`]]);
  element('transform-injection-chart').innerHTML = graph('Injected versus recovered periods for seeded synthetic sinusoids', 'Injected period / days', 'Recovered period / days', [{ points: e.injection_trials.map(trial => ({ x: trial.injected_period_days, y: trial.recovered_period_days, color: trial.recovered ? '#61d7de' : '#b09aec', label: `Trial ${trial.trial_index}: amplitude ${fmt(trial.amplitude_mag)} mag; injected ${fmt(trial.injected_period_days)} d; recovered ${fmt(trial.recovered_period_days)} d; ${trial.recovered ? 'within recovery tolerance' : 'missed / aliased'}` })), color: '#61d7de', scatter: true }], true);
  element('transform-injection-badge').textContent = `${fmt((e.recovery_fraction ?? 0)*100, 1)}% recovered`;
  element('transform-recovery-groups').innerHTML = e.injection_groups.map(group => `<div><span>${fmt(group.amplitude_mag)} mag injection</span><strong>${group.recovery_fraction === null ? 'Untested' : `${fmt(group.recovery_fraction*100, 0)}%`}</strong><small>${group.recovered} / ${group.trials} · unrecovered ${group.alias_count}</small></div>`).join('');
  element('transform-work-facts').innerHTML = facts([
    ['Grid observation-cell visits', fmt(c.observation_cell_evaluations, 0)],
    ['Ensemble harmonic visits', fmt(c.ensemble_observation_frequency_harmonic_evaluations, 0)],
    ['Visits / pipeline second', fmt(c.total_observation_evaluations / Math.max(c.pipeline_seconds, .000001), 0)],
    ['Ensemble wall time', `${fmt(e.elapsed_seconds)} s`], ['Base native duration', `${fmt(c.base_native_seconds)} s`], ['Input used', `${fmt(p.used_observations, 0)} / ${fmt(p.input_observations, 0)}`],
  ]);
  element('transform-worker-table').innerHTML = e.workers.map(worker => `<tr><td>${html(worker.hostname)}<small class="transform-pid">PID ${worker.worker_pid}${worker.mpi_rank !== undefined ? ` · rank ${worker.mpi_rank}` : ''}</small></td><td>${worker.tasks_completed}</td><td>${fmt(worker.compute_seconds)}</td></tr>`).join('');
  element('transform-provenance').textContent = `${p.name || p.star_id} · ${p.band} band · ${p.time_system} · baseline ${fmt(p.observation_span_days, 1)} days\n${p.subsampling}\nSource: ${p.source_url}\nCanonical input SHA-256: ${p.input_sha256}\nEnsemble: ${e.sampling_assumption} · seed ${e.base_seed}`;
  element('transform-caveats').innerHTML = [...report.caveats, ...e.caveats].map(caveat => `<p>${html(caveat)}</p>`).join('');
  renderScale();
}

function renderScale(): void {
  if (!result) return;
  const repetitions = number('transform-repeat'), ranks = number('transform-ranks');
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 1000000 || !Number.isInteger(ranks) || ranks < 1 || ranks > 256) {
    element('transform-scale-facts').textContent = 'Choose 1–1,000,000 repetitions and 1–256 ranks.';
    return;
  }
  const e = result.ensemble, measuredTaskSeconds = e.workers.reduce((sum, worker) => sum+worker.compute_seconds, 0);
  const tasks = e.task_count*repetitions, workerHours = measuredTaskSeconds*repetitions/3600;
  const usedRanks = Math.min(ranks, tasks), idealSeconds = workerHours*3600/Math.max(1, usedRanks);
  element('transform-scale-facts').innerHTML = facts([
    ['Projected tasks', fmt(tasks, 0)], ['Measured average task', `${fmt(measuredTaskSeconds/Math.max(1,e.task_count), 4)} s`],
    ['Projected aggregate worker hours', fmt(workerHours, 3)], ['Ideal wall time', `${fmt(idealSeconds/60, 3)} minutes`],
    ['Ideal concurrent ranks', fmt(usedRanks, 0)], ['Projected ensemble harmonic visits', fmt(result.computation.ensemble_observation_frequency_harmonic_evaluations*repetitions, 0)],
  ]);
}

function nearest(values: number[], target: number): number {
  return values.reduce((best, value, index) => Math.abs(value-target) < Math.abs(values[best]-target) ? index : best, 0);
}

function mapGeometry() {
  return window.matchMedia('(max-width: 640px)').matches
    ? { w: 480, h: 330, left: 78, right: 18, top: 15, bottom: 68 }
    : { w: 620, h: 310, left: 67, right: 18, top: 15, bottom: 58 };
}
function color(power: number | null, min: number, max: number): string {
  if (power === null || !Number.isFinite(power)) return '#101623';
  const stops = [[20, 37, 53], [65, 80, 111], [142, 87, 122], [233, 162, 121], [255, 237, 193]];
  const ratio = Math.max(0, Math.min(1, (power-min) / (max-min || 1))) * (stops.length-1);
  const lower = Math.min(stops.length-2, Math.floor(ratio)), fraction = ratio-lower;
  return `rgb(${stops[lower].map((value, i) => Math.round(value*(1-fraction)+stops[lower+1][i]*fraction)).join(',')})`;
}

function drawMap(kind: 'chirp' | 'local', grid: TransformGrid, rowValues: number[], selected: { frequency: number; row: number }): void {
  const canvas = element<HTMLCanvasElement>(`transform-${kind}-map`);
  const dpr = Math.min(2, window.devicePixelRatio || 1), s = mapGeometry();
  canvas.width = s.w*dpr; canvas.height = s.h*dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#0c1421'; ctx.fillRect(0, 0, s.w, s.h);
  const valid = grid.powers.flat().filter((p): p is number => p !== null && Number.isFinite(p));
  const min = Math.min(...valid), max = Math.max(...valid);
  const width = s.w-s.left-s.right, height = s.h-s.top-s.bottom;
  const cw = width/grid.frequencies.length, ch = height/grid.powers.length;
  for (let row = 0; row < grid.powers.length; row++) for (let col = 0; col < grid.frequencies.length; col++) {
    ctx.fillStyle = color(grid.powers[row]?.[col] ?? null, min, max);
    ctx.fillRect(s.left+col*cw, s.top+(grid.powers.length-row-1)*ch, cw+.4, ch+.4);
  }
  const xpos = s.left+(selected.frequency+.5)*cw, ypos = s.top+(grid.powers.length-selected.row-.5)*ch;
  ctx.strokeStyle = '#fff3ce'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(xpos, s.top); ctx.lineTo(xpos, s.h-s.bottom); ctx.moveTo(s.left, ypos); ctx.lineTo(s.w-s.right, ypos); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(xpos-5, ypos-5, 10, 10);
  ctx.fillStyle = '#b2c2d4'; ctx.font = '17px system-ui';
  ctx.textAlign = 'center';
  for (let tick = 0; tick <= 2; tick++) {
    const col = Math.round(tick/2*(grid.frequencies.length-1));
    ctx.fillText(fmt(grid.frequencies[col], 4), s.left+(col+.5)*cw, s.h-s.bottom+26);
    const row = Math.round(tick/2*(rowValues.length-1));
    ctx.textAlign = 'right';
    const value = kind === 'chirp' ? rowValues[row]*1e6 : rowValues[row]-(result?.chirp.reference_epoch_jd ?? 0);
    ctx.fillText(fmt(value, kind === 'chirp' ? 2 : 0), s.left-9, s.top+(rowValues.length-row-.5)*ch+5);
    ctx.textAlign = 'center';
  }
  ctx.fillText('Frequency / cycles per day', (s.left+s.w-s.right)/2, s.h-7);
  ctx.save(); ctx.translate(15, (s.top+s.h-s.bottom)/2); ctx.rotate(-Math.PI/2);
  ctx.fillText(kind === 'chirp' ? 'ḟ / μcycles day⁻²' : 'Days from reference epoch', 0, 0); ctx.restore();
  canvas.setAttribute('aria-label', `${kind === 'chirp' ? 'Chirp' : 'Localized'} heatmap: ${grid.frequencies.length} frequency columns and ${grid.powers.length} rows. Power range ${fmt(min)} to ${fmt(max)}. Use sliders below to read every cell.`);
}

function renderCell(kind: 'chirp' | 'local'): void {
  if (!result) return;
  const grid = kind === 'chirp' ? result.chirp : result.localized;
  const cell = kind === 'chirp' ? chirpCell : localCell;
  const rows = kind === 'chirp' ? result.chirp.frequency_derivatives : result.localized.time_centers_jd;
  const frequency = grid.frequencies[cell.frequency], row = rows[cell.row], power = grid.powers[cell.row]?.[cell.frequency] ?? null;
  const period = 1/frequency;
  element(`transform-${kind}-frequency-label`).textContent = `${fmt(period)} days`;
  element(`transform-${kind}-row-label`).textContent = kind === 'chirp' ? `${row.toExponential(3)} cycles/day²` : `${fmt(row, 2)} ${result.provenance.time_system}`;
  const second = kind === 'chirp' ? ['Endpoint phase curvature', `${fmt(.5*row*(result.provenance.observation_span_days/2)**2)} cycles`] : ['Effective observations', fmt(result.localized.effective_observations[cell.row]?.[cell.frequency])];
  element(`transform-${kind}-readout`).innerHTML = facts([['Period', `${fmt(period)} d`], ['Power', fmt(power)], [second[0], second[1]]]);
  drawMap(kind, grid, rows, cell);
}

for (const kind of ['chirp', 'local'] as const) {
  for (const axis of ['frequency', 'row'] as const) input(`transform-${kind}-${axis}`).addEventListener('input', () => {
    const cell = kind === 'chirp' ? chirpCell : localCell;
    cell[axis] = number(`transform-${kind}-${axis}`);
    renderCell(kind);
  });
  const canvas = element<HTMLCanvasElement>(`transform-${kind}-map`);
  const selectCell = (event: PointerEvent): void => {
    if (!result) return;
    const grid = kind === 'chirp' ? result.chirp : result.localized;
    const size = mapGeometry();
    const bounds = canvas.getBoundingClientRect(), x = (event.clientX-bounds.left)/bounds.width*size.w, y = (event.clientY-bounds.top)/bounds.height*size.h;
    if (x < size.left || x > size.w-size.right || y < size.top || y > size.h-size.bottom) return;
    const cell = kind === 'chirp' ? chirpCell : localCell;
    const frequency = Math.min(grid.frequencies.length-1, Math.max(0, Math.floor((x-size.left)/(size.w-size.left-size.right)*grid.frequencies.length)));
    const row = Math.min(grid.powers.length-1, Math.max(0, grid.powers.length-1-Math.floor((y-size.top)/(size.h-size.top-size.bottom)*grid.powers.length)));
    if (frequency === cell.frequency && row === cell.row) return;
    cell.frequency = frequency;
    cell.row = row;
    input(`transform-${kind}-frequency`).value = String(cell.frequency);
    input(`transform-${kind}-row`).value = String(cell.row);
    renderCell(kind);
  };
  canvas.addEventListener('pointerdown', selectCell);
  canvas.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') selectCell(event); });
}

element<HTMLFormElement>('transform-form').addEventListener('submit', event => { void start(event); });
element('transform-form').addEventListener('input', event => {
  if (!(event.target instanceof HTMLElement) || event.target.id === 'transform-source') return;
  document.querySelectorAll('[data-transform-preset]').forEach(node => node.setAttribute('aria-pressed', 'false'));
  updateBudget();
});
input('transform-source').addEventListener('change', updateBudget);
input('transform-source').addEventListener('focus', () => { void loadDatasets(); });
element('transform-export').addEventListener('click', () => {
  if (!result) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'thoth-transform-evidence.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
input('transform-repeat').addEventListener('input', renderScale);
input('transform-ranks').addEventListener('input', renderScale);
let mapResizeFrame: number | null = null;
window.addEventListener('resize', () => {
  if (!result || mapResizeFrame !== null) return;
  mapResizeFrame = requestAnimationFrame(() => {
    mapResizeFrame = null;
    renderCell('chirp');
    renderCell('local');
  });
});
updateBudget();
void loadDatasets();
