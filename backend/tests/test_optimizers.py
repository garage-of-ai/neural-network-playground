import numpy as np
import pytest
from core.optimizers import SGD, SGDMomentum, Adam, get_optimizer


def test_sgd_moves_weight_in_negative_gradient_direction():
    optimizer = SGD(learning_rate=0.1)
    update_fn = optimizer.get_update_fn_for_layer(0)

    W = np.array([[1.0, 2.0]])
    b = np.array([0.5])
    dW = np.array([[1.0, 1.0]])
    db = np.array([1.0])

    W_new, b_new = update_fn(W, b, dW, db)
    np.testing.assert_allclose(W_new, W - 0.1 * dW)
    np.testing.assert_allclose(b_new, b - 0.1 * db)


def test_sgd_momentum_accumulates_velocity():
    optimizer = SGDMomentum(learning_rate=0.1, momentum=0.9)
    update_fn = optimizer.get_update_fn_for_layer(0)

    W = np.array([[1.0]])
    b = np.array([0.0])
    dW = np.array([[1.0]])
    db = np.array([0.0])

    W_after_1, _ = update_fn(W, b, dW, db)
    step_1_delta = W[0, 0] - W_after_1[0, 0]

    W_after_2, _ = update_fn(W_after_1, b, dW, db)
    step_2_delta = W_after_1[0, 0] - W_after_2[0, 0]

    # velocity cộng dồn theo momentum => bước sau phải dịch xa hơn bước đầu
    assert step_2_delta > step_1_delta


def test_adam_first_step_matches_manual_bias_correction():
    optimizer = Adam(learning_rate=0.1, beta1=0.9, beta2=0.999, eps=1e-8)
    update_fn = optimizer.get_update_fn_for_layer(0)

    W = np.array([[1.0]])
    b = np.array([0.0])
    dW = np.array([[2.0]])
    db = np.array([0.0])

    W_new, _ = update_fn(W, b, dW, db)

    # Ở bước t=1, bias-correction triệt tiêu hoàn toàn phần "chưa tích lũy":
    # m_hat = dW, v_hat = dW**2 (xem lại công thức Adam đã bàn ở phần optimizers.py)
    m_hat = dW
    v_hat = dW ** 2
    expected_W = W - 0.1 * m_hat / (np.sqrt(v_hat) + 1e-8)

    np.testing.assert_allclose(W_new, expected_W, atol=1e-6)


def test_different_layers_have_independent_state():
    optimizer = SGDMomentum(learning_rate=0.1, momentum=0.9)
    update_fn_layer0 = optimizer.get_update_fn_for_layer(0)
    update_fn_layer1 = optimizer.get_update_fn_for_layer(1)

    dW = np.array([[1.0]])
    db = np.array([0.0])

    # Cập nhật layer 0 ba lần để velocity của nó tích lũy lớn
    W0, b0 = np.array([[1.0]]), np.array([0.0])
    for _ in range(3):
        W0, b0 = update_fn_layer0(W0, b0, dW, db)

    # Lần cập nhật ĐẦU TIÊN của layer 1 phải giống hệt "bước đầu tiên" của
    # SGD thường (velocity = 0), KHÔNG được lây velocity đã tích lũy của layer 0
    W1_first, _ = update_fn_layer1(np.array([[1.0]]), np.array([0.0]), dW, db)
    expected_first_step = np.array([[1.0]]) - 0.1 * dW
    np.testing.assert_allclose(W1_first, expected_first_step)


def test_get_optimizer_dispatches_correct_class():
    assert isinstance(get_optimizer("sgd", 0.1), SGD)
    assert isinstance(get_optimizer("sgd-momentum", 0.1), SGDMomentum)
    assert isinstance(get_optimizer("adam", 0.1), Adam)


def test_get_optimizer_unknown_raises():
    with pytest.raises(ValueError):
        get_optimizer("not_a_real_optimizer", 0.1)
