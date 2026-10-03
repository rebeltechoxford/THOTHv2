// Research kernels are compiled into the same pybind11 extension as the period search.
// The Duffing oscillator is a dimensionless teaching model, not stellar hydrodynamics.
#pragma once
#include <chrono>

namespace thoth_research {

inline py::dict fixed_frequency(const InputArray &time_array,
                               const InputArray &magnitude_array,
                               const InputArray &error_array,
                               double frequency, int harmonics) {
    const auto times = copy_input(time_array, "times");
    const auto magnitudes = copy_input(magnitude_array, "magnitudes");
    const auto errors = copy_input(error_array, "errors");
    if (harmonics < 1 || harmonics > 3 || !std::isfinite(frequency) || frequency <= 0) {
        throw std::invalid_argument("frequency must be finite and positive; harmonics must be 1 to 3.");
    }
    const int parameters = 2 * harmonics + 1;
    if (times.size() != magnitudes.size() || times.size() != errors.size() ||
        times.size() <= static_cast<std::size_t>(parameters)) {
        throw std::invalid_argument("Equal arrays with more observations than Fourier parameters are required.");
    }
    double first = std::numeric_limits<double>::infinity();
    double last = -std::numeric_limits<double>::infinity();
    double minimum_error = std::numeric_limits<double>::infinity();
    for (std::size_t i = 0; i < times.size(); ++i) {
        if (!std::isfinite(times[i]) || !std::isfinite(magnitudes[i]) ||
            !std::isfinite(errors[i]) || errors[i] <= 0) {
            throw std::invalid_argument("Observations must be finite with positive errors.");
        }
        first = std::min(first, times[i]);
        last = std::max(last, times[i]);
        minimum_error = std::min(minimum_error, errors[i]);
    }
    if (!(last > first) || !std::isfinite(last - first) ||
        !std::isfinite((last - first) * frequency) || (last - first) * frequency > 1e9) {
        throw std::invalid_argument("Observation baseline and frequency exceed the supported numeric range.");
    }
    const double epoch = first + (last - first) / 2;
    std::vector<double> centered_times(times.size());
    std::vector<long double> centered_magnitudes(times.size()), weights(times.size());
    Coefficients coefficients{};
    long double chi2 = 0, mean = 0, weight_sum = 0;
    {
        py::gil_scoped_release release;
        for (std::size_t i = 0; i < times.size(); ++i) {
            const long double relative = static_cast<long double>(minimum_error) / errors[i];
            weights[i] = relative * relative;
            weight_sum += weights[i];
            mean += weights[i] * (static_cast<long double>(magnitudes[i]) - magnitudes[0]);
            centered_times[i] = times[i] - epoch;
        }
        mean = static_cast<long double>(magnitudes[0]) + mean / weight_sum;
        long double constant_chi2 = 0;
        for (std::size_t i = 0; i < times.size(); ++i) {
            centered_magnitudes[i] = static_cast<long double>(magnitudes[i]) - mean;
            constant_chi2 += weights[i] * centered_magnitudes[i] * centered_magnitudes[i];
        }
        const auto trial = fit(frequency, centered_times, centered_magnitudes, weights, harmonics, constant_chi2);
        if (!trial.valid) {
            throw std::invalid_argument("Fixed-frequency Fourier fit is rank deficient.");
        }
        coefficients = trial.coefficients;
        for (std::size_t i = 0; i < times.size(); ++i) {
            const long double residual = (centered_magnitudes[i] -
                predict(frequency * centered_times[i], coefficients, harmonics)) / errors[i];
            chi2 += residual * residual;
        }
        coefficients[0] += mean;
    }
    std::vector<double> values;
    for (int i = 0; i < parameters; ++i) {
        values.push_back(finite_double(coefficients[i], "Coefficient"));
    }
    py::dict output;
    output["period_days"] = 1 / frequency;
    output["coefficients"] = values;
    output["reference_epoch_jd"] = epoch;
    output["chi2"] = finite_double(chi2, "Chi-square");
    output["harmonics"] = harmonics;
    return output;
}

inline py::dict spectral_window(const InputArray &time_array,
                               const InputArray &frequency_array, int threads) {
    const auto times = copy_input(time_array, "times");
    const auto frequencies = copy_input(frequency_array, "frequencies");
    if (times.empty() || frequencies.empty() || threads < 0 || threads > 256) {
        throw std::invalid_argument("Nonempty times/frequencies and threads between 0 and 256 are required.");
    }
    if (static_cast<long double>(times.size()) * frequencies.size() > 20000000.0L) {
        throw std::invalid_argument("Spectral window exceeds the 20 million time-frequency work limit.");
    }
    for (double time : times) {
        if (!std::isfinite(time)) throw std::invalid_argument("Times must be finite.");
    }
    const double earliest = *std::min_element(times.begin(), times.end());
    const double latest = *std::max_element(times.begin(), times.end());
    for (double frequency : frequencies) {
        if (!std::isfinite(frequency) || frequency < 0) {
            throw std::invalid_argument("Frequencies must be finite and nonnegative.");
        }
        for (double time : {earliest, latest}) {
            if (!std::isfinite((time - times.front()) * frequency) ||
                std::abs((time - times.front()) * frequency) > 1e9) {
                throw std::invalid_argument("Time-frequency scales exceed the supported numeric range.");
            }
        }
    }
    int thread_count = 1;
#ifdef _OPENMP
    thread_count = threads == 0 ? omp_get_max_threads() : threads;
    thread_count = std::max(1, std::min(thread_count, static_cast<int>(frequencies.size())));
#endif
    std::vector<double> powers(frequencies.size());
    {
        py::gil_scoped_release release;
#ifdef _OPENMP
#pragma omp parallel for num_threads(thread_count) schedule(static)
#endif
        for (int j = 0; j < static_cast<int>(frequencies.size()); ++j) {
            long double cosine = 0, sine = 0;
            for (double time : times) {
                const double angle = two_pi * std::remainder((time - times.front()) * frequencies[j], 1.0);
                cosine += std::cos(angle);
                sine += std::sin(angle);
            }
            powers[j] = static_cast<double>((cosine * cosine + sine * sine) /
                (static_cast<long double>(times.size()) * times.size()));
            powers[j] = std::max(0.0, std::min(1.0, powers[j]));
        }
    }
    py::dict output;
    output["frequencies"] = frequencies;
    output["powers"] = powers;
    output["threads_used"] = thread_count;
    return output;
}

using State = std::array<double, 4>; // displacement, d(displacement)/d(tau), drive work, dissipated energy

inline State derivative(double tau, const State &state, double damping, double drive, double beta) {
    const double forcing = drive * std::cos(tau);
    return {state[1], forcing - 2 * damping * state[1] - state[0] - beta * state[0] * state[0] * state[0],
            forcing * state[1], 2 * damping * state[1] * state[1]};
}

inline State advance(double tau, const State &state, double dt, double damping, double drive, double beta) {
    const auto k1 = derivative(tau, state, damping, drive, beta);
    State temporary{};
    for (int i = 0; i < 4; ++i) temporary[i] = state[i] + dt * k1[i] / 2;
    const auto k2 = derivative(tau + dt / 2, temporary, damping, drive, beta);
    for (int i = 0; i < 4; ++i) temporary[i] = state[i] + dt * k2[i] / 2;
    const auto k3 = derivative(tau + dt / 2, temporary, damping, drive, beta);
    for (int i = 0; i < 4; ++i) temporary[i] = state[i] + dt * k3[i];
    const auto k4 = derivative(tau + dt, temporary, damping, drive, beta);
    State output{};
    for (int i = 0; i < 4; ++i) {
        output[i] = state[i] + dt * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6;
        if (!std::isfinite(output[i])) throw std::invalid_argument("Oscillator left the finite numeric range.");
    }
    return output;
}

inline double oscillator_energy(const State &state, double beta) {
    return 0.5 * state[1] * state[1] + 0.5 * state[0] * state[0] +
        0.25 * beta * std::pow(state[0], 4);
}

inline py::dict oscillator(double period, double damping, double drive, double beta,
                          int cycles, int steps_per_cycle) {
    if (!std::isfinite(period) || period <= 0 || period > 100000 ||
        !std::isfinite(damping) || damping < 0 || damping > 2 ||
        !std::isfinite(drive) || drive < 0 || drive > 2 ||
        !std::isfinite(beta) || beta < 0 || beta > 4 ||
        cycles < 1 || cycles > 40 || steps_per_cycle < 64 || steps_per_cycle > 2000) {
        throw std::invalid_argument("Use period (0,100000], damping/drive [0,2], nonlinearity [0,4], cycles [1,40], and steps_per_cycle [64,2000].");
    }
    const int steps = cycles * steps_per_cycle;
    const double dt = two_pi / steps_per_cycle;
    std::vector<double> times, displacement, velocity, energy, drive_work, dissipated;
    times.reserve(steps + 1); displacement.reserve(steps + 1); velocity.reserve(steps + 1);
    energy.reserve(steps + 1); drive_work.reserve(steps + 1); dissipated.reserve(steps + 1);
    double max_difference = 0, sum_square_difference = 0, balance_error = 0;
    const auto start = std::chrono::steady_clock::now();
    {
        py::gil_scoped_release release;
        State coarse{0.1, 0, 0, 0}, fine = coarse;
        const double initial_energy = oscillator_energy(coarse, beta);
        for (int i = 0; i <= steps; ++i) {
            const double current_energy = oscillator_energy(fine, beta);
            times.push_back(static_cast<double>(i) * period / steps_per_cycle);
            displacement.push_back(fine[0]); velocity.push_back(fine[1]);
            energy.push_back(current_energy); drive_work.push_back(fine[2]); dissipated.push_back(fine[3]);
            const double difference = coarse[0] - fine[0];
            max_difference = std::max(max_difference, std::abs(difference));
            sum_square_difference += difference * difference;
            balance_error = std::max(balance_error, std::abs(current_energy - initial_energy - fine[2] + fine[3]));
            if (i < steps) {
                const double tau = i * dt;
                coarse = advance(tau, coarse, dt, damping, drive, beta);
                fine = advance(tau, fine, dt / 2, damping, drive, beta);
                fine = advance(tau + dt / 2, fine, dt / 2, damping, drive, beta);
            }
        }
    }
    const double seconds = std::chrono::duration<double>(std::chrono::steady_clock::now() - start).count();
    py::dict convergence;
    convergence["max_displacement_difference"] = max_difference;
    convergence["rms_displacement_difference"] = std::sqrt(sum_square_difference / (steps + 1));
    convergence["energy_balance_error"] = balance_error;
    convergence["refinement_ratio"] = 2;
    convergence["coarse_step_dimensionless"] = dt;
    convergence["fine_step_dimensionless"] = dt / 2;
    py::dict output;
    output["times_days"] = times; output["displacement"] = displacement;
    output["velocity"] = velocity; output["energy"] = energy;
    output["drive_work"] = drive_work; output["dissipated_energy"] = dissipated;
    output["convergence"] = convergence; output["native_seconds"] = seconds;
    output["rk4_steps"] = steps * 3;
    output["derivative_evaluations"] = steps * 12;
    return output;
}

inline void register_functions(py::module_ &module) {
    module.def("fit_frequency", &fixed_frequency, py::arg("times"), py::arg("magnitudes"),
        py::arg("errors"), py::arg("frequency_per_day"), py::arg("harmonics") = 2,
        "Weighted Fourier fit at one specified frequency; does not search frequencies.");
    module.def("spectral_window", &spectral_window, py::arg("times"), py::arg("frequencies"),
        py::arg("threads") = 1, "Normalized unweighted sampling window |sum exp(2*pi*i*f*t)/N|^2.");
    module.def("simulate_oscillator", &oscillator, py::arg("period_days") = 300,
        py::arg("damping") = 0.05, py::arg("drive") = 0.15, py::arg("nonlinearity") = 0.2,
        py::arg("cycles") = 6, py::arg("steps_per_cycle") = 200,
        "C++ RK4 integration of x''+2*zeta*x'+x+beta*x^3=F*cos(tau), with a dt/2 convergence run.");
}
} // namespace thoth_research
