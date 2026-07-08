import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useViewport } from '@xyflow/react'
import type { LayerConfig } from '../../types'
import { samplePathPoints, type LayerLayout } from './layoutMath'

// Mỗi lần 1 batch đi qua mạng là đúng 1 "xung": MỘT ô vuông xuất hiện từ rìa
// trái, bay vào giữa cột input rồi tách thành 1 ô cho mỗi input node. Từ mỗi
// node vừa nhận ô, node đó "phân thân": bắn 1 ô theo MỖI cạnh đi ra sang layer
// kế tiếp — mọi ô trong cùng 1 đợt luôn đến nơi CÙNG LÚC. Lặp tới layer output.
// (phỏng theo mockups/draft-2/main.js, nhưng phần nội suy vị trí giao cho
// Framer Motion đảm nhiệm thay vì tự viết vòng lặp requestAnimationFrame)
const ENTRY_MS = 260
const SPLIT_MS = 160
const HOP_MS = 260
const SQUARE_SIZE = 9
const PATH_SAMPLES = 24

interface Square {
    id: number
    xs: number[]
    ys: number[]
    durationMs: number
}

let nextSquareId = 0

interface NetworkPulseProps {
    architecture: LayerConfig[]
    layout: LayerLayout[]
    pulseSignal: number
}

function NetworkPulse({ architecture, layout, pulseSignal }: NetworkPulseProps) {
    const [squares, setSquares] = useState<Square[]>([])
    const timeouts = useRef<number[]>([])
    const isFirstRender = useRef(true)

    useEffect(() => {
        // bỏ qua lần mount đầu tiên — pulseSignal bắt đầu ở 0, không phải 1 step thật
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        if (layout.length === 0 || layout[0].neurons.length === 0) return

        const spawn = (from: { x: number; y: number }, to: { x: number; y: number }, durationMs: number) => {
            const { xs, ys } = samplePathPoints(from, to, PATH_SAMPLES)
            setSquares((prev) => [...prev, { id: nextSquareId++, xs, ys, durationMs }])
        }

        const runLayerHops = (li: number) => {
            if (li >= layout.length - 1) return
            const fromNeurons = layout[li].neurons
            const toNeurons = layout[li + 1].neurons
            fromNeurons.forEach((from) => {
                toNeurons.forEach((to) => spawn(from, to, HOP_MS))
            })
            timeouts.current.push(window.setTimeout(() => runLayerHops(li + 1), HOP_MS))
        }

        const inputNeurons = layout[0].neurons
        const entryX = inputNeurons[0].x
        const entryY = inputNeurons.reduce((sum, p) => sum + p.y, 0) / inputNeurons.length

        // Stage 0: 1 ô đại diện cả batch, bay từ rìa trái vào giữa cột input
        spawn({ x: 0, y: entryY }, { x: entryX, y: entryY }, ENTRY_MS)

        timeouts.current.push(
            window.setTimeout(() => {
                // Stage 1: tách thành 1 ô cho mỗi input node
                inputNeurons.forEach((pos) => spawn({ x: entryX, y: entryY }, pos, SPLIT_MS))
                timeouts.current.push(window.setTimeout(() => runLayerHops(0), SPLIT_MS))
            }, ENTRY_MS),
        )

        return () => {
            timeouts.current.forEach((t) => window.clearTimeout(t))
            timeouts.current = []
        }
        // architecture chỉ dùng để giữ closure layout mới nhất khi pulseSignal đổi,
        // không cần theo dõi layout/architecture riêng — 1 pulse chạy trọn với
        // đúng layout tại thời điểm bắn ra
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pulseSignal])

    const removeSquare = (id: number) => setSquares((prev) => prev.filter((s) => s.id !== id))

    // squares nằm trong svg overlay riêng (anh em của <ReactFlow>), nên cần tự
    // áp transform pan/zoom của viewport để khớp vị trí với node/edge bên
    // trong ReactFlow — zoom luôn khoá =1 nhưng x/y đổi khi pan
    const { x: vx, y: vy, zoom } = useViewport()

    if (architecture.length === 0) return null

    return (
        <svg className="pulse-overlay">
            <g transform={`translate(${vx} ${vy}) scale(${zoom})`}>
                {squares.map((sq) => (
                    <motion.rect
                        key={sq.id}
                        className="pulse-square"
                        width={SQUARE_SIZE}
                        height={SQUARE_SIZE}
                        rx={2}
                        x={-SQUARE_SIZE / 2}
                        y={-SQUARE_SIZE / 2}
                        initial={{ x: sq.xs[0], y: sq.ys[0], scale: 0.3, opacity: 0 }}
                        animate={{ x: sq.xs, y: sq.ys, scale: [0.3, 1.15, 1], opacity: 1 }}
                        transition={{ duration: sq.durationMs / 1000, ease: 'linear' }}
                        onAnimationComplete={() => removeSquare(sq.id)}
                    />
                ))}
            </g>
        </svg>
    )
}

export default NetworkPulse
