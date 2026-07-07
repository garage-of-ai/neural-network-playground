import { useEffect, useRef } from 'react'
import { useTraining } from '../../context/TrainingContext'
import { useDataset } from '../../context/DatasetContext'
import './CheckPanel.css'

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

// TODO(backend): decision boundary hiện là sóng giả lập theo epoch/dataset
// (giữ tinh thần mockups/draft-2), chưa phản ánh trọng số mạng thật
function drawBoundary(canvas: HTMLCanvasElement, datasetKind: string, epoch: number) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const img = ctx.createImageData(w, h)
    const t = epoch * 0.15

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const nx = (x / w - 0.5) * 4
            const ny = (y / h - 0.5) * 4
            let v: number
            if (datasetKind === 'xor') v = Math.sin(nx * 2 + t) * Math.cos(ny * 2)
            else if (datasetKind === 'spiral') v = Math.sin(Math.sqrt(nx * nx + ny * ny) * 4 - Math.atan2(ny, nx) * 2 + t)
            else if (datasetKind === 'moons') v = Math.sin(nx + t) + Math.cos(ny * 1.5)
            else v = nx * nx + ny * ny - 1.2 + Math.sin(t) * 0.2

            const idx = (y * w + x) * 4
            if (v > 0) {
                img.data[idx] = 255 - Math.min(120, v * 80)
                img.data[idx + 1] = 214
                img.data[idx + 2] = 214
            } else {
                img.data[idx] = 207
                img.data[idx + 1] = 232
                img.data[idx + 2] = 255 - Math.min(60, -v * 40)
            }
            img.data[idx + 3] = 255
        }
    }
    ctx.putImageData(img, 0, 0)
}

function CheckPanel() {
    const { lossHistory, accuracyHistory, epoch } = useTraining()
    const { config: datasetConfig } = useDataset()

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
        if (boundaryCanvasRef.current) drawBoundary(boundaryCanvasRef.current, datasetConfig.kind, epoch)
    }, [datasetConfig.kind, epoch])

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
                <span>Accuracy</span>
                <span>{Math.round(lastAcc * 100)}%</span>
            </div>
            <canvas className="chart" ref={accCanvasRef} />

            <div className="decision-boundary">
                <div className="chart-label">
                    <span>Decision boundary</span>
                    <span>epoch {epoch}</span>
                </div>
                <canvas className="boundary-canvas" ref={boundaryCanvasRef} width={240} height={240} />
            </div>
        </div>
    )
}

export default CheckPanel
