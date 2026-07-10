import { randNormal, randUniform, shuffle } from './random'
import type { DatasetKind } from '../types'

export const AVAILABLE_KINDS: DatasetKind[] = ['circle', 'xor', 'gauss', 'spiral', 'moons', 'blobs3']
export const N_SAMPLES = 200

function splitCounts(total: number, parts: number): number[] {
    const base = Math.floor(total / parts)
    const counts = new Array(parts).fill(base)
    counts[parts - 1] += total - base * parts
    return counts
}

function linspace(start: number, end: number, n: number): number[] {
    if (n === 1) return [start]
    const step = (end - start) / (n - 1)
    return Array.from({ length: n }, (_, i) => start + i * step)
}

function toXY(xs: number[], ys: number[]): number[][] {
    return xs.map((x, i) => [x, ys[i]])
}

function makeCircle(noise: number): { X: number[][]; y: number[] } {
    const noiseScale = noise / 100
    const [n0, n1] = splitCounts(N_SAMPLES, 2)

    function genRing(rLow: number, rHigh: number, count: number, label: number) {
        const x: number[] = []
        const y: number[] = []
        for (let i = 0; i < count; i++) {
            const r = randUniform(rLow, rHigh)
            const angle = randUniform(0, 2 * Math.PI)
            x.push(r * Math.cos(angle) + randNormal(0, noiseScale))
            y.push(r * Math.sin(angle) + randNormal(0, noiseScale))
        }
        return { x, y, labels: new Array(count).fill(label) }
    }

    const ring0 = genRing(0, 2, n0, 0)
    const ring1 = genRing(3, 5, n1, 1)
    const X = toXY([...ring0.x, ...ring1.x], [...ring0.y, ...ring1.y])
    const y = [...ring0.labels, ...ring1.labels]
    return shuffle(X, y)
}

function makeXor(noise: number): { X: number[][]; y: number[] } {
    const noiseScale = noise / 100
    const X: number[][] = []
    const y: number[] = []
    for (let i = 0; i < N_SAMPLES; i++) {
        let x = randUniform(-5, 5)
        let yv = randUniform(-5, 5)
        x = x + Math.sign(x) * randNormal(0, noiseScale)
        yv = yv + Math.sign(yv) * randNormal(0, noiseScale)
        X.push([x, yv])
        y.push(x * yv >= 0 ? 1 : 0)
    }
    return { X, y }
}

function makeGauss(noise: number): { X: number[][]; y: number[] } {
    const std = 1.0 + noise / 20
    const [n0, n1] = splitCounts(N_SAMPLES, 2)
    const centers: Array<[number, number, number]> = [
        [2.0, 2.0, 0],
        [-2.0, -2.0, 1],
    ]
    const counts = [n0, n1]

    const X: number[][] = []
    const y: number[] = []
    centers.forEach(([cx, cy, label], idx) => {
        for (let i = 0; i < counts[idx]; i++) {
            X.push([randNormal(cx, std), randNormal(cy, std)])
            y.push(label)
        }
    })
    return shuffle(X, y)
}

function makeSpiral(noise: number): { X: number[][]; y: number[] } {
    const noiseScale = noise / 100
    const [n0, n1] = splitCounts(N_SAMPLES, 2)

    function genSpiral(deltaT: number, count: number, label: number) {
        const x: number[] = []
        const y: number[] = []
        for (let i = 0; i < count; i++) {
            const r = (i / count) * 5
            const t = 1.75 * (i / count) * 2 * Math.PI + deltaT
            x.push(r * Math.sin(t) + randNormal(0, noiseScale))
            y.push(r * Math.cos(t) + randNormal(0, noiseScale))
        }
        return { x, y, labels: new Array(count).fill(label) }
    }

    const s0 = genSpiral(0, n0, 0)
    const s1 = genSpiral(Math.PI, n1, 1)
    const X = toXY([...s0.x, ...s1.x], [...s0.y, ...s1.y])
    const y = [...s0.labels, ...s1.labels]
    return shuffle(X, y)
}

function makeMoons(noise: number): { X: number[][]; y: number[] } {
    const noiseScale = noise / 100
    const [n0, n1] = splitCounts(N_SAMPLES, 2)

    const outerT = linspace(0, Math.PI, n0)
    const innerT = linspace(0, Math.PI, n1)

    const x0 = outerT.map((t) => Math.cos(t) + randNormal(0, noiseScale))
    const y0 = outerT.map((t) => Math.sin(t) + randNormal(0, noiseScale))
    const x1 = innerT.map((t) => 1 - Math.cos(t) + randNormal(0, noiseScale))
    const y1 = innerT.map((t) => 1 - Math.sin(t) - 0.5 + randNormal(0, noiseScale))

    const X = toXY([...x0, ...x1], [...y0, ...y1])
    const y = [...new Array(n0).fill(0), ...new Array(n1).fill(1)]
    return shuffle(X, y)
}

function makeBlobs3(noise: number): { X: number[][]; y: number[] } {
    const std = 0.5 + noise / 50
    const centers: Array<[number, number]> = [
        [3.0, 3.0],
        [-3.0, 3.0],
        [0.0, -3.0],
    ]
    const counts = splitCounts(N_SAMPLES, 3)

    const X: number[][] = []
    const y: number[] = []
    centers.forEach(([cx, cy], label) => {
        for (let i = 0; i < counts[label]; i++) {
            X.push([randNormal(cx, std), randNormal(cy, std)])
            y.push(label)
        }
    })
    return { X, y }
}

const GENERATORS: Record<DatasetKind, (noise: number) => { X: number[][]; y: number[] }> = {
    circle: makeCircle,
    xor: makeXor,
    gauss: makeGauss,
    spiral: makeSpiral,
    moons: makeMoons,
    blobs3: makeBlobs3,
}

export function generateDataset(kind: DatasetKind, noise: number): { X: number[][]; y: number[] } {
    const generator = GENERATORS[kind]
    if (!generator) throw new Error(`Unknown dataset kind: ${kind}`)
    return generator(noise)
}
