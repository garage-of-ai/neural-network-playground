import { mapMatrix, mapVector, zeros, zipMatrix, zipVector } from './matrix'
import type { Optimizer } from '../types'

type UpdateFn = (W: number[][], b: number[], dW: number[][], db: number[]) => [number[][], number[]]

export class SGD {
    private lr: number

    constructor(lr: number) {
        this.lr = lr
    }

    getUpdateFnForLayer(_layerIdx: number): UpdateFn {
        return (W, b, dW, db) => [
            zipMatrix(W, dW, (w, d) => w - this.lr * d),
            zipVector(b, db, (bi, d) => bi - this.lr * d),
        ]
    }
}

export class SGDMomentum {
    private lr: number
    private momentum: number
    private vW = new Map<number, number[][]>()
    private vB = new Map<number, number[]>()

    constructor(lr: number, momentum = 0.9) {
        this.lr = lr
        this.momentum = momentum
    }

    getUpdateFnForLayer(layerIdx: number): UpdateFn {
        return (W, b, dW, db) => {
            const prevVW = this.vW.get(layerIdx)
            const prevVB = this.vB.get(layerIdx)
            // matches numpy's `momentum * 0.0 + dW` on the first call for this layer
            const vW = prevVW ? zipMatrix(prevVW, dW, (v, d) => this.momentum * v + d) : mapMatrix(dW, (d) => d)
            const vB = prevVB ? zipVector(prevVB, db, (v, d) => this.momentum * v + d) : mapVector(db, (d) => d)
            this.vW.set(layerIdx, vW)
            this.vB.set(layerIdx, vB)
            return [zipMatrix(W, vW, (w, v) => w - this.lr * v), zipVector(b, vB, (bi, v) => bi - this.lr * v)]
        }
    }
}

interface AdamState {
    mW: number[][]
    vW: number[][]
    mB: number[]
    vB: number[]
    t: number
}

export class Adam {
    private lr: number
    private beta1: number
    private beta2: number
    private eps: number
    private state = new Map<number, AdamState>()

    constructor(lr: number, beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
        this.lr = lr
        this.beta1 = beta1
        this.beta2 = beta2
        this.eps = eps
    }

    getUpdateFnForLayer(layerIdx: number): UpdateFn {
        return (W, b, dW, db) => {
            let s = this.state.get(layerIdx)
            if (!s) {
                s = { mW: zeros(dW.length, dW[0].length), vW: zeros(dW.length, dW[0].length), mB: db.map(() => 0), vB: db.map(() => 0), t: 0 }
            }
            s.t += 1
            const t = s.t
            s.mW = zipMatrix(s.mW, dW, (m, d) => this.beta1 * m + (1 - this.beta1) * d)
            s.vW = zipMatrix(s.vW, dW, (v, d) => this.beta2 * v + (1 - this.beta2) * d * d)
            s.mB = zipVector(s.mB, db, (m, d) => this.beta1 * m + (1 - this.beta1) * d)
            s.vB = zipVector(s.vB, db, (v, d) => this.beta2 * v + (1 - this.beta2) * d * d)
            this.state.set(layerIdx, s)

            const mHatW = mapMatrix(s.mW, (m) => m / (1 - this.beta1 ** t))
            const vHatW = mapMatrix(s.vW, (v) => v / (1 - this.beta2 ** t))
            const mHatB = mapVector(s.mB, (m) => m / (1 - this.beta1 ** t))
            const vHatB = mapVector(s.vB, (v) => v / (1 - this.beta2 ** t))

            const updateW = zipMatrix(mHatW, vHatW, (m, v) => m / (Math.sqrt(v) + this.eps))
            const updateB = zipVector(mHatB, vHatB, (m, v) => m / (Math.sqrt(v) + this.eps))

            return [zipMatrix(W, updateW, (w, u) => w - this.lr * u), zipVector(b, updateB, (bi, u) => bi - this.lr * u)]
        }
    }
}

export type OptimizerInstance = SGD | SGDMomentum | Adam

const OPTIMIZERS: Record<Optimizer, new (lr: number) => OptimizerInstance> = {
    sgd: SGD,
    'sgd-momentum': SGDMomentum,
    adam: Adam,
}

export function getOptimizer(name: Optimizer, lr: number): OptimizerInstance {
    const Ctor = OPTIMIZERS[name]
    if (!Ctor) throw new Error(`Unknown optimizer: ${name}`)
    return new Ctor(lr)
}
