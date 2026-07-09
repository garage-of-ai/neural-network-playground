import numpy as np

class SGD:
    def __init__(self, lr):
        self.lr = lr

    def get_update_fn_for_layer(self, layer_idx):
        pass

class SGDMomentum:
    def __init__(self, lr, momentum=0.9):
        self.lr = lr
        self.momentum = momentum
        self._v_W = {}
        self._v_b = {}

    def get_update_fn_for_layer(self, layer_idx):
        pass

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
        pass

### Registry ###

_OPTIMIZERS = {
    "sgd": SGD,
    "sgd-momentum": SGDMomentum,
    "adam": Adam
}

def get_optimizer(name, lr):
    pass