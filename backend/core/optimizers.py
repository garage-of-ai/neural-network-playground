import numpy as np

class SGD:
    def __init__(self, lr):
        self.lr = lr

    def get_update_fn_for_layer(self, layer_idx):
        def update_fn(W, b, dW, db):
            return W - self.lr * dW, b - self.lr * db
        return update_fn

class SGDMomentum:
    def __init__(self, lr, momentum=0.9):
        self.lr = lr
        self.momentum = momentum
        self._v_W = {}
        self._v_b = {}

    def get_update_fn_for_layer(self, layer_idx):
        self._v_W.setdefault(layer_idx, 0.0)
        self._v_b.setdefault(layer_idx, 0.0)

        def update_fn(W, b, dW, db):
            self._v_W[layer_idx] = self.momentum * self._v_W[layer_idx] + dW
            self._v_b[layer_idx] = self.momentum * self._v_b[layer_idx] + db
            return W - self.lr * self._v_W[layer_idx], b - self.lr * self._v_b[layer_idx]
        return update_fn

class Adam:
    def __init__(self, lr, beta1=0.9, beta2=0.999, eps=1e-8):
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps

        self._m_W = {}
        self._v_W = {}
        self._m_b = {}
        self._v_b = {}
        self._t = {}

    def get_update_fn_for_layer(self, layer_idx):
        self._m_W.setdefault(layer_idx, 0.0)
        self._v_W.setdefault(layer_idx, 0.0)
        self._m_b.setdefault(layer_idx, 0.0)
        self._v_b.setdefault(layer_idx, 0.0)
        self._t.setdefault(layer_idx, 0)

        def update_fn(W, b, dW, db):
            self._t[layer_idx] += 1
            t = self._t[layer_idx]

            self._m_W[layer_idx] = self.beta1 * self._m_W[layer_idx] + (1 - self.beta1) * dW
            self._v_W[layer_idx] = self.beta2 * self._v_W[layer_idx] + (1 - self.beta2) * (dW ** 2)
            self._m_b[layer_idx] = self.beta1 * self._m_b[layer_idx] + (1 - self.beta1) * db
            self._v_b[layer_idx] = self.beta2 * self._v_b[layer_idx] + (1 - self.beta2) * (db ** 2)

            m_hat_W = self._m_W[layer_idx] / (1 - self.beta1 ** t)
            v_hat_W = self._v_W[layer_idx] / (1 - self.beta2 ** t)
            m_hat_b = self._m_b[layer_idx] / (1 - self.beta1 ** t)
            v_hat_b = self._v_b[layer_idx] / (1 - self.beta2 ** t)

            W_new = W - self.lr * m_hat_W / (np.sqrt(v_hat_W) + self.eps)
            b_new = b - self.lr * m_hat_b / (np.sqrt(v_hat_b) + self.eps)
            return W_new, b_new
        return update_fn

### Registry ###

_OPTIMIZERS = {
    "sgd": SGD,
    "sgd-momentum": SGDMomentum,
    "adam": Adam
}

def get_optimizer(name, lr):
    if name not in _OPTIMIZERS:
        raise ValueError(f"Unknown optimizer: {name}")
    return _OPTIMIZERS[name](lr)