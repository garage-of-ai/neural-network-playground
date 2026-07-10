import { useEffect, useRef } from 'react'
import { useTraining } from '../../context/TrainingContext'
import { useNetwork, type PredictionGrid } from '../../context/NetworkContext'
import { useDataset } from '../../context/DatasetContext'
import type { DatasetPoint } from '../../types'
import './CheckPanel.css'

// khoảng toạ độ thật mà backend dùng để sinh dataset và prediction_grid (xem
// training_session.py: GRID_RANGE=6) — phải khớp đúng con số này thì điểm dữ
// liệu mới rơi đúng vị trí trên nền decision boundary, không bị lệch
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

// bảng "Giấy Dó": nền vùng tô nhạt (êm, gần màu giấy — DATA_SPACE nhìn lâu đỡ chói),
// còn điểm dữ liệu dùng bản đậm cùng tông để vẫn nổi rõ trên nền nhạt đó
const FILL_COLORS: [number, number, number][] = [
    [224, 163, 139], // hồng đất nhạt — class 0
    [168, 199, 154], // rêu nhạt — class 1
    [159, 182, 222], // khói lam — class 2
]

const POINT_COLORS: [number, number, number][] = [
    [191, 90, 60], // đất nung — class 0
    [47, 133, 88], // lá rừng — class 1
    [53, 100, 172], // chàm — class 2
]

const BOUNDARY_LINE_COLOR: [number, number, number] = [46, 42, 38] // var(--ink)
const BOUNDARY_PROBE_PX = 2 // khoảng cách (px) dò 2 ô lân cận để phát hiện chỗ đổi lớp/vượt ngưỡng

// vân giấy: cứ mỗi 7px chéo lại ngả nhẹ về màu mực, bù lại việc FILL_COLORS
// nhạt nên tương phản giữa 2 vùng liền kề tự nó hơi thấp
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

// vẽ decision boundary thật từ prediction_grid server trả về (xem PLAN.API.md
// mục 1.10). isMultiClass=true (output softmax) -> grid chứa index lớp (0,1,2..);
// false (sigmoid) -> grid chứa xác suất [0,1]. Cả hai trường hợp đều tô màu
// phẳng/rời rạc (nhị phân so với ngưỡng 0.5) để đồng nhất cách quan sát.
// Ngoài tô màu, mỗi pixel còn được so với 2 pixel lân cận (phải, dưới): nếu
// lớp dự đoán đổi (multi-class) hoặc xác suất vượt qua ngưỡng 0.5 theo hướng
// khác (binary), pixel đó nằm trên đường biên -> tô màu mực đậm thay vì màu
// nền, tạo thành 1 đường viền rõ giữa các vùng thay vì chỉ có gradient mờ
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

// cùng quy ước lớp với drawBoundary ở trên (nhị phân: label 1 ~ index 0, label
// 0 ~ index 2; đa lớp: label là index) nhưng dùng POINT_COLORS (đậm hơn
// FILL_COLORS của nền) để điểm dữ liệu vẫn nổi rõ trên nền màu nhạt
function pointColor(label: number, isMultiClass: boolean): string {
    if (isMultiClass) return rgbCss(POINT_COLORS[Math.round(label) % POINT_COLORS.length])
    return rgbCss(label > 0.5 ? POINT_COLORS[0] : POINT_COLORS[2])
}

// vẽ đè điểm dữ liệu thật (train đặc, test rỗng viền) lên trên nền decision
// boundary vừa vẽ bằng putImageData ở trên — PHẢI gọi sau drawBoundary vì
// putImageData ghi đè toàn bộ canvas, vẽ trước sẽ bị xoá mất
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
