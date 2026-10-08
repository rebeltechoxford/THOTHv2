// Irregular-cadence research transforms. Values are diagnostics, not probabilities.
#pragma once
#include <chrono>
#include <cstdint>

namespace thoth_transforms {
constexpr long double work_limit = 500000000.0L;
constexpr double nan = std::numeric_limits<double>::quiet_NaN();
using Clock = std::chrono::steady_clock;

struct Photometry {
    std::vector<double> times, magnitudes, errors, dt;
    std::vector<long double> values, weights;
    double first = 0, last = 0, epoch = 0, span = 0;
    long double constant = 0;
};

inline void check_threads(int threads) {
    if (threads < 0 || threads > 256)
        throw std::invalid_argument("threads must be between 0 (automatic) and 256.");
}

inline int thread_count(int requested, int cells) {
    check_threads(requested);
    int count = 1;
#ifdef _OPENMP
    count = requested == 0 ? omp_get_max_threads() : requested;
#endif
    return std::max(1, std::min(count, cells));
}

inline Photometry prepare(const InputArray &time_array, const InputArray &magnitude_array,
                          const InputArray &error_array, int minimum, bool variance = true) {
    Photometry data;
    data.times = copy_input(time_array, "times");
    data.magnitudes = copy_input(magnitude_array, "magnitudes");
    data.errors = copy_input(error_array, "errors");
    const auto n = data.times.size();
    if (n != data.magnitudes.size() || n != data.errors.size() || n < static_cast<std::size_t>(minimum))
        throw std::invalid_argument("Equal arrays with enough observations for the requested transform are required.");
    data.first = std::numeric_limits<double>::infinity();
    data.last = -data.first;
    double minimum_error = data.first;
    long double value_scale = 0;
    for (std::size_t i = 0; i < n; ++i) {
        if (!std::isfinite(data.times[i]) || !std::isfinite(data.magnitudes[i]) ||
            !std::isfinite(data.errors[i]) || data.errors[i] <= 0)
            throw std::invalid_argument("Observations must be finite with positive errors.");
        data.first = std::min(data.first, data.times[i]);
        data.last = std::max(data.last, data.times[i]);
        minimum_error = std::min(minimum_error, data.errors[i]);
        const long double difference = static_cast<long double>(data.magnitudes[i]) - data.magnitudes[0];
        if (!std::isfinite(difference))
            throw std::invalid_argument("Magnitude differences exceed the supported numeric range.");
        value_scale = std::max(value_scale, std::abs(difference));
    }
    data.span = data.last - data.first;
    if (!std::isfinite(data.span) || data.span <= 0)
        throw std::invalid_argument("Observation times must have a finite, positive baseline.");
    data.epoch = data.first + data.span / 2;
    data.dt.resize(n); data.values.resize(n); data.weights.resize(n);
    if (value_scale == 0) value_scale = 1;
    long double sum_weights = 0, sum_values = 0;
    for (std::size_t i = 0; i < n; ++i) {
        data.dt[i] = data.times[i] - data.epoch;
        const long double relative = static_cast<long double>(minimum_error) / data.errors[i];
        data.weights[i] = relative * relative;
        data.values[i] = (static_cast<long double>(data.magnitudes[i]) - data.magnitudes[0]) / value_scale;
        sum_weights += data.weights[i];
        sum_values += data.weights[i] * data.values[i];
    }
    const long double mean = sum_values / sum_weights;
    for (std::size_t i = 0; i < n; ++i) {
        data.values[i] -= mean;
        data.constant += data.weights[i] * data.values[i] * data.values[i];
    }
    if (variance && (!(data.constant > 0) || !std::isfinite(data.constant)))
        throw std::invalid_argument("Magnitudes must have nonzero weighted variance within the supported numeric range.");
    return data;
}

inline std::vector<double> grid(const Photometry &data, double min_period,
                               double max_period, int samples) {
    if (!std::isfinite(min_period) || !std::isfinite(max_period) || min_period <= 0 || max_period <= min_period)
        throw std::invalid_argument("Periods must be finite, positive, and max_period > min_period.");
    if (samples < 16 || samples > 8192)
        throw std::invalid_argument("Frequency samples must be between 16 and 8192.");
    const double lo = 1 / max_period, hi = 1 / min_period;
    if (!(lo > 0) || !(hi > lo) || !std::isfinite(hi) || !std::isfinite(data.span * hi) || data.span * hi > 1e9)
        throw std::invalid_argument("Period and time scales exceed the supported numeric range.");
    std::vector<double> frequencies(samples);
    for (int i = 0; i < samples; ++i) frequencies[i] = lo + (hi - lo) * i / (samples - 1);
    return frequencies;
}

inline void check_work(std::size_t observations, std::size_t cells, int harmonics = 1) {
    if (cells > 2000000 || static_cast<long double>(observations) * cells * harmonics > work_limit)
        throw std::invalid_argument("Requested transform exceeds the 500 million observation-cell-harmonic work limit. Reduce observations or grid resolution.");
}

inline Trial chirp_fit(const Photometry &data, double frequency, double derivative, int harmonics) {
    const int parameters = 2 * harmonics + 1;
    Matrix matrix{}; Coefficients rhs{};
    for (std::size_t i = 0; i < data.dt.size(); ++i) {
        const double time = data.dt[i];
        const auto values = basis(frequency * time + 0.5 * derivative * time * time, harmonics);
        for (int row = 0; row < parameters; ++row) {
            const long double weighted = data.weights[i] * values[row];
            rhs[row] += weighted * data.values[i];
            for (int column = 0; column <= row; ++column) matrix[row][column] += weighted * values[column];
        }
    }
    for (int row = 0; row < parameters; ++row)
        for (int column = row + 1; column < parameters; ++column) matrix[row][column] = matrix[column][row];
    Trial trial;
    trial.valid = solve(matrix, rhs, parameters, trial.coefficients);
    if (trial.valid) {
        for (int j = 0; j < parameters; ++j) trial.improvement += rhs[j] * trial.coefficients[j];
        trial.valid = std::isfinite(trial.improvement);
        trial.improvement = std::max(0.0L, std::min(data.constant, trial.improvement));
    }
    return trial;
}

inline py::dict chirp_periodogram(const InputArray &time_array, const InputArray &magnitude_array,
                                 const InputArray &error_array, double min_period, double max_period,
                                 int frequency_samples, int drift_samples, double max_derivative,
                                 int harmonics, int threads) {
    if (harmonics < 1 || harmonics > 3)
        throw std::invalid_argument("harmonics must be between 1 and 3.");
    if (drift_samples < 1 || drift_samples > 257 || !std::isfinite(max_derivative) || max_derivative < 0)
        throw std::invalid_argument("drift_samples must be 1 to 257 and max_frequency_derivative finite and nonnegative.");
    const auto data = prepare(time_array, magnitude_array, error_array, 2 * harmonics + 3);
    const auto frequencies = grid(data, min_period, max_period, frequency_samples);
    if (!std::isfinite(max_derivative * data.span * data.span) || max_derivative * data.span * data.span > 1e9)
        throw std::invalid_argument("Frequency derivative and baseline exceed the supported phase range.");
    const int cells = frequency_samples * drift_samples;
    check_work(data.times.size(), cells, harmonics);
    const int count = thread_count(threads, cells);
    std::vector<double> derivatives(drift_samples);
    for (int row = 0; row < drift_samples; ++row)
        derivatives[row] = drift_samples == 1 ? 0 : max_derivative * (2.0 * row / (drift_samples - 1) - 1);
    std::vector<std::vector<double>> powers(drift_samples, std::vector<double>(frequency_samples, nan));
    std::vector<unsigned char> evaluated(cells, 0);
    int actual_threads = 1;
    const auto start = Clock::now();
    {
        py::gil_scoped_release release;
#ifdef _OPENMP
#pragma omp parallel for num_threads(count) schedule(static)
#endif
        for (int cell = 0; cell < cells; ++cell) {
#ifdef _OPENMP
            if (cell == 0) actual_threads = omp_get_num_threads();
#endif
            const int row = cell / frequency_samples, column = cell % frequency_samples;
            const double derivative = derivatives[row], frequency = frequencies[column];
            if (frequency + derivative * (data.first - data.epoch) <= 0 ||
                frequency + derivative * (data.last - data.epoch) <= 0) continue;
            evaluated[cell] = 1;
            const auto trial = chirp_fit(data, frequency, derivative, harmonics);
            if (trial.valid) powers[row][column] = static_cast<double>(trial.improvement / data.constant);
        }
    }
    int best_row = -1, best_column = -1;
    double best_power = -1;
    std::uint64_t evaluated_cells = 0;
    for (int row = 0; row < drift_samples; ++row)
        for (int column = 0; column < frequency_samples; ++column) {
            evaluated_cells += evaluated[row * frequency_samples + column];
            if (powers[row][column] > best_power) {
                best_power = powers[row][column]; best_row = row; best_column = column;
            }
        }
    if (best_row < 0) throw std::invalid_argument("No chirp cell has an identifiable full-rank harmonic fit.");
    py::dict output;
    output["frequencies"] = frequencies; output["frequency_derivatives"] = derivatives;
    output["powers"] = powers; output["best_frequency"] = frequencies[best_column];
    output["best_frequency_derivative"] = derivatives[best_row];
    output["best_period_days"] = 1 / frequencies[best_column];
    output["reference_epoch_jd"] = data.epoch; output["harmonics"] = harmonics;
    output["native_seconds"] = std::chrono::duration<double>(Clock::now() - start).count();
    output["observation_cell_evaluations"] = evaluated_cells * data.times.size();
    output["evaluated_cells"] = evaluated_cells; output["requested_cells"] = cells;
    output["threads_used"] = actual_threads;
    return output;
}

inline py::dict localized_periodogram(const InputArray &time_array, const InputArray &magnitude_array,
                                     const InputArray &error_array, double min_period, double max_period,
                                     int frequency_samples, int time_samples, double window_cycles, int threads) {
    if (time_samples < 2 || time_samples > 512 || !std::isfinite(window_cycles) || window_cycles < 0.25 || window_cycles > 20)
        throw std::invalid_argument("time_samples must be 2 to 512 and window_cycles between 0.25 and 20.");
    const auto data = prepare(time_array, magnitude_array, error_array, 5);
    const auto frequencies = grid(data, min_period, max_period, frequency_samples);
    const int cells = time_samples * frequency_samples;
    check_work(data.times.size(), cells);
    const int count = thread_count(threads, cells);
    std::vector<double> centers(time_samples);
    for (int i = 0; i < time_samples; ++i) centers[i] = data.first + data.span * i / (time_samples - 1);
    std::vector<std::vector<double>> powers(time_samples, std::vector<double>(frequency_samples, nan));
    std::vector<std::vector<double>> effective(time_samples, std::vector<double>(frequency_samples, 0));
    int actual_threads = 1;
    const auto start = Clock::now();
    {
        py::gil_scoped_release release;
#ifdef _OPENMP
#pragma omp parallel for num_threads(count) schedule(static)
#endif
        for (int cell = 0; cell < cells; ++cell) {
#ifdef _OPENMP
            if (cell == 0) actual_threads = omp_get_num_threads();
#endif
            const int row = cell / frequency_samples, column = cell % frequency_samples;
            const double frequency = frequencies[column], center = centers[row];
            std::vector<long double> weights(data.times.size());
            long double sum = 0, square_sum = 0, mean = 0;
            for (std::size_t i = 0; i < data.times.size(); ++i) {
                const double u = (data.times[i] - center) * frequency / window_cycles;
                weights[i] = data.weights[i] * std::exp(-0.5 * u * u);
                sum += weights[i]; square_sum += weights[i] * weights[i]; mean += weights[i] * data.values[i];
            }
            if (!(sum > 0) || !(square_sum > 0)) continue;
            effective[row][column] = static_cast<double>(sum * sum / square_sum);
            if (effective[row][column] < 5) continue;
            mean /= sum;
            Matrix matrix{}; Coefficients rhs{}, coefficients{};
            long double constant = 0;
            for (std::size_t i = 0; i < data.times.size(); ++i) {
                const auto values = basis(frequency * (data.times[i] - center), 1);
                const long double magnitude = data.values[i] - mean;
                constant += weights[i] * magnitude * magnitude;
                for (int j = 0; j < 3; ++j) {
                    rhs[j] += weights[i] * values[j] * magnitude;
                    for (int k = 0; k <= j; ++k) matrix[j][k] += weights[i] * values[j] * values[k];
                }
            }
            for (int j = 0; j < 3; ++j)
                for (int k = j + 1; k < 3; ++k) matrix[j][k] = matrix[k][j];
            if (!(constant > 0) || !solve(matrix, rhs, 3, coefficients)) continue;
            long double improvement = 0;
            for (int j = 0; j < 3; ++j) improvement += rhs[j] * coefficients[j];
            if (std::isfinite(improvement)) powers[row][column] = static_cast<double>(std::max(0.0L, std::min(1.0L, improvement / constant)));
        }
    }
    py::dict output;
    output["frequencies"] = frequencies; output["time_centers_jd"] = centers;
    output["powers"] = powers; output["effective_observations"] = effective;
    output["native_seconds"] = std::chrono::duration<double>(Clock::now() - start).count();
    output["observation_cell_evaluations"] = static_cast<std::uint64_t>(cells) * data.times.size();
    output["threads_used"] = actual_threads; output["window_cycles"] = window_cycles;
    output["method"] = "Gaussian localized weighted floating-mean sinusoid; normalized variance reduction";
    return output;
}

inline py::dict phase_dispersion(const InputArray &time_array, const InputArray &magnitude_array,
                                const InputArray &error_array, double min_period, double max_period,
                                int samples, int bins, int threads) {
    if (bins < 3 || bins > 128) throw std::invalid_argument("bins must be between 3 and 128.");
    const auto data = prepare(time_array, magnitude_array, error_array, 6);
    const auto frequencies = grid(data, min_period, max_period, samples);
    check_work(data.times.size(), samples);
    const int count = thread_count(threads, samples);
    std::vector<double> theta(samples, nan);
    std::vector<int> populated_bins(samples, 0), supported_observations(samples, 0);
    int actual_threads = 1;
    const auto start = Clock::now();
    {
        py::gil_scoped_release release;
#ifdef _OPENMP
#pragma omp parallel for num_threads(count) schedule(static)
#endif
        for (int cell = 0; cell < samples; ++cell) {
#ifdef _OPENMP
            if (cell == 0) actual_threads = omp_get_num_threads();
#endif
            std::vector<long double> weight(bins, 0), sum(bins, 0), square(bins, 0);
            std::vector<int> members(bins, 0);
            for (std::size_t i = 0; i < data.times.size(); ++i) {
                const double cycles = frequencies[cell] * data.dt[i];
                const double phase = cycles - std::floor(cycles);
                const int bin = std::min(bins - 1, static_cast<int>(phase * bins));
                weight[bin] += data.weights[i]; sum[bin] += data.weights[i] * data.values[i];
                square[bin] += data.weights[i] * data.values[i] * data.values[i]; ++members[bin];
            }
            long double within = 0;
            bool all_populated_supported = true;
            for (int bin = 0; bin < bins; ++bin) {
                if (members[bin] > 0) {
                    ++populated_bins[cell];
                    if (members[bin] < 2 || !(weight[bin] > 0)) all_populated_supported = false;
                    else supported_observations[cell] += members[bin];
                    if (weight[bin] > 0) within += std::max(0.0L, square[bin] - sum[bin] * sum[bin] / weight[bin]);
                }
            }
            // Singleton bins would fit their datum exactly and bias theta down.
            if (all_populated_supported && populated_bins[cell] >= 3)
                theta[cell] = static_cast<double>(std::max(0.0L, std::min(1.0L, within / data.constant)));
        }
    }
    int best = -1; double minimum = std::numeric_limits<double>::infinity();
    for (int cell = 0; cell < samples; ++cell) if (theta[cell] < minimum) { minimum = theta[cell]; best = cell; }
    py::dict output;
    output["frequencies"] = frequencies; output["theta"] = theta;
    output["best_period_days"] = best >= 0 ? 1 / frequencies[best] : nan;
    output["populated_bins"] = populated_bins; output["supported_observations"] = supported_observations;
    output["native_seconds"] = std::chrono::duration<double>(Clock::now() - start).count();
    output["observation_frequency_evaluations"] = static_cast<std::uint64_t>(samples) * data.times.size();
    output["threads_used"] = actual_threads; output["bins"] = bins;
    return output;
}

inline py::dict structure_function(const InputArray &time_array, const InputArray &magnitude_array,
                                  const InputArray &error_array, int lag_bins, double max_lag, int threads) {
    if (lag_bins < 3 || lag_bins > 256 || !std::isfinite(max_lag) || max_lag < 0)
        throw std::invalid_argument("lag_bins must be 3 to 256 and max_lag_days finite and nonnegative (0 means full baseline).");
    const auto data = prepare(time_array, magnitude_array, error_array, 2, false);
    const auto n = data.times.size();
    const std::uint64_t pairs = static_cast<std::uint64_t>(n) * (n - 1) / 2;
    if (pairs > 25000000) throw std::invalid_argument("Structure function exceeds the 25 million unordered-pair limit.");
    if (max_lag == 0) max_lag = data.span;
    const double square_root_limit = std::sqrt(std::numeric_limits<double>::max() / 4);
    const auto range = std::minmax_element(data.magnitudes.begin(), data.magnitudes.end());
    if (static_cast<long double>(*range.second) - *range.first > square_root_limit ||
        *std::max_element(data.errors.begin(), data.errors.end()) > square_root_limit)
        throw std::invalid_argument("Squared magnitude or error differences exceed the supported numeric range.");
    // Fixed partitions and ordered reduction keep results identical across thread counts.
    const int blocks = static_cast<int>(std::min<std::size_t>(64, n));
    const int count = thread_count(threads, blocks);
    std::vector<std::vector<long double>> sum(blocks, std::vector<long double>(lag_bins, 0));
    std::vector<std::vector<long double>> noise(blocks, std::vector<long double>(lag_bins, 0));
    std::vector<std::vector<std::uint64_t>> counts(blocks, std::vector<std::uint64_t>(lag_bins, 0));
    int actual_threads = 1;
    const auto start = Clock::now();
    {
        py::gil_scoped_release release;
#ifdef _OPENMP
#pragma omp parallel for num_threads(count) schedule(static)
#endif
        for (int block = 0; block < blocks; ++block) {
#ifdef _OPENMP
            if (block == 0) actual_threads = omp_get_num_threads();
#endif
            const std::size_t begin = n * block / blocks, end = n * (block + 1) / blocks;
            for (std::size_t i = begin; i < end; ++i) for (std::size_t j = i + 1; j < n; ++j) {
                const double lag = std::abs(data.times[j] - data.times[i]);
                if (lag <= 0 || lag > max_lag) continue;
                const int bin = std::min(lag_bins - 1, static_cast<int>(lag / max_lag * lag_bins));
                const long double difference = static_cast<long double>(data.magnitudes[j]) - data.magnitudes[i];
                // Divide before accumulating so a representable mean cannot overflow its sum.
                sum[block][bin] += difference * difference / pairs;
                noise[block][bin] += (static_cast<long double>(data.errors[i]) * data.errors[i] +
                                     static_cast<long double>(data.errors[j]) * data.errors[j]) / pairs;
                ++counts[block][bin];
            }
        }
    }
    std::vector<double> centers(lag_bins), differences(lag_bins, nan), corrected(lag_bins, nan);
    std::vector<std::uint64_t> pair_counts(lag_bins, 0);
    for (int bin = 0; bin < lag_bins; ++bin) {
        centers[bin] = max_lag * ((bin + 0.5) / lag_bins);
        long double total = 0, measurement_noise = 0;
        for (int block = 0; block < blocks; ++block) {
            total += sum[block][bin]; measurement_noise += noise[block][bin];
            pair_counts[bin] += counts[block][bin];
        }
        if (pair_counts[bin]) {
            differences[bin] = finite_double(total / pair_counts[bin] * pairs, "Structure difference");
            corrected[bin] = finite_double((total - measurement_noise) / pair_counts[bin] * pairs, "Noise-corrected structure difference");
        }
    }
    py::dict output;
    output["lag_centers_days"] = centers; output["mean_squared_difference"] = differences;
    output["noise_corrected_difference"] = corrected; output["pair_counts"] = pair_counts;
    output["pair_evaluations"] = pairs; output["max_lag_days"] = max_lag;
    output["native_seconds"] = std::chrono::duration<double>(Clock::now() - start).count();
    output["threads_used"] = actual_threads;
    return output;
}

inline void register_functions(py::module_ &module) {
    module.def("chirp_periodogram", &chirp_periodogram, py::arg("times"), py::arg("magnitudes"), py::arg("errors"),
        py::arg("min_period"), py::arg("max_period"), py::arg("frequency_samples") = 128,
        py::arg("drift_samples") = 41, py::arg("max_frequency_derivative") = 1e-7,
        py::arg("harmonics") = 2, py::arg("threads") = 1,
        "Weighted harmonic LS over frequency and frequency derivative; phase cycles = f*dt+0.5*fdot*dt^2. Power is normalized chi-square improvement, not significance.");
    module.def("localized_periodogram", &localized_periodogram, py::arg("times"), py::arg("magnitudes"), py::arg("errors"),
        py::arg("min_period"), py::arg("max_period"), py::arg("frequency_samples") = 100,
        py::arg("time_samples") = 32, py::arg("window_cycles") = 3.0, py::arg("threads") = 1,
        "Gaussian-window weighted floating-mean sinusoidal fits on irregular times; normalized local variance reduction. This is not the WWZ statistic.");
    module.def("phase_dispersion", &phase_dispersion, py::arg("times"), py::arg("magnitudes"), py::arg("errors"),
        py::arg("min_period"), py::arg("max_period"), py::arg("samples") = 128,
        py::arg("bins") = 12, py::arg("threads") = 1,
        "Weighted phase-bin within/global residual ratio without degrees-of-freedom correction; singleton bins or fewer than three populated bins produce NaN.");
    module.def("structure_function", &structure_function, py::arg("times"), py::arg("magnitudes"), py::arg("errors"),
        py::arg("lag_bins") = 40, py::arg("max_lag_days") = 0, py::arg("threads") = 1,
        "Unweighted unordered-pair mean squared magnitude difference in linear positive-lag bins, and subtraction of sigma_i^2+sigma_j^2. Negative corrected values are preserved.");
}
} // namespace thoth_transforms
