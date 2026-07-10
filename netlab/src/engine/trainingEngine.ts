import { buildDataset, type DatasetBundle } from './datasetService'
import * as losses from './losses'
import { argmaxIndex } from './matrix'
import type { MLP } from './network'
import { buildNetwork, buildOptimizer } from './networkFactory'
import type { OptimizerInstance } from './optimizers'
import type {
    DatasetConfig,
    DatasetPointsMessage,
    LayerConfig,
    NetworkWeights,
    PredictionGridMessage,
    StateUpdateMessage,
    TrainingConfig,
} from '../types'

const RESOLUTION = 240
const GRID_RANGE = 6

type UpdateFn = (W: number[][], b: number[], dW: number[][], db: number[]) => [number[][], number[]]

function oneHot(numClasses: number, label: number): number[] {
    return Array.from({ length: numClasses }, (_, i) => (i === label ? 1 : 0))
}

export class TrainingEngine {
    private network: MLP | null = null
    private optimizer: OptimizerInstance | null = null
    private dataset: DatasetBundle | null = null
    private architecture: LayerConfig[] | null = null
    private trainingConfig: TrainingConfig | null = null
    private updateFns: UpdateFn[] = []
    private epoch = 0
    private batchCursor = 0

    initSession(architecture: LayerConfig[], trainingConfig: TrainingConfig, datasetConfig: DatasetConfig) {
        this.architecture = architecture
        this.trainingConfig = trainingConfig
        this.dataset = buildDataset(datasetConfig)
        this.rebuildNetworkAndOptimizer()
        this.epoch = 0
        this.batchCursor = 0

        return {
            datasetPoints: this.buildDatasetPoints(),
            stateUpdate: this.buildStateUpdate(true),
            predictionGrid: this.buildPredictionGrid(),
        }
    }

    rebuildNetwork(architecture: LayerConfig[]) {
        this.architecture = architecture
        this.rebuildNetworkAndOptimizer()
        this.epoch = 0
        this.batchCursor = 0

        return { stateUpdate: this.buildStateUpdate(true), predictionGrid: this.buildPredictionGrid() }
    }

    rebuildDataset(datasetConfig: DatasetConfig) {
        this.dataset = buildDataset(datasetConfig)
        this.batchCursor = 0

        return { datasetPoints: this.buildDatasetPoints(), predictionGrid: this.buildPredictionGrid() }
    }

    updateTrainingConfig(trainingConfig: TrainingConfig) {
        const weightInitChanged = this.trainingConfig !== null && trainingConfig.weightInit !== this.trainingConfig.weightInit
        const needsNewOptimizer =
            this.trainingConfig === null ||
            trainingConfig.optimizer !== this.trainingConfig.optimizer ||
            trainingConfig.learningRate !== this.trainingConfig.learningRate

        this.trainingConfig = trainingConfig

        // đổi cách khởi tạo trọng số chỉ áp dụng ngay khi mạng chưa chạy bước nào
        // kể từ lần reset gần nhất — nếu đang huấn luyện dở, giá trị mới chỉ được
        // lưu lại, đợi tới lần reset kế tiếp mới thực sự áp dụng (mirrors training_session.py)
        const isUntrained = this.epoch === 0 && this.batchCursor === 0
        if (weightInitChanged && isUntrained) {
            this.rebuildNetworkAndOptimizer()
            return { weightsChanged: true, stateUpdate: this.buildStateUpdate(true), predictionGrid: this.buildPredictionGrid() }
        }

        if (needsNewOptimizer) {
            this.optimizer = buildOptimizer(trainingConfig.optimizer, trainingConfig.learningRate)
            this.updateFns = this.network!.layers.map((_, i) => this.optimizer!.getUpdateFnForLayer(i))
        }
        return { weightsChanged: false as const }
    }

    step() {
        this.runStep()
        return { stateUpdate: this.buildStateUpdate(false), predictionGrid: this.buildPredictionGrid() }
    }

    runEpoch() {
        const startEpoch = this.epoch
        this.runStep()
        while (this.epoch === startEpoch) this.runStep()
        return { stateUpdate: this.buildStateUpdate(false), predictionGrid: this.buildPredictionGrid() }
    }

    reset() {
        this.rebuildNetworkAndOptimizer()
        this.epoch = 0
        this.batchCursor = 0
        return { stateUpdate: this.buildStateUpdate(true), predictionGrid: this.buildPredictionGrid() }
    }

    private runStep(): void {
        const network = this.network!
        const { XBatch, yBatchRaw, epochDone } = this.nextBatch()
        const yBatch = this.prepareTargets(yBatchRaw)

        network.forward(XBatch)
        const gradients = network.backward(yBatch)
        network.layers.forEach((layer, i) => {
            const { dW, db } = gradients[i]
            layer.applyGrad(dW, db, this.updateFns[i])
        })

        if (epochDone) this.epoch += 1
    }

    private nextBatch(): { XBatch: number[][]; yBatchRaw: number[]; epochDone: boolean } {
        const { XTrain, yTrain } = this.dataset!
        const batchSize = this.trainingConfig!.batchSize

        const start = this.batchCursor
        const end = start + batchSize
        const XBatch = XTrain.slice(start, end)
        const yBatchRaw = yTrain.slice(start, end)

        this.batchCursor = end
        const epochDone = this.batchCursor >= XTrain.length
        if (epochDone) this.batchCursor = 0

        return { XBatch, yBatchRaw, epochDone }
    }

    private prepareTargets(y: number[]): number[][] {
        const network = this.network!
        if (network.outputActivation === 'softmax') {
            const numClasses = network.layers[network.layers.length - 1].outputSize
            return y.map((label) => oneHot(numClasses, label))
        }
        return y.map((label) => [label])
    }

    private computeMetrics(): { loss: number; accuracy: number } {
        const network = this.network!
        const { XTrain, yTrain } = this.dataset!
        const yTrue = this.prepareTargets(yTrain)
        const yPred = network.forward(XTrain)

        const outputActivation = network.outputActivation
        if (outputActivation === 'sigmoid') {
            const loss = losses.bceLoss(yPred, yTrue)
            const correct = yPred.map((row, i) => (row[0] > 0.5 ? 1 : 0) === yTrue[i][0])
            const accuracy = correct.filter(Boolean).length / correct.length
            return { loss, accuracy }
        }
        if (outputActivation === 'softmax') {
            const loss = losses.ceLoss(yPred, yTrue)
            const correct = yPred.map((row, i) => argmaxIndex(row) === argmaxIndex(yTrue[i]))
            const accuracy = correct.filter(Boolean).length / correct.length
            return { loss, accuracy }
        }
        return { loss: losses.mseLoss(yPred, yTrue), accuracy: 0.0 }
    }

    private predictGrid(resolution = RESOLUTION): number[][] {
        const network = this.network!
        const axis = Array.from({ length: resolution }, (_, i) => -GRID_RANGE + (i * (2 * GRID_RANGE)) / (resolution - 1))

        const gridPoints: number[][] = []
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                gridPoints.push([axis[j], axis[i]])
            }
        }

        const yPred = network.forward(gridPoints)
        const isSoftmax = network.outputActivation === 'softmax'
        const values = yPred.map((row) => (isSoftmax ? argmaxIndex(row) : row[0]))

        const grid: number[][] = []
        for (let i = 0; i < resolution; i++) {
            grid.push(values.slice(i * resolution, (i + 1) * resolution))
        }
        return grid
    }

    private getWeights(): NetworkWeights {
        return this.network!.layers.map((layer) => layer.W)
    }

    private rebuildNetworkAndOptimizer(): void {
        this.network = buildNetwork(this.architecture!, this.trainingConfig!.weightInit)
        this.optimizer = buildOptimizer(this.trainingConfig!.optimizer, this.trainingConfig!.learningRate)
        this.updateFns = this.network.layers.map((_, i) => this.optimizer!.getUpdateFnForLayer(i))
    }

    private buildStateUpdate(weightsReset: boolean): StateUpdateMessage {
        const { loss, accuracy } = this.computeMetrics()
        return { type: 'state_update', epoch: this.epoch, weights: this.getWeights(), loss, accuracy, weightsReset }
    }

    private buildDatasetPoints(): DatasetPointsMessage {
        const { trainPoints, testPoints } = this.dataset!
        return { type: 'dataset_points', train: trainPoints, test: testPoints }
    }

    private buildPredictionGrid(): PredictionGridMessage {
        return { type: 'prediction_grid', resolution: RESOLUTION, grid: this.predictGrid() }
    }
}
