import { meanAll, zipMatrix } from './matrix'

const EPS = 1e-9

export function mseLoss(yPred: number[][], yTrue: number[][]): number {
    return meanAll(zipMatrix(yPred, yTrue, (p, t) => (p - t) ** 2))
}

export function bceLoss(yPred: number[][], yTrue: number[][]): number {
    const terms = zipMatrix(yPred, yTrue, (p, t) => t * Math.log(p + EPS) + (1 - t) * Math.log(1 - p + EPS))
    return -meanAll(terms)
}

export function ceLoss(yPred: number[][], yTrue: number[][]): number {
    const perRow = zipMatrix(yPred, yTrue, (p, t) => t * Math.log(p + EPS)).map((row) => row.reduce((a, b) => a + b, 0))
    return -(perRow.reduce((a, b) => a + b, 0) / perRow.length)
}

export function bceOutputGrad(yPred: number[][], yTrue: number[][]): number[][] {
    const n = yPred.length
    return zipMatrix(yPred, yTrue, (p, t) => (p - t) / n)
}

export function ceOutputGrad(yPred: number[][], yTrue: number[][]): number[][] {
    const n = yPred.length
    return zipMatrix(yPred, yTrue, (p, t) => (p - t) / n)
}

export function mseOutputGrad(yPred: number[][], yTrue: number[][]): number[][] {
    const n = yPred.length
    return zipMatrix(yPred, yTrue, (p, t) => (2 * (p - t)) / n)
}
