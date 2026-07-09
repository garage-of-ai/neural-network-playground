import numpy as np
from core import losses
from .network_factory import build_network, build_optimizer
from .dataset_service import build_dataset

RESOLUTION = 40
GRID_RANGE = 6

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
        self.architecture = architecture
        self.training_config = training_config
        self.dataset = build_dataset(dataset_config)
        self._rebuild_network_and_optimizer()
        self.epoch = 0
        self._batch_cursor = 0

    def rebuild_network(self, architecture):
        self.architecture = architecture
        self._rebuild_network_and_optimizer()
        self.epoch = 0
        self._batch_cursor = 0

    def rebuild_dataset(self, dataset_config):
        self.dataset = build_dataset(dataset_config)
        self._batch_cursor = 0

    def update_training_config(self, training_config):
        needs_new_optimizer = (
            self.training_config is None
            or training_config.optimizer != self.training_config.optimizer
            or training_config.learningRate != self.training_config.learningRate
        )
        self.training_config = training_config
        if needs_new_optimizer:
            self.optimizer = build_optimizer(training_config.optimizer, training_config.learningRate)
            self._update_fns = [
                self.optimizer.get_update_fn_for_layer(i) for i in range(len(self.network.layers))
            ]

    def step(self):
        X_batch, y_batch_raw, epoch_done = self._next_batch()
        y_batch = self._prepare_targets(y_batch_raw)

        self.network.forward(X_batch)
        gradients = self.network.backward(y_batch)
        for i, layer in enumerate(self.network.layers):
            dW, db = gradients[i]
            layer.apply_grad(dW, db, self._update_fns[i])

        if epoch_done:
            self.epoch += 1

        loss, accuracy = self._compute_metrics()
        return {"epoch": self.epoch, "loss": loss, "accuracy": accuracy}

    def run_epoch(self):
        start_epoch = self.epoch
        result = self.step()
        while self.epoch == start_epoch:
            result = self.step()
        return result

    def reset(self):
        self._rebuild_network_and_optimizer()
        self.epoch = 0
        self._batch_cursor = 0

    def predict_grid(self, resolution = RESOLUTION):
        axis = np.linspace(-GRID_RANGE, GRID_RANGE, resolution)
        xx, yy = np.meshgrid(axis, axis)
        grid_points = np.stack([xx.ravel(), yy.ravel()], axis=1)

        y_pred = self.network.forward(grid_points)
        if self.network.output_activation == "softmax":
            values = np.argmax(y_pred, axis=-1).astype(float)
        else:
            values = y_pred[:, 0]

        return values.reshape(resolution, resolution).tolist()

    def get_weights(self):
        return [layer.W.tolist() for layer in self.network.layers]

    def _next_batch(self):
        X, y = self.dataset.X_train, self.dataset.y_train
        batch_size = self.training_config.batchSize

        start = self._batch_cursor
        end = start + batch_size
        X_batch, y_batch = X[start:end], y[start:end]

        self._batch_cursor = end
        epoch_done = self._batch_cursor >= len(X)
        if epoch_done:
            self._batch_cursor = 0

        return X_batch, y_batch, epoch_done

    def _prepare_targets(self, y):
        if self.network.output_activation == "softmax":
            num_classes = self.network.layers[-1].output_size
            return np.eye(num_classes)[y.astype(int)]
        return y.reshape(-1, 1).astype(float)

    def _compute_metrics(self):
        X, y = self.dataset.X_train, self.dataset.y_train
        y_true = self._prepare_targets(y)
        y_pred = self.network.forward(X)

        output_activation = self.network.output_activation
        if output_activation == "sigmoid":
            loss = losses.bce_loss(y_pred, y_true)
            accuracy = float(np.mean((y_pred > 0.5).astype(float) == y_true))
        elif output_activation == "softmax":
            loss = losses.ce_loss(y_pred, y_true)
            accuracy = float(np.mean(np.argmax(y_pred, axis=-1) == np.argmax(y_true, axis=-1)))
        else:
            loss = losses.mse_loss(y_pred, y_true)
            accuracy = 0.0

        return float(loss), accuracy

    def _rebuild_network_and_optimizer(self):
        self.network = build_network(self.architecture, self.training_config.weightInit)
        self.optimizer = build_optimizer(self.training_config.optimizer, self.training_config.learningRate)
        self._update_fns = [
            self.optimizer.get_update_fn_for_layer(i) for i in range(len(self.network.layers))
        ]