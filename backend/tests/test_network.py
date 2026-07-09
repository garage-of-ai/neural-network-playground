import numpy as np
import pytest
from core.layers import DenseLayer
from core.network import MLP

EPSILON = 1e-5
TOLERANCE = 1e-4


def _build_network(output_activation):
    np.random.seed(42)
    out_units = 3 if output_activation == "softmax" else 1
    layers = [
        DenseLayer(input_size=2, output_size=4, activation="relu", weight_init="gaussian"),
        DenseLayer(input_size=4, output_size=out_units, activation=output_activation, weight_init="gaussian"),
    ]
    return MLP(layers)


def _total_loss(network, X, y_true):
    # Loss tự viết ngay trong test, KHÔNG import core/losses.py — để test này
    # độc lập, không bị "che" bug nếu losses.py cũng sai theo cùng 1 kiểu
    y_pred = network.forward(X)
    eps = 1e-9
    if network.output_activation == "softmax":
        return -np.mean(np.sum(y_true * np.log(y_pred + eps), axis=-1))
    return -np.mean(y_true * np.log(y_pred + eps) + (1 - y_true) * np.log(1 - y_pred + eps))


def _numerical_gradient(network, X, y_true, layer_idx, param_name, index):
    layer = network.layers[layer_idx]
    param = getattr(layer, param_name)

    original_value = param[index]
    param[index] = original_value + EPSILON
    loss_plus = _total_loss(network, X, y_true)

    param[index] = original_value - EPSILON
    loss_minus = _total_loss(network, X, y_true)

    param[index] = original_value  # khôi phục nguyên trạng, tránh làm hỏng test khác
    return (loss_plus - loss_minus) / (2 * EPSILON)


def test_forward_output_shape_binary():
    network = _build_network("sigmoid")
    X = np.random.randn(5, 2)
    assert network.forward(X).shape == (5, 1)


def test_forward_output_shape_multiclass():
    network = _build_network("softmax")
    X = np.random.randn(5, 2)
    assert network.forward(X).shape == (5, 3)


def test_predict_matches_forward():
    network = _build_network("sigmoid")
    X = np.random.randn(3, 2)
    np.testing.assert_allclose(network.predict(X), network.forward(X))


def test_gradient_check_sigmoid_output():
    network = _build_network("sigmoid")
    X = np.random.randn(4, 2)
    y_true = np.random.randint(0, 2, size=(4, 1)).astype(float)

    network.forward(X)
    analytical_gradients = network.backward(y_true)

    checks = [(0, "W", (0, 0)), (0, "W", (1, 2)), (1, "W", (0, 0)), (0, "b", (0,))]
    for layer_idx, param_name, index in checks:
        numerical = _numerical_gradient(network, X, y_true, layer_idx, param_name, index)
        param_idx = 0 if param_name == "W" else 1
        analytical = analytical_gradients[layer_idx][param_idx][index]
        assert abs(numerical - analytical) < TOLERANCE


def test_gradient_check_softmax_output():
    network = _build_network("softmax")
    X = np.random.randn(4, 2)
    labels = np.random.randint(0, 3, size=4)
    y_true = np.eye(3)[labels]

    network.forward(X)
    analytical_gradients = network.backward(y_true)

    checks = [(0, "W", (0, 0)), (1, "W", (0, 1)), (1, "b", (2,))]
    for layer_idx, param_name, index in checks:
        numerical = _numerical_gradient(network, X, y_true, layer_idx, param_name, index)
        param_idx = 0 if param_name == "W" else 1
        analytical = analytical_gradients[layer_idx][param_idx][index]
        assert abs(numerical - analytical) < TOLERANCE
