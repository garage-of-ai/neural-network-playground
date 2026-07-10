import type { DenseLayer } from './layers'
import { bceOutputGrad, ceOutputGrad, mseOutputGrad } from './losses'
import { zipMatrix } from './matrix'
import type { ActivationFn } from '../types'

export class MLP {
    layers: DenseLayer[]
    private output: number[][] | null = null

    constructor(layers: DenseLayer[]) {
        this.layers = layers
    }

    get outputActivation(): ActivationFn {
        return this.layers[this.layers.length - 1].activation
    }

    forward(x: number[][]): number[][] {
        let out = x
        for (const layer of this.layers) out = layer.forward(out)
        this.output = out
        return out
    }

    backward(yTrue: number[][]): Array<{ dW: number[][]; db: number[] }> {
        if (!this.output) throw new Error('forward() must be called before backward()')
        const nLayers = this.layers.length
        const gradients: Array<{ dW: number[][]; db: number[] }> = new Array(nLayers)

        let dz: number[][]
        const outputActivation = this.outputActivation
        if (outputActivation === 'sigmoid') {
            dz = bceOutputGrad(this.output, yTrue)
        } else if (outputActivation === 'softmax') {
            dz = ceOutputGrad(this.output, yTrue)
        } else {
            const lastLayer = this.layers[nLayers - 1]
            const dLoss = mseOutputGrad(this.output, yTrue)
            dz = zipMatrix(dLoss, lastLayer.activationDerivativeFn!(lastLayer.lastZ), (a, b) => a * b)
        }

        for (let i = nLayers - 1; i >= 0; i--) {
            const { dW, db, dx } = this.layers[i].backward(dz)
            gradients[i] = { dW, db }
            if (i > 0) {
                const prevLayer = this.layers[i - 1]
                dz = zipMatrix(dx, prevLayer.activationDerivativeFn!(prevLayer.lastZ), (a, b) => a * b)
            }
        }

        return gradients
    }

    predict(x: number[][]): number[][] {
        return this.forward(x)
    }
}
