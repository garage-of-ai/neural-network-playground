export type DatasetKind = 'circle' | 'xor' | 'gauss' | 'spiral' | 'moons' | 'blobs3'

export interface DatasetConfig {
    kind: DatasetKind
    trainSplit: number // % dữ liệu dùng để train, 50-95
    noise: number // 0-50
}

export type ActivationFn = 'relu' | 'tanh' | 'sigmoid' | 'linear' | 'softmax'
export type LayerKind = 'input' | 'hidden' | 'output'

export interface LayerConfig {
    id: string
    units: number
    kind: LayerKind
    label: string
    activation?: ActivationFn
}

export type WeightMatrix = number[][] // weights[fromUnit][toUnit]
export type NetworkWeights = WeightMatrix[] // 1 phần tử cho mỗi khoảng cách giữa 2 layer liên tiếp

export type Optimizer = 'sgd' | 'sgd-momentum' | 'adam'
export type WeightInit = 'zeros' | 'uniform' | 'gaussian'

export interface TrainingConfig {
    optimizer: Optimizer
    learningRate: number
    batchSize: number
    epochs: number
    weightInit: WeightInit
}
