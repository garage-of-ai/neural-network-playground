import numpy as np

def zeros_init(shape):
    return np.zeros(shape)

def uniform_init(shape, low = -1.0, high = 1.0):
    return np.random.uniform(low, high, size=shape)

def gaussian_init(shape, mean = 0.0, std = 1.0):
    return np.random.normal(mean, std, size=shape)

_INITIALIZERS = {
    "zeros": zeros_init,
    "uniform": uniform_init,
    "gaussian": gaussian_init
}

def get_initializer(name):
    if name not in _INITIALIZERS:
        raise ValueError(f"Unknown initializer: {name}")
    return _INITIALIZERS[name]