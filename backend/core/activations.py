import numpy as np

### Hàm activation và đạo hàm ###

def relu(z):
    pass

def relu_derivative(z):
    pass

def sigmoid(z):
    pass

def sigmoid_derivative(z):
    pass

def tanh(z):
    pass

def tanh_derivative(z):
    pass

def linear(z):
    pass

def linear_derivative(z):
    pass

def softmax(z):
    pass


### Registry ###

_ACTIVATIONS = {
    "relu": (relu, relu_derivative),
    "sigmoid": (sigmoid, sigmoid_derivative),
    "tanh": (tanh, tanh_derivative),
    "linear": (linear, linear_derivative),
    "softmax": (softmax, None)
}

def get_activation(name: str):
    pass