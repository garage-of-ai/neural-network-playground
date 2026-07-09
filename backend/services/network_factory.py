from core.layers import DenseLayer
from core.network import MLP
from core.optimizers import get_optimizer

def build_network(architecture: list, weight_init: str):
    layers = []
    for prev_layer, layer in zip(architecture, architecture[1:]):
        layers.append(DenseLayer(
            input_size=prev_layer.units,
            output_size=layer.units,
            activation=layer.activation,
            weight_init=weight_init,
        ))
    return MLP(layers)

def build_optimizer(optimizer_name: str, lr: float):
    return get_optimizer(optimizer_name, lr)