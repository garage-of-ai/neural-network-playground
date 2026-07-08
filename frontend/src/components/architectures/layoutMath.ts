import type { LayerConfig } from '../../types'

export const NEURON_SIZE = 34
export const NEURON_GAP = 14
export const LABEL_HEIGHT = 40
export const COL_WIDTH = 200

// layer quá nhiều unit (vd input MNIST) thì chỉ hiển thị 4 unit đầu + 4 unit
// cuối, kèm dấu "⋮" ở giữa, thay vì vẽ hết
export const DISPLAY_CAP = 8
export const DISPLAY_HALF = 4

export interface Point {
    x: number
    y: number
}

export interface NeuronPosition extends Point {
    unitIndex: number
}

export interface LayerLayout {
    neurons: NeuronPosition[]
    ellipsis?: { y: number; hiddenCount: number }
}

// unit nào sẽ được vẽ ra thật (index thật trong weights/architecture), và có
// cần chèn dấu "..." ở giữa hay không
export function visibleUnitIndices(units: number): { indices: number[]; withEllipsis: boolean } {
    if (units <= DISPLAY_CAP) return { indices: Array.from({ length: units }, (_, i) => i), withEllipsis: false }
    const first = Array.from({ length: DISPLAY_HALF }, (_, i) => i)
    const last = Array.from({ length: DISPLAY_HALF }, (_, i) => units - DISPLAY_HALF + i)
    return { indices: [...first, ...last], withEllipsis: true }
}

// số "hàng" chiếm chỗ theo chiều dọc (unit hiển thị + hàng dấu "...") — dùng để
// tính chiều cao cần thiết, không dựa vào units thật (có thể rất lớn)
export function displayedRowCount(units: number): number {
    return units <= DISPLAY_CAP ? units : DISPLAY_CAP + 1
}

// vị trí tính thuần bằng công thức (không đo DOM) — layout hoàn toàn xác định
// trước bởi số layer/unit hiển thị
export function computeLayerPositions(architecture: LayerConfig[]): LayerLayout[] {
    const maxRows = Math.max(1, ...architecture.map((l) => displayedRowCount(l.units)))
    const stageHeight = LABEL_HEIGHT + maxRows * NEURON_SIZE + (maxRows - 1) * NEURON_GAP

    return architecture.map((layer, li) => {
        const { indices, withEllipsis } = visibleUnitIndices(layer.units)
        const rowCount = displayedRowCount(layer.units)
        const colHeight = rowCount * NEURON_SIZE + Math.max(0, rowCount - 1) * NEURON_GAP
        const startY = LABEL_HEIGHT + (stageHeight - LABEL_HEIGHT - colHeight) / 2
        const x = li * COL_WIDTH + COL_WIDTH / 2
        const rowY = (row: number) => startY + row * (NEURON_SIZE + NEURON_GAP) + NEURON_SIZE / 2

        const neurons: NeuronPosition[] = []
        let ellipsis: LayerLayout['ellipsis']
        indices.forEach((unitIndex, pos) => {
            // dấu "..." chiếm đúng 1 hàng ở ranh giới giữa nhóm 4 unit đầu và 4 unit cuối
            if (withEllipsis && pos === DISPLAY_HALF) {
                ellipsis = { y: rowY(pos), hiddenCount: layer.units - DISPLAY_CAP }
            }
            const row = withEllipsis && pos >= DISPLAY_HALF ? pos + 1 : pos
            neurons.push({ unitIndex, x, y: rowY(row) })
        })

        return { neurons, ellipsis }
    })
}

export function stageSize(architecture: LayerConfig[]) {
    const maxRows = Math.max(1, ...architecture.map((l) => displayedRowCount(l.units)))
    return {
        width: architecture.length * COL_WIDTH,
        height: LABEL_HEIGHT + maxRows * NEURON_SIZE + (maxRows - 1) * NEURON_GAP,
    }
}

// đường cong bezier chữ S nằm ngang: 2 điểm điều khiển lệch ngang 45%
// khoảng cách, giữ nguyên tung độ của điểm đầu/cuối tương ứng
export function bezierControlPoints(from: Point, to: Point) {
    const dx = (to.x - from.x) * 0.45
    return { cx1: from.x + dx, cy1: from.y, cx2: to.x - dx, cy2: to.y }
}

export function bezierPath(from: Point, to: Point): string {
    const { cx1, cy1, cx2, cy2 } = bezierControlPoints(from, to)
    return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`
}

// điểm giữa (t=0.5) của cubic bezier ở trên, dùng để neo tooltip trọng số
export function bezierMidpoint(from: Point, to: Point): Point {
    const { cx1, cy1, cx2, cy2 } = bezierControlPoints(from, to)
    return {
        x: 0.125 * from.x + 0.375 * cx1 + 0.375 * cx2 + 0.125 * to.x,
        y: 0.125 * from.y + 0.375 * cy1 + 0.375 * cy2 + 0.125 * to.y,
    }
}

// lấy mẫu `steps` điểm dọc theo bezier để dùng làm keyframes cho animation
// di chuyển (Framer Motion) đi đúng theo đường cong thay vì cắt thẳng
export function samplePathPoints(from: Point, to: Point, steps: number): { xs: number[]; ys: number[] } {
    const { cx1, cy1, cx2, cy2 } = bezierControlPoints(from, to)
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const mt = 1 - t
        xs.push(mt * mt * mt * from.x + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * to.x)
        ys.push(mt * mt * mt * from.y + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * to.y)
    }
    return { xs, ys }
}

export function weightColor(w: number): string {
    if (Math.abs(w) < 0.08) return '#9a938a'
    return w > 0 ? '#3fb950' : '#e5534b'
}
