import numpy as np

### Tính loss phục vụ cho việc hiển thị ###

_EPS = 1e-9

def mse_loss(y_pred, y_true):
    return np.mean((y_pred - y_true) ** 2)

def bce_loss(y_pred, y_true):
    return -np.mean(y_true * np.log(y_pred + _EPS) + (1 - y_true) * np.log(1 - y_pred + _EPS))

def ce_loss(y_pred, y_true):
    return -np.mean(np.sum(y_true * np.log(y_pred + _EPS), axis=-1))

### Tính đạo hàm cho layer cuối ###

def bce_ouput_grad(y_pred, y_true):
    n = y_pred.shape[0]
    return (y_pred - y_true) / n

def ce_output_grad(y_pred, y_true):
    n = y_pred.shape[0]
    return (y_pred - y_true) / n

def mse_output_grad(y_pred, y_true):
    n = y_pred.shape[0]
    return 2 * (y_pred - y_true) / n

