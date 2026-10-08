"""Independent geometry, quadrature, and radiative closure checks."""
import numpy as np
import pytest

from thoth import _native


def test_celestial_axis_conventions_and_missing_rows():
    result = _native.celestial_geometry(
        [0, 90, 180, 270, 360, -90, 0, 0, np.nan, 12],
        [0, 0, 0, 0, 0, 0, 90, -90, 0, 91],
        [300, np.nan, 0, -1, 1, 2, 3, 4, 5, np.inf], 8, 4, 1)
    positions = np.asarray(result["positions"])
    np.testing.assert_allclose(positions[:8],
        [[1,0,0], [0,0,-1], [-1,0,0], [0,0,1], [1,0,0],
         [0,0,1], [0,1,0], [0,-1,0]], atol=2e-15)
    assert np.isnan(positions[8:]).all()
    assert result["counts"] == {"coordinates_known": 8, "coordinates_missing": 2,
                               "period_known": 6, "period_unknown": 4}
    assert result["input_rows"] == 10
    assert result["mapped_rows"] == 8
    assert result["missing_coordinates"] == 2


def test_galactic_rotation_matches_published_matrix_and_preserves_norms():
    rng = np.random.default_rng(19)
    ra = rng.uniform(-400, 500, 73)
    dec = rng.uniform(-90, 90, 73)
    result = _native.celestial_geometry(ra, dec, np.full(73, np.nan), 12, 6, 1)
    xyz = np.column_stack([np.cos(np.deg2rad(dec))*np.cos(np.deg2rad(ra)),
                           np.cos(np.deg2rad(dec))*np.sin(np.deg2rad(ra)),
                           np.sin(np.deg2rad(dec))])
    rotation = np.array([
        [-.0548755604162154, -.8734370902348850, -.4838350155487132],
        [ .4941094278755837, -.4448296299600112,  .7469822444972189],
        [-.8676661490190047, -.1980763734312015,  .4559837761750669]])
    expected = xyz @ rotation.T
    expected = np.column_stack([expected[:,0], expected[:,2], -expected[:,1]])
    np.testing.assert_allclose(result["galactic_positions"], expected, atol=2e-15)
    np.testing.assert_allclose(np.linalg.norm(result["galactic_positions"], axis=1), 1, atol=2e-15)
    # Conventional IAU Galactic north pole, independently tabulated in J2000.
    pole = _native.celestial_geometry([192.85948], [27.12825], [np.nan], 4, 2, 1)
    np.testing.assert_allclose(pole["galactic_positions"][0], [0,1,0], atol=1e-7)


def test_spherical_cell_areas_sum_to_full_sky_and_density_recovers_counts():
    result = _native.celestial_geometry([0, 89, 90, 359, -1, 3, 3],
                                       [-90, 0, 0, 89, 89, 90, np.nan],
                                       [100]*7, 8, 4, 1)
    cells = result["density_cells"]
    assert len(cells) == 32
    assert sum(cell["solid_angle_sr"] for cell in cells) == pytest.approx(4*np.pi)
    assert sum(cell["count"] for cell in cells) == 6
    assert sum(cell["density_per_sr"]*cell["solid_angle_sr"] for cell in cells) == pytest.approx(6)
    assert cells[0]["solid_angle_sr"] < cells[8]["solid_angle_sr"]
    assert all(cell["solid_angle_sr"] > 0 for cell in cells)
    assert cells[0]["count"] == 1
    assert cells[17]["count"] == 1
    assert cells[18]["count"] == 1
    assert cells[-1]["count"] == 2


def test_direction_geometry_identical_across_worker_counts():
    ra = np.linspace(-360, 720, 901)
    dec = np.linspace(-90, 90, 901)
    one = _native.celestial_geometry(ra, dec, np.full(901, 333), 12, 8, 1)
    four = _native.celestial_geometry(ra, dec, np.full(901, 333), 12, 8, 4)
    assert one["positions"] == four["positions"]
    assert one["galactic_positions"] == four["galactic_positions"]
    assert one["density_cells"] == four["density_cells"]
    assert 1 <= four["threads_used"] <= 4


@pytest.mark.parametrize("arguments", [
    ([0], [0,1], [1]),
    (np.zeros((2,2)), [0]*4, [1]*4),
    ([0], [0], [1], 3, 2, 1),
    ([0], [0], [1], 4, 181, 1),
    ([0], [0], [1], 4, 2, 257),
])
def test_direction_geometry_guards(arguments):
    with pytest.raises(ValueError):
        _native.celestial_geometry(*arguments)


def test_spherical_surface_is_closed_positive_and_normals_are_analytic():
    latitude, longitude = 64, 128
    result = _native.stellar_surface(.37, -.2, latitude, longitude, .19)
    points = np.asarray(result["positions"]).reshape(latitude+1, longitude+1, 3)
    normals = np.asarray(result["normals"]).reshape(latitude+1, longitude+1, 3)
    radii = np.asarray(result["radii"]).reshape(latitude+1, longitude+1)
    assert result["vertex_count"] == (latitude+1)*(longitude+1)
    assert result["triangle_count"] == 2*longitude*(latitude-1)
    np.testing.assert_allclose(points[:,0], points[:,-1], atol=0)
    np.testing.assert_allclose(normals[:,0], normals[:,-1], atol=0)
    np.testing.assert_allclose(points[0], np.broadcast_to([0,.8,0], points[0].shape), atol=2e-15)
    np.testing.assert_allclose(points[-1], np.broadcast_to([0,-.8,0], points[-1].shape), atol=2e-15)
    np.testing.assert_allclose(normals[0], np.broadcast_to(normals[0,0], normals[0].shape), atol=2e-15)
    np.testing.assert_allclose(normals[-1], np.broadcast_to(normals[-1,0], normals[-1].shape), atol=2e-15)
    np.testing.assert_allclose(np.linalg.norm(points, axis=2), radii, atol=3e-16)
    np.testing.assert_allclose(np.linalg.norm(normals, axis=2), 1, atol=5e-16)
    assert np.all(np.sum(points*normals, axis=2) > 0)
    assert result["minimum_radius"] == pytest.approx(radii.min())
    assert result["maximum_radius"] == pytest.approx(radii.max())
    # Centered numerical tangents independently check analytic normal directions.
    dtheta = points[2:,1:-1] - points[:-2,1:-1]
    dphi = points[1:-1,2:] - points[1:-1,:-2]
    finite_normals = np.cross(dtheta, dphi)
    finite_normals /= np.linalg.norm(finite_normals, axis=2, keepdims=True)
    np.testing.assert_allclose(normals[1:-1,1:-1], finite_normals, atol=.004)
    indexed = points.reshape(-1,3)[np.asarray(result["indices"]).reshape(-1,3)]
    face_normals = np.cross(indexed[:,1]-indexed[:,0], indexed[:,2]-indexed[:,0])
    assert np.all(np.linalg.norm(face_normals, axis=1) > 1e-9)
    assert np.all(np.sum(face_normals*indexed.mean(axis=1), axis=1) > 0)


def test_surface_constant_radius_and_phase_periodicity():
    result = _native.stellar_surface(.5, .3, 12, 24, 0)
    points = np.asarray(result["positions"]).reshape(-1,3)
    np.testing.assert_allclose(np.linalg.norm(points, axis=1), 1.3, atol=5e-16)
    np.testing.assert_allclose(result["normals"], (points/1.3).ravel(), atol=5e-16)
    start = _native.stellar_surface(0, 0, 12, 24, .25)
    end = _native.stellar_surface(1, 0, 12, 24, .25)
    np.testing.assert_allclose(start["positions"], end["positions"], atol=3e-16)


@pytest.mark.parametrize("arguments", [
    (-.1,), (np.nan,), (0, .6), (0, 0, 3, 8),
    (0, 0, 257, 8), (0, 0, 4, 513), (0, 0, 4, 8, .26),
])
def test_stellar_surface_guards(arguments):
    with pytest.raises(ValueError):
        _native.stellar_surface(*arguments)


def test_grid_plane_geometry_and_holes():
    x, y = np.array([0,1,3,6.]), np.array([-2,0,4.])
    z = 2*x[None,:] + 3*y[:,None] + 5
    result = _native.surface_from_grid(x, y, z, .5)
    points = np.asarray(result["positions"]).reshape(len(y), len(x), 3)
    np.testing.assert_allclose(points[:,:,0], np.broadcast_to(x, z.shape))
    np.testing.assert_allclose(points[:,:,1], z*.5)
    np.testing.assert_allclose(points[:,:,2], np.broadcast_to(y[:,None], z.shape))
    expected_normal = np.array([-1., 1., -1.5])
    expected_normal /= np.linalg.norm(expected_normal)
    np.testing.assert_allclose(np.asarray(result["normals"]).reshape(-1,3),
                               np.broadcast_to(expected_normal, (12,3)), atol=1e-15)
    assert result["triangle_count"] == 12
    z[0,0] = np.nan
    missing = _native.surface_from_grid(x, y, z)
    assert missing["missing_vertices"] == 1
    assert missing["finite_vertices"] == 11
    assert missing["triangle_count"] == 10
    assert 0 not in missing["indices"]
    assert np.isnan(missing["positions"][1])


def test_grid_axis_orientation_preserves_upward_normals():
    result = _native.surface_from_grid([3,1,0], [-1,2], np.zeros((2,3)))
    np.testing.assert_allclose(np.asarray(result["normals"]).reshape(-1,3),
                               np.broadcast_to([0,1,0], (6,3)))


@pytest.mark.parametrize("arguments", [
    ([0], [0,1], np.zeros((2,1))),
    ([0,0], [0,1], np.zeros((2,2))),
    ([0,1], [0,1], np.zeros((3,2))),
    ([0,1], [0,1], np.zeros((2,2)), np.inf),
    ([0,1], [0,1], np.ones((2,2))*1e13),
])
def test_grid_mesh_guards(arguments):
    with pytest.raises(ValueError):
        _native.surface_from_grid(*arguments)


def test_distance_posterior_quadrature_and_negative_parallax():
    result = _native.distance_posterior(-.2, .3, 1350, 4096, 30000)
    radii = np.asarray(result["distances_pc"])
    # Independent NumPy evaluation of the prior and Gaussian likelihood.
    log_density = 2*np.log(radii) - radii/1350 - .5*((-.2-1000/radii)/.3)**2
    expected = np.exp(log_density-log_density.max())
    expected /= np.trapezoid(expected, radii) if hasattr(np, "trapezoid") else np.trapz(expected, radii)
    np.testing.assert_allclose(result["density_per_pc"], expected, atol=1e-16, rtol=1e-13)
    density = np.asarray(result["density_per_pc"])
    cdf = np.asarray(result["cumulative_probability"])
    assert cdf[0] == 0
    assert cdf[-1] == 1
    assert np.all(np.diff(cdf) >= 0)
    assert result["p16_pc"] < result["median_pc"] < result["p84_pc"]
    assert result["median_pc"] > 0
    integral = np.trapezoid(density, radii) if hasattr(np, "trapezoid") else np.trapz(density, radii)
    assert integral == pytest.approx(1, abs=3e-15)


def test_distance_posterior_resolves_precise_parallax_and_converges():
    result = _native.distance_posterior(5, .002, 1350, 1024, 20000)
    assert result["median_pc"] == pytest.approx(200, abs=.001)
    assert result["mode_pc"] == pytest.approx(200, abs=.001)
    assert result["p84_pc"]-result["p16_pc"] == pytest.approx(.1591133, rel=.01)
    coarse = _native.distance_posterior(.1, .4, 1350, 1024, 20000)
    fine = _native.distance_posterior(.1, .4, 1350, 4096, 20000)
    for key in ("median_pc", "p16_pc", "p84_pc", "mode_pc"):
        assert coarse[key] == pytest.approx(fine[key], rel=.0005)


def test_distance_prior_is_retained_when_parallax_is_uninformative():
    result = _native.distance_posterior(0, 1e6, 1000, 2048, 50000)
    # r² exp(-r/L) has its mode at 2L, independently of the quadrature.
    assert result["mode_pc"] == pytest.approx(2000, rel=1e-7)
    assert result["lower_bound_pc"] == .001
    assert result["upper_bound_pc"] == 50000


@pytest.mark.parametrize("arguments", [
    (-.2, 1e-6, 1350, 1024, 20000),
    (5., .05, 1350, 1024, 100),
])
def test_underresolved_truncated_posterior_does_not_invent_broad_intervals(arguments):
    with pytest.raises(ValueError, match="unresolved at an integration boundary"):
        _native.distance_posterior(*arguments)


def test_resolved_boundary_modes_remain_valid():
    weak = _native.distance_posterior(0, 1e6, 1000, 1024, 100)
    assert weak["mode_pc"] == 100
    assert 0 < weak["p16_pc"] < weak["median_pc"] < weak["p84_pc"] < 100
    # The added high-SNR local grid resolves a peak at the upper endpoint.
    precise = _native.distance_posterior(5., .002, 1350, 1024, 200)
    assert precise["mode_pc"] == 200
    assert precise["median_pc"] == pytest.approx(199.946, abs=.002)


@pytest.mark.parametrize("arguments", [
    (np.nan, .1), (1, 0), (1, 1e-7), (1, .1, 0),
    (1, .1, 1350, 10), (1, .1, 1350, 1024, .01),
])
def test_distance_posterior_guards(arguments):
    with pytest.raises(ValueError):
        _native.distance_posterior(*arguments)


@pytest.mark.parametrize("radius_fraction", [0, .3, .5, 1])
def test_radiative_family_reproduces_flux_and_exposes_degeneracy(radius_fraction):
    flux = np.array([.02, .3, 1., 2., 12.])
    result = _native.radiative_phase_family(flux, .806, 3000, radius_fraction)
    radii = np.asarray(result["radii_relative"])
    temperatures = np.asarray(result["temperatures_k"])
    np.testing.assert_allclose(radii, flux**(radius_fraction/2), rtol=3e-15)
    # Independent SI Planck calculation verifies the analytic inverse.
    exponent_scale = 6.62607015e-34*299792458/(.806e-6*1.380649e-23)
    reconstructed = radii*radii*np.expm1(exponent_scale/3000)/np.expm1(exponent_scale/temperatures)
    np.testing.assert_allclose(reconstructed, flux, rtol=3e-15)
    np.testing.assert_allclose(result["reconstructed_fluxes"], flux, rtol=3e-15)
    assert result["temperatures_k"][2] == pytest.approx(3000)
    assert result["radii_relative"][2] == pytest.approx(1)
    if radius_fraction == 0:
        np.testing.assert_allclose(radii, 1)
        assert temperatures[0] < temperatures[-1]
    if radius_fraction == 1:
        np.testing.assert_allclose(temperatures, 3000)
    assert result["iterations"] == 0


def test_radiative_family_extreme_supported_fluxes_remain_finite():
    result = _native.radiative_phase_family([1e-12, 1e12], .1, 500, .5)
    assert np.isfinite(result["radii_relative"]).all()
    assert np.isfinite(result["temperatures_k"]).all()
    np.testing.assert_allclose(result["reconstructed_fluxes"], [1e-12,1e12], rtol=1e-13)


@pytest.mark.parametrize("arguments", [
    ([],), ([0],), ([np.nan],), ([1e13],),
    ([1], .01), ([1], .806, 300), ([1], .806, 3000, 1.1),
])
def test_radiative_family_guards(arguments):
    with pytest.raises(ValueError):
        _native.radiative_phase_family(*arguments)
