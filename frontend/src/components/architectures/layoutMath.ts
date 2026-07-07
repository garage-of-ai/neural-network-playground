import type { LayerConfig } from '../../types'

export const NEURON_SIZE = 34
export const NEURON_GAP = 14
export const LABEL_HEIGHT = 40
export const COL_WIDTH = 200

export interface Point {
    x: number
    y: number
}

// vị trí tính thuần bằng công thức (không đo DOM như bản vanilla JS gốc) —
// vì layout ở đây hoàn toàn xác định trước bởi số layer/unit, không cần
// getBoundingClientRect() sau khi render mới biết được vị trí
export function computeLayerPositions(architecture: LayerConfig[]): Point[][] {
    const maxUnits = Math.max(1, ...architecture.map((l) => l.units))
    const stageHeight = LABEL_HEIGHT + maxUnits * NEURON_SIZE + (maxUnits - 1) * NEURON_GAP

    return architecture.map((layer, li) => {
        const colHeight = layer.units * NEURON_SIZE + Math.max(0, layer.units - 1) * NEURON_GAP
        const startY = LABEL_HEIGHT + (stageHeight - LABEL_HEIGHT - colHeight) / 2
        const x = li * COL_WIDTH + COL_WIDTH / 2

        return Array.from({ length: layer.units }, (_, ni) => ({
            x,
            y: startY + ni * (NEURON_SIZE + NEURON_GAP) + NEURON_SIZE / 2,
        }))
    })
}

export function stageSize(architecture: LayerConfig[]) {
    const maxUnits = Math.max(1, ...architecture.map((l) => l.units))
    return {
        width: architecture.length * COL_WIDTH,
        height: LABEL_HEIGHT + maxUnits * NEURON_SIZE + (maxUnits - 1) * NEURON_GAP,
    }
}

// đường cong bezier chữ S nằm ngang: 2 điểm điều khiển lệch ngang 45%
// khoảng cách, giữ nguyên tung độ của điểm đầu/cuối tương ứng
export function bezierPath(from: Point, to: Point): string {
    const dx = (to.x - from.x) * 0.45
    const cx1 = from.x + dx
    const cx2 = to.x - dx
    return `M ${from.x} ${from.y} C ${cx1} ${from.y}, ${cx2} ${to.y}, ${to.x} ${to.y}`
}

// điểm giữa (t=0.5) của cubic bezier ở trên, dùng để neo tooltip trọng số
export function bezierMidpoint(from: Point, to: Point): Point {
    const dx = (to.x - from.x) * 0.45
    const cx1 = from.x + dx
    const cx2 = to.x - dx
    return {
        x: 0.125 * from.x + 0.375 * cx1 + 0.375 * cx2 + 0.125 * to.x,
        y: (from.y + to.y) / 2,
    }
}

export function weightColor(w: number): string {
    if (Math.abs(w) < 0.08) return '#9a938a'
    return w > 0 ? '#3fb950' : '#e5534b'
}
