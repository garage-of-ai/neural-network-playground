import { generateDataset } from './datasets'
import type { DatasetConfig, DatasetPoint } from '../types'

export interface DatasetBundle {
    XTrain: number[][]
    yTrain: number[]
    XTest: number[][]
    yTest: number[]
    trainPoints: DatasetPoint[]
    testPoints: DatasetPoint[]
}

function toPoints(X: number[][], y: number[]): DatasetPoint[] {
    return X.map(([px, py], i): DatasetPoint => [px, py, y[i]])
}

export function buildDataset(config: DatasetConfig): DatasetBundle {
    const { X, y } = generateDataset(config.kind, config.noise)

    const nTrain = Math.floor((X.length * config.trainSplit) / 100)
    const XTrain = X.slice(0, nTrain)
    const yTrain = y.slice(0, nTrain)
    const XTest = X.slice(nTrain)
    const yTest = y.slice(nTrain)

    return {
        XTrain,
        yTrain,
        XTest,
        yTest,
        trainPoints: toPoints(XTrain, yTrain),
        testPoints: toPoints(XTest, yTest),
    }
}
