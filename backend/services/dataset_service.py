from dataclasses import dataclass
import numpy as np
from core.datasets import generate_dataset, AVAILABLE_KINDS

@dataclass
class DatasetBundle:
    X_train: np.ndarray
    y_train: np.ndarray
    X_test: np.ndarray
    y_test: np.ndarray
    train_points: list
    test_points: list

def _to_points(X, y) -> list:
    return [[float(px), float(py), float(label)] for (px, py), label in zip(X, y)]

def build_dataset(dataset_config):
    X, y = generate_dataset(dataset_config.kind, dataset_config.noise)

    n_train = int(len(X) * dataset_config.trainSplit / 100)
    X_train, y_train = X[:n_train], y[:n_train]
    X_test, y_test = X[n_train:], y[n_train:]

    return DatasetBundle(
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test,
        train_points=_to_points(X_train, y_train),
        test_points=_to_points(X_test, y_test),
    )

def list_available_kinds() -> list[dict]:
    return [{"kind": kind} for kind in AVAILABLE_KINDS]