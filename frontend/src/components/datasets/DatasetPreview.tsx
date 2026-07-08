import { useEffect, useRef } from 'react'
import type { DatasetKind } from '../../types'

interface DatasetPreviewProps {
    kind: DatasetKind
    size?: number
}

const COLOR_A = '#e5534b'
const COLOR_B = '#3fb950'
const COLOR_C = '#3f8ee0'

// seed theo index thay vì Math.random() thật, để icon không "nhấp nháy" đổi
// hình mỗi lần component re-render (vd khi kéo slider noise)
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
        for (let i = 0; i < 40; i++) {
            const a = seededRandom(i) * Math.PI * 2
            const r = seededRandom(i + 50) * w * 0.42
            drawPoint(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, r < w * 0.22 ? COLOR_A : COLOR_B)
        }
    } else if (kind === 'xor') {
        for (let i = 0; i < 50; i++) {
            const x = (seededRandom(i) - 0.5) * w * 0.8
            const y = (seededRandom(i + 70) - 0.5) * h * 0.8
            drawPoint(ctx, cx + x, cy + y, x * y > 0 ? COLOR_A : COLOR_B)
        }
    } else if (kind === 'gauss') {
        for (let i = 0; i < 50; i++) {
            const side = i % 2
            const x = (seededRandom(i) - 0.5) * w * 0.3 + (side ? w * 0.28 : -w * 0.28)
            const y = (seededRandom(i + 30) - 0.5) * h * 0.5
            drawPoint(ctx, cx + x, cy + y, side ? COLOR_A : COLOR_B)
        }
    } else if (kind === 'spiral') {
        for (let i = 0; i < 60; i++) {
            const t = i / 60
            const a = t * 10
            const r = t * w * 0.4
            drawPoint(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, COLOR_A)
            drawPoint(ctx, cx + Math.cos(a + Math.PI) * r, cy + Math.sin(a + Math.PI) * r, COLOR_B)
        }
    } else if (kind === 'moons') {
        for (let i = 0; i < 40; i++) {
            const a = seededRandom(i) * Math.PI
            drawPoint(ctx, cx - w * 0.15 + Math.cos(a) * w * 0.3, cy - h * 0.05 + Math.sin(a) * h * 0.25, COLOR_A)
            drawPoint(ctx, cx + w * 0.15 - Math.cos(a) * w * 0.3, cy + h * 0.05 - Math.sin(a) * h * 0.25, COLOR_B)
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
