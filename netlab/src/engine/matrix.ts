// Minimal matrix/vector helpers — just the ops core/layers.py, core/losses.py and
// core/optimizers.py actually use. Matrices are number[][] shaped [rows][cols].

export function zeros(rows: number, cols: number): number[][] {
    return Array.from({ length: rows }, () => new Array(cols).fill(0))
}

export function matmul(A: number[][], B: number[][]): number[][] {
    const rows = A.length
    const inner = B.length
    const cols = B[0]?.length ?? 0
    const result = zeros(rows, cols)
    for (let i = 0; i < rows; i++) {
        for (let k = 0; k < inner; k++) {
            const a = A[i][k]
            if (a === 0) continue
            for (let j = 0; j < cols; j++) {
                result[i][j] += a * B[k][j]
            }
        }
    }
    return result
}

export function transpose(A: number[][]): number[][] {
    const rows = A.length
    const cols = A[0]?.length ?? 0
    const result = zeros(cols, rows)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = A[i][j]
        }
    }
    return result
}

// Z[i][j] + b[j], broadcasting the bias row vector over every row — matches `x @ W + b`
export function addBias(Z: number[][], b: number[]): number[][] {
    return Z.map((row) => row.map((v, j) => v + b[j]))
}

// sum over axis 0 (down each column) — matches np.sum(dz, axis=0)
export function sumAxis0(A: number[][]): number[] {
    const cols = A[0]?.length ?? 0
    const result = new Array(cols).fill(0)
    for (const row of A) {
        for (let j = 0; j < cols; j++) result[j] += row[j]
    }
    return result
}

export function mapMatrix(A: number[][], fn: (v: number) => number): number[][] {
    return A.map((row) => row.map(fn))
}

export function zipMatrix(A: number[][], B: number[][], fn: (a: number, b: number) => number): number[][] {
    return A.map((row, i) => row.map((v, j) => fn(v, B[i][j])))
}

export function mapVector(v: number[], fn: (x: number) => number): number[] {
    return v.map(fn)
}

export function zipVector(a: number[], b: number[], fn: (x: number, y: number) => number): number[] {
    return a.map((v, i) => fn(v, b[i]))
}

export function meanAll(A: number[][]): number {
    const flat = A.flat()
    return flat.reduce((a, b) => a + b, 0) / flat.length
}

// index of the largest value in a row — matches np.argmax's first-max-wins tie-break
export function argmaxIndex(row: number[]): number {
    let best = 0
    for (let i = 1; i < row.length; i++) {
        if (row[i] > row[best]) best = i
    }
    return best
}
