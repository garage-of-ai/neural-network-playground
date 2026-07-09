import numpy as np
from .activations import get_activation
from .initializers import get_initializer

class DenseLayer:
    def __init__(self, input_size, output_size, activation, weight_init):
        self.input_size = input_size
        self.output_size = output_size
        
        self.activation = activation
        self.activation_fn, self.activation_derivative_fn = get_activation(activation)

        init_fn = get_initializer(weight_init)
        self.W = init_fn(shape=(input_size, output_size))
        self.b = init_fn(shape=(output_size,))

        self._input_cache = None
        self._z_cache = None

    def forward(self, x):
        self._input_cache = x
        self._z_cache = x @ self.W + self.b
        return self.activation_fn(self._z_cache)

    def backward(self, dz):
        dW = self._input_cache.T @ dz
        db = np.sum(dz, axis=0)
        dx = dz @ self.W.T
        return dW, db, dx

    def apply_grad(self, dW, db, update_fn):
        self.W, self.b = update_fn(self.W, self.b, dW, db)