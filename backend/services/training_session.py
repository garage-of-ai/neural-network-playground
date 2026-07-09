import numpy as np
from .network_factory import build_network, build_optimizer
from .dataset_service import build_dataset

RESOLUTION = 40

class TrainingSession:
    def __init__(self):
        self.network = None
        self.optimizer = None
        self.dataset = None
        self.architecture = None
        self.training_config = None
        self.epoch = 0
        self._batch_cursor = 0

    def init_session(self, architecture, training_config, dataset_config):
        pass

    def rebuild_network(self, architecture):
        pass

    def rebuild_dataset(self, dataset_config):
        pass

    def update_training_config(self, training_config):
        pass

    def step(self):
        pass

    def run_epoch(self):
        pass

    def reset(self):
        pass

    def predict_grid(self, resolution = RESOLUTION):
        pass

    def get_weights(self):
        pass

    def _next_batch(self):
        pass