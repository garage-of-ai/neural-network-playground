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
        pass

    def backward(self, dz):
        pass

    def apply_grad(self, dW, db, update_fn):
        pass