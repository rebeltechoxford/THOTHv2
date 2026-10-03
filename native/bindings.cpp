// THOTHv2: weighted, floating-mean Fourier fits on a uniform frequency grid.
// No external linear-algebra dependency is required for the <= 7 fit parameters.
#include <pybind11/numpy.h>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include <algorithm>
#include <array>
#include <cmath>
#include <cstddef>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

#ifdef _OPENMP
#include <omp.h>
#endif

namespace py = pybind11;

namespace {
constexpr double two_pi = 6.283185307179586476925286766559;
constexpr int max_parameters = 7;
constexpr std::size_t max_observations = 1000000;
constexpr int max_samples = 250000;
constexpr long double max_work = 250000000.0L;
using Coefficients = std::array<long double, max_parameters>;
using Matrix = std::array<Coefficients, max_parameters>;
using InputArray = py::array_t<double, py::array::c_style | py::array::forcecast>;

struct Trial {
    Coefficients coefficients{};
    long double improvement = 0;
    bool valid = false;
};

struct Result {
    double period_days;
    double epoch;
    double chi2;
    double reduced_chi2;
    double mean;
    double amplitude;
    int threads_used;
    std::size_t valid_frequencies;
    std::vector<double> frequencies;
    std::vector<double> powers;
    std::vector<double> coefficients;
    std::vector<double> model_times;
    std::vector<double> model_magnitudes;
};

std::vector<double> copy_input(const InputArray &array, const char *name) {
    if (array.ndim() != 1) {
        throw std::invalid_argument(std::string(name) + " must be a one-dimensional array.");
    }
    const auto size = static_cast<std::size_t>(array.size());
    if (size > max_observations) {
        throw std::invalid_argument("At most 1,000,000 observations are supported.");
    }
    if (size == 0) {
        return {};
    }
    const double *begin = array.data();
    return std::vector<double>(begin, begin + size);
}

// Partial pivoting with a conservative rank threshold. Near-singular trials
// cannot identify all harmonics independently and are excluded from the scan.
bool solve(Matrix matrix, Coefficients rhs, int parameters, Coefficients &solution) {
    long double scale = 0;
    for (int i = 0; i < parameters; ++i) {
        scale = std::max(scale, std::abs(matrix[i][i]));
    }
    if (!(scale > 0)) {
        return false;
    }
    const long double threshold = scale * 1e-12L;
    for (int column = 0; column < parameters; ++column) {
        int pivot = column;
        for (int row = column + 1; row < parameters; ++row) {
            if (std::abs(matrix[row][column]) > std::abs(matrix[pivot][column])) {
                pivot = row;
            }
        }
        if (std::abs(matrix[pivot][column]) <= threshold) {
            return false;
        }
        if (pivot != column) {
            std::swap(matrix[pivot], matrix[column]);
            std::swap(rhs[pivot], rhs[column]);
        }
        for (int row = column + 1; row < parameters; ++row) {
            const long double ratio = matrix[row][column] / matrix[column][column];
            matrix[row][column] = 0;
            for (int j = column + 1; j < parameters; ++j) {
                matrix[row][j] -= ratio * matrix[column][j];
            }
            rhs[row] -= ratio * rhs[column];
        }
    }
    for (int row = parameters - 1; row >= 0; --row) {
        long double remainder = rhs[row];
        for (int column = row + 1; column < parameters; ++column) {
            remainder -= matrix[row][column] * solution[column];
        }
        solution[row] = remainder / matrix[row][row];
        if (!std::isfinite(solution[row])) {
            return false;
        }
    }
    return true;
}

Coefficients basis(double cycles, int harmonics) {
    Coefficients values{};
    values[0] = 1;
    // Reducing cycles before multiplying avoids unnecessarily large angles.
    const double angle = two_pi * std::remainder(cycles, 1.0);
    const double sine = std::sin(angle);
    const double cosine = std::cos(angle);
    double harmonic_sine = sine;
    double harmonic_cosine = cosine;
    for (int harmonic = 1; harmonic <= harmonics; ++harmonic) {
        values[2 * harmonic - 1] = harmonic_sine;
        values[2 * harmonic] = harmonic_cosine;
        const double next_sine = harmonic_sine * cosine + harmonic_cosine * sine;
        harmonic_cosine = harmonic_cosine * cosine - harmonic_sine * sine;
        harmonic_sine = next_sine;
    }
    return values;
}

long double predict(double cycles, const Coefficients &coefficients, int harmonics) {
    const auto values = basis(cycles, harmonics);
    long double result = 0;
    for (int j = 0; j < 2 * harmonics + 1; ++j) {
        result += coefficients[j] * values[j];
    }
    return result;
}

Trial fit(double frequency, const std::vector<double> &centered_times,
          const std::vector<long double> &centered_magnitudes,
          const std::vector<long double> &weights, int harmonics,
          long double constant_chi2) {
    const int parameters = 2 * harmonics + 1;
    Matrix matrix{};
    Coefficients rhs{};
    for (std::size_t i = 0; i < centered_times.size(); ++i) {
        const auto values = basis(frequency * centered_times[i], harmonics);
        for (int row = 0; row < parameters; ++row) {
            const long double weighted_value = weights[i] * values[row];
            rhs[row] += weighted_value * centered_magnitudes[i];
            for (int column = 0; column <= row; ++column) {
                matrix[row][column] += weighted_value * values[column];
            }
        }
    }
    for (int row = 0; row < parameters; ++row) {
        for (int column = row + 1; column < parameters; ++column) {
            matrix[row][column] = matrix[column][row];
        }
    }
    Trial trial;
    trial.valid = solve(matrix, rhs, parameters, trial.coefficients);
    if (trial.valid) {
        for (int j = 0; j < parameters; ++j) {
            trial.improvement += rhs[j] * trial.coefficients[j];
        }
        trial.valid = std::isfinite(trial.improvement);
        trial.improvement = std::max(0.0L, std::min(constant_chi2, trial.improvement));
    }
    return trial;
}

double finite_double(long double value, const char *name) {
    const double result = static_cast<double>(value);
    if (!std::isfinite(result)) {
        throw std::invalid_argument(std::string(name) + " exceeds the supported numeric range.");
    }
    return result;
}

Result scan(const std::vector<double> &times, const std::vector<double> &magnitudes,
            const std::vector<double> &errors, double min_period, double max_period,
            int samples, int harmonics, int threads) {
    if (harmonics < 1 || harmonics > 3) {
        throw std::invalid_argument("harmonics must be between 1 and 3.");
    }
    if (times.size() != magnitudes.size() || times.size() != errors.size()) {
        throw std::invalid_argument("times, magnitudes, and errors must have equal lengths.");
    }
    const int parameters = 2 * harmonics + 1;
    if (times.size() < static_cast<std::size_t>(parameters + 2)) {
        throw std::invalid_argument("At least 2 * harmonics + 3 observations are required.");
    }
    if (!std::isfinite(min_period) || !std::isfinite(max_period) ||
        min_period <= 0 || max_period <= min_period) {
        throw std::invalid_argument("Periods must be finite, positive, and max_period > min_period.");
    }
    if (samples < 16 || samples > max_samples) {
        throw std::invalid_argument("samples must be between 16 and 250,000.");
    }
    if (static_cast<long double>(times.size()) * samples * harmonics > max_work) {
        throw std::invalid_argument("Requested scan exceeds the 250 million observation-frequency-harmonic work limit. Reduce samples or observations.");
    }
    if (threads < 0 || threads > 256) {
        throw std::invalid_argument("threads must be between 0 (automatic) and 256.");
    }
    double minimum_time = std::numeric_limits<double>::infinity();
    double maximum_time = -std::numeric_limits<double>::infinity();
    double minimum_error = std::numeric_limits<double>::infinity();
    double minimum_magnitude = std::numeric_limits<double>::infinity();
    double maximum_magnitude = -std::numeric_limits<double>::infinity();
    for (std::size_t i = 0; i < times.size(); ++i) {
        if (!std::isfinite(times[i]) || !std::isfinite(magnitudes[i]) ||
            !std::isfinite(errors[i])) {
            throw std::invalid_argument("All times, magnitudes, and errors must be finite.");
        }
        if (errors[i] <= 0) {
            throw std::invalid_argument("All measurement errors must be positive.");
        }
        minimum_time = std::min(minimum_time, times[i]);
        maximum_time = std::max(maximum_time, times[i]);
        minimum_error = std::min(minimum_error, errors[i]);
        minimum_magnitude = std::min(minimum_magnitude, magnitudes[i]);
        maximum_magnitude = std::max(maximum_magnitude, magnitudes[i]);
    }
    const double span = maximum_time - minimum_time;
    const double minimum_frequency = 1.0 / max_period;
    const double maximum_frequency = 1.0 / min_period;
    if (!std::isfinite(span) || span <= 0) {
        throw std::invalid_argument("Observation times must have a finite, positive baseline.");
    }
    if (minimum_magnitude == maximum_magnitude) {
        throw std::invalid_argument("Magnitudes must have nonzero weighted variance.");
    }
    if (!std::isfinite(maximum_frequency) || minimum_frequency <= 0 ||
        minimum_frequency >= maximum_frequency ||
        !std::isfinite(span * maximum_frequency) || span * maximum_frequency > 1e9) {
        throw std::invalid_argument("Period and time scales exceed the supported numeric range.");
    }
    const double epoch = minimum_time + span / 2.0;
    std::vector<double> centered_times(times.size());
    std::vector<long double> centered_magnitudes(times.size());
    std::vector<long double> weights(times.size());
    long double weight_sum = 0;
    long double weighted_sum = 0;
    // A common scale preserves the fit and normalized powers while preventing
    // enormous 1/sigma^2 values in the normal equations.
    for (std::size_t i = 0; i < times.size(); ++i) {
        centered_times[i] = times[i] - epoch;
        const long double relative_error = static_cast<long double>(minimum_error) / errors[i];
        weights[i] = relative_error * relative_error;
        weight_sum += weights[i];
        weighted_sum += weights[i] *
            (static_cast<long double>(magnitudes[i]) - magnitudes[0]);
    }
    const long double mean = static_cast<long double>(magnitudes[0]) + weighted_sum / weight_sum;
    long double constant_chi2 = 0;
    for (std::size_t i = 0; i < times.size(); ++i) {
        centered_magnitudes[i] = static_cast<long double>(magnitudes[i]) - mean;
        constant_chi2 += weights[i] * centered_magnitudes[i] * centered_magnitudes[i];
    }
    if (!std::isfinite(mean) || !std::isfinite(constant_chi2) || constant_chi2 <= 0) {
        throw std::invalid_argument("Magnitudes must have nonzero weighted variance within the supported numeric range.");
    }

    int thread_count = 1;
#ifdef _OPENMP
    thread_count = threads == 0 ? omp_get_max_threads() : threads;
    thread_count = std::max(1, std::min(thread_count, samples));
#endif
    Result result{};
    result.epoch = epoch;
    result.mean = finite_double(mean, "Weighted mean");
    result.threads_used = thread_count;
    result.frequencies.resize(samples);
    result.powers.resize(samples);
    std::vector<Trial> trials(samples);
    const double frequency_step = (maximum_frequency - minimum_frequency) / (samples - 1);
#ifdef _OPENMP
#pragma omp parallel for num_threads(thread_count) schedule(static)
#endif
    for (int index = 0; index < samples; ++index) {
        const double frequency = minimum_frequency + index * frequency_step;
        result.frequencies[index] = frequency;
        trials[index] = fit(frequency, centered_times, centered_magnitudes, weights,
                            harmonics, constant_chi2);
        // NaN marks a rejected rank-deficient trial; it is not a zero-power fit.
        result.powers[index] = trials[index].valid
            ? static_cast<double>(trials[index].improvement / constant_chi2)
            : std::numeric_limits<double>::quiet_NaN();
    }
    int best_index = -1;
    long double best_improvement = -1;
    result.valid_frequencies = 0;
    for (int index = 0; index < samples; ++index) {
        if (trials[index].valid) {
            ++result.valid_frequencies;
            if (trials[index].improvement > best_improvement) {
                best_improvement = trials[index].improvement;
                best_index = index;
            }
        }
    }
    if (best_index < 0) {
        throw std::invalid_argument("No trial frequency has a full-rank Fourier fit. Check distinct observation times, time baseline, period range, and errors.");
    }
    const double frequency = result.frequencies[best_index];
    result.period_days = 1.0 / frequency;
    Coefficients coefficients = trials[best_index].coefficients;
    // Calculate chi-square from residuals, avoiding subtraction of two similar
    // numbers for nearly perfect fits. Output chi-square uses the original errors.
    long double chi2 = 0;
    for (std::size_t i = 0; i < times.size(); ++i) {
        const long double residual = centered_magnitudes[i] -
            predict(frequency * centered_times[i], coefficients, harmonics);
        const long double standardized = residual / errors[i];
        chi2 += standardized * standardized;
    }
    result.chi2 = finite_double(chi2, "Chi-square");
    result.reduced_chi2 = finite_double(chi2 / (times.size() - parameters), "Reduced chi-square");
    coefficients[0] += mean;
    for (int j = 0; j < parameters; ++j) {
        result.coefficients.push_back(finite_double(coefficients[j], "Fitted coefficient"));
    }
    long double model_minimum = std::numeric_limits<long double>::infinity();
    long double model_maximum = -std::numeric_limits<long double>::infinity();
    for (int i = 0; i < 4096; ++i) {
        const long double value = predict(i / 4096.0, coefficients, harmonics);
        model_minimum = std::min(model_minimum, value);
        model_maximum = std::max(model_maximum, value);
    }
    result.amplitude = finite_double(model_maximum - model_minimum, "Fitted amplitude");
    const int model_samples = static_cast<int>(std::min(10000.0,
        std::max(500.0, std::ceil(span * frequency * harmonics * 100.0))));
    result.model_times.reserve(model_samples);
    result.model_magnitudes.reserve(model_samples);
    for (int i = 0; i < model_samples; ++i) {
        const double time = minimum_time + span * (static_cast<double>(i) / (model_samples - 1));
        result.model_times.push_back(time);
        result.model_magnitudes.push_back(finite_double(
            predict(frequency * (time - epoch), coefficients, harmonics), "Model magnitude"));
    }
    return result;
}

py::dict periodogram(const InputArray &time_array, const InputArray &magnitude_array,
                     const InputArray &error_array, double min_period, double max_period,
                     int samples, int harmonics, int threads) {
    const auto times = copy_input(time_array, "times");
    const auto magnitudes = copy_input(magnitude_array, "magnitudes");
    const auto errors = copy_input(error_array, "errors");
    Result result;
    {
        py::gil_scoped_release release;
        result = scan(times, magnitudes, errors, min_period, max_period, samples, harmonics, threads);
    }
    py::dict output;
    output["period_days"] = result.period_days;
    output["frequencies"] = result.frequencies;
    output["powers"] = result.powers;
    output["coefficients"] = result.coefficients;
    output["reference_epoch_jd"] = result.epoch;
    output["chi2"] = result.chi2;
    output["reduced_chi2"] = result.reduced_chi2;
    output["mean_magnitude"] = result.mean;
    output["amplitude_mag"] = result.amplitude;
    output["model_times"] = result.model_times;
    output["model_magnitudes"] = result.model_magnitudes;
    output["harmonics"] = harmonics;
    output["observations"] = times.size();
    output["n_observations"] = times.size();
    output["dof"] = times.size() - (2 * harmonics + 1);
    output["threads_used"] = result.threads_used;
    output["valid_frequencies"] = result.valid_frequencies;
#ifdef _OPENMP
    output["openmp_enabled"] = true;
#else
    output["openmp_enabled"] = false;
#endif
    return output;
}

std::vector<double> evaluate(const InputArray &time_array, double period,
                             const std::vector<double> &input_coefficients, double epoch) {
    const auto times = copy_input(time_array, "times");
    if (!std::isfinite(period) || period <= 0 || !std::isfinite(epoch)) {
        throw std::invalid_argument("period_days must be finite and positive; reference_epoch_jd must be finite.");
    }
    if (input_coefficients.size() < 3 || input_coefficients.size() > 7 ||
        input_coefficients.size() % 2 != 1) {
        throw std::invalid_argument("coefficients must contain an intercept and 1 to 3 sine/cosine pairs.");
    }
    Coefficients coefficients{};
    for (std::size_t i = 0; i < input_coefficients.size(); ++i) {
        if (!std::isfinite(input_coefficients[i])) {
            throw std::invalid_argument("All coefficients must be finite.");
        }
        coefficients[i] = input_coefficients[i];
    }
    const int harmonics = static_cast<int>((input_coefficients.size() - 1) / 2);
    std::vector<double> output(times.size());
    {
        py::gil_scoped_release release;
        for (std::size_t i = 0; i < times.size(); ++i) {
            const double cycles = (times[i] - epoch) / period;
            if (!std::isfinite(times[i]) || !std::isfinite(cycles) || std::abs(cycles) > 1e9) {
                throw std::invalid_argument("Evaluation times must be finite and within the supported numeric range.");
            }
            output[i] = finite_double(predict(cycles, coefficients, harmonics), "Model magnitude");
        }
    }
    return output;
}
} // namespace

PYBIND11_MODULE(_native, module) {
    module.doc() = "C++ weighted floating-mean Fourier period search for THOTHv2.";
    module.def("backend_info", []() {
        py::dict info;
        info["engine"] = "C++17 weighted Fourier least squares";
#ifdef _OPENMP
        info["openmp"] = true;
        info["max_threads"] = omp_get_max_threads();
#else
        info["openmp"] = false;
        info["max_threads"] = 1;
#endif
        return info;
    }, "Report compile-time OpenMP availability and the runtime thread ceiling.");
    module.def("periodogram", &periodogram,
        py::arg("times"), py::arg("magnitudes"), py::arg("errors"),
        py::arg("min_period") = 100.0, py::arg("max_period") = 1000.0,
        py::arg("samples") = 1500, py::arg("harmonics") = 2, py::arg("threads") = 0,
        R"doc(Fit weighted Fourier models over a uniform frequency grid.

The model is intercept + sum(sin_k*sin(2*pi*k*f*(t-epoch)) +
cos_k*cos(2*pi*k*f*(t-epoch))). Time and period units are days. Errors
are one-sigma magnitude errors. Power is (chi2_constant-chi2_fit)/chi2_constant;
it is neither a false-alarm probability nor a confidence interval. Rank-deficient
trial powers are NaN. Reduced chi-square uses N-(2*harmonics+1) degrees of freedom
at the selected fixed trial frequency; it does not account for the frequency search.
Amplitude is the peak-to-peak magnitude range of the fitted 4096-point cycle.
)doc");
    module.def("evaluate", &evaluate, py::arg("times"), py::arg("period_days"),
        py::arg("coefficients"), py::arg("reference_epoch_jd"),
        "Evaluate the fitted intercept/sine/cosine series at arbitrary times.");
}
