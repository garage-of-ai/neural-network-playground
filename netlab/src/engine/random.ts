export function randUniform(low: number, high: number): number {
    return low + Math.random() * (high - low)
}

export function uniformArray(low: number, high: number, n: number): number[] {
    return Array.from({ length: n }, () => randUniform(low, high))
}

// Box-Muller transform — matches np.random.normal(loc, scale) in distribution (not bit-for-bit RNG)
export function randNormal(mean: number, std: number): number {
    const u1 = Math.max(Math.random(), Number.EPSILON)
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + std * z0
}

export function normalArray(mean: number, std: number, n: number): number[] {
    return Array.from({ length: n }, () => randNormal(mean, std))
}

// Fisher-Yates — equivalent to np.random.permutation(n)
export function permutation(n: number): number[] {
    const arr = Array.from({ length: n }, (_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

export function shuffle(X: number[][], y: number[]): { X: number[][]; y: number[] } {
    const perm = permutation(y.length)
    return { X: perm.map((i) => X[i]), y: perm.map((i) => y[i]) }
}
