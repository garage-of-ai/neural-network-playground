import numpy as np
import pytest
from core.activations import (
    relu, relu_derivative,
    sigmoid, sigmoid_derivative,
    tanh, tanh_derivative,
    linear, linear_derivative,
    softmax,
    get_activation,
)


def test_relu_basic():
    z = np.array([-2.0, 0.0, 3.0])
    np.testing.assert_allclose(relu(z), [0.0, 0.0, 3.0])


def test_relu_derivative():
    z = np.array([-2.0, 0.0, 3.0])
    np.testing.assert_allclose(relu_derivative(z), [0.0, 0.0, 1.0])


def test_sigmoid_range_and_midpoint():
    z = np.array([-100.0, 0.0, 100.0])
    result = sigmoid(z)
    assert np.all(result > 0.0) and np.all(result < 1.0)
    np.testing.assert_allclose(result[1], 0.5, atol=1e-8)


def test_sigmoid_no_overflow_on_extreme_values():
    z = np.array([-1000.0, 1000.0])
    result = sigmoid(z)
    assert not np.any(np.isnan(result))
    np.testing.assert_allclose(result, [0.0, 1.0], atol=1e-6)


def test_sigmoid_derivative_matches_numerical():
    z = np.array([-1.0, 0.0, 2.0])
    eps = 1e-5
    numerical = (sigmoid(z + eps) - sigmoid(z - eps)) / (2 * eps)
    np.testing.assert_allclose(sigmoid_derivative(z), numerical, atol=1e-5)


def test_tanh_range_and_midpoint():
    z = np.array([-100.0, 0.0, 100.0])
    result = tanh(z)
    assert np.all(result > -1.0) and np.all(result < 1.0)
    np.testing.assert_allclose(result[1], 0.0, atol=1e-8)


def test_tanh_derivative_matches_numerical():
    z = np.array([-1.0, 0.0, 2.0])
    eps = 1e-5
    numerical = (tanh(z + eps) - tanh(z - eps)) / (2 * eps)
    np.testing.assert_allclose(tanh_derivative(z), numerical, atol=1e-5)


def test_linear_is_identity():
    z = np.array([-3.5, 0.0, 42.0])
    np.testing.assert_allclose(linear(z), z)


def test_linear_derivative_is_ones():
    z = np.array([-3.5, 0.0, 42.0])
    np.testing.assert_allclose(linear_derivative(z), np.ones_like(z))


def test_softmax_sums_to_one_per_row():
    z = np.array([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]])
    result = softmax(z)
    np.testing.assert_allclose(result.sum(axis=-1), [1.0, 1.0])


def test_softmax_numerically_stable_with_large_values():
    z = np.array([1000.0, 1000.0, 1000.0])
    result = softmax(z)
    assert not np.any(np.isnan(result))
    np.testing.assert_allclose(result, [1 / 3, 1 / 3, 1 / 3], atol=1e-6)


def test_softmax_matches_manual_computation():
    z = np.array([1.0, 2.0, 3.0])
    expected = np.exp(z - z.max())
    expected = expected / expected.sum()
    np.testing.assert_allclose(softmax(z), expected)


def test_get_activation_returns_correct_pair():
    fn, deriv = get_activation("relu")
    assert fn is relu
    assert deriv is relu_derivative


def test_get_activation_unknown_raises():
    with pytest.raises(ValueError):
        get_activation("not_a_real_activation")
