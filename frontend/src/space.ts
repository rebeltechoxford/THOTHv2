import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { api, post } from './api';
import { errorMessage } from './dom';
import type { Star, ClusterResult, WorkerResult, TransformResult, SimulationResult } from './types';
import './space.css';

interface SpaceStar { id: string; name: string; catalog: string; region: string; aliases?: string[]; ra_deg: number | null; dec_deg: number | null; period_days: number | null; mean_i_mag?: number | null; amplitude_i_mag?: number | null }
interface DensityCell { longitude_index: number; latitude_index: number; ra_deg: number; dec_deg: number; count: number; solid_angle_sr: number; density_per_sr: number; x: number; y: number; z: number }
interface SurveyGroup { name: string; catalog: string; region: string; count: number; centroid: number[] }
interface SpaceData { stars: SpaceStar[]; positions: (number[] | null)[]; galactic_positions: (number[] | null)[]; density_cells: DensityCell[]; groups: SurveyGroup[]; counts: { catalog_entries: number; mapped_entries: number; missing_coordinates: number }; geometry: Record<string, unknown>; provenance: Record<string, unknown>; caveats: string[]; computation: Record<string, unknown> }
interface RadiativeFamily { radii_relative: number[]; temperatures_k: number[]; reconstructed_fluxes: number[]; radius_fraction?: number; reference_temperature_k?: number; counterfactual_predictions?: { label: string; wavelength_um: number; relative_fluxes: (number | null)[]; delta_magnitudes: (number | null)[]; kind: string }[]; [key: string]: unknown }
interface StarModel { star?: Star; star_id?: string; selected_phase?: number; selected_model?: { radius_relative: number; phase: number }; period_days?: number | null; phase_curve?: { phase: number; magnitude: number; relative_flux?: number }[]; phase_model?: { phase: number; magnitude: number; relative_flux?: number }[]; phase_source?: string; model_kind?: string; geometry?: Record<string, unknown>; computation?: Record<string, unknown>; caveats?: string[]; mesh?: { positions: number[]; normals?: number[]; indices: number[]; [key: string]: unknown }; radiative_family?: RadiativeFamily; fit?: { period_days: number; reduced_chi2?: number; n_observations?: number; phase_model?: { phase: number; magnitude: number; relative_flux?: number }[] }; provenance?: { photometry?: { input_observations?: number; used_observations?: number } }; photometry?: { phase_curve?: { phase: number; magnitude: number; relative_flux?: number }[]; phase_model?: { phase: number; magnitude: number; relative_flux?: number }[]; period_days?: number; status?: string }; [key: string]: unknown }
interface AstrometryEntry { star_id: string; source_id: string; name: string; direction: number[]; position_pc: number[]; distance_median_pc: number; distance_p16_pc: number; distance_p84_pc: number; parallax_mas: number; parallax_error_mas: number; separation_arcsec: number; association_status: string; quality_flags: string[]; source_url: string }
interface AstrometryCatalogue { items: AstrometryEntry[]; total: number; prior_length_pc: number; geometry: Record<string, unknown>; caveats: string[] }
interface GaiaCandidate { source_id: string; ra: number; dec: number; parallax: number | null; parallax_error: number | null; ruwe: number | null; distance_usable: boolean; separation_arcsec: number; quality_flags: string[]; [key: string]: unknown }
interface GaiaEvidence { star_id: string; name: string; candidates: GaiaCandidate[]; candidate_count: number; archive: string; adql_query: string; response_sha256: string; retrieved_utc: string; source_url: string; caveats: string[]; association_status: string }
interface DistancePosterior { distances_pc: number[]; density_per_pc: number[]; cumulative_probability: number[]; median_pc: number; p16_pc: number; p84_pc: number; mode_pc: number; prior_length_pc: number; lower_bound_pc?: number; upper_bound_pc?: number; model_kind: string; [key: string]: unknown }
interface NativeSurface { mesh: { positions: number[]; indices: number[]; native_seconds?: number }; axes: Record<string, unknown>; caveats: string[] }
type ClusterEvidence = ClusterResult & { star_id?: string; name?: string; band?: string; time_system?: string; source_url?: string };
type View = 'sky' | 'density' | 'period' | 'distance' | 'star' | 'workers' | 'surface';
const node = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing 3D element: ${id}`);
  return element as T;
};
const html = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
const fmt = (value: unknown, digits = 2): string => typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—';
const scientific = (value: number): string => Math.abs(value) > 0 && Math.abs(value) < .001 ? value.toExponential(3) : fmt(value, 5);
const example = 'OGLE-BLG-LPV-096697';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

node('space-lab').innerHTML = `
  <div class="section-heading"><div><p class="eyebrow">THE CATALOGUE BECOMES A PLACE. THE COMPUTATION BECOMES A SHAPE.</p><h2>The 3D Observatory <span class="count-label">Every record has a viewpoint.</span></h2></div><span class="data-badge"><span class="status-dot"></span>C++ geometry · Python evidence · local WebGL</span></div>
  <p class="space-intro">Fly around the observed sky. Select any catalogue entry, enter its normalized star model, and explore survey density, measured workers, and computed frequency landscapes. Each view tells you exactly what its geometry means.</p>
  <div class="space-layout">
    <article class="card space-world">
      <div class="space-tabs" role="group" aria-label="Choose a three-dimensional view">
        <button type="button" data-space-view="sky" aria-pressed="true">Celestial sphere</button><button type="button" data-space-view="density" aria-pressed="false">Survey density</button><button type="button" data-space-view="period" aria-pressed="false">Period depth</button><button type="button" data-space-view="distance" aria-pressed="false">Candidate distances</button><button type="button" data-space-view="star" aria-pressed="false">Star reconstruction</button><button type="button" data-space-view="workers" aria-pressed="false">Compute cluster</button><button type="button" data-space-view="surface" aria-pressed="false">Math landscape</button>
      </div>
      <div class="space-viewport" id="space-viewport">
        <canvas id="space-canvas" tabindex="0" aria-label="Interactive 3D Mira sky. Drag to orbit, pinch or scroll to zoom. Use the record list and view controls for keyboard selection."></canvas>
        <div class="space-hud"><span id="space-view-label">CELESTIAL SPHERE / J2000 DIRECTIONS</span><strong id="space-hud-count">Opening the full catalogue…</strong></div>
        <div id="space-webgl-message" class="space-webgl-message" role="status" hidden></div>
        <div class="space-view-tools"><button type="button" id="space-reset" title="Reset this view">↺ Reset camera</button><button type="button" id="space-play" aria-pressed="false">▶ Orbit</button><button type="button" id="space-fullscreen">⛶ Expand</button></div>
        <div class="space-bottom-hud"><span id="space-render-status">Loading catalogue geometry</span><span id="space-gesture">Drag to orbit · scroll / pinch to zoom · tap a point</span></div>
      </div>
      <div class="space-options" id="space-map-options"><label>Coordinate frame<select id="space-frame"><option value="equatorial">Equatorial · RA / Dec</option><option value="galactic">Galactic · l / b</option></select></label><label class="space-check"><input id="space-grid" type="checkbox" checked>Coordinate grid</label><label class="space-check"><input id="space-groups" type="checkbox" checked>Survey centroids</label><label>Point size<input id="space-point-size" type="range" min="1" max="5" step=".25" value="2.25"></label><button id="space-export-sky" type="button" class="export-button">Geometry + sources JSON ↓</button></div>
      <div id="space-star-options" class="space-options" hidden><label>Cycle phase <strong id="space-phase-label">0.00</strong><input id="space-phase" type="range" min="0" max="1" step=".002" value="0"></label><label class="space-check"><input id="space-cutaway" type="checkbox">Reveal schematic layers</label><label class="space-check"><input id="space-wireframe" type="checkbox">Mesh edges</label><button id="space-model-fit" type="button" class="export-button">Infer from measured brightness</button></div>
      <div id="space-inference" class="space-inference" hidden><h4>One light curve. A family of 3D explanations.</h4><p>The native radiative model partitions measured flux changes between normalized radius and temperature at your assumed reference temperature T₀. Compare conditional hypotheses that reproduce the same observed brightness. Further measurements are needed to identify which geometry describes the star.</p><div class="space-hypotheses" role="group" aria-label="Choose a conditional radiative hypothesis"><button type="button" data-radius-fraction="0" aria-pressed="false">Fixed radius<br>Changing temperature</button><button type="button" data-radius-fraction="0.5" aria-pressed="true">Mixed<br>Radius + temperature</button><button type="button" data-radius-fraction="1" aria-pressed="false">Fixed temperature<br>Changing radius</button></div><label class="space-inference-slider">Fraction of flux change assigned to radius <strong id="space-radius-fraction-label">0.50</strong><input id="space-radius-fraction" type="range" min="0" max="1" step=".05" value=".5"></label><label class="space-reference-temperature">Assumed reference temperature T₀ / K<input id="space-reference-temperature" type="number" min="1500" max="10000" step="any" value="3000" required></label><div class="space-radiative-metrics"><span>CONDITIONAL RADIUS / R₀<strong id="space-radiative-radius">—</strong></span><span>CONDITIONAL T / K<strong id="space-radiative-temperature">—</strong></span><span>RECONSTRUCTED FLUX / F₀<strong id="space-radiative-flux">—</strong></span></div><div id="space-inference-chart"></div><p id="space-inference-status">Select a star and infer from available photometry to build this family.</p></div>
      <div id="space-distance-options" class="space-options" hidden><button id="space-refresh-distances" type="button" class="export-button">Reload acquired Gaia candidates</button><span id="space-distance-scale">Physical coordinate scale pending evidence</span></div>
      <div id="space-surface-options" class="space-options" hidden><label>Computed surface<select id="space-surface-kind"><option value="chirp">Frequency × frequency derivative</option><option value="localized">Time × frequency</option></select></label><label>Vertical scale<input id="space-height" type="range" min="1" max="5" step=".1" value="1"></label><button id="space-run-transform" type="button" class="export-button">Run current foundry experiment ↗</button></div>
      <div id="space-worker-options" class="space-options" hidden><button id="space-run-cluster" type="button" class="export-button">Run a real cluster experiment ↗</button><span>Nodes represent measured processes and their coordinator.</span></div>
      <p class="space-geometry-note" id="space-geometry-note">Directions lie on a unit celestial sphere. Shell radius is a display scale; individual distances are unavailable in this catalogue.</p>
      <div id="space-surface-readout" class="space-surface-readout" hidden><p id="space-cell-value" aria-live="polite"></p><label>Frequency column<input id="space-cell-frequency" type="range" min="0" max="0" step="1" value="0"></label><label>Second coordinate<input id="space-cell-row" type="range" min="0" max="0" step="1" value="0"></label></div>
      <div id="space-worker-ledger" class="space-worker-ledger" hidden></div>
    </article>
    <aside class="space-sidebar">
      <article class="card space-finder"><div class="card-heading"><div><p class="eyebrow">FIND YOUR PLACE IN THE SKY</p><h3>Every entry, reachable</h3></div></div><div class="space-sidebar-body">
        <label>Star name / catalogue ID<input id="space-search" type="search" placeholder="Mira, R Leo, OGLE…" autocomplete="off"></label>
        <div class="space-filter-pair"><label>Catalogue<select id="space-catalogue"><option value="">All catalogues</option></select></label><label>Survey region<select id="space-region"><option value="">All regions</option></select></label></div>
        <div class="space-filter-pair"><label>Minimum period / days<input id="space-min-period" type="number" min="0" placeholder="Any"></label><label>Maximum period / days<input id="space-max-period" type="number" min="0" placeholder="Any"></label></div>
        <div class="space-match-line"><strong id="space-match-count">Loading records</strong><button id="space-clear-filters" type="button">Reset</button></div>
        <div id="space-record-list" class="space-record-list" role="group" aria-label="Catalogue records; use previous and next to browse all matches"><p>Catalogue geometry is loading…</p></div>
        <div class="space-list-pages"><button id="space-prev-records" type="button" disabled>← Previous</button><span id="space-list-page">—</span><button id="space-next-records" type="button" disabled>Next →</button></div>
      </div></article>
      <article class="card space-selected"><div class="card-heading"><div><p class="eyebrow">A RECORD. A MODEL. AN OPEN QUESTION.</p><h3 id="space-star-name">Choose a star</h3></div><span class="subtle-pill amber-pill" id="space-selected-badge">Catalogue</span></div><div class="space-sidebar-body" id="space-inspector"><p class="space-muted">Tap any point or choose a catalogue record. The model is available for every entry; missing measurements stay visible.</p></div></article>
    </aside>
  </div>
  <div class="space-ledger" id="space-ledger"><span>Preparing native geometry…</span></div>
  <details class="space-evidence"><summary>What is real in these three dimensions? <span>+</span></summary><div><p>The sky uses published angular positions. Period depth encodes the period as a radial coordinate. Density describes catalogue coverage per steradian. Survey groups describe observing regions. Their centroids are directional summaries; they do not identify gravitational star clusters.</p><p>Star meshes have a normalized radius and schematic layers. A measured light curve can drive relative brightness; brightness alone does not determine a radius, temperature, mass, or interior. The compute graph uses actual process receipts. Math surfaces use the native search matrices and show missing cells as gaps.</p><div id="space-provenance"></div><ul id="space-caveats"></ul></div></details>
`;

let data: SpaceData | null = null;
let matched: number[] = [];
let page = 0;
const pageSize = 8;
let selectedIndex = -1;
let selectedStar: Star | null = null;
let starModel: StarModel | null = null;
let modelRequest = 0;
let fittingModel = false;
let queuedModel = false;
let view: View = 'sky';
let transform: TransformResult | null = null;
let cluster: ClusterEvidence | null = null;
let simulation: SimulationResult | null = null;
let astrometry: AstrometryCatalogue | null = null;
let gaiaEvidence: GaiaEvidence | null = null;
let posterior: DistancePosterior | null = null;
let gaiaCandidateIndex = 0;
let priorLength = 1350;
let nativeMeshReferenceRadius = 1;
const nativeSurfaces = new Map<string, NativeSurface>();
const surfaceRequests = new Set<string>();
let surfaceError = '';
let renderer: THREE.WebGLRenderer | null = null;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let scene: THREE.Scene;
let content: THREE.Group;
let grid: THREE.Group;
let groupLabels: THREE.Group;
let pointCloud: THREE.Points | null = null;
let pointMaterial: THREE.ShaderMaterial | null = null;
let pointIndices: number[] = [];
let selectionMarker: THREE.Group | null = null;
let stellarShell: THREE.Mesh | null = null;
let stellarGlow: THREE.Mesh | null = null;
let stellarEdges: THREE.LineSegments | null = null;
let stellarLayers: THREE.Group | null = null;
let surface: THREE.Mesh | null = null;
let surfaceMarker: THREE.Mesh | null = null;
let densityMesh: THREE.InstancedMesh | null = null;
let activeDensityCells: DensityCell[] = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let visible = true;
let dirty = true;
let playing = false;
let lastFrame = 0;
let fpsEpoch = 0;
let renderedFrames = 0;
let animationPhase = 0;
let selectedCell = { row: 0, frequency: 0 };

function announce(message: string): void { node('space-render-status').textContent = message; }
function disposeObject(object: THREE.Object3D): void {
  object.traverse(child => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.LineSegments || child instanceof THREE.Line || child instanceof THREE.Sprite) {
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        if ('map' in material && material.map instanceof THREE.Texture) material.map.dispose();
        material.dispose();
      }
    }
  });
}
function clearScene(): void {
  disposeObject(content);
  scene.remove(content);
  content = new THREE.Group();
  scene.add(content);
  pointCloud = null; pointMaterial = null; selectionMarker = null;
  stellarShell = null; stellarGlow = null; stellarEdges = null; stellarLayers = null;
  surface = null; surfaceMarker = null; densityMesh = null;
  grid = new THREE.Group(); groupLabels = new THREE.Group();
}
function labelSprite(text: string, color = '#a1b2c9', size = 3.5): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 112;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(3,10,21,.8)'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '42px system-ui'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 24);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(size, size * canvas.height / canvas.width, 1);
  return sprite;
}
function line(points: THREE.Vector3[], color: number, opacity = .4): THREE.Line {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
function direction(ra: number, dec: number): THREE.Vector3 {
  const a = ra * Math.PI / 180, d = dec * Math.PI / 180;
  return new THREE.Vector3(Math.cos(d) * Math.cos(a), Math.sin(d), -Math.cos(d) * Math.sin(a));
}
function makeCoordinateGrid(): void {
  const radius = 10;
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const points = Array.from({ length: 145 }, (_, i) => direction(i * 2.5, latitude).multiplyScalar(radius));
    grid.add(line(points, latitude === 0 ? 0x539cba : 0x314763, latitude === 0 ? .48 : .2));
  }
  for (let longitude = 0; longitude < 360; longitude += 30) {
    grid.add(line(Array.from({ length: 73 }, (_, i) => direction(longitude, -90 + i * 2.5).multiplyScalar(radius)), 0x314763, .2));
  }
  const isGalactic = node<HTMLSelectElement>('space-frame').value === 'galactic';
  for (let longitude = 0; longitude < 360; longitude += 90) {
    const text = `${isGalactic ? 'l' : 'RA'} ${longitude}°`;
    const sprite = labelSprite(text, '#8cacc5', 2.5); sprite.position.copy(direction(longitude, 0).multiplyScalar(radius * 1.06)); grid.add(sprite);
  }
  const north = labelSprite(isGalactic ? 'b +90°' : 'Dec +90°', '#8cacc5', 2.5); north.position.set(0, 11.1, 0); grid.add(north);
  grid.visible = node<HTMLInputElement>('space-grid').checked;
  content.add(grid);
}
function colorFor(star: SpaceStar): THREE.Color {
  const period = star.period_days;
  if (!period || !Number.isFinite(period)) return new THREE.Color('#728298');
  return new THREE.Color().setHSL(.49 + Math.min(1, Math.max(0, (Math.log10(period) - 1.8) / 1.4)) * .28, .64, .66);
}
function positionFor(index: number): THREE.Vector3 {
  if (!data) return new THREE.Vector3();
  const positions = node<HTMLSelectElement>('space-frame').value === 'galactic' ? data.galactic_positions : data.positions;
  const tuple = positions[index];
  if (!tuple?.every(Number.isFinite)) return new THREE.Vector3();
  const radius = view === 'period' && data.stars[index].period_days ? 6 + Math.min(1, Math.max(0, Math.log10(data.stars[index].period_days!) / Math.log10(100000))) * 8 : 10;
  return new THREE.Vector3(tuple[0], tuple[1], tuple[2]).multiplyScalar(radius);
}
function buildPoints(): void {
  if (!data) return;
  pointIndices = matched.filter(index => data!.positions[index]?.every(Number.isFinite));
  const positions = new Float32Array(pointIndices.length * 3), colors = new Float32Array(pointIndices.length * 3);
  for (let i = 0; i < pointIndices.length; i++) {
    const p = positionFor(pointIndices[i]), c = colorFor(data.stars[pointIndices[i]]);
    positions.set(p.toArray(), i * 3); colors.set(c.toArray(), i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pointMaterial = new THREE.ShaderMaterial({
    uniforms: { size: { value: Number(node<HTMLInputElement>('space-point-size').value) * (renderer?.getPixelRatio() ?? 1) } },
    vertexShader: 'attribute vec3 color; varying vec3 tint; uniform float size; void main(){ tint=color; gl_PointSize=size; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'varying vec3 tint; void main(){ float r=length(gl_PointCoord-vec2(.5)); if(r>.5)discard; float a=smoothstep(.5,.05,r); gl_FragColor=vec4(tint,a); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  pointCloud = new THREE.Points(geometry, pointMaterial);
  pointCloud.renderOrder = 1;
  content.add(pointCloud);
  makeCoordinateGrid();
  if (node<HTMLSelectElement>('space-frame').value === 'equatorial') {
    for (const survey of data.groups) {
      if (survey.centroid.length !== 3 || !survey.centroid.every(Number.isFinite)) continue;
      const position = new THREE.Vector3(...survey.centroid as [number, number, number]).normalize().multiplyScalar(10.6);
      const sprite = labelSprite(`${survey.name} · ${fmt(survey.count, 0)}`, '#b6a2ed', 3.8); sprite.position.copy(position); groupLabels.add(sprite);
    }
  }
  groupLabels.visible = node<HTMLInputElement>('space-groups').checked;
  content.add(groupLabels);
  updateSelectionMarker();
}
function updateSelectionMarker(): void {
  if (!data || !renderer || !['sky', 'period'].includes(view)) return;
  if (selectionMarker) { content.remove(selectionMarker); disposeObject(selectionMarker); selectionMarker = null; }
  if (selectedIndex < 0 || !matched.includes(selectedIndex) || !data.positions[selectedIndex]) return;
  selectionMarker = new THREE.Group();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(.11, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffca91 }));
  selectionMarker.add(sphere);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.19, .23, 40), new THREE.MeshBasicMaterial({ color: 0xffba75, side: THREE.DoubleSide, transparent: true, opacity: .85 }));
  selectionMarker.add(ring); selectionMarker.position.copy(positionFor(selectedIndex)); content.add(selectionMarker); dirty = true;
}
function filteredDensityCells(space: SpaceData, indices: readonly number[]): DensityCell[] {
  const longitudeBins = Number(space.geometry.longitude_bins), latitudeBins = Number(space.geometry.latitude_bins);
  const counts = new Uint32Array(longitudeBins * latitudeBins);
  for (const index of indices) {
    const star = space.stars[index];
    if (!space.positions[index] || star.ra_deg === null || star.dec_deg === null || !Number.isFinite(star.ra_deg) || !Number.isFinite(star.dec_deg) || star.dec_deg < -90 || star.dec_deg > 90) continue;
    let longitude = star.ra_deg % 360;
    if (longitude < 0) longitude += 360;
    const column = Math.min(longitudeBins - 1, Math.floor(longitude / 360 * longitudeBins));
    const row = Math.min(latitudeBins - 1, Math.floor((star.dec_deg + 90) / 180 * latitudeBins));
    counts[row * longitudeBins + column]++;
  }
  return space.density_cells.map(cell => {
    const count = counts[cell.latitude_index * longitudeBins + cell.longitude_index];
    return { ...cell, count, density_per_sr: count / cell.solid_angle_sr };
  });
}
function buildDensity(): void {
  if (!data) return;
  makeCoordinateGrid();
  const cells = filteredDensityCells(data, matched);
  activeDensityCells = cells;
  const maximum = Math.max(1, ...cells.map(cell => cell.density_per_sr));
  densityMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .13, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 }), cells.length);
  const helper = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const axis = new THREE.Vector3(cell.x, cell.y, cell.z).normalize();
    const strength = Math.log1p(cell.density_per_sr) / Math.log1p(maximum), height = .005 + strength * 4;
    helper.position.copy(axis).multiplyScalar(10 + height / 2); helper.quaternion.setFromUnitVectors(up, axis); helper.scale.set(1, height, 1); helper.updateMatrix();
    densityMesh.setMatrixAt(i, helper.matrix); densityMesh.setColorAt(i, new THREE.Color().setHSL(.52 + strength * .21, .68, .45 + strength * .18));
  }
  content.add(densityMesh);
  content.add(new THREE.Mesh(new THREE.SphereGeometry(9.98, 48, 32), new THREE.MeshBasicMaterial({ color: 0x071220, transparent: true, opacity: .85 })));
  const mapped = cells.reduce((sum, cell) => sum + cell.count, 0), populated = cells.filter(cell => cell.count > 0).length;
  node('space-hud-count').textContent = `${fmt(mapped, 0)} filtered mapped entries · ${fmt(populated, 0)} populated / ${fmt(cells.length, 0)} angular cells`;
  node('space-geometry-note').textContent = `Current filter: ${fmt(matched.length, 0)} matching entries, ${fmt(mapped, 0)} with coordinates. Counts and entries per steradian use these matches on the native equatorial grid. Heights are normalized to this filter’s density maximum; zero-count cells retain a display marker. ${viewDescriptions.density[1]}`;
}

function buildStar(): void {
  let geometry: THREE.BufferGeometry;
  if (starModel?.mesh?.positions.length && starModel.mesh.indices.length) {
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(starModel.mesh.positions.map(value => value * 4), 3));
    geometry.setIndex(starModel.mesh.indices);
    if (starModel.mesh.normals?.length) geometry.setAttribute('normal', new THREE.Float32BufferAttribute(starModel.mesh.normals, 3));
    else geometry.computeVertexNormals();
    nativeMeshReferenceRadius = starModel.selected_model?.radius_relative ?? familyValue(starModel.radiative_family?.radii_relative, starModel.selected_phase ?? 0) ?? 1;
  } else {
    geometry = new THREE.SphereGeometry(4, 96, 64); nativeMeshReferenceRadius = 1;
  }
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const y = geometry.attributes.position.getY(i);
    // Shading provides depth cues; the displayed color does not claim resolved surface structure.
    const shading = .54 + .08 * y / 4;
    colors.set(new THREE.Color().setHSL(.065, .8, shading).toArray(), i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  stellarShell = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ vertexColors: true, side: THREE.DoubleSide, clippingPlanes: [], shininess: 8, specular: new THREE.Color('#754c2a'), emissive: new THREE.Color('#522107'), emissiveIntensity: .28 }));
  content.add(stellarShell);
  stellarEdges = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffce83, transparent: true, opacity: .14 }));
  content.add(stellarEdges);
  stellarGlow = new THREE.Mesh(new THREE.SphereGeometry(4.2, 48, 32), new THREE.MeshBasicMaterial({ color: 0xd06b3f, transparent: true, opacity: .08, side: THREE.BackSide, depthWrite: false }));
  content.add(stellarGlow);
  stellarLayers = new THREE.Group();
  for (const [radius, color] of [[2.95, 0xc84a48], [1.7, 0xf5bb75], [.65, 0xffe2ad]] as const) {
    stellarLayers.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })));
  }
  content.add(stellarLayers);
  const labels = [labelSprite(starModel?.radiative_family ? 'CONDITIONAL RADIUS · MEASURED FLUX MODEL' : 'NORMALIZED PHOTOSPHERE · R = 1', '#ffc184', 5.3), labelSprite('SCHEMATIC INTERIOR · UNMEASURED', '#a99bc8', 5.3)];
  labels[0].position.set(0, 5, 0); labels[1].position.set(0, -5, 0); content.add(...labels);
  const ring = new THREE.Mesh(new THREE.RingGeometry(4.8, 4.83, 120), new THREE.MeshBasicMaterial({ color: 0x6aa4b4, side: THREE.DoubleSide, transparent: true, opacity: .5 }));
  ring.rotation.x = Math.PI / 2; content.add(ring);
  updateStarAppearance();
}
function phaseCurve(): { phase: number; magnitude: number; relative_flux?: number }[] {
  return starModel?.phase_curve ?? starModel?.phase_model ?? starModel?.fit?.phase_model ?? starModel?.photometry?.phase_curve ?? starModel?.photometry?.phase_model ?? [];
}
function magnitudeAt(phase: number): number | null {
  const curve = phaseCurve();
  if (!curve.length) return null;
  const index = Math.min(curve.length - 1, Math.floor(phase * (curve.length - 1)));
  const next = Math.min(curve.length - 1, index + 1), start = curve[index], end = curve[next];
  const fraction = end.phase > start.phase ? (phase - start.phase) / (end.phase - start.phase) : 0;
  return start.magnitude + Math.max(0, Math.min(1, fraction)) * (end.magnitude - start.magnitude);
}
function familyValue(values: number[] | undefined, phase: number): number | null {
  if (!values?.length) return null;
  const curve = phaseCurve();
  const index = Math.min(values.length - 1, Math.floor(phase * (values.length - 1))), next = Math.min(values.length - 1, index + 1);
  const firstPhase = curve[index]?.phase ?? index / Math.max(1, values.length - 1), lastPhase = curve[next]?.phase ?? next / Math.max(1, values.length - 1);
  const fraction = lastPhase > firstPhase ? Math.max(0, Math.min(1, (phase - firstPhase) / (lastPhase - firstPhase))) : 0;
  return values[index] + fraction * (values[next] - values[index]);
}
function updateStarAppearance(): void {
  const phase = Number(node<HTMLInputElement>('space-phase').value), cutaway = node<HTMLInputElement>('space-cutaway').checked;
  node('space-phase-label').textContent = fmt(phase, 2);
  if (stellarShell) {
    const material = stellarShell.material as THREE.MeshPhongMaterial;
    material.clippingPlanes = cutaway ? [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)] : [];
    const magnitude = magnitudeAt(phase), curve = phaseCurve();
    const brightest = curve.length ? Math.min(...curve.map(point => point.magnitude)) : 0;
    const relative = magnitude === null ? 1 : Math.pow(10, -.4 * (magnitude - brightest));
    const radius = familyValue(starModel?.radiative_family?.radii_relative, phase), temperature = familyValue(starModel?.radiative_family?.temperatures_k, phase), reconstructedFlux = familyValue(starModel?.radiative_family?.reconstructed_fluxes, phase);
    const radiusRatio = (radius ?? 1) / nativeMeshReferenceRadius;
    stellarShell.scale.setScalar(radiusRatio);
    if (temperature !== null) {
      // Illustrative warm/cool color scale. Photometric inference does not provide a resolved color image.
      material.color.setHSL(Math.max(0, Math.min(.13, (temperature - 1800) / 25000)), .38, .45 + .3 * relative);
    } else material.color.setRGB(.15 + .85 * relative, .15 + .85 * relative, .15 + .85 * relative);
    if (stellarGlow) (stellarGlow.material as THREE.MeshBasicMaterial).opacity = .025 + .09 * relative;
    if (stellarGlow) stellarGlow.scale.setScalar(radius ?? 1);
    if (stellarEdges) stellarEdges.scale.copy(stellarShell.scale);
    if (stellarLayers) stellarLayers.scale.setScalar(radius ?? 1);
    node('space-radiative-radius').textContent = fmt(radius, 4); node('space-radiative-temperature').textContent = fmt(temperature, 1); node('space-radiative-flux').textContent = fmt(reconstructedFlux, 4);
    if (view === 'star' && radius !== null && temperature !== null) node('space-hud-count').textContent = `${data?.stars[selectedIndex]?.name ?? 'Selected star'} · R/R₀ ${fmt(radius, 3)} · conditional T ${fmt(temperature, 0)} K`;
    const readout = document.getElementById('space-model-brightness');
    if (readout) readout.textContent = magnitude === null ? (starModel ? 'Measured phase evidence is unavailable for this entry; normalized geometry remains a template.' : 'Phase evidence is not loaded; normalized geometry remains a template.') : `Phase ${fmt(phase)} · ${fmt(magnitude, 3)} mag · ${fmt(relative * 100, 1)}% of brightest fitted flux`;
  }
  if (stellarEdges) { stellarEdges.visible = node<HTMLInputElement>('space-wireframe').checked; (stellarEdges.material as THREE.LineBasicMaterial).clippingPlanes = cutaway ? [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)] : []; }
  if (stellarLayers) stellarLayers.visible = cutaway;
  dirty = true;
}
function buildDistances(): void {
  const entries = astrometry?.items ?? [];
  const maximum = Math.max(1, ...entries.map(entry => entry.distance_p84_pc)), scale = 12 / maximum;
  const grid = new THREE.GridHelper(28, 14, 0x324965, 0x13233b); grid.position.y = -5; content.add(grid);
  const axes = [new THREE.Vector3(14, 0, 0), new THREE.Vector3(0, 14, 0), new THREE.Vector3(0, 0, 14)];
  axes.forEach((axis, index) => {
    content.add(line([axis.clone().negate(), axis], [0x678acb, 0x58baa9, 0xba81a5][index], .65));
    const label = labelSprite(`${['X', 'Y', 'Z'][index]} / pc`, '#9db7d2', 3); label.position.copy(axis); content.add(label);
  });
  const observer = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); content.add(observer);
  const earthLabel = labelSprite('OBSERVER / ORIGIN', '#aebcd1', 3.5); earthLabel.position.set(0, -.65, 0); content.add(earthLabel);
  for (const entry of entries) {
    if (!entry.position_pc.every(Number.isFinite) || !entry.direction.every(Number.isFinite)) continue;
    const position = new THREE.Vector3(...entry.position_pc as [number, number, number]).multiplyScalar(scale);
    const direction = new THREE.Vector3(...entry.direction as [number, number, number]);
    const interval = line([direction.clone().multiplyScalar(entry.distance_p16_pc * scale), direction.clone().multiplyScalar(entry.distance_p84_pc * scale)], entry.quality_flags.length ? 0xd89061 : 0xa592e2, .8);
    content.add(interval);
    const point = new THREE.Mesh(new THREE.SphereGeometry(.18, 20, 12), new THREE.MeshBasicMaterial({ color: entry.quality_flags.length ? 0xe6a574 : 0xb8a3ef })); point.position.copy(position); point.userData.star_id = entry.star_id; content.add(point);
    const title = labelSprite(`${entry.name} · ${fmt(entry.distance_median_pc, 0)} pc`, '#bfcde1', 5.5); title.position.copy(position).add(new THREE.Vector3(0, .55, 0)); content.add(title);
  }
  node('space-hud-count').textContent = `${fmt(entries.length, 0)} unconfirmed positional associations · radial 16–84% intervals`;
  node('space-distance-scale').textContent = `One scene unit = ${fmt(1 / scale, 1)} pc · uniform Cartesian scale`;
  node('space-worker-ledger').hidden = false;
  node('space-worker-ledger').innerHTML = entries.length ? `<p>Gaia DR3 positional candidates; source associations are unconfirmed. Distances are conditional on the parallax likelihood and an exponentially decreasing space-density prior of ${fmt(astrometry?.prior_length_pc, 0)} pc. Integration support: 0.001–20,000 pc.</p><table><thead><tr><th>POSITIONAL CANDIDATE</th><th>MEDIAN / pc</th><th>16–84% / pc</th></tr></thead><tbody>${entries.map(entry => `<tr><td>${html(entry.name)}<small>Gaia ${html(entry.source_id)} · ${fmt(entry.separation_arcsec, 2)}″ separation</small><small>${html(entry.quality_flags.join('; ') || 'No quoted quality flag')}</small></td><td>${fmt(entry.distance_median_pc, 0)}</td><td>${fmt(entry.distance_p16_pc, 0)}–${fmt(entry.distance_p84_pc, 0)}</td></tr>`).join('')}</tbody></table><ul class="space-distance-caveats">${astrometry?.caveats.map(caveat => `<li>${html(caveat)}</li>`).join('') ?? ''}</ul>` : '<p>Acquire Gaia evidence for a selected star. A positional match requires identity and astrometric-quality review before treating it as the Mira distance.</p>';
}
function transformSource(report: TransformResult): string {
  const name = report.provenance?.name?.trim(), id = report.provenance?.star_id?.trim();
  return name && id && name !== id ? `${name} (${id})` : name || id || 'Source in the Transform Foundry report';
}
function buildWorkers(): void {
  const workers = cluster?.node_results ?? transform?.ensemble.workers ?? [];
  const workload = cluster?.node_results ? cluster.name || cluster.star_id || 'Source in the cluster experiment report' : transform ? transformSource(transform) : null;
  const workloadBand = cluster?.node_results ? cluster.band : transform?.provenance.band;
  const workloadTime = cluster?.node_results ? cluster.time_system : transform?.provenance.time_system;
  const receiptSource = workload ? `Workload observations: ${workload}${workloadBand ? ` · ${workloadBand} band` : ''}${workloadTime ? ` · ${workloadTime}` : ''}.` : '';
  const coordinator = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 2), new THREE.MeshBasicMaterial({ color: 0xe8a069, wireframe: true }));
  content.add(coordinator);
  const coordinatorLabel = labelSprite('PYTHON COORDINATOR', '#ffbe8a', 4.4); coordinatorLabel.position.set(0, 1.9, 0); content.add(coordinatorLabel);
  for (let i = 0; i < workers.length; i++) {
    const worker = workers[i], angle = i / workers.length * Math.PI * 2;
    const position = new THREE.Vector3(Math.cos(angle) * 7, (i % 2 ? -1 : 1) * 1.8, Math.sin(angle) * 7);
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(.65 + Math.min(.5, worker.tasks_completed / 30), 1), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xa289e7 : 0x6cdfd9, wireframe: true }));
    mesh.position.copy(position); mesh.userData.worker = worker; content.add(mesh);
    content.add(line([new THREE.Vector3(), position], i % 2 ? 0x8872bd : 0x4c9699, .7));
    const title = labelSprite(`${worker.hostname} / PID ${worker.worker_pid}`, '#b6cbdd', 4.7); title.position.copy(position).add(new THREE.Vector3(0, 1.4, 0)); content.add(title);
    const count = labelSprite(`${worker.tasks_completed} tasks · ${fmt(worker.compute_seconds)} s`, '#95a6bc', 3.8); count.position.copy(position).add(new THREE.Vector3(0, -1.3, 0)); content.add(count);
  }
  const gridHelper = new THREE.GridHelper(22, 22, 0x34445f, 0x142238); gridHelper.position.y = -3; content.add(gridHelper);
  node('space-worker-ledger').innerHTML = workers.length ? `<p>${html(receiptSource)}</p><table><thead><tr><th>HOST / PID</th><th>TASKS</th><th>COMPUTE / s</th></tr></thead><tbody>${workers.map(worker => `<tr><td>${html(worker.hostname)}<small>PID ${html(worker.worker_pid)}${worker.mpi_rank !== undefined ? ` · rank ${html(worker.mpi_rank)}` : ''}</small></td><td>${fmt(worker.tasks_completed, 0)}</td><td>${fmt(worker.compute_seconds, 3)}</td></tr>`).join('')}</tbody></table>` : '<p>Run the cluster experiment or Transform Foundry to place actual process receipts here. The empty coordinator represents the workflow; no workers have been invented.</p>';
  node('space-hud-count').textContent = workers.length ? `${workload ?? 'Source in the experiment report'} · ${fmt(workers.length, 0)} measured worker processes` : 'Awaiting measured process receipts';
  if (receiptSource) node('space-geometry-note').textContent = `${receiptSource} ${viewDescriptions.workers[1]}`;
}
function surfaceGrid() { return node<HTMLSelectElement>('space-surface-kind').value === 'localized' ? transform?.localized : transform?.chirp; }
function surfaceKey(): string | null {
  const id = (transform as (TransformResult & { job_id?: string }) | null)?.job_id;
  return id ? `${id}:${node<HTMLSelectElement>('space-surface-kind').value}` : null;
}
async function loadNativeSurface(): Promise<void> {
  const key = surfaceKey();
  if (!key || nativeSurfaces.has(key) || surfaceRequests.has(key)) return;
  surfaceRequests.add(key);
  const [id, kind] = key.split(':');
  try {
    const result = await api<NativeSurface>(`/api/space/surfaces/${encodeURIComponent(id)}?kind=${encodeURIComponent(kind)}`);
    nativeSurfaces.set(key, result); surfaceError = '';
    if (view === 'surface' && surfaceKey() === key) setView('surface', false);
  } catch (error) { surfaceError = `Browser triangulation of native power matrix; native mesh endpoint unavailable: ${errorMessage(error)}`; if (view === 'surface') announce(surfaceError); }
}
function buildSurface(): void {
  const report = transform, dataset = surfaceGrid();
  if (!report || !dataset) {
    const helper = new THREE.GridHelper(18, 18, 0x34445f, 0x142238); content.add(helper);
    const message = labelSprite('RUN A NATIVE GRID TO BUILD THIS LANDSCAPE', '#9bb4cd', 12); message.position.y = 2; content.add(message);
    node('space-hud-count').textContent = 'Awaiting a computed transform matrix';
    node('space-surface-readout').hidden = true; return;
  }
  const rows = dataset.powers.length, columns = dataset.frequencies.length;
  const positions = new Float32Array(rows * columns * 3), colors = new Float32Array(rows * columns * 3), indices: number[] = [];
  const height = Number(node<HTMLInputElement>('space-height').value);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const power = dataset.powers[row][column], index = row * columns + column;
      positions.set([(column / Math.max(1, columns - 1) - .5) * 16, (power ?? 0) * 5 * height, (row / Math.max(1, rows - 1) - .5) * 10], index * 3);
      colors.set(new THREE.Color().setHSL(.72 - Math.max(0, Math.min(1, power ?? 0)) * .23, .65, .38 + Math.max(0, Math.min(1, power ?? 0)) * .27).toArray(), index * 3);
      if (row < rows - 1 && column < columns - 1) {
        const a = index, b = index + 1, c = index + columns, d = c + 1;
        const valid = (r: number, col: number) => dataset.powers[r][col] !== null && Number.isFinite(dataset.powers[r][col]);
        if (valid(row, column) && valid(row, column + 1) && valid(row + 1, column)) indices.push(a, c, b);
        if (valid(row, column + 1) && valid(row + 1, column) && valid(row + 1, column + 1)) indices.push(b, c, d);
      }
    }
  }
  const native = nativeSurfaces.get(surfaceKey() ?? '');
  if (native && native.mesh.positions.length === positions.length) {
    for (let i = 0; i < native.mesh.positions.length; i += 3) positions.set([native.mesh.positions[i] * 8, native.mesh.positions[i + 1] * 5 * height, native.mesh.positions[i + 2] * 5], i);
    indices.length = 0; for (const index of native.mesh.indices) indices.push(index);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  surface = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: .91 })); content.add(surface);
  const edges = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x90bdd7, transparent: true, opacity: .12 })); content.add(edges);
  const base = new THREE.GridHelper(20, 20, 0x42536a, 0x1b2b40); content.add(base);
  for (let i = 0; i <= 2; i++) {
    const column = Math.round(i / 2 * (columns - 1)), x = (i / 2 - .5) * 16;
    const label = labelSprite(`${scientific(dataset.frequencies[column])} d⁻¹`, '#9bd1d9', 3.5); label.position.set(x, -.45, 6.1); content.add(label);
    const row = Math.round(i / 2 * (rows - 1));
    const rowValue = node<HTMLSelectElement>('space-surface-kind').value === 'localized' ? report.localized.time_centers_jd[row] : report.chirp.frequency_derivatives[row];
    const rowLabel = labelSprite(node<HTMLSelectElement>('space-surface-kind').value === 'localized' ? `HJD ${fmt(rowValue, 1)}` : `${scientific(rowValue)} d⁻²`, '#baa7ed', 4); rowLabel.position.set(10.6, -.45, (i / 2 - .5) * 10); content.add(rowLabel);
  }
  const yLabel = labelSprite('HEIGHT = RELATIVE χ² IMPROVEMENT', '#c0a5f3', 7); yLabel.position.set(0, 6 * height + .5, 0); content.add(yLabel);
  surfaceMarker = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffbe7b })); content.add(surfaceMarker);
  node<HTMLInputElement>('space-cell-frequency').max = String(columns - 1); node<HTMLInputElement>('space-cell-row').max = String(rows - 1);
  selectedCell.row = Math.min(selectedCell.row, rows - 1); selectedCell.frequency = Math.min(selectedCell.frequency, columns - 1);
  node<HTMLInputElement>('space-cell-frequency').value = String(selectedCell.frequency); node<HTMLInputElement>('space-cell-row').value = String(selectedCell.row);
  node('space-surface-readout').hidden = false; updateSurfaceCell();
  node('space-hud-count').textContent = `${transformSource(report)} · ${fmt(rows * columns, 0)} computed cells · ${native ? 'C++ indexed mesh' : 'browser triangulation'} · ${fmt(dataset.native_seconds, 3)} native s`;
  node('space-geometry-note').textContent = `Computed observations: ${transformSource(report)} · ${report.provenance.band} band · ${report.provenance.time_system}. ${viewDescriptions.surface[1]}`;
  if (surfaceError && !native) announce(surfaceError);
}
function updateSurfaceCell(): void {
  const dataset = surfaceGrid(); if (!dataset || !transform) return;
  selectedCell = { row: Number(node<HTMLInputElement>('space-cell-row').value), frequency: Number(node<HTMLInputElement>('space-cell-frequency').value) };
  const power = dataset.powers[selectedCell.row]?.[selectedCell.frequency];
  if (surfaceMarker) {
    surfaceMarker.visible = power !== null && power !== undefined;
    surfaceMarker.position.set((selectedCell.frequency / Math.max(1, dataset.frequencies.length - 1) - .5) * 16, (power ?? 0) * 5 * Number(node<HTMLInputElement>('space-height').value) + .16, (selectedCell.row / Math.max(1, dataset.powers.length - 1) - .5) * 10);
  }
  const localized = node<HTMLSelectElement>('space-surface-kind').value === 'localized';
  const second = localized ? transform.localized.time_centers_jd[selectedCell.row] : transform.chirp.frequency_derivatives[selectedCell.row];
  node('space-cell-value').textContent = `f = ${scientific(dataset.frequencies[selectedCell.frequency])} d⁻¹ · ${localized ? `HJD ${fmt(second, 3)}` : `ḟ = ${scientific(second)} d⁻²`} · improvement ${power === null ? 'unidentifiable' : fmt(power, 5)}`;
  dirty = true;
}

const viewDescriptions: Record<View, [string, string]> = {
  sky: ['CELESTIAL SPHERE / PUBLISHED ANGULAR POSITIONS', 'Directions lie on a unit celestial sphere. Display radius is arbitrary; catalogue entries have no individual measured distances here. Color encodes published period; gray means a missing period.'],
  density: ['SURVEY COVERAGE / ENTRIES PER STERADIAN', 'Bar height uses log(1 + entries per steradian) in angular cells. This measures catalogue coverage and selection effects. It is not physical stellar density or a gravitational cluster map.'],
  period: ['PERIOD AS A RADIAL COORDINATE / DISPLAY ENCODING', 'Radius = 6 + 8 × clamp(log₁₀(period days) / 5, 0, 1). This depth encodes a measured period, not a physical distance. Entries with missing periods remain on the reference shell.'],
  distance: ['CANDIDATE DISTANCES / CONDITIONAL PARSEC COORDINATES', 'Positions use Gaia DR3 positional candidates and Bayesian distance posterior medians in a uniform parsec scale. Lines show 16–84% radial intervals. Associations are unconfirmed; negative or noisy parallaxes and flagged solutions can be prior dominated.'],
  star: ['PHOTOMETRIC 3D RECONSTRUCTION / CONDITIONAL RADIATIVE FAMILY', 'Native geometry follows a conditional radius / temperature family that reproduces a fitted measured phase curve. Reference radius is normalized; reference temperature is assumed. Display lighting and color provide depth cues and an illustrative temperature scale. The interior remains schematic.'],
  workers: ['MEASURED PROCESS GRAPH / COMPUTATIONAL TOPOLOGY', 'Each worker node comes from an actual process receipt: host, PID, task count, and compute time. Edges describe coordinator / worker flow; node positions are a diagram, not physical machine locations or measured network traffic.'],
  surface: ['NATIVE COMPUTATION / FREQUENCY LANDSCAPE', 'Horizontal coordinates come from the actual native search grid. Height is relative χ² improvement, multiplied by the selected display scale. Missing cells leave gaps. Peaks are empirical candidates, not calibrated probabilities.'],
};
function setView(next: View, reset = true): void {
  view = next;
  document.querySelectorAll<HTMLButtonElement>('[data-space-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.spaceView === next)));
  node('space-view-label').textContent = viewDescriptions[next][0]; node('space-geometry-note').textContent = viewDescriptions[next][1];
  node('space-map-options').hidden = !['sky', 'density', 'period'].includes(next);
  node('space-star-options').hidden = next !== 'star'; node('space-surface-options').hidden = next !== 'surface'; node('space-worker-options').hidden = next !== 'workers';
  node('space-inference').hidden = next !== 'star'; node('space-distance-options').hidden = next !== 'distance';
  node('space-worker-ledger').hidden = next !== 'workers' && next !== 'distance'; node('space-surface-readout').hidden = next !== 'surface' || !transform;
  node<HTMLSelectElement>('space-frame').disabled = next === 'density'; node<HTMLInputElement>('space-groups').disabled = next === 'density' || node<HTMLSelectElement>('space-frame').value === 'galactic';
  if (next === 'density') node<HTMLSelectElement>('space-frame').value = 'equatorial';
  node('space-hud-count').textContent = next === 'star' ? selectedStar?.name ?? data?.stars[selectedIndex]?.name ?? 'Select any catalogue star' : `${fmt(matched.length, 0)} mapped catalogue entries`;
  if (renderer) {
    clearScene();
    if (next === 'sky' || next === 'period') buildPoints();
    if (next === 'density') buildDensity();
    if (next === 'distance') { buildDistances(); if (!astrometry) void loadAstrometry(); }
    if (next === 'star') buildStar();
    if (next === 'workers') buildWorkers();
    if (next === 'surface') { buildSurface(); void loadNativeSurface(); }
    if (reset) resetCamera(); dirty = true;
  }
  node('space-play').textContent = playing ? 'Ⅱ Pause' : next === 'star' ? '▶ Cycle' : '▶ Orbit';
}
function resetCamera(): void {
  if (!renderer) return;
  camera.position.set(view === 'surface' ? 18 : view === 'star' ? 7 : 17, view === 'star' ? 3 : view === 'surface' ? 15 : 10, view === 'star' ? 11 : 20);
  controls.target.set(0, view === 'surface' ? 1.5 : 0, 0); controls.minDistance = view === 'star' ? 5 : 3; controls.maxDistance = 75;
  controls.update(); dirty = true;
}
function setupRenderer(): void {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: node<HTMLCanvasElement>('space-canvas'), antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.localClippingEnabled = true;
    scene = new THREE.Scene(); scene.background = new THREE.Color('#030811');
    scene.add(new THREE.AmbientLight(0xbfc8dc, 1.1));
    const keyLight = new THREE.DirectionalLight(0xffdfb6, 1.65); keyLight.position.set(-8, 12, 14); scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x7a9fd2, .35); fillLight.position.set(8, -3, -10); scene.add(fillLight);
    camera = new THREE.PerspectiveCamera(45, 1, .1, 150);
    content = new THREE.Group(); scene.add(content);
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .09; controls.autoRotate = false; controls.autoRotateSpeed = .35;
    controls.addEventListener('change', () => { dirty = true; });
    const resize = () => { if (!renderer) return; const viewport = node('space-viewport'); const width = viewport.clientWidth, height = viewport.clientHeight; renderer.setSize(width, height, false); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); dirty = true; };
    new ResizeObserver(resize).observe(node('space-viewport')); resize();
    node<HTMLCanvasElement>('space-canvas').addEventListener('webglcontextlost', event => { event.preventDefault(); node('space-webgl-message').hidden = false; node('space-webgl-message').textContent = 'The graphics context was lost. Reload this view to resume 3D; the record list and scientific tools remain available.'; renderer = null; });
    new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (visible) dirty = true; }, { rootMargin: '100px' }).observe(node('space-viewport'));
    resetCamera(); requestAnimationFrame(frame);
  } catch (error) {
    node('space-webgl-message').hidden = false; node('space-webgl-message').textContent = `WebGL is unavailable on this device. Browse every catalogue entry below and use the scientific labs. ${errorMessage(error)}`;
    node('space-canvas').hidden = true; announce('Accessible catalogue view · graphics unavailable'); renderer = null;
  }
}
function frame(time: number): void {
  requestAnimationFrame(frame);
  if (!renderer || !visible || document.hidden || time - lastFrame < 1000 / 30) return;
  const elapsed = Math.min(.1, (time - lastFrame) / 1000 || 1 / 30); lastFrame = time;
  const moved = controls.update();
  if (playing) {
    if (view === 'star') {
      animationPhase = (Number(node<HTMLInputElement>('space-phase').value) + elapsed / 15) % 1; node<HTMLInputElement>('space-phase').value = String(animationPhase); updateStarAppearance();
      if (stellarShell) stellarShell.rotation.y += elapsed * .06;
      if (stellarEdges) stellarEdges.rotation.y = stellarShell?.rotation.y ?? 0;
    } else controls.autoRotate = true;
    dirty = true;
  } else controls.autoRotate = false;
  if (selectionMarker) selectionMarker.children[1].quaternion.copy(camera.quaternion);
  if (dirty || moved) {
    renderer.render(scene, camera); dirty = false; renderedFrames++;
    if (time - fpsEpoch > 1800) {
      const fps = renderedFrames / ((time - fpsEpoch) / 1000); fpsEpoch = time; renderedFrames = 0;
      announce(`${view === 'sky' || view === 'period' ? `${fmt(pointIndices.length, 0)} GPU points · ` : ''}${playing || moved ? `${fmt(fps, 0)} fps · ` : ''}${fmt(renderer.info.render.calls, 0)} draw calls · ${renderer.getPixelRatio()}× pixel ratio`);
    }
  }
}

function renderRecordList(): void {
  if (!data) return;
  page = Math.max(0, Math.min(page, Math.max(0, Math.ceil(matched.length / pageSize) - 1)));
  const subset = matched.slice(page * pageSize, (page + 1) * pageSize);
  node('space-match-count').textContent = `${fmt(matched.length, 0)} matching entries`;
  node('space-record-list').innerHTML = subset.length ? subset.map(index => {
    const star = data!.stars[index];
    return `<button type="button" class="space-record ${index === selectedIndex ? 'selected' : ''}" data-space-index="${index}" aria-pressed="${index === selectedIndex}"><span>${html(star.name)}<small>${html(star.region || star.catalog)} · ${html(star.id)}</small></span><b>${star.period_days ? `${fmt(star.period_days, 1)} d` : '—'}</b></button>`;
  }).join('') : '<p>No catalogue entries match these controls.</p>';
  node('space-list-page').textContent = matched.length ? `${page + 1} / ${fmt(Math.ceil(matched.length / pageSize), 0)}` : '0 / 0';
  node<HTMLButtonElement>('space-prev-records').disabled = page === 0; node<HTMLButtonElement>('space-next-records').disabled = (page + 1) * pageSize >= matched.length;
}
function filterRecords(): void {
  if (!data) return;
  const query = node<HTMLInputElement>('space-search').value.toLowerCase().trim(), catalog = node<HTMLSelectElement>('space-catalogue').value, region = node<HTMLSelectElement>('space-region').value;
  const minText = node<HTMLInputElement>('space-min-period').value, maxText = node<HTMLInputElement>('space-max-period').value;
  const minimum = minText ? Number(minText) : 0, maximum = maxText ? Number(maxText) : Infinity;
  matched = data.stars.flatMap((star, index) => ((!query || `${star.name} ${star.id} ${star.aliases?.join(' ') ?? ''}`.toLowerCase().includes(query)) && (!catalog || star.catalog === catalog) && (!region || star.region === region) && ((!minText && !maxText) || (star.period_days !== null && star.period_days >= minimum && star.period_days <= maximum))) ? [index] : []);
  page = 0; renderRecordList();
  if (view === 'sky' || view === 'period') setView(view, false);
  else if (view === 'density') setView('density', false);
}
function renderInspector(): void {
  const compact = data?.stars[selectedIndex]; if (!compact) return;
  const star = selectedStar ?? compact;
  node('space-star-name').textContent = star.name; node('space-selected-badge').textContent = star.catalog;
  const actual = selectedStar;
  const fields = [['Identifier', star.id], ['Region / survey', star.region || '—'], ['Published period', star.period_days ? `${fmt(star.period_days, 4)} days` : 'Unknown'], ['RA / Dec J2000', actual ? `${fmt(actual.ra_deg, 5)}° / ${fmt(actual.dec_deg, 5)}°` : 'Loading…'], ['Mean I magnitude', fmt(star.mean_i_mag, 3)], ['I amplitude', star.amplitude_i_mag ? `${fmt(star.amplitude_i_mag, 3)} mag` : 'Unknown'], ['Distance / radius / mass', 'Unknown in bundled catalogue']];
  node('space-inspector').innerHTML = `<dl class="space-star-facts">${fields.map(([key, value]) => `<div><dt>${html(key)}</dt><dd>${html(value)}</dd></div>`).join('')}</dl><div class="space-selected-actions"><button type="button" id="space-enter-star" class="fit-button">Reconstruct this star →</button><button type="button" id="space-focus-star" class="export-button">Center its direction</button></div><div class="space-model-exports"><button id="space-export-model" type="button" class="export-button">Model + evidence JSON ↓</button><button id="space-export-obj" type="button" class="export-button">Native mesh OBJ ↓</button></div><p id="space-model-brightness" class="space-model-status">${phaseCurve().length ? 'Native empirical phase curve ready; scrub the star to inspect relative brightness.' : 'Normalized geometry ready. Measured phase brightness requires available photometry.'}</p>${actual?.source_url ? `<a class="text-link" href="${html(actual.source_url)}" target="_blank" rel="noopener noreferrer">Inspect published source ↗</a>` : ''}<div class="space-distance-evidence"><button type="button" id="space-acquire-evidence" class="export-button">Acquire Gaia DR3 evidence ↗</button><p id="space-gaia-status">Bring an unknown distance into a testable inference. A nearby Gaia source is a positional candidate until its identity and solution quality are verified.</p><div id="space-gaia-candidates"></div><div id="space-distance-result"></div></div><details class="space-selected-evidence"><summary>Model evidence &amp; geometry</summary><p>Reference radius: dimensionless 1. Conditional radiative family: measured flux with an assumed temperature scale. Interior layers: schematic. Physical radius, mass, interior, and unique radius / temperature evolution require independent measurements.</p>${starModel?.caveats?.length ? `<ul>${starModel.caveats.map(caveat => `<li>${html(caveat)}</li>`).join('')}</ul>` : ''}${starModel?.computation ? `<pre>${html(JSON.stringify(starModel.computation, null, 2))}</pre>` : ''}</details>`;
  node('space-enter-star').addEventListener('click', () => { setView('star'); if (!starModel) void fitStar(); });
  node('space-focus-star').addEventListener('click', () => {
    if (!renderer) return;
    if (!data?.positions[selectedIndex]) { announce('This record has no published coordinates; its model and evidence remain available.'); return; }
    if (!['sky', 'period'].includes(view)) setView('sky');
    const direction = positionFor(selectedIndex).normalize(); camera.position.copy(direction.clone().multiplyScalar(24)); controls.target.copy(direction.clone().multiplyScalar(7)); controls.update(); dirty = true;
  });
  node('space-acquire-evidence').addEventListener('click', () => { void acquireGaiaEvidence(); });
  node<HTMLButtonElement>('space-export-model').disabled = !starModel;
  node<HTMLButtonElement>('space-export-obj').disabled = !starModel?.mesh;
  node('space-export-model').addEventListener('click', () => {
    if (starModel) download(JSON.stringify({ ...starModel, visualization_phase: Number(node<HTMLInputElement>('space-phase').value), gaia_evidence: gaiaEvidence, distance_posterior: posterior }, null, 2), `${safeName(star.id)}-model.json`, 'application/json');
  });
  node('space-export-obj').addEventListener('click', exportStarObj);
  renderGaiaEvidence();
}
function safeName(value: string): string { return value.replace(/[^a-zA-Z0-9._-]/g, '_'); }
function download(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type })), anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.hidden = true; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function exportStarObj(): void {
  const mesh = starModel?.mesh, star = data?.stars[selectedIndex]; if (!mesh || !star) return;
  const phase = Number(node<HTMLInputElement>('space-phase').value), radius = familyValue(starModel?.radiative_family?.radii_relative, phase) ?? 1;
  const ratio = radius / nativeMeshReferenceRadius;
  const rows = [`# THOTH v2 conditional normalized stellar envelope`, `# Catalogue entry ${star.id}`, `# Phase ${phase}; R/R0 ${radius}; unknown absolute R0`, `# Radius/temperature fraction ${starModel?.radiative_family?.radius_fraction ?? 'unavailable'}; reference T0 ${starModel?.radiative_family?.reference_temperature_k ?? 'unavailable'} K assumed`, '# This is a conditional photometric reconstruction, not a resolved stellar image.', `o ${safeName(star.id)}`];
  for (let i = 0; i < mesh.positions.length; i += 3) rows.push(`v ${mesh.positions[i] * ratio} ${mesh.positions[i + 1] * ratio} ${mesh.positions[i + 2] * ratio}`);
  const normals = mesh.normals;
  if (normals?.length === mesh.positions.length) for (let i = 0; i < normals.length; i += 3) rows.push(`vn ${normals[i]} ${normals[i + 1]} ${normals[i + 2]}`);
  for (let i = 0; i < mesh.indices.length; i += 3) rows.push(`f ${mesh.indices.slice(i, i + 3).map(index => normals?.length === mesh.positions.length ? `${index + 1}//${index + 1}` : String(index + 1)).join(' ')}`);
  download(rows.join('\n') + '\n', `${safeName(star.id)}-phase-${phase.toFixed(3)}.obj`, 'text/plain');
}
async function selectStar(index: number): Promise<void> {
  if (!data?.stars[index]) return;
  selectedIndex = index; selectedStar = null; starModel = null; gaiaEvidence = null; posterior = null; gaiaCandidateIndex = 0; priorLength = 1350; modelRequest++; node<HTMLInputElement>('space-phase').value = '0';
  node('space-inference-chart').innerHTML = ''; node('space-inference-status').textContent = 'Select a star and infer from available photometry to build this family.';
  renderRecordList(); renderInspector(); updateSelectionMarker();
  if (view === 'star') setView('star', false);
  const id = data.stars[index].id;
  try {
    const record = await api<Star>(`/api/stars/${encodeURIComponent(id)}`);
    if (selectedIndex !== index) return;
    selectedStar = record; renderInspector();
    if (view === 'star') node('space-hud-count').textContent = record.name;
  } catch (error) { if (selectedIndex === index) node('space-model-brightness').textContent = `Detailed record unavailable: ${errorMessage(error)}`; }
}
async function fitStar(): Promise<void> {
  const star = data?.stars[selectedIndex]; if (!star) return;
  if (!node<HTMLInputElement>('space-reference-temperature').checkValidity()) { node('space-inference-status').textContent = 'Choose an assumed reference temperature from 1,500 to 10,000 K before calculating the next hypothesis.'; return; }
  if (fittingModel) { queuedModel = true; node('space-inference-status').textContent = 'Your latest hypothesis is queued behind the current native model calculation.'; return; }
  fittingModel = true;
  const request = ++modelRequest, button = node<HTMLButtonElement>('space-model-fit'); button.disabled = true; button.textContent = 'C++ fitting measured photometry…';
  node('space-inference-status').textContent = `Computing the conditional radiative family for η = ${fmt(Number(node<HTMLInputElement>('space-radius-fraction').value), 2)}…`;
  node('space-model-brightness').textContent = 'Loading actual photometry and computing an empirical phase curve…';
  try {
    const model = await post<StarModel>('/api/space/star', { star_id: star.id, phase: Number(node<HTMLInputElement>('space-phase').value), resolution: 48, displacement: 0, contrast: 0, radius_fraction: Number(node<HTMLInputElement>('space-radius-fraction').value), reference_temperature_k: Number(node<HTMLInputElement>('space-reference-temperature').value) });
    if (request !== modelRequest) return;
    starModel = model; renderInspector(); if (view === 'star') setView('star', false); updateStarAppearance(); renderInferenceChart();
    if (!phaseCurve().length) node('space-model-brightness').textContent = typeof model.photometry_message === 'string' ? model.photometry_message : 'No measured phase curve is available for this record. Normalized geometry remains explorable.';
    announce('Native star-model evidence received');
  } catch (error) {
    if (request === modelRequest) {
      node('space-model-brightness').textContent = `Measured brightness unavailable: ${errorMessage(error)}`;
      node('space-inference-status').textContent = `The requested hypothesis was not calculated: ${errorMessage(error)}`;
      if (starModel?.radiative_family && !queuedModel) {
        if (starModel.radiative_family.radius_fraction !== undefined) node<HTMLInputElement>('space-radius-fraction').value = String(starModel.radiative_family.radius_fraction);
        if (starModel.radiative_family.reference_temperature_k !== undefined) node<HTMLInputElement>('space-reference-temperature').value = String(starModel.radiative_family.reference_temperature_k);
        updateHypothesis(false);
      }
    }
  }
  finally { fittingModel = false; button.disabled = false; button.textContent = 'Infer from measured brightness'; if (queuedModel) { queuedModel = false; void fitStar(); } }
}
function renderInferenceChart(): void {
  const family = starModel?.radiative_family, curve = phaseCurve();
  if (!family || !curve.length) { node('space-inference-status').textContent = curve.length ? (typeof starModel?.radiative_message === 'string' ? starModel.radiative_message : 'The measured brightness fit is available; the passband does not identify a radiative model family under the current assumptions.') : 'Photometry is unavailable for this entry. A normalized 3D template remains available; a measured reconstruction needs observations.'; return; }
  const fluxes = curve.map(point => point.relative_flux ?? Math.pow(10, -.4 * (point.magnitude - curve[0].magnitude)));
  const values = [...fluxes, ...family.reconstructed_fluxes].filter(Number.isFinite), maximum = Math.max(1, ...values);
  const w = 620, h = 200, left = 56, right = 18, top = 20, bottom = 45;
  const x = (phase: number) => left + phase * (w - left - right), y = (flux: number) => h - bottom - flux / maximum * (h - top - bottom);
  let body = '';
  for (let i = 0; i <= 3; i++) {
    const flux = maximum * i / 3, phase = i / 3;
    body += `<line x1="${left}" x2="${w - right}" y1="${y(flux)}" y2="${y(flux)}" stroke="#273b55"/><text x="${left - 8}" y="${y(flux) + 5}" text-anchor="end">${html(fmt(flux, 1))}</text><text x="${x(phase)}" y="${h - bottom + 23}" text-anchor="middle">${fmt(phase, 2)}</text>`;
  }
  const path = (series: number[]) => series.map((value, index) => `${index ? 'L' : 'M'}${x(curve[index]?.phase ?? index / Math.max(1, series.length - 1))},${y(value)}`).join(' ');
  body += `<path d="${path(fluxes)}" fill="none" stroke="#69d6d3" stroke-width="4"/><path d="${path(family.reconstructed_fluxes)}" fill="none" stroke="#edbd8e" stroke-width="2" stroke-dasharray="6 5"/><text x="${(left + w - right) / 2}" y="${h - 4}" text-anchor="middle">Cycle phase</text><text transform="translate(15 ${(top + h - bottom) / 2}) rotate(-90)" text-anchor="middle">Relative flux</text>`;
  let predictionFigure = '';
  const predictions = family.counterfactual_predictions;
  if (predictions?.length) {
    const all = predictions.flatMap(prediction => prediction.delta_magnitudes.filter((value): value is number => value !== null && Number.isFinite(value)));
    const minimum = Math.min(...all), maximum = Math.max(...all), span = maximum - minimum || 1;
    const yp = (value: number) => top + (value - minimum) / span * (h - top - bottom);
    let figure = '';
    for (let i = 0; i <= 3; i++) { const value = minimum + span * i / 3; figure += `<line x1="${left}" x2="${w - right}" y1="${yp(value)}" y2="${yp(value)}" stroke="#273b55"/><text x="${left - 8}" y="${yp(value) + 5}" text-anchor="end">${fmt(value, 1)}</text><text x="${x(i / 3)}" y="${h - bottom + 23}" text-anchor="middle">${fmt(i / 3, 2)}</text>`; }
    predictions.forEach(prediction => {
      let move = true;
      const path = prediction.delta_magnitudes.map((value, index) => { if (value === null || !Number.isFinite(value)) { move = true; return ''; } const command = `${move ? 'M' : 'L'}${x(curve[index]?.phase ?? index / Math.max(1, prediction.delta_magnitudes.length - 1))},${yp(value)}`; move = false; return command; }).join(' ');
      figure += `<path d="${path}" fill="none" stroke="${prediction.label === 'I' ? '#69d6d3' : prediction.label === 'K' ? '#edbd8e' : '#b398e5'}" stroke-width="2.5" ${prediction.label === 'I' ? '' : 'stroke-dasharray="5 4"'}/>`;
    });
    figure += `<text x="${(left + w - right) / 2}" y="${h - 4}" text-anchor="middle">Cycle phase</text><text transform="translate(15 ${(top + h - bottom) / 2}) rotate(-90)" text-anchor="middle">Predicted Δ magnitude</text>`;
    predictionFigure = `<h4 class="space-prediction-title">Which new measurement could distinguish the shapes?</h4><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Unmeasured V I and K monochromatic predictions for the selected conditional radius and temperature family">${figure}</svg><p><span class="space-flux-key violet"></span>V proxy · 0.55 μm <span class="space-flux-key measured"></span>I proxy · 0.806 μm <span class="space-flux-key reconstructed"></span>K proxy · 2.2 μm</p><p>Compare the hypotheses above: their I-band brightness can coincide while predicted V and K behavior differs. These curves are unmeasured monochromatic predictions, with assumed reference temperature and no calibrated color zero point. Calibrated multiband observations could test the families.</p>`;
  }
  node('space-inference-chart').innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Measured Fourier phase flux and conditional reconstructed flux overlap for this hypothesis">${body}</svg><p><span class="space-flux-key measured"></span>Measured phase fit <span class="space-flux-key reconstructed"></span>Conditional reconstruction</p>${predictionFigure}`;
  const error = family.reconstructed_fluxes.reduce((max, flux, index) => Math.max(max, Math.abs(flux - fluxes[index]) / Math.max(1e-12, Math.abs(fluxes[index]))), 0);
  const fit = starModel?.fit, inputCount = starModel?.provenance?.photometry?.input_observations;
  node('space-inference-status').textContent = `Fourier phase fit: P = ${fmt(fit?.period_days, 4)} days · reduced χ² = ${fmt(fit?.reduced_chi2, 3)} · ${fmt(fit?.n_observations, 0)} used observations${inputCount ? ` / ${fmt(inputCount, 0)} supplied` : ''}. η = ${fmt(family.radius_fraction, 2)} · assumed T₀ = ${fmt(family.reference_temperature_k, 0)} K. Maximum relative radiative flux closure ${scientific(error)} compares the reconstruction with the fitted phase curve; it is not an observational residual. Changing η alters radius and temperature while preserving that same fitted flux. This degeneracy needs independent measurements.`;
}
async function loadAstrometry(): Promise<void> {
  try { astrometry = await api<AstrometryCatalogue>('/api/space/astrometry'); if (view === 'distance') setView('distance', false); }
  catch (error) { if (view === 'distance') node('space-worker-ledger').textContent = `Astrometric evidence unavailable: ${errorMessage(error)}`; }
}
async function acquireGaiaEvidence(): Promise<void> {
  const star = data?.stars[selectedIndex]; if (!star) return;
  const index = selectedIndex, button = node<HTMLButtonElement>('space-acquire-evidence'); button.disabled = true; button.textContent = 'Acquiring source evidence…';
  node('space-gaia-status').textContent = 'Retrieving positional candidates, astrometric uncertainties, and archive provenance…';
  try {
    const evidence = await api<GaiaEvidence>(`/api/space/evidence/${encodeURIComponent(star.id)}?radius_arcsec=3${gaiaEvidence ? '&refresh=true' : ''}`);
    if (selectedIndex !== index) return;
    gaiaEvidence = evidence; posterior = null; gaiaCandidateIndex = Math.max(0, evidence.candidates.findIndex(candidate => candidate.distance_usable)); renderGaiaEvidence(); void loadAstrometry();
  } catch (error) { if (selectedIndex === index) node('space-gaia-status').textContent = `Gaia evidence unavailable: ${errorMessage(error)}`; }
  finally { if (document.getElementById('space-acquire-evidence') === button) { button.disabled = false; button.textContent = 'Refresh Gaia DR3 evidence ↗'; } }
}
function renderGaiaEvidence(): void {
  if (!gaiaEvidence) return;
  const candidates = gaiaEvidence.candidates;
  node('space-gaia-status').textContent = `${fmt(candidates.length, 0)} Gaia positional candidates · ${gaiaEvidence.association_status.replaceAll('_', ' ')} · retrieved ${gaiaEvidence.retrieved_utc}.`;
  node('space-gaia-candidates').innerHTML = candidates.length ? `<label>Choose evidence to investigate<select id="space-gaia-source">${candidates.map((candidate, index) => `<option value="${index}" ${index === gaiaCandidateIndex ? 'selected' : ''} ${!candidate.distance_usable ? 'disabled' : ''}>${html(candidate.source_id)} · ${fmt(candidate.separation_arcsec, 2)}″ · ${fmt(candidate.parallax, 3)} ± ${fmt(candidate.parallax_error, 3)} mas</option>`).join('')}</select></label><p id="space-gaia-quality"></p><label>Distance prior length / parsecs<input id="space-prior-length" type="number" min="50" max="10000" step="50" value="${priorLength}"></label><button type="button" id="space-infer-distance" class="export-button" ${!candidates.some(candidate => candidate.distance_usable) ? 'disabled' : ''}>Compute distance posterior</button><details class="space-selected-evidence"><summary>Inspect archive evidence</summary><a href="${html(gaiaEvidence.source_url)}" target="_blank" rel="noopener noreferrer" class="text-link">Gaia source archive ↗</a><p>${html(gaiaEvidence.caveats.join(' '))}</p><pre>${html(gaiaEvidence.adql_query)}\nSHA-256 ${html(gaiaEvidence.response_sha256)}</pre></details>` : '<p>No positional candidates were returned. A distance remains unknown.</p>';
  if (candidates.length) {
    const update = () => { const candidate = candidates[Number(node<HTMLSelectElement>('space-gaia-source').value)]; node('space-gaia-quality').textContent = candidate ? `Gaia ${candidate.source_id} · RUWE ${fmt(candidate.ruwe, 3)} · ${candidate.quality_flags.join('; ') || 'No quoted quality flag'}. Identity association is unconfirmed.` : 'No candidate has usable astrometry.'; };
    node('space-gaia-source').addEventListener('change', () => { gaiaCandidateIndex = Number(node<HTMLSelectElement>('space-gaia-source').value); posterior = null; node('space-distance-result').innerHTML = ''; update(); }); update();
    node('space-infer-distance').addEventListener('click', () => { void inferDistance(); });
  }
  if (posterior) renderDistancePosterior();
}
async function inferDistance(): Promise<void> {
  const candidate = gaiaEvidence?.candidates[Number(node<HTMLSelectElement>('space-gaia-source').value)];
  if (!candidate?.distance_usable || candidate.parallax === null || candidate.parallax_error === null) return;
  const index = selectedIndex, sourceId = candidate.source_id, button = node<HTMLButtonElement>('space-infer-distance'); button.disabled = true; button.textContent = 'Native posterior integration…';
  priorLength = Number(node<HTMLInputElement>('space-prior-length').value);
  try {
    const result = await post<DistancePosterior>('/api/space/distance', { parallax_mas: candidate.parallax, parallax_error_mas: candidate.parallax_error, prior_length_pc: priorLength, samples: 1024, max_distance_pc: 20000 });
    if (selectedIndex !== index || gaiaEvidence?.candidates[Number(node<HTMLSelectElement>('space-gaia-source').value)]?.source_id !== sourceId) return;
    posterior = result; renderDistancePosterior();
  } catch (error) { if (selectedIndex === index) node('space-distance-result').textContent = `Distance inference failed: ${errorMessage(error)}`; }
  finally { button.disabled = false; button.textContent = 'Compute distance posterior'; }
}
function renderDistancePosterior(): void {
  if (!posterior) return;
  const result = posterior, w = 380, h = 230, left = 55, right = 15, top = 20, bottom = 55;
  const xmax = Math.max(result.p84_pc * 1.6, result.median_pc * 2, 1), ymax = Math.max(...result.density_per_pc), x = (value: number) => left + value / xmax * (w - left - right), y = (value: number) => h - bottom - value / ymax * (h - top - bottom);
  let svg = `<rect x="${x(result.p16_pc)}" y="${top}" width="${Math.min(w-right, x(result.p84_pc)) - x(result.p16_pc)}" height="${h-top-bottom}" fill="#7965a1" opacity=".23"/>`;
  for (let i = 0; i <= 3; i++) { const value = xmax * i / 3; svg += `<text x="${x(value)}" y="${h-bottom+25}" text-anchor="middle">${fmt(value, 0)}</text>`; }
  const points = result.distances_pc.flatMap((distance, index) => distance <= xmax ? [`${x(distance)},${y(result.density_per_pc[index])}`] : []);
  svg += `<polyline points="${points.join(' ')}" stroke="#b49adf" stroke-width="2.5" fill="none"/><line x1="${x(result.median_pc)}" x2="${x(result.median_pc)}" y1="${top}" y2="${h-bottom}" stroke="#e4b17b" stroke-dasharray="4 4"/><text x="${(left+w-right)/2}" y="${h-5}" text-anchor="middle">Conditional distance / pc</text><text transform="translate(17 ${(top+h-bottom)/2}) rotate(-90)" text-anchor="middle">Posterior density / pc⁻¹</text>`;
  node('space-distance-result').innerHTML = `<p><strong>${fmt(result.median_pc, 0)} pc</strong> median · 16–84% interval <strong>${fmt(result.p16_pc, 0)}–${fmt(result.p84_pc, 0)} pc</strong></p><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Conditional parallax distance posterior with median and 16–84 percent interval">${svg}</svg><p>Prior length ${fmt(result.prior_length_pc, 0)} pc. Bounded integration support: ${fmt(result.lower_bound_pc ?? .001, 3)}–${fmt(result.upper_bound_pc ?? 20000, 0)} pc. This inference belongs to the chosen Gaia candidate; its Mira identity remains unconfirmed. Compare prior lengths when the parallax is weak or negative; the generic disk prior is unsuitable for treating weak Magellanic Cloud parallaxes as reliable galaxy distances.</p>`;
}
async function loadCatalogue(): Promise<void> {
  try {
    data = await api<SpaceData>('/api/space');
    if (data.positions.length !== data.stars.length || data.galactic_positions.length !== data.stars.length) throw new Error('Catalogue geometry and record arrays must have matching lengths.');
    for (const key of ['catalog', 'region'] as const) {
      const select = node<HTMLSelectElement>(key === 'catalog' ? 'space-catalogue' : 'space-region');
      [...new Set(data.stars.map(star => star[key]).filter(Boolean))].sort().forEach(value => select.add(new Option(value, value)));
    }
    matched = data.stars.map((_, index) => index); renderRecordList();
    node('space-ledger').innerHTML = `<span><strong>${fmt(data.counts.catalog_entries, 0)}</strong> catalogue records</span><span><strong>${fmt(data.counts.mapped_entries, 0)}</strong> native sky directions</span><span><strong>${fmt(data.density_cells.length, 0)}</strong> angular density cells</span><span><strong>${fmt(data.groups.length, 0)}</strong> survey groups</span><span><strong>${fmt(data.counts.missing_coordinates, 0)}</strong> missing coordinates</span>`;
    node('space-provenance').innerHTML = `<p><strong>Native computation receipt</strong></p><pre>${html(JSON.stringify(data.computation, null, 2))}</pre><p><strong>Source provenance</strong></p><pre>${html(JSON.stringify(data.provenance, null, 2))}</pre>`;
    node('space-caveats').innerHTML = data.caveats.map(caveat => `<li>${html(caveat)}</li>`).join('');
    setView(view);
    const index = data.stars.findIndex(star => star.id === example); void selectStar(index >= 0 ? index : 0);
    if (!renderer) announce(`${fmt(data.stars.length, 0)} catalogue records available without WebGL`);
  } catch (error) { node('space-record-list').textContent = `Catalogue geometry unavailable: ${errorMessage(error)}`; node('space-hud-count').textContent = 'Geometry could not be loaded'; announce('Retry by reloading the observatory'); }
}

let pointerDown: { x: number; y: number } | null = null;
node('space-canvas').addEventListener('pointerdown', event => { const pointer = event as PointerEvent; pointerDown = { x: pointer.clientX, y: pointer.clientY }; });
node('space-canvas').addEventListener('pointerup', event => {
  const pointerEvent = event as PointerEvent;
  if (!renderer || !pointerDown || Math.hypot(pointerEvent.clientX - pointerDown.x, pointerEvent.clientY - pointerDown.y) > 7) return;
  pointerDown = null;
  const rect = renderer.domElement.getBoundingClientRect(); pointer.set((pointerEvent.clientX - rect.left) / rect.width * 2 - 1, -(pointerEvent.clientY - rect.top) / rect.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera); raycaster.params.Points.threshold = .13;
  if (pointCloud) {
    const hit = raycaster.intersectObject(pointCloud)[0]; if (hit?.index !== undefined) void selectStar(pointIndices[hit.index]);
  } else if (densityMesh && data) {
    const hit = raycaster.intersectObject(densityMesh)[0]; if (hit?.instanceId === undefined) return;
    const cell = activeDensityCells[hit.instanceId];
    if (!cell) return;
    node('space-hud-count').textContent = `Filtered cell: RA ${fmt(cell.ra_deg, 1)}° / Dec ${fmt(cell.dec_deg, 1)}° · ${fmt(cell.count, 0)} matching entries · ${fmt(cell.density_per_sr, 0)} sr⁻¹`;
  } else if (surface && transform) {
    const hit = raycaster.intersectObject(surface)[0], dataset = surfaceGrid(); if (!hit || !dataset) return;
    node<HTMLInputElement>('space-cell-frequency').value = String(Math.max(0, Math.min(dataset.frequencies.length - 1, Math.round((hit.point.x / 16 + .5) * (dataset.frequencies.length - 1)))));
    node<HTMLInputElement>('space-cell-row').value = String(Math.max(0, Math.min(dataset.powers.length - 1, Math.round((hit.point.z / 10 + .5) * (dataset.powers.length - 1))))); updateSurfaceCell();
  } else if (view === 'distance' && data) {
    const hit = raycaster.intersectObjects(content.children, false).find(intersection => typeof intersection.object.userData.star_id === 'string');
    if (hit) { const index = data.stars.findIndex(star => star.id === hit.object.userData.star_id); if (index >= 0) void selectStar(index); }
  }
});
node('space-canvas').addEventListener('keydown', event => {
  const key = (event as KeyboardEvent).key; if (!renderer || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', 'r'].includes(key)) return;
  event.preventDefault();
  if (key === 'r') { resetCamera(); return; }
  const offset = camera.position.clone().sub(controls.target), spherical = new THREE.Spherical().setFromVector3(offset);
  if (key === 'ArrowLeft') spherical.theta -= .1; if (key === 'ArrowRight') spherical.theta += .1; if (key === 'ArrowUp') spherical.phi -= .1; if (key === 'ArrowDown') spherical.phi += .1;
  if (key === '+') spherical.radius *= .9; if (key === '-') spherical.radius *= 1.1; spherical.makeSafe(); camera.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(controls.target)); controls.update(); dirty = true;
});
node('space-record-list').addEventListener('click', event => { const button = (event.target as Element).closest<HTMLButtonElement>('[data-space-index]'); if (button) void selectStar(Number(button.dataset.spaceIndex)); });
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-space-view]')) button.addEventListener('click', () => setView(button.dataset.spaceView as View));
for (const id of ['space-search', 'space-min-period', 'space-max-period']) node(id).addEventListener('input', filterRecords);
for (const id of ['space-catalogue', 'space-region']) node(id).addEventListener('change', filterRecords);
node('space-clear-filters').addEventListener('click', () => { ['space-search', 'space-catalogue', 'space-region', 'space-min-period', 'space-max-period'].forEach(id => node<HTMLInputElement | HTMLSelectElement>(id).value = ''); filterRecords(); });
node('space-prev-records').addEventListener('click', () => { page--; renderRecordList(); }); node('space-next-records').addEventListener('click', () => { page++; renderRecordList(); });
node('space-frame').addEventListener('change', () => setView(view, false));
node('space-grid').addEventListener('change', () => { if (grid) grid.visible = node<HTMLInputElement>('space-grid').checked; dirty = true; });
node('space-groups').addEventListener('change', () => { if (groupLabels) groupLabels.visible = node<HTMLInputElement>('space-groups').checked; dirty = true; });
node('space-point-size').addEventListener('input', () => { if (pointMaterial && renderer) pointMaterial.uniforms.size.value = Number(node<HTMLInputElement>('space-point-size').value) * renderer.getPixelRatio(); dirty = true; });
node('space-export-sky').addEventListener('click', () => { if (data) download(JSON.stringify(data), 'THOTH-catalogue-directions-and-provenance.json', 'application/json'); });
node('space-reset').addEventListener('click', resetCamera);
node('space-play').addEventListener('click', () => { playing = !playing; node('space-play').setAttribute('aria-pressed', String(playing)); node('space-play').textContent = playing ? 'Ⅱ Pause' : view === 'star' ? '▶ Cycle' : '▶ Orbit'; dirty = true; });
node('space-fullscreen').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await node('space-viewport').requestFullscreen(); }
  catch { node('space-viewport').classList.toggle('space-expanded'); node('space-fullscreen').textContent = node('space-viewport').classList.contains('space-expanded') ? '⛶ Collapse' : '⛶ Expand'; }
});
for (const id of ['space-phase', 'space-cutaway', 'space-wireframe']) node(id).addEventListener('input', updateStarAppearance);
node('space-model-fit').addEventListener('click', () => { void fitStar(); });
let inferenceTimer: ReturnType<typeof setTimeout> | undefined;
function updateHypothesis(recompute: boolean): void {
  const fraction = Number(node<HTMLInputElement>('space-radius-fraction').value);
  node('space-radius-fraction-label').textContent = fmt(fraction, 2);
  document.querySelectorAll<HTMLButtonElement>('[data-radius-fraction]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.radiusFraction) === fraction)));
  clearTimeout(inferenceTimer);
  if (!node<HTMLInputElement>('space-reference-temperature').checkValidity()) { node('space-inference-status').textContent = 'Choose an assumed reference temperature from 1,500 to 10,000 K before calculating the next hypothesis.'; return; }
  if (recompute && starModel?.radiative_family) inferenceTimer = setTimeout(() => { void fitStar(); }, 350);
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-radius-fraction]')) button.addEventListener('click', () => { node<HTMLInputElement>('space-radius-fraction').value = button.dataset.radiusFraction ?? '.5'; updateHypothesis(true); });
node('space-radius-fraction').addEventListener('input', () => updateHypothesis(true));
node('space-reference-temperature').addEventListener('input', () => updateHypothesis(true));
node('space-refresh-distances').addEventListener('click', () => { void loadAstrometry(); });
node('space-surface-kind').addEventListener('change', () => setView('surface'));
node('space-height').addEventListener('input', () => setView('surface', false));
for (const id of ['space-cell-frequency', 'space-cell-row']) node(id).addEventListener('input', updateSurfaceCell);
node('space-run-transform').addEventListener('click', () => { const form = document.getElementById('transform-form') as HTMLFormElement | null; form?.requestSubmit(); announce('Current Transform Foundry experiment submitted; the surface appears when computed.'); });
node('space-run-cluster').addEventListener('click', () => { const form = document.getElementById('cluster-form') as HTMLFormElement | null; form?.requestSubmit(); announce('Real cluster experiment submitted; waiting for process receipts.'); });
window.addEventListener('thoth:transform-result', event => { transform = (event as CustomEvent<TransformResult>).detail; if (view === 'surface' || view === 'workers') setView(view, false); });
window.addEventListener('thoth:cluster-result', event => { cluster = (event as CustomEvent<ClusterEvidence>).detail; if (view === 'workers') setView(view, false); });
window.addEventListener('thoth:simulation-result', event => { simulation = (event as CustomEvent<SimulationResult>).detail; if (view === 'star') announce(`Dimensionless oscillator available: ${fmt(simulation.times_days.length, 0)} computed samples; brightness uses measured photometry independently.`); });
window.addEventListener('thoth:star-selected', event => { const id = (event as CustomEvent<{ id: string }>).detail.id; const index = data?.stars.findIndex(star => star.id === id); if (index !== undefined && index >= 0 && index !== selectedIndex) void selectStar(index); });

setupRenderer();
if (reducedMotion) node('space-gesture').textContent = 'Motion is paused · drag to orbit · pinch to zoom';
void loadCatalogue();
