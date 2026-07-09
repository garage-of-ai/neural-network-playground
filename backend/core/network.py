import numpy as np
from .layers import DenseLayer
from . import losses

class MLP:
    def __init__(self, layers: list[DenseLayer]):
        self.layers = layers
    
    @property
    def output_activation(self) -> str:
        return self.layers[-1].activation

    def forward(self, x):
        for layer in self.layers:
            x = layer.forward(x)
        self._output = x
        return x

    def backward(self, y_true):
        n_layers = len(self.layers)
        gradients = [None] * n_layers

        if self.output_activation == "sigmoid":
            dz = losses.bce_ouput_grad(self._output, y_true)
        elif self.output_activation == "softmax":
            dz = losses.ce_output_grad(self._output, y_true)
        else:
            last_layer = self.layers[-1]
            d_loss = losses.mse_output_grad(self._output, y_true)
            dz = d_loss * last_layer.activation_derivative_fn(last_layer._z_cache)

        for i in reversed(range(n_layers)):
            dW, db, dx = self.layers[i].backward(dz)
            gradients[i] = (dW, db)
            if i > 0:
                prev_layer = self.layers[i - 1]
                dz = dx * prev_layer.activation_derivative_fn(prev_layer._z_cache)

        return gradients

    def predict(self, x):
        return self.forward(x)