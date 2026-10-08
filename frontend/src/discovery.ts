import { api, post } from './api';
import { errorMessage } from './dom';
import type { Candidate, Dataset, ResearchJob, ResearchResult, SimulationParameters, SimulationResult, Star } from './types';

const d = (id: string): HTMLElement => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing lab element: ${id}`);
  return node;
};
const field = (id: string): HTMLInputElement | HTMLSelectElement => {
  const node = d(id);
  if (!(node instanceof HTMLInputElement || node instanceof HTMLSelectElement)) throw new Error(`Expected control: ${id}`);
  return node;
};
const btn = (id: string): HTMLButtonElement => {
  const node = d(id);
  if (!(node instanceof HTMLButtonElement)) throw new Error(`Expected button: ${id}`);
  return node;
};
const slider = (id: string): HTMLInputElement => {
  const node = field(id);
  if (!(node instanceof HTMLInputElement)) throw new Error(`Expected slider: ${id}`);
  return node;
};
const format = (value: number | null, digits = 3): string => typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—';
const escapeHTML = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
const colors = ['#efac7d', '#b09aec', '#61d7de', '#8dd8ae', '#e68fa4'];
type XY = { x: number; y: number; label?: string; color?: string };
type Series = { points: XY[]; color: string; dashed?: boolean; scatter?: boolean; opacity?: number };
interface PlotOptions { label: string; xLabel: string; yLabel: string; series: Series[]; reverseY?: boolean; xRange?: number[]; yRange?: number[]; markerX?: number; highlight?: XY; zeroLine?: boolean }

function extent(values: number[]): number[] {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return [0, 1];
  const low = Math.min(...finite), high = Math.max(...finite);
  const pad = Math.max((high - low) * 0.09, Math.abs(high) * 0.001, 0.01);
  return [low - pad, high + pad];
}

function plot(options: PlotOptions): string {
  const mobile = window.matchMedia('(max-width: 640px)').matches;
  const width = mobile ? 460 : 620, height = mobile ? 300 : 275;
  const left = mobile ? 63 : 52, right = mobile ? 20 : 15, top = 15, bottom = mobile ? 51 : 43;
  const ticks = mobile ? 3 : 4;
  // The viewBox scales to the card width. Larger SVG text keeps phone labels
  // readable at approximately 300 CSS pixels without changing desktop charts.
  const textStyle = mobile ? ' style="font-size:16px"' : '';
  const all = options.series.flatMap(s => s.points).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  const xr = options.xRange ?? extent(all.map(p => p.x)), yr = options.yRange ?? extent(all.map(p => p.y));
  const xs = (x: number): number => left + (x - xr[0]) / (xr[1] - xr[0] || 1) * (width - left - right);
  const ys = (y: number): number => top + (options.reverseY ? y - yr[0] : yr[1] - y) / (yr[1] - yr[0] || 1) * (height - top - bottom);
  let body = '';
  for (let tick = 0; tick <= ticks; tick++) {
    const xv = xr[0] + tick / ticks * (xr[1] - xr[0]), yv = yr[0] + tick / ticks * (yr[1] - yr[0]);
    body += `<line x1="${left}" x2="${width - right}" y1="${ys(yv)}" y2="${ys(yv)}" class="chart-grid"/><text x="${left - 8}" y="${ys(yv) + (mobile ? 5 : 3)}" text-anchor="end" class="chart-text"${textStyle}>${escapeHTML(format(yv, 2))}</text><text x="${xs(xv)}" y="${height - bottom + (mobile ? 24 : 18)}" text-anchor="middle" class="chart-text"${textStyle}>${escapeHTML(format(xv, xr[1] - xr[0] < 0.1 ? 5 : xr[1] - xr[0] < 3 ? 2 : 0))}</text>`;
  }
  if (options.zeroLine && yr[0] <= 0 && yr[1] >= 0) body += `<line x1="${left}" x2="${width - right}" y1="${ys(0)}" y2="${ys(0)}" stroke="#597082" stroke-dasharray="4 4"/>`;
  for (const series of options.series) {
    const valid = series.points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (series.scatter) {
      const stride = Math.max(1, Math.ceil(valid.length / 1800));
      body += valid.filter((_, i) => i % stride === 0).map(p => `<circle cx="${xs(p.x)}" cy="${ys(p.y)}" r="1.8" fill="${p.color ?? series.color}" opacity="${series.opacity ?? 0.55}"><title>${escapeHTML(p.label ?? `${format(p.x)} · ${format(p.y)}`)}</title></circle>`).join('');
    } else {
      body += `<path d="${valid.map((p, i) => `${i ? 'L' : 'M'}${xs(p.x).toFixed(2)},${ys(p.y).toFixed(2)}`).join(' ')}" fill="none" stroke="${series.color}" stroke-width="1.7" opacity="${series.opacity ?? 1}"${series.dashed ? ' stroke-dasharray="4 4"' : ''}/>`;
    }
  }
  if (options.markerX !== undefined) body += `<line x1="${xs(options.markerX)}" x2="${xs(options.markerX)}" y1="${top}" y2="${height - bottom}" stroke="#e9bb8c" opacity=".8" stroke-dasharray="3 4"/>`;
  if (options.highlight) body += `<circle cx="${xs(options.highlight.x)}" cy="${ys(options.highlight.y)}" r="5" stroke="#efac7d" stroke-width="1.5" fill="#0e1623"/>`;
  body += `<line x1="${left}" x2="${width - right}" y1="${height - bottom}" y2="${height - bottom}" class="chart-axis"/><text x="${width / 2}" y="${height - 4}" text-anchor="middle" class="chart-label"${textStyle}>${escapeHTML(options.xLabel)}</text><text transform="translate(${mobile ? 17 : 12} ${height / 2}) rotate(-90)" text-anchor="middle" class="chart-label"${textStyle}>${escapeHTML(options.yLabel)}</text>`;
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHTML(options.label)}">${body}</svg>`;
}

let selectedStar: Star | null = null;
let exampleStar: Star | null = null;
let exampleStarId = 'OGLE-BLG-LPV-096697';
let researchBoundsTouched = false;
let researchResult: ResearchResult | null = null;
let candidateIndex = 0;
let researchJobId: string | null = null;
let researchTimer: ReturnType<typeof setTimeout> | undefined;
const datasets = new Map<string, Dataset>();
let simulation: SimulationResult | null = null;
let simulationView: 'displacement' | 'phase' | 'energy' = 'displacement';
let simulationStep = 0;
let simulationRequest = 0;
let simulationTimer: ReturnType<typeof setTimeout> | undefined;
let animationFrame: number | null = null;
let previousFrame = 0;
let animationAccumulator = 0;

export function setDiscoveryStar(star: Star): void {
  selectedStar = star;
  const source = field('research-source');
  if (!(source instanceof HTMLSelectElement)) return;
  const existing = source.querySelector<HTMLOptionElement>('option[value="selected"]');
  if (existing) existing.textContent = `Selected star · ${star.name || star.id}`;
  else source.add(new Option(`Selected star · ${star.name || star.id}`, 'selected'));
  if (star.id === exampleStarId) {
    exampleStar = star;
    if (!researchResult && !researchBoundsTouched && source.value === 'example') setResearchBounds(star);
  }
}

function setResearchBounds(star: Star | null): void {
  const period = star?.period_days;
  if (period && period > 0) {
    field('research-min').value = String(Math.max(10, Math.floor(period * 0.65)));
    field('research-max').value = String(Math.min(5000, Math.ceil(period * 1.5)));
  }
}

function addDataset(dataset: Dataset): string {
  const key = `dataset:${dataset.dataset_id}`;
  const existing = datasets.has(key);
  datasets.set(key, dataset);
  const source = field('research-source');
  if (!existing && source instanceof HTMLSelectElement) source.add(new Option(`${dataset.name} · ${dataset.band} band · ${dataset.time_system} · ${dataset.observations_count.toLocaleString()} points`, key));
  return key;
}

function stageTitle(stage: string): string {
  return ({ prepare: 'Preparing observations', preparing: 'Preparing observations', model_comparison: 'Challenging competing Fourier models', compare_models: 'Challenging competing Fourier models', aliases: 'Searching competing frequency peaks', cadence: 'Examining the sampling window', stability: 'Comparing early and late cycles', period_stability: 'Comparing early and late cycles', observation_planning: 'Finding discriminating observation times', planning: 'Finding discriminating observation times', complete: 'Evidence ready to explore' } as Record<string, string>)[stage] ?? stage.replaceAll('_', ' ');
}

function normalizeStage(stage: string): string {
  return ({ model_comparison: 'compare_models', aliases: 'cadence', stability: 'period_stability', observation_planning: 'planning' } as Record<string, string>)[stage] ?? stage;
}

async function startResearch(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (researchJobId) return;
  const minimum = Number(field('research-min').value), maximum = Number(field('research-max').value);
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum <= 0 || minimum >= maximum) {
    showResearchError('Choose a positive minimum period and a greater maximum period.');
    return;
  }
  const source = field('research-source').value;
  const samples = Number(field('research-samples').value);
  const observationsLimit = Math.min(3000, Math.floor(48000000 / (12 * samples)));
  const request = { ...(datasets.has(source) ? { dataset_id: datasets.get(source)!.dataset_id } : { star_id: source === 'selected' ? selectedStar?.id ?? exampleStarId : exampleStarId }), min_period: minimum, max_period: maximum, samples, threads: Number(field('research-threads').value), observations_limit: observationsLimit };
  btn('research-run').disabled = true;
  btn('research-run').textContent = 'Preparing the investigation…';
  d('research-error').hidden = true;
  d('research-results').hidden = true;
  d('research-state').textContent = 'Queued';
  d('research-progress').style.width = '0%';
  d('research-percent').textContent = '0%';
  d('research-heading').textContent = 'Preparing observations';
  d('research-events').innerHTML = `<li><span class="timeline-dot"></span><div>Experiment submitted<small>${escapeHTML(datasets.get(source)?.name ?? (source === 'selected' ? selectedStar?.name : exampleStarId))} · ${format(minimum, 0)}–${format(maximum, 0)} days</small></div></li>`;
  document.querySelectorAll<HTMLElement>('.research-pipeline>span').forEach(node => node.className = '');
  try {
    const response = await post<{ job_id: string; state: string }>('/api/research/jobs', request);
    researchJobId = response.job_id;
    await pollResearch();
  } catch (error) { failResearch(errorMessage(error)); }
}

function showResearchError(message: string): void {
  d('research-error').textContent = message;
  d('research-error').hidden = false;
}

function failResearch(message: string): void {
  clearTimeout(researchTimer);
  researchJobId = null;
  d('research-state').textContent = 'Failed';
  d('research-heading').textContent = 'The investigation needs attention';
  showResearchError(message);
  btn('research-run').disabled = false;
  btn('research-run').textContent = '✦ Investigate the unknowns';
}

async function pollResearch(): Promise<void> {
  if (!researchJobId) return;
  try {
    const job = await api<ResearchJob>(`/api/research/jobs/${encodeURIComponent(researchJobId)}`);
    const stage = job.progress?.stage ?? job.state;
    const progress = job.state === 'complete' ? 100 : Math.min(100, Math.max(0, job.progress?.percent ?? 0));
    d('research-progress').style.width = `${progress}%`;
    d('research-percent').textContent = `${Math.round(progress)}%`;
    d('research-heading').textContent = stageTitle(stage);
    d('research-state').textContent = job.state === 'complete' ? 'Complete' : job.state === 'failed' ? 'Failed' : 'Computing';
    d('research-detail').textContent = job.progress?.detail ?? 'Python is coordinating the native computation.';
    const events = job.events ?? [];
    if (events.length) d('research-events').innerHTML = events.slice(-7).map(item => `<li><span class="timeline-dot"></span><div>${escapeHTML(stageTitle(item.stage))}<small>${item.elapsed_seconds === undefined ? '' : `${format(item.elapsed_seconds, 2)} s · `}${escapeHTML(item.detail)}</small></div></li>`).join('');
    const stages = ['compare_models', 'cadence', 'period_stability', 'planning'];
    const current = stages.indexOf(normalizeStage(stage));
    document.querySelectorAll<HTMLElement>('.research-pipeline>span').forEach(node => {
      const index = stages.indexOf(node.dataset.stage ?? '');
      node.classList.toggle('active', index === current && job.state !== 'complete');
      node.classList.toggle('done', job.state === 'complete' || index < current);
    });
    if (job.state === 'failed') { failResearch(job.error ?? 'The research computation failed.'); return; }
    if (job.state === 'complete') {
      if (!job.result) { failResearch('The completed job did not include an evidence report.'); return; }
      researchResult = job.result;
      window.dispatchEvent(new CustomEvent('thoth:research-result', {detail:job.result}));
      candidateIndex = 0;
      researchJobId = null;
      btn('research-run').disabled = false;
      btn('research-run').textContent = '✦ Investigate the unknowns';
      d('research-heading').textContent = 'Evidence ready to explore';
      renderResearch();
      return;
    }
    researchTimer = setTimeout(() => void pollResearch(), 550);
  } catch (error) { failResearch(errorMessage(error)); }
}

function fact(label: string, value: string, unit: string, note: string): string {
  return `<div><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}<small>${escapeHTML(unit)}</small></strong><p>${escapeHTML(note)}</p></div>`;
}

function primitiveMetric(record: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) if (typeof record[key] === 'number') return record[key];
  return fallback;
}

function renderResearch(): void {
  if (!researchResult) return;
  const result = researchResult, model = result.selected_model;
  const nativeSeconds = primitiveMetric(result.computation, ['native_seconds', 'total_native_seconds', 'elapsed_seconds']);
  d('research-summary').innerHTML = fact('TRAINING-SELECTED PERIOD', format(model.period_days, 4), 'days', `${model.harmonics} harmonics · earlier ${result.training_observations.toLocaleString()} observations`) + fact('WITHHELD PREDICTION ERROR', format(model.holdout_rmse_mag, 4), 'mag', `Unweighted RMSE · later ${result.holdout_observations.toLocaleString()} observations`) + fact('FULL-DATA CANDIDATES', String(result.candidates.length), 'rhythms', 'Lens curves use all observations') + fact('OBSERVATIONS TESTED', result.residuals.length.toLocaleString(), 'points', `Native compute: ${format(nativeSeconds, 3)} s`);
  const maxError = Math.max(...result.models.map(item => item.holdout_weighted_rmse_mag), 0.001);
  d('model-comparison').innerHTML = result.models.map(item => `<div class="model-bar-row ${item.harmonics === model.harmonics ? 'winner' : ''}"><span>${item.harmonics} harmonic${item.harmonics === 1 ? '' : 's'}${item.harmonics === model.harmonics ? ' ✦' : ''}</span><div class="model-bar"><i style="width:${Math.max(1, item.holdout_weighted_rmse_mag / maxError * 100)}%"></i></div><strong>${format(item.holdout_weighted_rmse_mag, 4)}</strong></div>`).join('');
  d('model-table').innerHTML = result.models.map(item => `<tr><td>${item.harmonics === model.harmonics ? '✦ ' : ''}${item.harmonics}</td><td>${format(item.period_days, 3)}</td><td>${format(item.holdout_weighted_rmse_mag, 4)}</td><td>${format(item.bic, 1)}</td></tr>`).join('');
  d('hypothesis-options').innerHTML = result.candidates.map((candidate, index) => `<button type="button" class="${index === candidateIndex ? 'active' : ''}" data-candidate="${index}" aria-pressed="${index === candidateIndex}">${index === 0 ? 'Leading' : `Alternative ${index}`}<br>${format(candidate.period_days, 2)} d</button>`).join('');
  const frequencies = result.periodogram.frequencies, powers = result.periodogram.powers;
  const frequencyRange = [Math.min(...frequencies), Math.max(...frequencies)];
  const periods = frequencies.map((frequency, i) => ({ x: frequency, y: powers[i] ?? NaN })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y)).sort((a, b) => a.x - b.x);
  const windowPoints = result.spectral_window.frequencies.map((frequency, i) => ({ x: frequency, y: result.spectral_window.powers[i] })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= frequencyRange[0] && p.x <= frequencyRange[1]).sort((a, b) => a.x - b.x);
  d('cadence-chart').innerHTML = plot({ label: 'Period search and native spectral window; shared peaks can indicate cadence aliases', xLabel: 'Trial frequency / day⁻¹', yLabel: 'Relative response', xRange: frequencyRange, yRange: [0, Math.max(1, ...periods.map(p => p.y), ...windowPoints.map(p => p.y)) * 1.05], series: [{ points: periods, color: colors[1] }, { points: windowPoints, color: colors[2], opacity: 0.6 }], markerX: 1 / model.period_days });
  const epoch = Math.floor(Math.min(...result.residuals.map(row => row.time_jd)) / 1000) * 1000;
  d('residual-chart').innerHTML = plot({ label: 'Training and withheld residuals around zero', xLabel: `Observation time − ${epoch} / days`, yLabel: 'Observed − predicted / mag', zeroLine: true, series: [{ points: result.residuals.filter(row => row.partition === 'training').map(row => ({ x: row.time_jd - epoch, y: row.residual_mag, label: `Training residual ${format(row.residual_mag, 4)} mag` })), color: colors[2], scatter: true }, { points: result.residuals.filter(row => row.partition === 'holdout').map(row => ({ x: row.time_jd - epoch, y: row.residual_mag, label: `Withheld residual ${format(row.residual_mag, 4)} mag` })), color: colors[0], scatter: true }] });
  d('stability-windows').innerHTML = result.stability.map(item => `<div><small>${escapeHTML(item.label)}</small><strong>${format(item.period_days, 2)} d</strong><small>${item.n_observations.toLocaleString()} observations</small></div>`).join('');
  d('plan-shortcuts').innerHTML = result.observation_plan.slice(0, 3).map((item, index) => `<button type="button" data-plan-day="${item.days_after_last_observation}">Test ${index + 1} · +${format(item.days_after_last_observation, 1)} d</button>`).join('');
  const planHorizon = Math.ceil(result.planning_horizon_days);
  slider('plan-scrub').max = String(planHorizon);
  field('plan-scrub').value = String(result.observation_plan[0]?.days_after_last_observation ?? 0);
  const computationLabels: Record<string, string> = { native_seconds: 'Native C++ time / s', total_seconds: 'Python pipeline elapsed / s', trial_frequency_evaluations: 'Trial frequencies fitted', observation_frequency_harmonic_evaluations: 'Observation × frequency × harmonic evaluations', frequency_scans: 'Native frequency scans', samples_per_scan: 'Trial frequencies per scan', threads_requested: 'C++ threads requested', threads_used: 'C++ threads used' };
  const entries = Object.entries(result.computation).filter(([, value]) => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean');
  d('research-computation').innerHTML = entries.map(([key, value]) => `<span>${escapeHTML(computationLabels[key] ?? key.replaceAll('_', ' '))}: <b>${escapeHTML(typeof value === 'number' ? format(value, key.includes('seconds') ? 4 : 0) : value)}</b></span>`).join('');
  d('research-caveats').innerHTML = result.caveats.map(message => `<p>${escapeHTML(message)}</p>`).join('');
  renderHypothesis();
  renderPlan();
  d('research-results').hidden = false;
}

function candidateMagnitude(candidate: Candidate, time: number): number {
  const phase = (time - candidate.reference_epoch_jd) / candidate.period_days;
  let value = candidate.coefficients[0];
  for (let harmonic = 1; harmonic <= Math.floor((candidate.coefficients.length - 1) / 2); harmonic++) {
    const angle = 2 * Math.PI * harmonic * phase;
    value += candidate.coefficients[2 * harmonic - 1] * Math.sin(angle) + candidate.coefficients[2 * harmonic] * Math.cos(angle);
  }
  return value;
}

function renderHypothesis(): void {
  if (!researchResult) return;
  const candidate = researchResult.candidates[candidateIndex];
  if (!candidate) { d('hypothesis-chart').innerHTML = '<p class="empty-message">No candidate coefficients were returned.</p>'; return; }
  const phase = Number(field('phase-scrub').value);
  const observations = researchResult.residuals.map(row => ({ x: (((row.time_jd - candidate.reference_epoch_jd) / candidate.period_days) % 1 + 1) % 1, y: row.observed_magnitude, color: row.partition === 'holdout' ? colors[1] : colors[2], label: `${row.partition} · ${format(row.observed_magnitude)} mag` }));
  const model = Array.from({ length: 201 }, (_, i) => ({ x: i / 200, y: candidateMagnitude(candidate, candidate.reference_epoch_jd + i / 200 * candidate.period_days) }));
  const predicted = candidateMagnitude(candidate, candidate.reference_epoch_jd + phase * candidate.period_days);
  d('hypothesis-chart').innerHTML = plot({ label: `Observations folded at candidate ${format(candidate.period_days, 3)} days`, xLabel: 'Phase / cycles', yLabel: 'Magnitude ↑ brighter', reverseY: true, xRange: [0, 1], series: [{ points: observations, color: colors[2], scatter: true }, { points: model, color: colors[0] }], markerX: phase, highlight: { x: phase, y: predicted } });
  d('hypothesis-period').textContent = `${format(candidate.period_days, 3)} days`;
  d('phase-readout').textContent = `${format(phase, 2)} cycles · ${format(predicted, 3)} mag`;
  document.querySelectorAll<HTMLButtonElement>('[data-candidate]').forEach(node => { const selected = Number(node.dataset.candidate) === candidateIndex; node.classList.toggle('active', selected); node.setAttribute('aria-pressed', String(selected)); });
}

function renderPlan(): void {
  if (!researchResult || !researchResult.candidates.length) return;
  const day = Number(field('plan-scrub').value), horizon = Number(slider('plan-scrub').max);
  const latest = researchResult.planning_anchor_jd;
  const candidates = researchResult.candidates;
  const predictions = candidates.map(candidate => candidateMagnitude(candidate, latest + day));
  const spread = Math.max(...predictions) - Math.min(...predictions);
  const series = candidates.map((candidate, index) => ({ color: colors[index % colors.length], points: Array.from({ length: 301 }, (_, i) => ({ x: i / 300 * horizon, y: candidateMagnitude(candidate, latest + i / 300 * horizon) })) }));
  d('plan-chart').innerHTML = plot({ label: 'Competing empirical predictions after the final observation', xLabel: 'Days after final observation', yLabel: 'Predicted magnitude ↑ brighter', reverseY: true, xRange: [0, horizon], series, markerX: day });
  d('plan-day').textContent = `+${format(day, 1)} d · ${format(latest + day, 2)}`;
  d('plan-spread').textContent = `${format(spread, 3)} mag spread`;
  d('plan-predictions').innerHTML = candidates.map((candidate, index) => `<div style="border-color:${colors[index % colors.length]}"><small>${format(candidate.period_days, 2)} d hypothesis</small><strong>${format(predictions[index], 3)} mag</strong></div>`).join('');
}

async function uploadDataset(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const node = field('dataset-file');
  const file = node instanceof HTMLInputElement ? node.files?.[0] : null;
  if (!file) { d('upload-status').textContent = 'Choose a CSV file first.'; return; }
  if (file.size > 5 * 1024 * 1024) { d('upload-status').textContent = 'This interactive lab accepts CSV files up to 5 MB.'; return; }
  btn('upload-button').disabled = true;
  d('upload-status').textContent = 'Validating the observations…';
  try {
    const dataset = await post<Dataset>('/api/datasets', { name: field('dataset-name').value.trim(), csv_text: await file.text(), band: field('dataset-band').value.trim(), time_system: field('dataset-time').value });
    const key = addDataset(dataset);
    const source = field('research-source');
    source.value = key;
    d('upload-status').textContent = `${dataset.name}: ${dataset.observations_count.toLocaleString()} validated ${dataset.band}-band observations. Ready to investigate.`;
    field('research-min').value = '50'; field('research-max').value = '1000';
  } catch (error) { d('upload-status').textContent = errorMessage(error); }
  finally { btn('upload-button').disabled = false; }
}

function simulationParameters(): SimulationParameters {
  return { period_days: Number(field('sim-period').value), damping: Number(field('sim-damping').value), drive: Number(field('sim-drive').value), nonlinearity: Number(field('sim-nonlinearity').value), cycles: 6, steps_per_cycle: 200 };
}

function updateSimulationLabels(): void {
  const parameters = simulationParameters();
  d('sim-period-label').textContent = `${parameters.period_days} d`;
  for (const key of ['damping', 'drive', 'nonlinearity'] as const) d(`sim-${key}-label`).textContent = parameters[key].toFixed(3);
}

async function integrateSimulation(event?: SubmitEvent): Promise<void> {
  event?.preventDefault();
  pauseSimulation();
  clearTimeout(simulationTimer);
  const request = ++simulationRequest;
  btn('simulation-run').disabled = true;
  btn('simulation-run').textContent = 'C++ is integrating two resolutions…';
  d('simulation-status').textContent = 'RK4 solves the oscillator at Δτ and Δτ/2, then compares the trajectories and energy bookkeeping.';
  try {
    const result = await post<SimulationResult>('/api/simulation', simulationParameters());
    if (request !== simulationRequest) return;
    simulation = result; simulationStep = 0;
    window.dispatchEvent(new CustomEvent('thoth:simulation-result', {detail:result}));
    slider('sim-scrub').max = String(result.times_days.length - 1);
    field('sim-scrub').value = '0'; field('sim-scrub').disabled = false;
    btn('simulation-play').disabled = false;
    d('simulation-equation').textContent = result.equation;
    d('simulation-status').textContent = `${result.times_days.length.toLocaleString()} states · ${format(result.native_seconds, 5)} s native C++ compute. Sliders now rerun the native solver as you explore.`;
    d('simulation-metrics').innerHTML = `<div><span>NATIVE INTEGRATION</span><strong>${format(result.native_seconds * 1000, 3)} ms</strong><small>Two RK4 resolutions</small></div><div><span>STEP REFINEMENT DIFFERENCE</span><strong>${result.convergence.max_displacement_difference.toExponential(2)}</strong><small>max |xΔτ − xΔτ/2|</small></div><div><span>ENERGY BALANCE ERROR</span><strong>${result.convergence.energy_balance_error.toExponential(2)}</strong><small>E − E₀ − work + loss</small></div>`;
    d('simulation-caveat').textContent = `The disc illustrates toy displacement, not stellar radius or luminosity. ${(result.caveats ?? []).join(' ')}`;
    renderSimulation();
  } catch (error) { if (request === simulationRequest) d('simulation-status').textContent = errorMessage(error); }
  finally { if (request === simulationRequest) { btn('simulation-run').disabled = false; btn('simulation-run').textContent = 'Integrate in native C++ ↗'; } }
}

function renderSimulation(): void {
  if (!simulation) return;
  const result = simulation;
  const time = result.times_days[simulationStep], x = result.displacement[simulationStep], velocity = result.velocity[simulationStep];
  const scale = 1 + 0.27 * Math.tanh(x);
  d('sandbox-star').style.transform = `scale(${scale})`;
  d('sim-displacement').textContent = `${x >= 0 ? '+' : ''}${format(x, 4)}`;
  d('sim-time').textContent = `${format(time, 1)} days · velocity ${format(velocity, 3)}`;
  d('sim-step-label').textContent = `${simulationStep.toLocaleString()} / ${(result.times_days.length - 1).toLocaleString()}`;
  field('sim-scrub').value = String(simulationStep);
  if (simulationView === 'phase') {
    d('simulation-chart').innerHTML = plot({ label: 'Native oscillator phase portrait with selected state', xLabel: 'Dimensionless displacement', yLabel: 'Dimensionless velocity', series: [{ points: result.displacement.map((value, i) => ({ x: value, y: result.velocity[i] })), color: colors[2] }], highlight: { x, y: velocity }, zeroLine: true });
  } else if (simulationView === 'energy') {
    const balance = result.energy.map((_, i) => result.energy[0] + result.drive_work[i] - result.dissipated_energy[i]);
    d('simulation-chart').innerHTML = plot({ label: 'Native oscillator energy and accumulated forcing work minus dissipation', xLabel: 'Simulation time / days', yLabel: 'Dimensionless energy', series: [{ points: result.energy.map((value, i) => ({ x: result.times_days[i], y: value })), color: colors[0] }, { points: balance.map((value, i) => ({ x: result.times_days[i], y: value })), color: colors[2], dashed: true }], markerX: time });
  } else {
    d('simulation-chart').innerHTML = plot({ label: 'Native oscillator displacement over time and selected state', xLabel: 'Simulation time / days', yLabel: 'Dimensionless displacement', series: [{ points: result.displacement.map((value, i) => ({ x: result.times_days[i], y: value })), color: colors[0] }], markerX: time, highlight: { x: time, y: x }, zeroLine: true });
  }
}

function pauseSimulation(): void {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  animationFrame = null; previousFrame = 0; animationAccumulator = 0;
  btn('simulation-play').textContent = 'Play cycle ▶';
}

function animateSimulation(timestamp: number): void {
  if (!simulation || document.hidden) { pauseSimulation(); return; }
  if (previousFrame) animationAccumulator += Math.min(100, timestamp - previousFrame) * 0.06;
  previousFrame = timestamp;
  const advance = Math.floor(animationAccumulator);
  if (advance > 0) {
    animationAccumulator -= advance;
    simulationStep = (simulationStep + advance) % simulation.times_days.length;
    renderSimulation();
  }
  animationFrame = requestAnimationFrame(animateSimulation);
}

function exportEvidence(): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(researchResult, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'thoth-discovery-evidence.json'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function updateResearchBudget(): void {
  const samples = Number(field('research-samples').value);
  const limit = Math.min(3000, Math.floor(48000000 / (12 * samples)));
  d('research-budget').textContent = `Up to ${limit.toLocaleString()} observations · six frequency scans · up to ${(6 * samples).toLocaleString()} trial fits. Larger datasets use a reproducible subset across their full time baseline.`;
}

export function initDiscovery(): void {
  d('research-form').addEventListener('submit', event => void startResearch(event as SubmitEvent));
  field('research-source').addEventListener('change', () => {
    if (field('research-source').value === 'selected') setResearchBounds(selectedStar);
    else if (field('research-source').value === 'example') setResearchBounds(exampleStar);
  });
  for (const id of ['research-min', 'research-max']) field(id).addEventListener('input', () => { researchBoundsTouched = true; });
  field('research-samples').addEventListener('change', updateResearchBudget);
  d('upload-form').addEventListener('submit', event => void uploadDataset(event as SubmitEvent));
  d('hypothesis-options').addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-candidate]') : null;
    if (button) { candidateIndex = Number(button.dataset.candidate); renderHypothesis(); }
  });
  field('phase-scrub').addEventListener('input', renderHypothesis);
  field('plan-scrub').addEventListener('input', renderPlan);
  d('plan-shortcuts').addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-plan-day]') : null;
    if (button?.dataset.planDay) { field('plan-scrub').value = button.dataset.planDay; renderPlan(); }
  });
  btn('research-export').addEventListener('click', exportEvidence);
  d('simulation-form').addEventListener('submit', event => void integrateSimulation(event as SubmitEvent));
  for (const id of ['sim-period', 'sim-damping', 'sim-drive', 'sim-nonlinearity']) field(id).addEventListener('input', () => {
    updateSimulationLabels();
    if (simulation) { pauseSimulation(); clearTimeout(simulationTimer); d('simulation-status').textContent = 'Parameters changed · updating the native integration…'; simulationTimer = setTimeout(() => void integrateSimulation(), 500); }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const presets: Record<string, { damping: number; drive: number; nonlinearity: number }> = { conservative: { damping: 0, drive: 0, nonlinearity: 0.2 }, damped: { damping: 0.15, drive: 0, nonlinearity: 0.2 }, driven: { damping: 0.035, drive: 0.4, nonlinearity: 0.5 } };
    const values = presets[button.dataset.preset ?? ''];
    if (!values) return;
    for (const key of ['damping', 'drive', 'nonlinearity'] as const) field(`sim-${key}`).value = String(values[key]);
    updateSimulationLabels(); void integrateSimulation();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-sim-chart]').forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.simChart;
    if (view !== 'displacement' && view !== 'phase' && view !== 'energy') return;
    simulationView = view;
    document.querySelectorAll<HTMLButtonElement>('[data-sim-chart]').forEach(other => other.setAttribute('aria-selected', String(other === button)));
    renderSimulation();
  }));
  field('sim-scrub').addEventListener('input', () => { pauseSimulation(); simulationStep = Number(field('sim-scrub').value); renderSimulation(); });
  btn('simulation-play').addEventListener('click', () => {
    if (animationFrame !== null) pauseSimulation();
    else if (simulation) { btn('simulation-play').textContent = 'Pause cycle Ⅱ'; animationFrame = requestAnimationFrame(animateSimulation); }
  });
  updateSimulationLabels();
  updateResearchBudget();
  void api<{ items: Dataset[]; total: number }>('/api/datasets').then(response => {
    response.items.forEach(addDataset);
  }).catch(() => { /* Catalogue-based experiments remain usable when the dataset listing is unavailable. */ });
  void api<{ example_star_id: string; native_available: boolean }>('/api/status').then(status => {
    exampleStarId = status.example_star_id;
    if (status.native_available) void integrateSimulation();
    return api<Star>(`/api/stars/${encodeURIComponent(exampleStarId)}`);
  }).then(star => {
    exampleStar = star;
    if (!researchBoundsTouched && !researchResult && field('research-source').value === 'example') setResearchBounds(star);
  }).catch(() => { /* The status badge owns connection errors. */ });
}
