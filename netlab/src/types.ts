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

/** Điểm dữ liệu dạng [x, y, label] */
export type DatasetPoint = [number, number, number]

/** Message gửi vào TrainingEngine (nội bộ, không còn qua mạng) */
export type ClientMessage =
    | { type: 'session_init'; architecture: LayerConfig[]; trainingConfig: TrainingConfig; datasetConfig: DatasetConfig }
    | { type: 'update_architecture'; architecture: LayerConfig[] }
    | { type: 'update_dataset'; datasetConfig: DatasetConfig }
    | { type: 'update_training_config'; trainingConfig: TrainingConfig }
    | { type: 'step' }
    | { type: 'run_epoch' }
    | { type: 'reset' }

export interface StateUpdateMessage {
    type: 'state_update'
    epoch: number
    weights: NetworkWeights
    loss: number
    accuracy: number
    weightsReset: boolean
}

export interface DatasetPointsMessage {
    type: 'dataset_points'
    train: DatasetPoint[]
    test: DatasetPoint[]
}

export interface PredictionGridMessage {
    type: 'prediction_grid'
    resolution: number
    grid: number[][]
}

export interface ErrorMessage {
    type: 'error'
    message: string
    code: string
}

/** Message TrainingEngine phát ra để các context lắng nghe */
export type ServerMessage = StateUpdateMessage | DatasetPointsMessage | PredictionGridMessage | ErrorMessage
