import { DenseLayer } from './layers'
import { MLP } from './network'
import { getOptimizer, type OptimizerInstance } from './optimizers'
import type { LayerConfig, Optimizer, WeightInit } from '../types'

export function buildNetwork(architecture: LayerConfig[], weightInit: WeightInit): MLP {
    const layers: DenseLayer[] = []
    for (let i = 0; i < architecture.length - 1; i++) {
        const prevLayer = architecture[i]
        const layer = architecture[i + 1]
        if (!layer.activation) throw new Error(`Layer ${layer.id} is missing an activation`)
        layers.push(new DenseLayer(prevLayer.units, layer.units, layer.activation, weightInit))
    }
    return new MLP(layers)
}

export function buildOptimizer(name: Optimizer, lr: number): OptimizerInstance {
    return getOptimizer(name, lr)
}
