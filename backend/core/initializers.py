import numpy as np

def zeros_init(shape):
    pass

def uniform_init(shape, low = -1.0, high = 1.0):
    pass

def gaussian_init(shape, mean = 0.0, std = 1.0):
    pass

_INITIALIZERS = {
    "zeros": zeros_init,
    "uniform": uniform_init,
    "gaussian": gaussian_init
}

def get_initializer(name):
    pass