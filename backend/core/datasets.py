import numpy as np

AVAILABLE_KINDS = ["circle", "xor", "gauss", "spiral", "moons", "blobs3"]

N_SAMPLES = 200


def _split_counts(total, parts):
    base = total // parts
    counts = [base] * parts
    counts[-1] += total - base * parts
    return counts


def _shuffle(X, y):
    perm = np.random.permutation(len(y))
    return X[perm], y[perm]


### Hàm tạo các dataset ###
def _make_circle(noise):
    noise_scale = noise / 100
    n0, n1 = _split_counts(N_SAMPLES, 2)

    def gen_ring(r_low, r_high, count, label):
        r = np.random.uniform(r_low, r_high, count)
        angle = np.random.uniform(0, 2 * np.pi, count)
        x = r * np.cos(angle) + np.random.normal(0, noise_scale, count)
        y = r * np.sin(angle) + np.random.normal(0, noise_scale, count)
        return x, y, np.full(count, label)

    x0, y0, l0 = gen_ring(0, 2, n0, 0)
    x1, y1, l1 = gen_ring(3, 5, n1, 1)
    X = np.stack([np.concatenate([x0, x1]), np.concatenate([y0, y1])], axis=1)
    y = np.concatenate([l0, l1])
    return _shuffle(X, y)


def _make_xor(noise):
    noise_scale = noise / 100
    x = np.random.uniform(-5, 5, N_SAMPLES)
    yv = np.random.uniform(-5, 5, N_SAMPLES)
    x = x + np.sign(x) * np.random.normal(0, noise_scale, N_SAMPLES)
    yv = yv + np.sign(yv) * np.random.normal(0, noise_scale, N_SAMPLES)
    label = (x * yv >= 0).astype(int)
    X = np.stack([x, yv], axis=1)
    return X, label


def _make_gauss(noise):
    std = 1.0 + noise / 20
    n0, n1 = _split_counts(N_SAMPLES, 2)
    c0 = np.random.normal(loc=[2.0, 2.0], scale=std, size=(n0, 2))
    c1 = np.random.normal(loc=[-2.0, -2.0], scale=std, size=(n1, 2))
    X = np.concatenate([c0, c1])
    y = np.concatenate([np.zeros(n0), np.ones(n1)]).astype(int)
    return _shuffle(X, y)


def _make_spiral(noise):
    noise_scale = noise / 100
    n0, n1 = _split_counts(N_SAMPLES, 2)

    def gen_spiral(delta_t, count, label):
        i = np.arange(count)
        r = i / count * 5
        t = 1.75 * i / count * 2 * np.pi + delta_t
        x = r * np.sin(t) + np.random.normal(0, noise_scale, count)
        y = r * np.cos(t) + np.random.normal(0, noise_scale, count)
        return x, y, np.full(count, label)

    x0, y0, l0 = gen_spiral(0, n0, 0)
    x1, y1, l1 = gen_spiral(np.pi, n1, 1)
    X = np.stack([np.concatenate([x0, x1]), np.concatenate([y0, y1])], axis=1)
    y = np.concatenate([l0, l1])
    return _shuffle(X, y)


def _make_moons(noise):
    noise_scale = noise / 100
    n0, n1 = _split_counts(N_SAMPLES, 2)

    outer_t = np.linspace(0, np.pi, n0)
    inner_t = np.linspace(0, np.pi, n1)

    x0 = np.cos(outer_t) + np.random.normal(0, noise_scale, n0)
    y0 = np.sin(outer_t) + np.random.normal(0, noise_scale, n0)
    x1 = 1 - np.cos(inner_t) + np.random.normal(0, noise_scale, n1)
    y1 = 1 - np.sin(inner_t) - 0.5 + np.random.normal(0, noise_scale, n1)

    X = np.stack([np.concatenate([x0, x1]), np.concatenate([y0, y1])], axis=1)
    y = np.concatenate([np.zeros(n0), np.ones(n1)]).astype(int)
    return _shuffle(X, y)


def _make_blobs3(noise):
    std = 0.5 + noise / 50
    centers = [(3.0, 3.0), (-3.0, 3.0), (0.0, -3.0)]
    counts = _split_counts(N_SAMPLES, 3)

    Xs, ys = [], []
    for label, (cx, cy), count in zip(range(3), centers, counts):
        Xs.append(np.random.normal(loc=[cx, cy], scale=std, size=(count, 2)))
        ys.append(np.full(count, label))

    X = np.concatenate(Xs)
    y = np.concatenate(ys)
    return _shuffle(X, y)

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
    if kind not in _GENERATORS:
        raise ValueError(f"Unknown dataset kind: {kind}")
    return _GENERATORS[kind](noise)