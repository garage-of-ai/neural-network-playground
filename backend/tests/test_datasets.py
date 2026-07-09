import numpy as np
import pytest
from core.datasets import generate_dataset, AVAILABLE_KINDS, N_SAMPLES

BINARY_KINDS = ["circle", "xor", "gauss", "spiral", "moons"]


@pytest.mark.parametrize("kind", AVAILABLE_KINDS)
def test_all_kinds_generate_without_error(kind):
    X, y = generate_dataset(kind, noise=10)
    assert X is not None and y is not None


@pytest.mark.parametrize("kind", AVAILABLE_KINDS)
def test_output_shapes_consistent(kind):
    X, y = generate_dataset(kind, noise=10)
    assert X.shape == (N_SAMPLES, 2)
    assert y.shape == (N_SAMPLES,)


@pytest.mark.parametrize("kind", BINARY_KINDS)
def test_binary_datasets_have_two_labels(kind):
    _, y = generate_dataset(kind, noise=10)
    assert set(np.unique(y).tolist()) == {0, 1}


def test_blobs3_has_three_labels():
    _, y = generate_dataset("blobs3", noise=10)
    assert set(np.unique(y).tolist()) == {0, 1, 2}


def test_noise_zero_vs_high_changes_variance():
    X_low, _ = generate_dataset("gauss", noise=0)
    X_high, _ = generate_dataset("gauss", noise=50)
    assert X_high.var() > X_low.var()


def test_generated_points_are_finite():
    for kind in AVAILABLE_KINDS:
        X, _ = generate_dataset(kind, noise=25)
        assert np.all(np.isfinite(X))


def test_unknown_kind_raises():
    with pytest.raises(ValueError):
        generate_dataset("not_a_real_kind", noise=10)
