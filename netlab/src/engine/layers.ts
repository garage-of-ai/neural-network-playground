import { getActivation } from './activations'
import { getInitializer } from './initializers'
import { addBias, matmul, sumAxis0, transpose } from './matrix'
import type { ActivationFn, WeightInit } from '../types'

export class DenseLayer {
    inputSize: number
    outputSize: number
    activation: ActivationFn
    activationFn: (z: number[][]) => number[][]
    activationDerivativeFn: ((z: number[][]) => number[][]) | null

    W: number[][]
    b: number[]

    private inputCache: number[][] | null = null
    private zCache: number[][] | null = null

    constructor(inputSize: number, outputSize: number, activation: ActivationFn, weightInit: WeightInit) {
        this.inputSize = inputSize
        this.outputSize = outputSize
        this.activation = activation

        const [fn, derivativeFn] = getActivation(activation)
        this.activationFn = fn
        this.activationDerivativeFn = derivativeFn

        const init = getInitializer(weightInit)
        this.W = init(inputSize, outputSize)
        this.b = init(1, outputSize)[0]
    }

    forward(x: number[][]): number[][] {
        this.inputCache = x
        this.zCache = addBias(matmul(x, this.W), this.b)
        return this.activationFn(this.zCache)
    }

    get lastZ(): number[][] {
        if (!this.zCache) throw new Error('forward() must be called before backward()')
        return this.zCache
    }

    backward(dz: number[][]): { dW: number[][]; db: number[]; dx: number[][] } {
        if (!this.inputCache) throw new Error('forward() must be called before backward()')
        const dW = matmul(transpose(this.inputCache), dz)
        const db = sumAxis0(dz)
        const dx = matmul(dz, transpose(this.W))
        return { dW, db, dx }
    }

    applyGrad(dW: number[][], db: number[], updateFn: (W: number[][], b: number[], dW: number[][], db: number[]) => [number[][], number[]]): void {
        const [W, b] = updateFn(this.W, this.b, dW, db)
        this.W = W
        this.b = b
    }
}
