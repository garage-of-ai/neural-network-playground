import numpy as np
from .layers import DenseLayer
from . import losses

class MLP:
    def __init__(self, layers: list[DenseLayer]):
        self.layers = layers
    
    @property
    def output_activation(self) -> str:
        pass

    def forward(self, x):
        pass

    def backward(self, y_true):
        pass

    def predict(self, x):
        pass