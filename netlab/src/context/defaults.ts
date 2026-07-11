import type { DatasetConfig, LayerConfig, TrainingConfig } from '../types'

let nextLayerId = 0
export const makeLayerId = () => `layer-${nextLayerId++}`


export const DEFAULT_ARCHITECTURE: LayerConfig[] = [
    { id: makeLayerId(), units: 2, kind: 'input' },
    { id: makeLayerId(), units: 4, kind: 'hidden', activation: 'sigmoid' },
    { id: makeLayerId(), units: 4, kind: 'hidden', activation: 'sigmoid' },
    { id: makeLayerId(), units: 1, kind: 'output', activation: 'sigmoid' },
]

export const DEFAULT_DATASET_CONFIG: DatasetConfig = { kind: 'circle', trainSplit: 80, noise: 10 }

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
    optimizer: 'adam',
    learningRate: 0.03,
    batchSize: 16,
    epochs: 200,
    weightInit: 'uniform',
}
