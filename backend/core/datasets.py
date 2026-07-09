import numpy as np

AVAILABLE_KINDS = ["circle", "xor", "gauss", "spiral", "moons", "blobs3"]

N_SAMPLES = 200


### Hàm tạo các dataset ###
def _make_circle(noise):
    pass

def _make_xor(noise):
    pass

def _make_gauss(noise):
    pass

def _make_spiral(noise):
    pass

def _make_moons(noise):
    pass

def _make_blobs3(noise):
    pass

### Registry ###

_GENERATORS = {
    "circle": _make_circle,
    "xor": _make_xor,
    "gauss": _make_gauss,
    "spiral": _make_spiral,
    "moons": _make_moons,
    "blobs3": _make_blobs3
}

def generate_dataset(kind, noise):
    pass