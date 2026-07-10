import { randNormal, randUniform } from './random'
import type { WeightInit } from '../types'

export function zerosInit(rows: number, cols: number): number[][] {
    return Array.from({ length: rows }, () => new Array(cols).fill(0))
}

export function uniformInit(rows: number, cols: number, low = -0.1, high = 0.1): number[][] {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => randUniform(low, high)))
}

export function gaussianInit(rows: number, cols: number, mean = 0.0, std = 0.01): number[][] {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => randNormal(mean, std)))
}

const INITIALIZERS: Record<WeightInit, (rows: number, cols: number) => number[][]> = {
    zeros: zerosInit,
    uniform: uniformInit,
    gaussian: gaussianInit,
}

export function getInitializer(name: WeightInit): (rows: number, cols: number) => number[][] {
    const fn = INITIALIZERS[name]
    if (!fn) throw new Error(`Unknown initializer: ${name}`)
    return fn
}
