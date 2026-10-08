export interface Star {
  id: string; name: string; catalog: string; region: string;
  classification?: string; aliases?: string[];
  ra_deg: number | null; dec_deg: number | null; period_days: number | null;
  mean_i_mag?: number | null; mean_v_mag?: number | null; amplitude_i_mag?: number | null;
  magnitude_max?: number | null; magnitude_min?: number | null; magnitude_min_catalog?: number | null;
  magnitude_band?: string; epoch_max_jd?: number | null; spectral_type?: string;
  source_url?: string; lightcurve_url?: string; catalog_flags?: Record<string, string | boolean>;
}
export interface Observation { time_jd: number; magnitude: number; error_mag: number; band?: string }
export interface Lightcurve { observations: Observation[]; band?: string; time_system?: string; source_url?: string }
export interface NativeBackend { engine?: string; openmp?: boolean; max_threads?: number }
export interface Status { native_available: boolean; native_backend: NativeBackend | null; example_star_id: string }
export interface Summary { total_stars?: number; with_period?: number; median_period_days?: number; catalogs?: (string | { name: string; count: number })[]; coverage_note?: string }
export interface CatalogResponse { items: Star[]; total: number; page: number; summary: Summary; manifest: { retrieved_utc?: string } }
export interface Fit {
  period_days: number; reference_epoch_jd: number; amplitude_mag: number; reduced_chi2: number;
  n_observations: number; frequencies: number[]; powers: (number | null)[];
  coefficients: number[]; phase_model?: { phase: number; magnitude: number }[];
  model_magnitudes?: number[]; model_phases?: number[]; model_times?: number[];
  observations?: Observation[]; band?: string; time_system?: string;
  backend?: NativeBackend | string; threads_used?: number; warnings?: string[];
}
export interface ClusterEvent { stage: string; completed?: number; total?: number; task_index?: number; elapsed_seconds?: number }
export interface WorkerResult { worker_pid: number; hostname: string; mpi_rank?: number; tasks_completed: number; compute_seconds: number }
export interface ClusterResult {
  serial_seconds?: number; parallel_seconds?: number; speedup?: number; efficiency?: number;
  node_results?: WorkerResult[]; period_distribution?: { periods_days?: number[] }; periods?: number[];
  worker_pids?: number[]; hostnames?: string[]; workers?: number; settings?: { workers?: number }; same_task_results?: boolean;
}
export interface ClusterJob { state: 'queued' | 'running' | 'complete' | 'failed'; progress?: ClusterEvent; events?: ClusterEvent[]; result?: ClusterResult; error?: string }
export interface Point { x: number; y: number; error?: number | null; label?: string }
export interface SkyPoint { x: number; y: number; star: Star }
export interface DiscoveryModel {
  harmonics: number; period_days: number; holdout_rmse_mag: number; holdout_weighted_rmse_mag: number;
  training_chi2: number; aic: number; bic: number;
}
export interface Candidate { period_days: number; power: number; holdout_rmse_mag: number | null; coefficients: number[]; reference_epoch_jd: number; harmonics: number }
export interface ResearchResidual { time_jd: number; observed_magnitude: number; predicted_magnitude: number; residual_mag: number; error_mag: number; partition: 'training' | 'holdout' }
export interface StabilityWindow { label: string; start_jd: number; end_jd: number; n_observations: number; period_days: number | null; status: 'computed' | 'unidentifiable'; detail?: string }
export interface PlannedObservation { days_after_last_observation: number; time_jd: number; prediction_spread_mag: number; predictions: { period_days: number; magnitude: number }[] }
export interface ResearchResult {
  selected_model: DiscoveryModel; models: DiscoveryModel[]; residuals: ResearchResidual[];
  periodogram: { frequencies: number[]; powers: (number | null)[] };
  spectral_window: { frequencies: number[]; powers: number[] };
  candidates: Candidate[]; stability: StabilityWindow[]; observation_plan: PlannedObservation[];
  provenance: Record<string, unknown>; computation: Record<string, unknown>; caveats: string[];
  planning_anchor_jd: number; planning_horizon_days: number;
  training_observations: number; holdout_observations: number; split_time_jd: number;
}
export interface ResearchEvent { stage: string; percent: number; detail: string; elapsed_seconds?: number }
export interface ResearchJob { state: 'queued' | 'running' | 'complete' | 'failed'; progress?: ResearchEvent; events?: ResearchEvent[]; result?: ResearchResult | null; error?: string | null }
export interface Dataset { dataset_id: string; name: string; observations_count: number; band: string; time_system: 'JD' | 'HJD' | 'BJD'; created_at?: string; sha256?: string }
export interface SimulationParameters { period_days: number; damping: number; drive: number; nonlinearity: number; cycles: number; steps_per_cycle: number }
export interface SimulationResult {
  parameters: SimulationParameters; times_days: number[]; displacement: number[]; velocity: number[]; energy: number[];
  drive_work: number[]; dissipated_energy: number[]; native_seconds: number;
  convergence: { max_displacement_difference: number; rms_displacement_difference: number; energy_balance_error: number; refinement_ratio: number };
  equation: string; model_kind: string; caveats: string[]; computation: Record<string, unknown>;
}
export interface TransformGrid {
  frequencies: number[]; powers: (number | null)[][]; native_seconds: number;
  observation_cell_evaluations: number; threads_used: number;
}
export interface ChirpTransform extends TransformGrid {
  frequency_derivatives: number[]; best_frequency: number; best_frequency_derivative: number;
  best_period_days: number; reference_epoch_jd: number;
}
export interface LocalizedTransform extends TransformGrid {
  time_centers_jd: number[]; effective_observations: (number | null)[][];
}
export interface TransformTrial {
  trial_index: number; pid: number; hostname: string; elapsed_seconds: number;
}
export interface NullTrial extends TransformTrial { max_power: number }
export interface InjectionTrial extends TransformTrial {
  injected_period_days: number; recovered_period_days: number; amplitude_mag: number;
  amplitude_fraction: number; recovered: boolean;
}
export interface TransformEnsemble {
  execution: string; base_seed: number; surrogates: number; injections: number; task_count: number;
  observed_max_power: number; exceedances: number; empirical_p_value: number | null;
  p_value_floor: number | null; null_max_powers: number[]; null_trials: NullTrial[];
  injection_trials: InjectionTrial[]; recovery_fraction: number | null; elapsed_seconds: number;
  workers: WorkerResult[]; sampling_assumption: string; caveats: string[];
  injection_groups: { amplitude_fraction: number; amplitude_mag: number; injected_period_days: number;
    trials: number; recovered: number; alias_count: number; recovery_fraction: number | null }[];
}
export interface TransformResult {
  chirp: ChirpTransform; localized: LocalizedTransform;
  phase_dispersion: { frequencies: number[]; theta: (number | null)[]; best_period_days: number; native_seconds: number };
  structure_function: { lag_centers_days: number[]; mean_squared_difference: (number | null)[];
    noise_corrected_difference: (number | null)[]; pair_counts: number[]; native_seconds: number };
  ensemble: TransformEnsemble;
  provenance: { input_sha256: string; input_observations: number; used_observations: number; band: string;
    time_system: string; source_url: string; star_id: string; name: string; observation_span_days: number; subsampling: string };
  computation: { pipeline_seconds: number; native_seconds: number; base_native_seconds: number; observation_cell_evaluations: number;
    ensemble_observation_frequency_harmonic_evaluations: number; total_observation_evaluations: number; workers_requested: number };
  caveats: string[];
}
export interface TransformJob {
  state: 'queued' | 'running' | 'complete' | 'failed'; progress?: ResearchEvent;
  events?: ResearchEvent[]; result?: TransformResult | null; error?: string | null;
}
