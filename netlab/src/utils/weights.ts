import type { LayerConfig, NetworkWeights } from '../types'

export function createRandomWeights(architecture: LayerConfig[]): NetworkWeights {
    const weights: NetworkWeights = []
    for (let l = 0; l < architecture.length - 1; l++) {
        const fromUnits = architecture[l].units
        const toUnits = architecture[l + 1].units
        const matrix: number[][] = []
        for (let i = 0; i < fromUnits; i++) {
            const row: number[] = []
            for (let j = 0; j < toUnits; j++) {
                row.push(Math.random() * 2 - 1)
            }
            matrix.push(row)
        }
        weights.push(matrix)
    }
    return weights
}
