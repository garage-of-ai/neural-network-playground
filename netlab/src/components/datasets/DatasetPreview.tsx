import { useEffect, useRef } from 'react'
import type { DatasetKind } from '../../types'

interface DatasetPreviewProps {
    kind: DatasetKind
    size?: number
}

const COLOR_A = '#e5534b'
const COLOR_B = '#3fb950'
const COLOR_C = '#3f8ee0'


function seededRandom(seed: number) {
    const x = Math.sin(seed * 999) * 10000
    return x - Math.floor(x)
}

function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, r = 2.2) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
}

function drawDatasetIcon(ctx: CanvasRenderingContext2D, w: number, h: number, kind: DatasetKind) {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2

    if (kind === 'circle') {
        const maxR = w * 0.46
        // đĩa trong
        for (let i = 0; i < 22; i++) {
            const a = seededRandom(i) * Math.PI * 2
            const r = Math.sqrt(seededRandom(i + 100)) * maxR * 0.32
            drawPoint(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, COLOR_A)
        }
        // vòng ngoài, cách đĩa trong một khoảng trống rõ rệt (giống dữ liệu thật)
        for (let i = 0; i < 26; i++) {
            const a = seededRandom(i + 200) * Math.PI * 2
            const r = maxR * 0.62 + seededRandom(i + 300) * maxR * 0.38
            drawPoint(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, COLOR_B)
        }
    } else if (kind === 'xor') {
        // đẩy điểm ra xa 2 trục để tụ rõ về 4 góc, giống nhiễu theo sign(x)/sign(y) của dữ liệu thật
        for (let i = 0; i < 50; i++) {
            const qx = seededRandom(i * 4) < 0.5 ? -1 : 1
            const qy = seededRandom(i * 4 + 1) < 0.5 ? -1 : 1
            const dx = (0.14 + seededRandom(i * 4 + 2) * 0.34) * w
            const dy = (0.14 + seededRandom(i * 4 + 3) * 0.34) * h
            drawPoint(ctx, cx + qx * dx, cy + qy * dy, qx * qy > 0 ? COLOR_A : COLOR_B)
        }
    } else if (kind === 'gauss') {
        for (let i = 0; i < 50; i++) {
            const side = i % 2
            const x = (seededRandom(i) - 0.5) * w * 0.3 + (side ? w * 0.28 : -w * 0.28)
            const y = (seededRandom(i + 30) - 0.5) * h * 0.5
            drawPoint(ctx, cx + x, cy + y, side ? COLOR_A : COLOR_B)
        }
    } else if (kind === 'spiral') {
        // cộng thêm nhiễu nhỏ quanh đường xoắn ốc để không trông "giả", giống dữ liệu thật luôn có noise
        for (let i = 0; i < 60; i++) {
            const t = i / 60
            const a = t * 10
            const r = t * w * 0.42
            const nx1 = (seededRandom(i * 4) - 0.5) * w * 0.05
            const ny1 = (seededRandom(i * 4 + 1) - 0.5) * w * 0.05
            const nx2 = (seededRandom(i * 4 + 2) - 0.5) * w * 0.05
            const ny2 = (seededRandom(i * 4 + 3) - 0.5) * w * 0.05
            drawPoint(ctx, cx + Math.cos(a) * r + nx1, cy + Math.sin(a) * r + ny1, COLOR_A)
            drawPoint(ctx, cx + Math.cos(a + Math.PI) * r + nx2, cy + Math.sin(a + Math.PI) * r + ny2, COLOR_B)
        }
    } else if (kind === 'moons') {
        for (let i = 0; i < 40; i++) {
            const a = seededRandom(i) * Math.PI
            const nx1 = (seededRandom(i * 4 + 500) - 0.5) * w * 0.06
            const ny1 = (seededRandom(i * 4 + 501) - 0.5) * h * 0.06
            const nx2 = (seededRandom(i * 4 + 502) - 0.5) * w * 0.06
            const ny2 = (seededRandom(i * 4 + 503) - 0.5) * h * 0.06
            drawPoint(ctx, cx - w * 0.15 + Math.cos(a) * w * 0.3 + nx1, cy - h * 0.05 + Math.sin(a) * h * 0.25 + ny1, COLOR_A)
            drawPoint(ctx, cx + w * 0.15 - Math.cos(a) * w * 0.3 + nx2, cy + h * 0.05 - Math.sin(a) * h * 0.25 + ny2, COLOR_B)
        }
    } else if (kind === 'blobs3') {
        const centers: [number, number, string][] = [
            [-0.25, -0.2, COLOR_A],
            [0.25, -0.15, COLOR_B],
            [0, 0.25, COLOR_C],
        ]
        for (const [dx, dy, color] of centers) {
            for (let i = 0; i < 16; i++) {
                drawPoint(
                    ctx,
                    cx + dx * w + (seededRandom(i) - 0.5) * w * 0.18,
                    cy + dy * h + (seededRandom(i + 5) - 0.5) * h * 0.18,
                    color,
                )
            }
        }
    }
}

function DatasetPreview({ kind, size = 150 }: DatasetPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return
        drawDatasetIcon(ctx, size, size, kind)
    }, [kind, size])

    return <canvas ref={canvasRef} width={size} height={size} />
}

export default DatasetPreview
