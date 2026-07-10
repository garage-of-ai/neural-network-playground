import { useEffect, useRef } from 'react'
import { useTraining } from '../../context/TrainingContext'
import { useNetwork, type PredictionGrid } from '../../context/NetworkContext'
import { useDataset } from '../../context/DatasetContext'
import type { DatasetPoint } from '../../types'
import './CheckPanel.css'


const DATA_SPACE_RANGE = 6

function drawSparkline(canvas: HTMLCanvasElement, data: number[], color: string) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = (canvas.width = canvas.clientWidth)
    const h = (canvas.height = canvas.clientHeight)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    const max = Math.max(...data)
    const min = Math.min(...data)
    data.forEach((v, i) => {
        const x = (i / (data.length - 1 || 1)) * (w - 10) + 5
        const norm = (v - min) / ((max - min) || 1)
        const y = h - 8 - norm * (h - 16)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    const lastX = w - 5
    const lastY = h - 8 - ((data[data.length - 1] - min) / ((max - min) || 1)) * (h - 16)
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
}


const FILL_COLORS: [number, number, number][] = [
    [224, 163, 139],
    [168, 199, 154],
    [159, 182, 222],
]

const POINT_COLORS: [number, number, number][] = [
    [191, 90, 60],
    [47, 133, 88],
    [53, 100, 172],
]

const BOUNDARY_LINE_COLOR: [number, number, number] = [46, 42, 38] // var(--ink)
const BOUNDARY_PROBE_PX = 2 // khoảng cách (px) dò 2 ô lân cận để phát hiện chỗ đổi lớp/vượt ngưỡng

const HATCH_SPACING_PX = 7
const HATCH_MIX_TOWARD_INK = 0.14

function mixTowardInk([r, g, b]: [number, number, number], t: number): [number, number, number] {
    const [ir, ig, ib] = BOUNDARY_LINE_COLOR
    return [Math.round(r + (ir - r) * t), Math.round(g + (ig - g) * t), Math.round(b + (ib - b) * t)]
}

function sampleGrid(grid: number[][], resolution: number, w: number, h: number, x: number, y: number): number {
    const gx = Math.min(resolution - 1, Math.max(0, Math.floor((x / w) * resolution)))
    const gy = Math.min(resolution - 1, Math.max(0, Math.floor((y / h) * resolution)))
    return grid[gy][gx]
}


function drawBoundary(canvas: HTMLCanvasElement, prediction: PredictionGrid, isMultiClass: boolean) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { grid, resolution } = prediction
    const w = canvas.width
    const h = canvas.height
    const img = ctx.createImageData(w, h)
    const [lr, lg, lb] = BOUNDARY_LINE_COLOR

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const value = sampleGrid(grid, resolution, w, h, x, y)
            const idx = (y * w + x) * 4

            const rightX = Math.min(w - 1, x + BOUNDARY_PROBE_PX)
            const downY = Math.min(h - 1, y + BOUNDARY_PROBE_PX)
            const valueRight = sampleGrid(grid, resolution, w, h, rightX, y)
            const valueDown = sampleGrid(grid, resolution, w, h, x, downY)

            let isBoundary: boolean
            if (isMultiClass) {
                const cHere = Math.round(value) % FILL_COLORS.length
                isBoundary =
                    Math.round(valueRight) % FILL_COLORS.length !== cHere ||
                    Math.round(valueDown) % FILL_COLORS.length !== cHere
            } else {
                const hereHigh = value >= 0.5
                isBoundary = valueRight >= 0.5 !== hereHigh || valueDown >= 0.5 !== hereHigh
            }

            if (isBoundary) {
                img.data[idx] = lr
                img.data[idx + 1] = lg
                img.data[idx + 2] = lb
            } else {
                const fill = isMultiClass
                    ? FILL_COLORS[Math.round(value) % FILL_COLORS.length]
                    : // tô phẳng theo ngưỡng 0.5, cùng quy ước màu với pointColor()
                      FILL_COLORS[value >= 0.5 ? 0 : 2]
                // vân giấy: phủ đều lên nền để bù độ tương phản thấp giữa các
                // vùng màu nhạt, không phụ thuộc lớp nào nên không làm lệch màu
                const [r, g, b] = (x + y) % HATCH_SPACING_PX === 0 ? mixTowardInk(fill, HATCH_MIX_TOWARD_INK) : fill
                img.data[idx] = r
                img.data[idx + 1] = g
                img.data[idx + 2] = b
            }
            img.data[idx + 3] = 255
        }
    }
    ctx.putImageData(img, 0, 0)
}

function rgbCss([r, g, b]: [number, number, number]): string {
    return `rgb(${r}, ${g}, ${b})`
}


function pointColor(label: number, isMultiClass: boolean): string {
    if (isMultiClass) return rgbCss(POINT_COLORS[Math.round(label) % POINT_COLORS.length])
    return rgbCss(label > 0.5 ? POINT_COLORS[0] : POINT_COLORS[2])
}


function drawDatasetPoints(canvas: HTMLCanvasElement, trainPoints: DatasetPoint[], testPoints: DatasetPoint[], isMultiClass: boolean) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvas.width
    const toPixel = (v: number) => ((v + DATA_SPACE_RANGE) / (2 * DATA_SPACE_RANGE)) * size

    const drawSet = (points: DatasetPoint[], filled: boolean) => {
        for (const [x, y, label] of points) {
            const px = toPixel(x)
            const py = toPixel(y)
            const color = pointColor(label, isMultiClass)
            ctx.beginPath()
            ctx.arc(px, py, filled ? 3 : 2.5, 0, Math.PI * 2)
            if (filled) {
                ctx.fillStyle = color
                ctx.fill()
                ctx.strokeStyle = '#2e2a26'
                ctx.lineWidth = 0.75
                ctx.stroke()
            } else {
                ctx.strokeStyle = color
                ctx.lineWidth = 1.5
                ctx.stroke()
            }
        }
    }

    drawSet(testPoints, false)
    drawSet(trainPoints, true)
}

function CheckPanel() {
    const { lossHistory, accuracyHistory, epoch } = useTraining()
    const { architecture, predictionGrid } = useNetwork()
    const { trainPoints, testPoints } = useDataset()

    const lossCanvasRef = useRef<HTMLCanvasElement>(null)
    const accCanvasRef = useRef<HTMLCanvasElement>(null)
    const boundaryCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (lossCanvasRef.current) drawSparkline(lossCanvasRef.current, lossHistory, '#e5534b')
    }, [lossHistory])

    useEffect(() => {
        if (accCanvasRef.current) drawSparkline(accCanvasRef.current, accuracyHistory, '#3fb950')
    }, [accuracyHistory])

    useEffect(() => {
        if (!boundaryCanvasRef.current || !predictionGrid) return
        const isMultiClass = architecture[architecture.length - 1]?.activation === 'softmax'
        drawBoundary(boundaryCanvasRef.current, predictionGrid, isMultiClass)
        drawDatasetPoints(boundaryCanvasRef.current, trainPoints, testPoints, isMultiClass)
    }, [predictionGrid, architecture, trainPoints, testPoints])

    const lastLoss = lossHistory[lossHistory.length - 1]
    const lastAcc = accuracyHistory[accuracyHistory.length - 1]

    return (
        <div className="panel">
            <div className="title">Kết quả</div>

            <div className="chart-label">
                <span>Loss</span>
                <span>{lastLoss.toFixed(3)}</span>
            </div>
            <canvas className="chart" ref={lossCanvasRef} />

            <div className="chart-label">
                <span>Độ chính xác</span>
                <span>{Math.round(lastAcc * 100)}%</span>
            </div>
            <canvas className="chart" ref={accCanvasRef} />

            <div className="decision-boundary">
                <div className="chart-label">
                    <span>Biên quyết định</span>
                    <span>epoch {epoch}</span>
                </div>
                <canvas className="boundary-canvas" ref={boundaryCanvasRef} width={240} height={240} />
            </div>
        </div>
    )
}

export default CheckPanel
