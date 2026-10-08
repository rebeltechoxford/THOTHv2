import './observing.css';
import { api } from './api';
import { errorMessage } from './dom';
import type { CatalogResponse, Star } from './types';

interface Site { label?: string; latitude_deg: number; longitude_deg: number; elevation_m: number; approximate?: boolean; source?: unknown }
interface Defaults { location: Site; example_star_id: string; caveats?: string[] }
interface TrackPoint { time_utc: string; azimuth_deg: number | null; altitude_deg: number; sun_altitude_deg?: number; tracking_allowed: boolean; reasons?: string[] }
interface Pointing extends TrackPoint {
  star_id: string; name?: string; star_name?: string; location: Site; zenith_distance_deg: number;
  hour_angle_hours: number; lst_hours: number; ra_j2000_hours: number; dec_j2000_deg: number;
  ra_topocentric_hours: number; dec_topocentric_deg: number; sun_separation_deg: number;
  above_horizon: boolean; above_minimum_altitude: boolean; nighttime: boolean; mount_ready: boolean;
  earth_orientation?: { status: string; mount_ready: boolean; warnings?: string[] }; model?: string; caveats?: string[]; trajectory: TrackPoint[];
}
interface Adapter { id: string; label: string; available: boolean; simulated: boolean; configured: boolean }
interface MountInventory { adapters: Adapter[]; active_adapter_id: string; control_requires_token: boolean }
interface MountStatus {
  adapter_id: string; name?: string; simulated: boolean; connected: boolean; tracking: boolean; slewing: boolean;
  at_park: boolean; armed_until: string | null; lease_until: string | null;
  target: {star_id: string; site: Site; minimum_altitude_deg: number; pointing: Pointing} | null;
  capabilities?: Record<string, unknown>; fault?: string | null; stop_errors?: string[];
}
interface Plan { plan_id: string; expires_at: string; allowed: boolean; reasons: string[]; target: Pointing; coordinate_system: string; target_ra_hours: number; target_dec_deg: number }
const root = document.getElementById('observing-lab')!;
const entity: Record<string, string> = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => entity[c]);
const num = (value: unknown, digits = 2) => value === null || value === undefined || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(undefined, {minimumFractionDigits: digits, maximumFractionDigits: digits});
const utc = (value: string | undefined | null) => value ? new Date(value).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC') : '—';
const node = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id)! as T;
const input = (id: string) => node<HTMLInputElement>(id);
const button = (id: string) => node<HTMLButtonElement>(id);

root.innerHTML = `
  <div class="section-heading"><div><p class="eyebrow">FROM THE MODEL TO YOUR HORIZON</p><h2>Observe &amp; track <span class="count-label">Your location. Your sky.</span></h2></div><span class="data-badge"><span class="status-dot"></span>Topocentric coordinates · ASCOM Alpaca</span></div>
  <p class="observing-intro">Take a catalogue star into the sky above you. Explore its azimuth and elevation through time, then preview a telescope target before explicitly starting a mount. The simulator is ready without hardware.</p>
  <div class="observing-layout">
    <article class="card observing-sky-card">
      <div class="card-heading"><div><p class="eyebrow">THE LOCAL SKY</p><h3 id="observing-star-name">Loading observing site…</h3></div><span class="subtle-pill" id="observing-visibility">Calculating</span></div>
      <div class="observing-body">
        <div class="observing-sky-top"><div class="observing-compass" id="observing-compass" aria-label="Star direction above the local horizon"></div><div class="observing-pointing"><p class="eyebrow" id="observing-time-mode">LIVE UTC</p><p id="observing-time" class="observing-timestamp">—</p><div class="observing-metrics"><span>Azimuth<strong id="observing-azimuth">—</strong><small>North 0° · east 90°</small></span><span>Elevation<strong id="observing-altitude">—</strong><small>Horizon 0° · zenith 90°</small></span></div><p id="observing-direction-note" class="observing-muted"></p><div id="observing-conditions" class="observing-conditions"></div></div></div>
        <div class="observing-chart-heading"><h4>The next 12 hours</h4><button type="button" id="observing-return-now" class="observing-text-button" hidden>Return to displayed time</button></div>
        <div id="observing-trajectory" class="observing-trajectory" aria-label="Interactive elevation chart"></div>
        <label class="observing-scrub">Explore the computed path <strong id="observing-scrub-label">Displayed time</strong><input id="observing-scrub" type="range" min="0" max="48" step="1" value="0" disabled></label>
        <p class="observing-chart-key"><i class="observing-key target"></i>Star elevation <i class="observing-key sun"></i>Sun elevation <i class="observing-key limit"></i>Minimum mount altitude</p>
        <div id="observing-coordinate-ledger" class="observing-coordinate-ledger"></div>
        <div id="observing-error" class="notice" role="alert" hidden></div>
      </div>
    </article>
    <aside class="observing-settings">
      <article class="card"><div class="card-heading"><div><p class="eyebrow">CHOOSE THE VIEW</p><h3>Observer &amp; target</h3></div></div><div class="observing-body">
        <label>Find a Mira<input id="observing-search" type="search" maxlength="200" placeholder="Mira, R Leo, an OGLE ID…" autocomplete="off" disabled></label><p id="observing-search-note" class="observing-muted">Choose a catalogue record here or in the 3D observatory.</p><div id="observing-search-results" class="observing-search-results"></div>
        <p id="observing-selected-star" class="observing-selected-star">—</p>
        <form id="observing-site-form"><div class="observing-input-pair"><label>Latitude / °<input id="observing-latitude" type="number" min="-90" max="90" step="0.000001" required disabled></label><label>Longitude / °<input id="observing-longitude" type="number" min="-180" max="180" step="0.000001" required disabled></label></div><label>Observer height / m · WGS84 ellipsoid<input id="observing-height" type="number" min="-500" max="10000" step="0.1" required disabled></label><p class="observing-muted" id="observing-site-source"></p><label class="observing-check"><input id="observing-live" type="checkbox" checked disabled>Use current UTC · refresh every 15 seconds</label><label id="observing-date-label" hidden>Display time / UTC<input id="observing-date" type="datetime-local" step="60" disabled></label><label>Minimum tracking elevation / °<input id="observing-minimum" type="number" min="20" max="85" step="1" value="20" required disabled></label><button class="export-button" id="observing-update" type="submit" disabled>Update local sky ↗</button></form>
      </div></article>
      <article class="card observing-mount-card"><div class="card-heading"><div><p class="eyebrow">THE MOUNT PLUGIN</p><h3>Point with intention</h3></div><span id="mount-mode" class="subtle-pill">Simulator</span></div><div class="observing-body">
        <label>Controller<select id="mount-adapter" disabled></select></label><label id="mount-token-label" hidden>Local mount control token<input id="mount-token" type="password" autocomplete="off" spellcheck="false" placeholder="Server-configured token"></label><p class="observing-muted" id="mount-adapter-note">Loading controller options…</p><p class="observing-muted" id="mount-setup-note"></p>
        <div class="observing-mount-state" id="mount-state" role="status">Disconnected</div><div id="mount-status-detail" class="observing-muted"></div>
        <div class="observing-mount-buttons"><button id="mount-connect" type="button" class="export-button" disabled>1 · Connect</button><button id="mount-disconnect" type="button" class="export-button" disabled>Disconnect</button></div>
        <label class="observing-check observing-alignment"><input id="mount-aligned" type="checkbox" disabled>I have aligned the mount and verified the actual observing site, clear sky, and unobstructed telescope motion.</label>
        <div class="observing-mount-buttons"><button id="mount-arm" type="button" class="export-button" disabled>2 · Arm control</button><button id="mount-preview" type="button" class="export-button" disabled>3 · Preview target</button></div>
        <div id="mount-plan" class="observing-mount-plan"><p>Preview uses the actual current UTC, including when the sky display is set to another date. Changing the target or site invalidates the preview.</p></div>
        <button id="mount-track" type="button" class="fit-button" disabled>4 · Slew &amp; track selected star</button><button id="mount-stop" type="button" class="observing-stop" disabled>■ Stop motion &amp; tracking</button>
        <p class="observing-muted">Explicit commands only. If this phone loses contact, the server's tracking lease expires and requests a stop. Keep the mount's physical emergency stop within reach.</p><div id="mount-error" class="notice" role="alert" hidden></div>
      </div></article>
    </aside>
  </div>
  <details class="observing-methods card"><summary>Coordinates, precision &amp; mount assumptions <span>+</span></summary><div class="observing-body"><p>Azimuth is measured clockwise from north. Elevation is geometric, with atmospheric refraction disabled. Catalogue positions are treated as FK5 equinox J2000 directions; missing position epochs, proper motion, parallax, and radial velocity limit precise pointing. The current Earth orientation status is shown with each calculation.</p><p>The University, Mississippi preset is an approximate campus location. Enter your telescope's actual latitude, longitude, and height before hardware control. An aligned mount, correct driver site and time, cable clearance, horizon obstructions, and hardware limits remain the observer's responsibility.</p><p>ASCOM Alpaca runs through a server-configured telescope endpoint. The control token stays in this page's memory and is sent only to this THOTH server; it is never saved with the location. A simulator command moves a simulated mount. Real hardware is identified explicitly before connection.</p><ul id="observing-caveats"></ul></div></details>`;

let defaults: Defaults | null = null;
let selectedId = '';
let selectedName = '';
let current: Pointing | null = null;
let inspectedIndex: number | null = null;
let pointingRequest = 0;
let targetRevision = 0;
let searchRequest = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;
let updateTimer: ReturnType<typeof setTimeout> | undefined;
let inventory: MountInventory | null = null;
let status: MountStatus | null = null;
let plan: Plan | null = null;
let planRevision = -1;
let mountBusy = false;
let mountActions = 0;
let statusBusy = false;
let leaseBusy = false;
let localArmConfirmed = false;
let statusGeneration = 0;

function showError(id: string, error?: unknown) { node(id).hidden = !error; node(id).textContent = error ? errorMessage(error) : ''; }
function selectedAdapter() { return inventory?.adapters.find(adapter => adapter.id === node<HTMLSelectElement>('mount-adapter').value); }
function site() {
  if (!node<HTMLFormElement>('observing-site-form').reportValidity()) throw new Error('Enter a valid observing site, UTC time, and minimum elevation.');
  return {latitude_deg: Number(input('observing-latitude').value), longitude_deg: Number(input('observing-longitude').value), elevation_m: Number(input('observing-height').value)};
}
function targetSettings() { return {star_id: selectedId, ...site(), minimum_altitude_deg: Number(input('observing-minimum').value)}; }
function displayTime() {
  if (input('observing-live').checked) return null;
  const date = input('observing-date').value;
  if (!date) throw new Error('Choose a UTC display time.');
  return new Date(`${date}Z`).toISOString();
}
function invalidatePlan(message = 'Target changed. Preview it again before tracking.') {
  targetRevision++; plan = null; planRevision = -1;
  node('mount-plan').innerHTML = `<p>${escape(message)}</p>`; renderMountButtons();
}
function clearPointing() {
  current = null; inspectedIndex = null; pointingRequest++;
  node('observing-visibility').textContent = 'Calculating';
  ['observing-compass', 'observing-trajectory', 'observing-coordinate-ledger', 'observing-conditions'].forEach(id => node(id).replaceChildren());
  ['observing-azimuth', 'observing-altitude', 'observing-time'].forEach(id => node(id).textContent = '—');
  node('observing-direction-note').textContent = 'Waiting for coordinates for this target and site.';
  input('observing-scrub').disabled = true;
}
function saveSite() {
  try { localStorage.setItem('thoth.observing.site', JSON.stringify({...site(), minimum_altitude_deg: Number(input('observing-minimum').value)})); }
  catch { /* Storage can be unavailable in private browsers; the controls still work. */ }
}
async function updateSky() {
  if (!defaults || !selectedId) return;
  let body: unknown;
  try { body = {...targetSettings(), time_utc: displayTime(), duration_hours: 12, samples: 49}; }
  catch (error) { showError('observing-error', error); return; }
  const request = ++pointingRequest;
  button('observing-update').disabled = true;
  try {
    const result = await api<Pointing>('/api/observing/target', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
    if (request !== pointingRequest) return;
    current = result;
    if (inspectedIndex !== null && inspectedIndex >= current.trajectory.length) inspectedIndex = null;
    showError('observing-error'); renderSky();
  } catch (error) { if (request === pointingRequest) showError('observing-error', error); }
  finally { if (request === pointingRequest) button('observing-update').disabled = false; }
}
async function selectStar(id: string, name?: string, broadcast = true) {
  if (!defaults || !id) return;
  selectedId = id; selectedName = name || id;
  if (broadcast) window.dispatchEvent(new CustomEvent('thoth:star-selected', {detail: {id: selectedId, name: selectedName}}));
  node('observing-selected-star').textContent = `${selectedName} · ${id}`;
  node('observing-search-results').replaceChildren();
  invalidatePlan(); clearPointing();
  node('observing-star-name').textContent = selectedName; node('observing-visibility').textContent = 'Calculating';
  await updateSky();
}
async function searchStars() {
  if (!defaults) return;
  const request = ++searchRequest;
  const text = input('observing-search').value.trim();
  if (!text) { node('observing-search-results').replaceChildren(); node('observing-search-note').textContent = 'Choose a catalogue record here or in the 3D observatory.'; return; }
  try {
    const result = await api<CatalogResponse>(`/api/catalog?${new URLSearchParams({search: text, page_size: '8'})}`);
    if (request !== searchRequest) return;
    node('observing-search-note').textContent = `${result.total.toLocaleString()} matching records · showing ${result.items.length}`;
    node('observing-search-results').innerHTML = result.items.map(star => `<button type="button" data-observing-star="${escape(star.id)}"><span>${escape(star.name || star.id)}<small>${escape(star.catalog)} · ${escape(star.region)}</small></span><span>${star.ra_deg === null || star.dec_deg === null ? 'No coordinates' : 'Choose ↗'}</span></button>`).join('');
    node('observing-search-results').querySelectorAll<HTMLButtonElement>('button').forEach(item => item.addEventListener('click', () => {
      const star = result.items.find(record => record.id === item.dataset.observingStar)!;
      void selectStar(star.id, star.name);
    }));
  } catch (error) { if (request === searchRequest) node('observing-search-note').textContent = errorMessage(error); }
}
function compassPoint(point: TrackPoint) {
  const angle = (point.azimuth_deg ?? 0) * Math.PI / 180;
  const radius = 112 * (90 - Math.max(0, Math.min(90, point.altitude_deg))) / 90;
  return {x: 150 + radius * Math.sin(angle), y: 150 - radius * Math.cos(angle)};
}
function renderCompass(point: TrackPoint) {
  if (!current) return;
  const p = compassPoint(point);
  let previousVisible = false;
  const path = current.trajectory.map(sample => {
    if (sample.altitude_deg < 0 || sample.azimuth_deg === null) { previousVisible = false; return ''; }
    const xy = compassPoint(sample), command = previousVisible ? 'L' : 'M'; previousVisible = true;
    return `${command}${xy.x.toFixed(2)} ${xy.y.toFixed(2)}`;
  }).join(' ');
  node('observing-compass').innerHTML = `<svg viewBox="0 0 300 325" role="img" aria-label="${escape(selectedName)} at azimuth ${num(point.azimuth_deg)} degrees and elevation ${num(point.altitude_deg)} degrees"><defs><radialGradient id="observing-sky-glow"><stop stop-color="#193d47"/><stop offset="1" stop-color="#081421"/></radialGradient></defs><circle cx="150" cy="150" r="112" fill="url(#observing-sky-glow)" stroke="#405570"/><circle cx="150" cy="150" r="75" class="observing-compass-ring"/><circle cx="150" cy="150" r="37" class="observing-compass-ring"/><path d="M150 38V262M38 150H262" stroke="#273d53"/><text x="150" y="20" text-anchor="middle">N · 0°</text><text x="282" y="155" text-anchor="middle">E</text><text x="150" y="287" text-anchor="middle">S · 180°</text><text x="18" y="155" text-anchor="middle">W</text><text x="155" y="105" class="observing-compass-degree">60°</text><text x="155" y="68" class="observing-compass-degree">30°</text><circle cx="150" cy="150" r="2" fill="#90a8be"/><path d="${path}" fill="none" stroke="#5dafa4" stroke-opacity=".45" stroke-width="2"/>${point.azimuth_deg !== null ? `<path d="M150 150L${p.x} ${p.y}" stroke="#f2bd85" stroke-width="1.5" stroke-dasharray="4 4"/><circle cx="${p.x}" cy="${p.y}" r="7" fill="${point.altitude_deg >= 0 ? '#f2bd85' : '#7f8fa6'}" stroke="#fff1db" stroke-width="1.5"/>` : ''}<text x="150" y="317" text-anchor="middle">${point.altitude_deg < 0 ? 'Target below the horizon' : point.azimuth_deg === null ? 'Azimuth undefined at the zenith' : 'North-up · rings mark elevation'}</text></svg>`;
}
function renderTrajectory() {
  if (!current || !current.trajectory.length) { node('observing-trajectory').replaceChildren(); return; }
  const points = current.trajectory, width = 650, left = 46, right = 15, top = 20, bottom = 192;
  const x = (index: number) => left + index / Math.max(1, points.length - 1) * (width - left - right);
  const y = (altitude: number) => top + (90 - altitude) / 180 * (bottom - top);
  const line = (key: 'altitude_deg' | 'sun_altitude_deg') => points.map((point, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)} ${y(point[key] ?? -90).toFixed(2)}`).join(' ');
  const index = inspectedIndex ?? 0, point = points[index], minimum = Number(input('observing-minimum').value);
  node('observing-trajectory').innerHTML = `<svg viewBox="0 0 650 235" role="img" aria-label="Elevation over twelve hours. Use the slider or tap the chart to inspect a computed time."><rect x="${left}" y="${y(0)}" width="${width - left - right}" height="${bottom - y(0)}" fill="#18202e"/>${[-90, -45, 0, 45, 90].map(value => `<path d="M${left} ${y(value)}H${width - right}" stroke="${value === 0 ? '#657c94' : '#24364b'}"/><text x="36" y="${y(value) + 5}" text-anchor="end">${value}°</text>`).join('')}<path d="M${left} ${y(minimum)}H${width - right}" stroke="#ac96d0" stroke-dasharray="5 5"/><path d="${line('sun_altitude_deg')}" stroke="#e6a06a" stroke-width="2" stroke-opacity=".65" fill="none"/><path d="${line('altitude_deg')}" stroke="#82d7c9" stroke-width="2.5" fill="none"/>${[0, .25, .5, .75, 1].map(fraction => {const i = Math.round(fraction * (points.length - 1)); return `<text x="${x(i)}" y="217" text-anchor="${fraction === 0 ? 'start' : fraction === 1 ? 'end' : 'middle'}">${new Date(points[i].time_utc).toISOString().slice(11, 16)}</text>`;}).join('')}<path d="M${x(index)} ${top}V${bottom}" stroke="#e9c09d" stroke-opacity=".5"/><circle cx="${x(index)}" cy="${y(point.altitude_deg)}" r="5" fill="#edc197"/><text x="${width - right}" y="233" text-anchor="end">UTC</text></svg>`;
}
function inspectPoint(index: number | null) {
  if (!current) return;
  inspectedIndex = index;
  const point = index === null ? current : current.trajectory[index];
  if (!point) return;
  input('observing-scrub').value = String(index ?? 0);
  node('observing-scrub-label').textContent = index === null ? 'Displayed time' : utc(point.time_utc);
  button('observing-return-now').hidden = index === null;
  node('observing-time-mode').textContent = index === null ? input('observing-live').checked ? 'LIVE UTC' : 'CHOSEN UTC' : 'PATH SAMPLE · NO MOUNT COMMAND';
  node('observing-time').textContent = utc(point.time_utc);
  node('observing-azimuth').textContent = `${num(point.azimuth_deg)}${point.azimuth_deg === null ? '' : '°'}`;
  node('observing-altitude').textContent = `${num(point.altitude_deg)}°`;
  node('observing-direction-note').textContent = point.altitude_deg < 0 ? 'The star is below this location’s horizon.' : point.azimuth_deg === null ? 'At the zenith, azimuth has no unique direction.' : `Zenith distance ${num(90 - point.altitude_deg)}°. Geometric elevation; refraction disabled.`;
  node('observing-visibility').textContent = point.tracking_allowed ? 'Within tracking limits' : 'Tracking restricted';
  node('observing-visibility').classList.toggle('observing-ready', point.tracking_allowed);
  node('observing-conditions').innerHTML = `<span>Sun elevation <strong>${num(point.sun_altitude_deg)}°</strong></span><p>${point.tracking_allowed ? 'This computed time meets THOTH’s sky checks. A real mount still requires an armed, current target preview.' : escape((point.reasons || current.reasons || []).join(' · ') || 'Below the configured limits.')}</p>`;
  renderCompass(point); renderTrajectory();
}
function renderSky() {
  if (!current) return;
  selectedName = current.name || current.star_name || selectedName;
  node('observing-star-name').textContent = selectedName;
  input('observing-scrub').disabled = !current.trajectory.length; input('observing-scrub').max = String(Math.max(0, current.trajectory.length - 1));
  const earth = current.earth_orientation;
  node('observing-coordinate-ledger').innerHTML = `<span>Catalogue RA / Dec · J2000<strong>${num(current.ra_j2000_hours, 5)} h / ${num(current.dec_j2000_deg, 5)}°</strong></span><span>Topocentric RA / Dec · date<strong>${num(current.ra_topocentric_hours, 5)} h / ${num(current.dec_topocentric_deg, 5)}°</strong></span><span>Local sidereal time / hour angle<strong>${num(current.lst_hours, 4)} h / ${num(current.hour_angle_hours, 4)} h</strong></span><span>Earth orientation<strong>${escape(earth?.status || 'Reported by server')} · ${current.mount_ready ? 'mount calculation ready' : 'display only'}</strong></span><span>Calculation site · WGS84<strong>${num(current.location.latitude_deg, 6)}° / ${num(current.location.longitude_deg, 6)}° · ${num(current.location.elevation_m, 1)} m</strong></span>`;
  node('observing-caveats').innerHTML = [...(current.caveats || []), ...(earth?.warnings || [])].map(text => `<li>${escape(text)}</li>`).join('');
  inspectPoint(inspectedIndex);
}
function armed() { return !!status?.armed_until && Date.parse(status.armed_until) > Date.now(); }
function renderAdapter() {
  const adapter = selectedAdapter();
  node('mount-mode').textContent = adapter?.simulated ? 'SIMULATOR' : 'REAL HARDWARE';
  node('mount-mode').classList.toggle('observing-hardware', adapter?.simulated === false);
  node('mount-token-label').hidden = adapter?.simulated !== false;
  node('mount-adapter-note').textContent = adapter?.simulated ? 'Local simulator. Commands here move a simulated telescope; no physical hardware is contacted.' : adapter?.configured ? 'Real ASCOM Alpaca hardware. Verify its driver site, time, alignment, physical limits, and controller before connection.' : 'Alpaca is unavailable until its endpoint and control token are configured on the THOTH server. See the observing documentation.';
  renderMountButtons();
}
function renderMountButtons() {
  const connected = !!status?.connected, adapter = selectedAdapter(), ack = input('mount-aligned').checked;
  node<HTMLSelectElement>('mount-adapter').disabled = !inventory || connected || mountBusy;
  button('mount-connect').disabled = mountBusy || connected || !adapter?.available || (!adapter.simulated && !input('mount-token').value);
  button('mount-disconnect').disabled = mountBusy || !connected;
  input('mount-aligned').disabled = !connected || mountBusy;
  button('mount-arm').disabled = mountBusy || !connected || !ack || !!status?.tracking || !!status?.slewing;
  button('mount-preview').disabled = mountBusy || !connected || !ack || !armed() || !localArmConfirmed || !selectedId || !!status?.slewing || !!status?.tracking;
  const validPlan = !!plan?.allowed && planRevision === targetRevision && Date.parse(plan.expires_at) > Date.now();
  button('mount-track').disabled = mountBusy || !connected || !ack || !armed() || !localArmConfirmed || !validPlan || !!status?.slewing || !!status?.tracking;
  button('mount-stop').disabled = !connected;
}
function renderStatus() {
  if (!status) { renderMountButtons(); return; }
  const mode = status.simulated ? 'Simulator' : 'Real mount';
  node('mount-state').textContent = `${mode} · ${status.connected ? status.slewing ? 'Slewing' : status.tracking ? 'Tracking' : armed() ? 'Armed' : 'Connected' : 'Disconnected'}${status.at_park ? ' · parked' : ''}`;
  node('mount-state').classList.toggle('observing-tracking', status.tracking);
  const trackingName = status.target?.pointing.star_name || status.target?.star_id;
  node('mount-status-detail').innerHTML = `${trackingName ? `<p>Controller target: <strong>${escape(trackingName)}</strong>.${status.target?.star_id !== selectedId ? ' This differs from the displayed target. The selection has not moved the mount.' : ''}</p>` : ''}${status.armed_until ? `<p>Control armed until ${escape(utc(status.armed_until))}.</p>` : ''}${status.lease_until ? `<p>Contact lease until ${escape(utc(status.lease_until))}.</p>` : ''}`;
  if (status.fault || status.stop_errors?.length) showError('mount-error', new Error([status.fault, ...(status.stop_errors || [])].filter(Boolean).join(' · ')));
  renderMountButtons();
}
async function readStatus() {
  if (statusBusy) return;
  statusBusy = true;
  const generation = statusGeneration;
  try {
    const result = await api<MountStatus>('/api/mounts/status');
    if (generation !== statusGeneration) return;
    status = result;
    if (!status.connected || !armed()) localArmConfirmed = false;
    renderStatus();
  }
  finally { statusBusy = false; }
}
function mountHeaders(adapter = selectedAdapter()) {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (adapter?.simulated === false || status?.connected && !status.simulated) {
    const token = input('mount-token').value;
    if (!token) throw new Error('Enter the server-configured control token for this real mount.');
    headers['X-THOTH-Mount-Token'] = token;
  }
  return headers;
}
async function mountPost<T>(path: string, body: unknown = {}) { return api<T>(`/api/mounts/${path}`, {method: 'POST', headers: mountHeaders(), body: JSON.stringify(body)}); }
async function mountStatePost(path: string, body: unknown = {}) {
  const generation = ++statusGeneration;
  const result = await mountPost<MountStatus>(path, body);
  if (generation === statusGeneration) { status = result; renderStatus(); }
  return result;
}
async function mountAction(action: () => Promise<void>, isStop = false) {
  if (mountBusy && !isStop) return;
  mountActions++; mountBusy = true; showError('mount-error'); renderMountButtons();
  try { await action(); await readStatus(); }
  catch (error) { showError('mount-error', error); try { await readStatus(); } catch { /* Preserve the actionable command error. */ } }
  finally { mountActions--; mountBusy = mountActions > 0; renderMountButtons(); }
}
function renderPlan() {
  if (!plan) return;
  const target = plan.target;
  node('mount-plan').innerHTML = `<p class="eyebrow">${plan.allowed ? 'CURRENT TARGET PREVIEW' : 'TARGET REJECTED'}</p><strong>${escape(target.name || target.star_name || target.star_id)}</strong><dl><div><dt>Actual UTC</dt><dd>${escape(utc(target.time_utc))}</dd></div><div><dt>Azimuth / elevation</dt><dd>${num(target.azimuth_deg)}° / ${num(target.altitude_deg)}°</dd></div><div><dt>${escape(plan.coordinate_system)} RA / Dec</dt><dd>${num(plan.target_ra_hours, 5)} h / ${num(plan.target_dec_deg, 5)}°</dd></div><div><dt>Preview expires</dt><dd>${escape(utc(plan.expires_at))}</dd></div></dl><p>${escape(plan.reasons.join(' · ') || 'Sky and controller checks passed. The next button commands motion.')}</p>`;
}

node<HTMLFormElement>('observing-site-form').addEventListener('submit', event => { event.preventDefault(); saveSite(); void updateSky(); });
input('observing-search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => void searchStars(), 250); });
['observing-latitude', 'observing-longitude', 'observing-height', 'observing-minimum'].forEach(id => input(id).addEventListener('input', () => {
  invalidatePlan('Observing site or limit changed. Verify the site, re-arm, and preview the target again.'); input('mount-aligned').checked = false;
  localArmConfirmed = false;
  clearPointing();
  renderMountButtons();
  node('observing-site-source').textContent = 'Manual observing site · longitude is positive east and negative west.';
  clearTimeout(updateTimer); updateTimer = setTimeout(() => { if (node<HTMLFormElement>('observing-site-form').checkValidity()) { saveSite(); void updateSky(); } }, 600);
}));
input('observing-live').addEventListener('change', () => {
  node('observing-date-label').hidden = input('observing-live').checked; input('observing-date').disabled = input('observing-live').checked;
  invalidatePlan('Display time changed. Mount previews always use actual current UTC.'); void updateSky();
});
input('observing-date').addEventListener('change', () => { invalidatePlan('Display time changed. Mount previews always use actual current UTC.'); void updateSky(); });
input('observing-scrub').addEventListener('input', () => inspectPoint(Number(input('observing-scrub').value)));
button('observing-return-now').addEventListener('click', () => inspectPoint(null));
node('observing-trajectory').addEventListener('pointerdown', event => {
  if (!current?.trajectory.length) return;
  const rect = node('observing-trajectory').getBoundingClientRect();
  const chartX = (event.clientX - rect.left) / rect.width * 650;
  const index = Math.round(Math.max(0, Math.min(1, (chartX - 46) / (650 - 46 - 15))) * (current.trajectory.length - 1));
  inspectPoint(index);
});
window.addEventListener('thoth:star-selected', event => { const star = (event as CustomEvent<Star>).detail; if (defaults && star?.id && star.id !== selectedId) void selectStar(star.id, star.name, false); });
node<HTMLSelectElement>('mount-adapter').addEventListener('change', () => { invalidatePlan('Controller changed. Connect, arm, and preview a target.'); input('mount-aligned').checked = false; localArmConfirmed = false; renderAdapter(); });
input('mount-aligned').addEventListener('change', renderMountButtons);
input('mount-token').addEventListener('input', renderMountButtons);
button('mount-connect').addEventListener('click', () => void mountAction(async () => { await mountStatePost('connect', {adapter_id: selectedAdapter()?.id}); input('mount-aligned').checked = false; localArmConfirmed = false; invalidatePlan('Connected. Verify alignment and site before arming.'); }));
button('mount-disconnect').addEventListener('click', () => void mountAction(async () => { await mountStatePost('disconnect'); input('mount-aligned').checked = false; localArmConfirmed = false; invalidatePlan('Disconnected. Connect and arm before previewing a target.'); }));
button('mount-arm').addEventListener('click', () => void mountAction(async () => { await mountStatePost('arm', {aligned_ack: input('mount-aligned').checked}); localArmConfirmed = true; invalidatePlan('Armed. Preview the selected star at the actual current UTC.'); }));
button('mount-preview').addEventListener('click', () => void mountAction(async () => {
  if (!status?.connected || !input('mount-aligned').checked || !localArmConfirmed || !armed()) throw new Error('Verify the observing site and alignment, then explicitly arm before previewing.');
  const revision = targetRevision;
  const candidate = await mountPost<Plan>('plan', targetSettings());
  if (revision !== targetRevision) throw new Error('The selection or observing site changed while computing. Preview the new target again.');
  plan = candidate; planRevision = revision; renderPlan();
}));
button('mount-track').addEventListener('click', () => void mountAction(async () => {
  if (!status?.connected || !input('mount-aligned').checked || !localArmConfirmed || !armed()) throw new Error('Verify the observing site and alignment, then explicitly arm before tracking.');
  if (!plan?.allowed || planRevision !== targetRevision || Date.parse(plan.expires_at) <= Date.now()) throw new Error('This target preview expired or changed. Preview the target again.');
  await mountStatePost('track', {plan_id: plan.plan_id}); localArmConfirmed = false; invalidatePlan('Tracking was requested. Controller status shows the active target. Stop before repositioning or changing the setup.');
}));
button('mount-stop').addEventListener('click', () => void mountAction(async () => { await mountStatePost('stop'); input('mount-aligned').checked = false; localArmConfirmed = false; invalidatePlan('Stop requested. Confirm controller status and physical motion before approaching the telescope.'); }, true));

async function initialize() {
  try {
    defaults = await api<Defaults>('/api/observing/defaults');
    let initial = defaults.location, minimum = 20, stored = false;
    try {
      const saved = JSON.parse(localStorage.getItem('thoth.observing.site') || 'null') as Site & {minimum_altitude_deg?: number} | null;
      if (saved && [saved.latitude_deg, saved.longitude_deg, saved.elevation_m].every(Number.isFinite) && Math.abs(saved.latitude_deg) <= 90 && Math.abs(saved.longitude_deg) <= 180 && saved.elevation_m >= -500 && saved.elevation_m <= 10000) {
        initial = saved; stored = true;
        if (saved.minimum_altitude_deg !== undefined && saved.minimum_altitude_deg >= 20 && saved.minimum_altitude_deg <= 85) minimum = saved.minimum_altitude_deg;
      }
    } catch { /* Ignore incompatible saved settings. */ }
    input('observing-latitude').value = String(initial.latitude_deg); input('observing-longitude').value = String(initial.longitude_deg); input('observing-height').value = String(initial.elevation_m); input('observing-minimum').value = String(minimum);
    input('observing-date').value = new Date().toISOString().slice(0, 16);
    node('observing-site-source').textContent = stored ? 'Saved manual observing site on this browser. Verify it matches the telescope.' : `${defaults.location.label || 'University, Mississippi'} · approximate preset. Enter the telescope’s exact site before real control.`;
    ['observing-search', 'observing-latitude', 'observing-longitude', 'observing-height', 'observing-minimum', 'observing-live'].forEach(id => input(id).disabled = false);
    button('observing-update').disabled = false;
    await selectStar(defaults.example_star_id, defaults.example_star_id, false);
  } catch (error) { showError('observing-error', error); node('observing-star-name').textContent = 'Observing service unavailable'; }
  try {
    inventory = await api<MountInventory>('/api/mounts');
    node('mount-setup-note').innerHTML = `${inventory.adapters.some(adapter => !adapter.simulated && !adapter.configured) ? 'ASCOM Alpaca requires server setup. ' : ''}<a href="https://github.com/rebeltechoxford/THOTHv2/blob/main/docs/OBSERVING.md" target="_blank" rel="noopener noreferrer" class="text-link">Mount setup &amp; coordinate methods ↗</a>`;
    node<HTMLSelectElement>('mount-adapter').innerHTML = inventory.adapters.map(adapter => `<option value="${escape(adapter.id)}" ${adapter.available ? '' : 'disabled'}>${escape(adapter.label)}${adapter.available ? '' : ' · server setup required'}</option>`).join('');
    node<HTMLSelectElement>('mount-adapter').value = inventory.active_adapter_id;
    await readStatus(); renderAdapter();
  } catch (error) { showError('mount-error', error); node('mount-adapter-note').textContent = 'The mount service is unavailable.'; }
}
setInterval(() => { if (!document.hidden && defaults && input('observing-live').checked) void updateSky(); }, 15000);
setInterval(() => { if (!document.hidden && status?.connected && !statusBusy) void readStatus().catch(error => showError('mount-error', error)); else renderMountButtons(); }, 5000);
setInterval(() => {
  if (document.hidden || !status?.connected || !status.target || !status.lease_until || !status.tracking || leaseBusy || mountBusy) return;
  leaseBusy = true;
  void mountStatePost('heartbeat').catch(error => showError('mount-error', error)).finally(() => leaseBusy = false);
}, 30000);
void initialize();
