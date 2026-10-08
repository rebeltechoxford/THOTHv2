// Three-dimensional direction geometry and illustrative surface meshes.
// Unit vectors encode measured directions, never an inferred stellar distance.
#pragma once
#include <chrono>
#include <cstdint>

namespace thoth_space {
using Clock = std::chrono::steady_clock;
using Point = std::array<double, 3>;
constexpr double pi = two_pi / 2;
constexpr double radians = pi / 180;
constexpr double nan = std::numeric_limits<double>::quiet_NaN();

inline double elapsed(Clock::time_point start) {
    return std::chrono::duration<double>(Clock::now() - start).count();
}

inline Point direction(double longitude, double latitude) {
    const double longitude_radians = longitude * radians;
    const double latitude_radians = latitude * radians;
    const double c = std::cos(latitude_radians);
    return {c * std::cos(longitude_radians), std::sin(latitude_radians),
            -c * std::sin(longitude_radians)};
}

inline Point galactic_direction(double longitude, double latitude) {
    // Conventional ICRS-equivalent J2000 -> Galactic rotation, as documented
    // in ESA Hipparcos volume 1, section 1.5.1 (pole/node definitions
    // 1.5.9-1.5.10). This rotates directions only;
    // it is neither a Galactocentric translation nor a distance transformation.
    // The three standard equatorial components are (x, -z, y) in our Y-up view.
    constexpr double rotation[3][3] = {
        {-0.0548755604162154, -0.8734370902348850, -0.4838350155487132},
        { 0.4941094278755837, -0.4448296299600112,  0.7469822444972189},
        {-0.8676661490190047, -0.1980763734312015,  0.4559837761750669}};
    const auto view = direction(longitude, latitude);
    const Point standard{view[0], -view[2], view[1]};
    Point rotated{};
    for (int row = 0; row < 3; ++row)
        for (int column = 0; column < 3; ++column)
            rotated[row] += rotation[row][column] * standard[column];
    return {rotated[0], rotated[2], -rotated[1]};
}

inline py::dict celestial_geometry(const InputArray &ra_array,
                                   const InputArray &dec_array,
                                   const InputArray &period_array,
                                   int longitude_bins, int latitude_bins, int threads) {
    const auto start = Clock::now();
    const auto ra = copy_input(ra_array, "ra_deg");
    const auto dec = copy_input(dec_array, "dec_deg");
    const auto periods = copy_input(period_array, "period_days");
    if (ra.size() != dec.size() || ra.size() != periods.size())
        throw std::invalid_argument("RA, declination, and period arrays must have equal lengths.");
    if (longitude_bins < 4 || longitude_bins > 360 || latitude_bins < 2 || latitude_bins > 180)
        throw std::invalid_argument("longitude_bins must be 4 to 360; latitude_bins must be 2 to 180.");
    if (threads < 0 || threads > 256)
        throw std::invalid_argument("threads must be between 0 (automatic) and 256.");
    int requested = 1;
#ifdef _OPENMP
    requested = threads == 0 ? omp_get_max_threads() : threads;
#endif
    requested = std::max(1, std::min(requested, static_cast<int>(std::max<std::size_t>(1, ra.size()))));
    int used = 1;
    std::vector<Point> positions(ra.size(), Point{nan, nan, nan});
    std::vector<Point> galactic_positions(ra.size(), Point{nan, nan, nan});
    std::vector<int> bin_indices(ra.size(), -1);
    std::vector<std::size_t> counts(static_cast<std::size_t>(longitude_bins) * latitude_bins, 0);
    std::size_t missing = 0, period_known = 0;
    {
        py::gil_scoped_release release;
#ifdef _OPENMP
        #pragma omp parallel num_threads(requested)
#endif
        {
#ifdef _OPENMP
            #pragma omp single
            used = omp_get_num_threads();
            #pragma omp for
#endif
            for (std::ptrdiff_t i = 0; i < static_cast<std::ptrdiff_t>(ra.size()); ++i) {
                if (!std::isfinite(ra[i]) || !std::isfinite(dec[i]) || dec[i] < -90 || dec[i] > 90)
                    continue;
                double longitude = std::fmod(ra[i], 360.0);
                if (longitude < 0) longitude += 360.0;
                // Floating-point rounding of tiny negative values can produce 360.
                if (longitude >= 360) longitude = 0;
                positions[i] = direction(longitude, dec[i]);
                galactic_positions[i] = galactic_direction(longitude, dec[i]);
                const int column = std::min(longitude_bins - 1,
                    static_cast<int>(longitude / 360 * longitude_bins));
                const int row = std::min(latitude_bins - 1,
                    static_cast<int>((dec[i] + 90) / 180 * latitude_bins));
                bin_indices[i] = row * longitude_bins + column;
            }
        }
        // Accumulate integer counts serially so results do not depend on scheduling.
        for (std::size_t i = 0; i < ra.size(); ++i) {
            if (bin_indices[i] < 0) ++missing;
            else ++counts[bin_indices[i]];
            if (std::isfinite(periods[i]) && periods[i] > 0) ++period_known;
        }
    }
    py::list cells;
    const double delta_longitude = two_pi / longitude_bins;
    for (int row = 0; row < latitude_bins; ++row) {
        const double lower = -90 + 180.0 * row / latitude_bins;
        const double upper = -90 + 180.0 * (row + 1) / latitude_bins;
        const double area = delta_longitude * (std::sin(upper * radians) - std::sin(lower * radians));
        const double latitude = (lower + upper) / 2;
        for (int column = 0; column < longitude_bins; ++column) {
            const double longitude = 360.0 * (column + .5) / longitude_bins;
            const auto point = direction(longitude, latitude);
            const auto count = counts[row * longitude_bins + column];
            py::dict cell;
            cell["longitude_index"] = column; cell["latitude_index"] = row;
            cell["ra_deg"] = longitude; cell["dec_deg"] = latitude;
            cell["count"] = count; cell["solid_angle_sr"] = area;
            cell["density_per_sr"] = count / area;
            cell["x"] = point[0]; cell["y"] = point[1]; cell["z"] = point[2];
            cells.append(cell);
        }
    }
    py::dict count_summary;
    count_summary["coordinates_known"] = ra.size() - missing;
    count_summary["coordinates_missing"] = missing;
    count_summary["period_known"] = period_known;
    count_summary["period_unknown"] = ra.size() - period_known;
    py::dict output;
    output["positions"] = positions; output["galactic_positions"] = galactic_positions;
    output["density_cells"] = cells; output["counts"] = count_summary;
    output["input_rows"] = ra.size(); output["mapped_rows"] = ra.size() - missing;
    output["missing_coordinates"] = missing; output["native_seconds"] = elapsed(start);
    output["observation_evaluations"] = ra.size(); output["threads_used"] = used;
    output["coordinate_kind"] = "unit-sphere directions; stellar distances unknown";
    return output;
}

inline Point normalized(Point value) {
    const double norm = std::hypot(value[0], std::hypot(value[1], value[2]));
    if (!(norm > 0) || !std::isfinite(norm)) return {0, 1, 0};
    for (double &component : value) component /= norm;
    return value;
}

inline py::dict stellar_surface(double phase, double displacement, int latitude_samples,
                               int longitude_samples, double contrast) {
    const auto start = Clock::now();
    if (!std::isfinite(phase) || phase < 0 || phase > 1 ||
        !std::isfinite(displacement) || displacement < -.5 || displacement > .5 ||
        !std::isfinite(contrast) || contrast < 0 || contrast > .25)
        throw std::invalid_argument("phase must be 0 to 1, displacement -0.5 to 0.5, and contrast 0 to 0.25.");
    if (latitude_samples < 4 || latitude_samples > 256 || longitude_samples < 8 || longitude_samples > 512)
        throw std::invalid_argument("latitude_samples must be 4 to 256; longitude_samples must be 8 to 512.");
    const std::size_t count = static_cast<std::size_t>(latitude_samples + 1) * (longitude_samples + 1);
    std::vector<double> positions(count * 3), normals(count * 3), radii(count);
    std::vector<std::uint32_t> indices;
    indices.reserve(static_cast<std::size_t>(2) * longitude_samples * (latitude_samples - 1) * 3);
    double minimum_radius = std::numeric_limits<double>::infinity(), maximum_radius = 0;
    {
        py::gil_scoped_release release;
        const double phase_angle = two_pi * phase;
        const double mean_radius = 1 + displacement;
        for (int row = 0; row <= latitude_samples; ++row) {
            const double theta = pi * row / latitude_samples;
            const double s = std::sin(theta), c = std::cos(theta);
            for (int column = 0; column <= longitude_samples; ++column) {
                // Exact seam coordinates avoid a floating-point crack.
                const double phi = column == longitude_samples ? 0 : two_pi * column / longitude_samples;
                const double sp = std::sin(phi), cp = std::cos(phi);
                // Smooth spherical angular modes vanish at the poles. These are
                // demonstration perturbations, not reconstructed stellar structure.
                const double q = .6 * s * s * std::cos(3 * theta) * std::sin(2 * phi)
                    + .4 * std::sin(2 * theta) * std::cos(phi + phase_angle);
                const double q_theta = .6 * (2 * s * c * std::cos(3 * theta)
                    - 3 * s * s * std::sin(3 * theta)) * std::sin(2 * phi)
                    + .8 * std::cos(2 * theta) * std::cos(phi + phase_angle);
                // q_phi / sin(theta), analytically continued through the poles.
                const double q_phi_over_s = 1.2 * s * std::cos(3 * theta) * std::cos(2 * phi)
                    - .8 * c * std::sin(phi + phase_angle);
                const double shape = 1 + contrast * q;
                const double radius = mean_radius * shape;
                const Point radial{s * cp, c, -s * sp};
                const Point theta_tangent{c * cp, -s, -c * sp};
                const Point phi_tangent{-sp, 0, -cp};
                Point normal{};
                for (int axis = 0; axis < 3; ++axis)
                    normal[axis] = radial[axis] - contrast / shape *
                        (q_theta * theta_tangent[axis] + q_phi_over_s * phi_tangent[axis]);
                normal = normalized(normal);
                const std::size_t vertex = static_cast<std::size_t>(row) * (longitude_samples + 1) + column;
                for (int axis = 0; axis < 3; ++axis) {
                    positions[vertex * 3 + axis] = radius * radial[axis];
                    normals[vertex * 3 + axis] = normal[axis];
                }
                radii[vertex] = radius;
                minimum_radius = std::min(minimum_radius, radius);
                maximum_radius = std::max(maximum_radius, radius);
            }
        }
        for (int row = 0; row < latitude_samples; ++row) {
            for (int column = 0; column < longitude_samples; ++column) {
                const auto a = static_cast<std::uint32_t>(row * (longitude_samples + 1) + column);
                const auto b = a + static_cast<std::uint32_t>(longitude_samples + 1);
                if (row != 0) { indices.push_back(a); indices.push_back(b); indices.push_back(a + 1); }
                if (row != latitude_samples - 1) {
                    indices.push_back(a + 1); indices.push_back(b); indices.push_back(b + 1);
                }
            }
        }
    }
    py::dict output;
    output["positions"] = positions; output["normals"] = normals; output["indices"] = indices;
    output["radii"] = radii; output["vertex_count"] = count;
    output["triangle_count"] = indices.size() / 3;
    output["minimum_radius"] = minimum_radius; output["maximum_radius"] = maximum_radius;
    output["native_seconds"] = elapsed(start); output["surface_evaluations"] = count;
    output["model_kind"] = "illustrative normalized spherical surface; no measured Mira radius";
    output["equation"] = "R=(1+displacement)*(1+contrast*(0.6*sin(theta)^2*cos(3*theta)*sin(2*phi)+0.4*sin(2*theta)*cos(phi+2*pi*phase)))";
    return output;
}

inline py::dict surface_from_grid(const InputArray &x_array, const InputArray &y_array,
                                 const InputArray &height_array, double height_scale) {
    const auto start = Clock::now();
    const auto x = copy_input(x_array, "x"), y = copy_input(y_array, "y");
    if (x.size() < 2 || y.size() < 2 || x.size() > 512 || y.size() > 512)
        throw std::invalid_argument("Grid axes must contain 2 to 512 values each.");
    if (height_array.ndim() != 2 || height_array.shape(0) != static_cast<py::ssize_t>(y.size()) ||
        height_array.shape(1) != static_cast<py::ssize_t>(x.size()))
        throw std::invalid_argument("Grid height must be a two-dimensional array shaped (len(y), len(x)).");
    if (!std::isfinite(height_scale) || std::abs(height_scale) > 1e6)
        throw std::invalid_argument("height_scale must be finite with absolute value at most 1,000,000.");
    for (const auto *axis : {&x, &y}) {
        const bool increasing = (*axis)[1] > (*axis)[0];
        for (std::size_t i = 0; i < axis->size(); ++i) {
            if (!std::isfinite((*axis)[i]) || std::abs((*axis)[i]) > 1e12 ||
                (i > 0 && (increasing ? (*axis)[i] <= (*axis)[i-1] : (*axis)[i] >= (*axis)[i-1])))
                throw std::invalid_argument("Grid axes must be finite, strictly monotonic, and within +/-1e12.");
        }
    }
    const auto count = x.size() * y.size();
    std::vector<double> heights(height_array.data(), height_array.data() + count);
    std::vector<double> positions(count * 3), normals(count * 3, 0);
    std::vector<std::uint32_t> indices;
    std::size_t missing = 0;
    {
        py::gil_scoped_release release;
        for (std::size_t row = 0; row < y.size(); ++row)
            for (std::size_t column = 0; column < x.size(); ++column) {
                const auto i = row * x.size() + column;
                double height = heights[i];
                if (std::isfinite(height)) {
                    height *= height_scale;
                    if (!std::isfinite(height) || std::abs(height) > 1e12)
                        throw std::invalid_argument("Scaled grid heights must lie within +/-1e12.");
                } else { height = nan; ++missing; }
                positions[3*i] = x[column]; positions[3*i+1] = height; positions[3*i+2] = y[row];
            }
        auto triangle = [&](std::uint32_t a, std::uint32_t b, std::uint32_t c) {
            Point ab{}, ac{};
            for (int axis = 0; axis < 3; ++axis) {
                ab[axis] = positions[3*b+axis] - positions[3*a+axis];
                ac[axis] = positions[3*c+axis] - positions[3*a+axis];
            }
            Point normal{ab[1]*ac[2]-ab[2]*ac[1], ab[2]*ac[0]-ab[0]*ac[2], ab[0]*ac[1]-ab[1]*ac[0]};
            if (normal[1] < 0) { std::swap(b, c); for (double &component : normal) component = -component; }
            indices.push_back(a); indices.push_back(b); indices.push_back(c);
            for (const auto vertex : {a,b,c})
                for (int axis = 0; axis < 3; ++axis) normals[3*vertex+axis] += normal[axis];
        };
        for (std::size_t row = 0; row + 1 < y.size(); ++row)
            for (std::size_t column = 0; column + 1 < x.size(); ++column) {
                const auto a = static_cast<std::uint32_t>(row * x.size() + column);
                const auto b = a + 1, c = a + static_cast<std::uint32_t>(x.size()), d = c + 1;
                if (!std::isfinite(positions[3*a+1]) || !std::isfinite(positions[3*b+1]) ||
                    !std::isfinite(positions[3*c+1]) || !std::isfinite(positions[3*d+1])) continue;
                triangle(a,c,b); triangle(b,c,d);
            }
        for (std::size_t i = 0; i < count; ++i) {
            const auto normal = normalized({normals[3*i], normals[3*i+1], normals[3*i+2]});
            for (int axis = 0; axis < 3; ++axis) normals[3*i+axis] = normal[axis];
        }
    }
    py::dict output;
    output["positions"] = positions; output["normals"] = normals; output["indices"] = indices;
    output["grid_columns"] = x.size(); output["grid_rows"] = y.size();
    output["vertex_count"] = count; output["triangle_count"] = indices.size() / 3;
    output["finite_vertices"] = count - missing; output["missing_vertices"] = missing;
    output["native_seconds"] = elapsed(start);
    output["model_kind"] = "measured diagnostic grid as a height surface; missing cells remain holes";
    return output;
}

inline py::dict distance_posterior(double parallax, double error, double prior_length,
                                  int samples, double maximum_distance) {
    const auto start = Clock::now();
    if (!std::isfinite(parallax) || std::abs(parallax) > 1e6 ||
        !std::isfinite(error) || error < 1e-6 || error > 1e6)
        throw std::invalid_argument("Parallax must be finite within +/-1,000,000 mas; its error must be 1e-6 to 1,000,000 mas.");
    if (!std::isfinite(prior_length) || prior_length < .1 || prior_length > 1e6 ||
        !std::isfinite(maximum_distance) || maximum_distance < 1 || maximum_distance > 1e7)
        throw std::invalid_argument("prior_length_pc must be 0.1 to 1,000,000; max_distance_pc must be 1 to 10,000,000.");
    if (samples < 128 || samples > 16384)
        throw std::invalid_argument("samples must be 128 to 16384.");
    constexpr double minimum_distance = .001;
    std::vector<double> distances, density, cumulative;
    double normalization = 0, mode = 0;
    std::size_t evaluations = 0;
    {
        py::gil_scoped_release release;
        // Integrating density with respect to dr is equivalent to including the
        // r Jacobian when integrating the log-distance coordinate. Nonuniform
        // trapezoid widths below supply that Jacobian explicitly.
        const double lower_log = std::log(minimum_distance);
        const double upper_log = std::log(maximum_distance);
        distances.reserve(samples + samples / 2);
        for (int i = 0; i < samples; ++i)
            distances.push_back(std::exp(lower_log + (upper_log - lower_log) * i / (samples - 1)));
        distances.front() = minimum_distance; distances.back() = maximum_distance;
        // A purely logarithmic grid underresolves a very precise positive
        // parallax. Add a local grid around the positive likelihood maximum.
        if (parallax > 5 * error) {
            const double center = 1000 / parallax;
            const double width = 1000 * error / (parallax * parallax);
            const double left = std::max(minimum_distance, center - 10 * width);
            const double right = std::min(maximum_distance, center + 10 * width);
            if (right > left) {
                const int local_samples = samples / 2;
                for (int i = 0; i < local_samples; ++i)
                    distances.push_back(left + (right - left) * i / (local_samples - 1));
            }
        }
        std::sort(distances.begin(), distances.end());
        distances.erase(std::unique(distances.begin(), distances.end()), distances.end());
        auto log_density = [&](double radius) {
            ++evaluations;
            const long double deviation = (static_cast<long double>(parallax) - 1000.L / radius) / error;
            return 2 * std::log(static_cast<long double>(radius)) - radius / prior_length
                - .5L * deviation * deviation;
        };
        std::vector<long double> log_values(distances.size());
        long double peak = -std::numeric_limits<long double>::infinity();
        std::size_t peak_index = 0;
        for (std::size_t i = 0; i < distances.size(); ++i) {
            log_values[i] = log_density(distances[i]);
            if (log_values[i] > peak) { peak = log_values[i]; peak_index = i; }
        }
        if (peak_index == 0 || peak_index + 1 == distances.size()) {
            const auto neighbor = peak_index == 0 ? 1 : peak_index - 1;
            // A sharply rising truncated likelihood can concentrate within a
            // tiny fraction of the last quadrature panel. Trapezoidal areas
            // would then invent a broad interval despite remaining finite.
            // Fail explicitly rather than displaying unresolved quantiles.
            if (peak - log_values[neighbor] > .5L)
                throw std::invalid_argument(
                    "Distance posterior is unresolved at an integration boundary. "
                    "Increase samples or revise distance bounds; retain the measured parallax error.");
        }
        // Refine the largest grid mode; bounded support can place it at an end.
        if (peak_index == 0 || peak_index + 1 == distances.size()) mode = distances[peak_index];
        else {
            double left = distances[peak_index - 1], right = distances[peak_index + 1];
            constexpr double ratio = .6180339887498948482;
            double a = right - ratio * (right - left), b = left + ratio * (right - left);
            long double fa = log_density(a), fb = log_density(b);
            for (int iteration = 0; iteration < 64; ++iteration) {
                if (fa > fb) { right = b; b = a; fb = fa; a = right - ratio * (right-left); fa = log_density(a); }
                else { left = a; a = b; fa = fb; b = left + ratio * (right-left); fb = log_density(b); }
            }
            mode = (left + right) / 2;
        }
        density.resize(distances.size()); cumulative.assign(distances.size(), 0);
        for (std::size_t i = 0; i < distances.size(); ++i)
            density[i] = static_cast<double>(std::exp(log_values[i] - peak));
        for (std::size_t i = 1; i < distances.size(); ++i) {
            const double area = (distances[i] - distances[i-1]) * (density[i-1] + density[i]) / 2;
            normalization += area; cumulative[i] = normalization;
        }
        if (!(normalization > 0) || !std::isfinite(normalization))
            throw std::invalid_argument("Posterior could not be resolved on this support; increase samples or revise the distance bounds.");
        for (std::size_t i = 0; i < distances.size(); ++i) {
            density[i] /= normalization; cumulative[i] /= normalization;
        }
        cumulative.back() = 1;
    }
    auto quantile = [&](double probability) {
        const auto found = std::lower_bound(cumulative.begin(), cumulative.end(), probability);
        const std::size_t i = static_cast<std::size_t>(found - cumulative.begin());
        if (i == 0) return distances.front();
        const double width = distances[i] - distances[i-1];
        const double wanted = probability - cumulative[i-1];
        const double slope = (density[i] - density[i-1]) / width;
        const double discriminant = std::max(0.0, density[i-1] * density[i-1] + 2 * slope * wanted);
        const double denominator = density[i-1] + std::sqrt(discriminant);
        const double offset = denominator > 0 ? 2 * wanted / denominator : 0;
        return distances[i-1] + std::clamp(offset, 0.0, width);
    };
    py::dict output;
    output["distances_pc"] = distances; output["density_per_pc"] = density;
    output["cumulative_probability"] = cumulative;
    output["median_pc"] = quantile(.5); output["mode_pc"] = mode;
    output["p16_pc"] = quantile(.16); output["p84_pc"] = quantile(.84);
    output["prior_length_pc"] = prior_length; output["parallax_mas"] = parallax;
    output["parallax_error_mas"] = error;
    output["lower_bound_pc"] = minimum_distance; output["upper_bound_pc"] = maximum_distance;
    output["grid_samples"] = distances.size(); output["native_seconds"] = elapsed(start);
    output["posterior_evaluations"] = evaluations;
    output["model_kind"] = "bounded exponentially decreasing space-density distance posterior; Gaussian parallax likelihood";
    output["equation"] = "p(r|parallax) proportional to r^2*exp(-r/L)*exp(-0.5*((parallax_mas-1000/r)/parallax_error_mas)^2), r>0";
    return output;
}

inline py::dict radiative_phase_family(const InputArray &flux_array, double wavelength,
                                       double reference_temperature, double radius_fraction) {
    const auto start = Clock::now();
    const auto fluxes = copy_input(flux_array, "relative_fluxes");
    if (fluxes.empty()) throw std::invalid_argument("At least one relative flux is required.");
    if (!std::isfinite(wavelength) || wavelength < .1 || wavelength > 1000 ||
        !std::isfinite(reference_temperature) || reference_temperature < 500 || reference_temperature > 50000 ||
        !std::isfinite(radius_fraction) || radius_fraction < 0 || radius_fraction > 1)
        throw std::invalid_argument("wavelength_um must be 0.1 to 1000, reference_temperature_k 500 to 50000, and radius_fraction 0 to 1.");
    for (const double flux : fluxes)
        if (!std::isfinite(flux) || flux < 1e-12 || flux > 1e12)
            throw std::invalid_argument("Relative fluxes must be finite and between 1e-12 and 1e12.");
    std::vector<double> radii(fluxes.size()), temperatures(fluxes.size()), reconstructed(fluxes.size()), residuals(fluxes.size());
    {
        py::gil_scoped_release release;
        // Exact SI defining constants h, c, k_B, expressed here as hc/k_B in
        // micrometre-kelvin units. This is a monochromatic blackbody proxy.
        constexpr double hc_over_k_um = (6.62607015e-34 * 299792458.0 / 1.380649e-23) * 1e6;
        const double temperature_scale = hc_over_k_um / wavelength;
        const double reference_exponent = temperature_scale / reference_temperature;
        const double reference_denominator = std::expm1(reference_exponent);
        for (std::size_t i = 0; i < fluxes.size(); ++i) {
            const double log_flux = std::log(fluxes[i]);
            radii[i] = std::exp(radius_fraction * log_flux / 2);
            const double planck_ratio = std::exp((1 - radius_fraction) * log_flux);
            const double exponent = std::log1p(reference_denominator / planck_ratio);
            temperatures[i] = temperature_scale / exponent;
            const double reconstructed_ratio = reference_denominator / std::expm1(temperature_scale / temperatures[i]);
            reconstructed[i] = radii[i] * radii[i] * reconstructed_ratio;
            residuals[i] = reconstructed[i] - fluxes[i];
        }
    }
    py::dict output;
    output["radii_relative"] = radii; output["temperatures_k"] = temperatures;
    output["reconstructed_fluxes"] = reconstructed; output["residuals"] = residuals;
    output["wavelength_um"] = wavelength; output["reference_temperature_k"] = reference_temperature;
    output["radius_fraction"] = radius_fraction; output["native_seconds"] = elapsed(start);
    output["derivative_evaluations"] = 0; output["iterations"] = 0; output["evaluations"] = fluxes.size();
    output["equation_model"] = "F_relative=(R/R0)^2*B_lambda(T)/B_lambda(T0); R/R0=F_relative^(radius_fraction/2); T solved by analytic inverse Planck law";
    output["model_kind"] = "degenerate spherical monochromatic blackbody phase family; normalized radius, assumed reference temperature";
    return output;
}

inline void register_functions(py::module_ &module) {
    module.def("celestial_geometry", &celestial_geometry, py::arg("ra_deg"), py::arg("dec_deg"),
        py::arg("period_days"), py::arg("longitude_bins") = 72, py::arg("latitude_bins") = 36,
        py::arg("threads") = 1,
        "Map equatorial directions to Y-up unit vectors, Galactic directions, and solid-angle-correct density cells. No distances are inferred.");
    module.def("stellar_surface", &stellar_surface, py::arg("phase"), py::arg("displacement") = 0,
        py::arg("latitude_samples") = 48, py::arg("longitude_samples") = 96,
        py::arg("contrast") = .12,
        "Build an illustrative normalized spherical surface with analytic outward normals. This is not a reconstruction of stellar hydrodynamics.");
    module.def("surface_from_grid", &surface_from_grid, py::arg("x"), py::arg("y"), py::arg("z2d"),
        py::arg("height_scale") = 1,
        "Build an indexed Y-up diagnostic height mesh. Cells touching nonfinite heights are omitted.");
    module.def("distance_posterior", &distance_posterior, py::arg("parallax_mas"), py::arg("parallax_error_mas"),
        py::arg("prior_length_pc") = 1350, py::arg("samples") = 1024, py::arg("max_distance_pc") = 20000,
        "Numerically normalize a bounded EDSD distance prior times a Gaussian parallax likelihood. Negative parallaxes are supported.");
    module.def("radiative_phase_family", &radiative_phase_family, py::arg("relative_fluxes"),
        py::arg("wavelength_um") = .806, py::arg("reference_temperature_k") = 3000,
        py::arg("radius_fraction") = .5,
        "Invert a monochromatic Planck model for one of many radius/temperature families that reproduce the same relative passband flux.");
}
} // namespace thoth_space
