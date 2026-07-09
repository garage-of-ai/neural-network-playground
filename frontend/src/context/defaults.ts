import type { DatasetConfig, LayerConfig, TrainingConfig } from '../types'

let nextLayerId = 0
export const makeLayerId = () => `layer-${nextLayerId++}`

// Cùng 1 bộ giá trị mặc định được dùng cho state khởi tạo ở client (trước khi
// WS kết nối xong) VÀ cho message session_init gửi lên server, để 2 bên không
// bao giờ lệch nhau ở lần render đầu tiên (xem PLAN.API.md mục 1.1)
export const DEFAULT_ARCHITECTURE: LayerConfig[] = [
    { id: makeLayerId(), units: 2, kind: 'input', label: 'Input' },
    { id: makeLayerId(), units: 4, kind: 'hidden', label: 'Hidden Layer', activation: 'relu' },
    { id: makeLayerId(), units: 4, kind: 'hidden', label: 'Hidden Layer', activation: 'tanh' },
    { id: makeLayerId(), units: 1, kind: 'output', label: 'Output', activation: 'sigmoid' },
]

export const DEFAULT_DATASET_CONFIG: DatasetConfig = { kind: 'circle', trainSplit: 80, noise: 10 }

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
    optimizer: 'adam',
    learningRate: 0.03,
    batchSize: 16,
    epochs: 200,
    weightInit: 'uniform',
}
