import { mapMatrix } from './matrix'
import type { ActivationFn } from '../types'

// z shape: [batch][units]

export function relu(z: number[][]): number[][] {
    return mapMatrix(z, (v) => Math.max(0, v))
}

export function reluDerivative(z: number[][]): number[][] {
    return mapMatrix(z, (v) => (v > 0 ? 1 : 0))
}

// piecewise form avoids overflow for large |z|, matches core/activations.py
export function sigmoid(z: number[][]): number[][] {
    return mapMatrix(z, (v) => (v >= 0 ? 1 / (1 + Math.exp(-v)) : Math.exp(v) / (1 + Math.exp(v))))
}

export function sigmoidDerivative(z: number[][]): number[][] {
    const s = sigmoid(z)
    return mapMatrix(s, (v) => v * (1 - v))
}

export function tanhActivation(z: number[][]): number[][] {
    return mapMatrix(z, (v) => Math.tanh(v))
}

export function tanhDerivative(z: number[][]): number[][] {
    return mapMatrix(z, (v) => 1 - Math.tanh(v) ** 2)
}

export function linear(z: number[][]): number[][] {
    return z
}

export function linearDerivative(z: number[][]): number[][] {
    return mapMatrix(z, () => 1)
}

export function softmax(z: number[][]): number[][] {
    return z.map((row) => {
        const max = Math.max(...row)
        const exp = row.map((v) => Math.exp(v - max))
        const sum = exp.reduce((a, b) => a + b, 0)
        return exp.map((v) => v / sum)
    })
}

type ActivationPair = [(z: number[][]) => number[][], ((z: number[][]) => number[][]) | null]

const ACTIVATIONS: Record<ActivationFn, ActivationPair> = {
    relu: [relu, reluDerivative],
    sigmoid: [sigmoid, sigmoidDerivative],
    tanh: [tanhActivation, tanhDerivative],
    linear: [linear, linearDerivative],
    softmax: [softmax, null],
}

export function getActivation(name: ActivationFn): ActivationPair {
    const pair = ACTIVATIONS[name]
    if (!pair) throw new Error(`Unknown activation: ${name}`)
    return pair
}
