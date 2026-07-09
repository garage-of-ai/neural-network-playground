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

def build_dataset(dataset_config):
    pass

def list_available_kinds() -> list[dict]:
    pass