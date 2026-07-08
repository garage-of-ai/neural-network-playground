import { AnimatePresence, motion } from 'motion/react'
import { useViewport } from '@xyflow/react'
import type { LayerConfig } from '../../types'
import { COL_WIDTH } from './layoutMath'

interface LayerLabelBarProps {
    architecture: LayerConfig[]
}

// Label tách hẳn khỏi lớp đồ thị (không phải React Flow node): chỉ bám theo
// trục X của viewport khi pan để luôn gióng thẳng đúng cột layer, còn trục Y
// luôn cố định ở đáy stage — không "trôi" theo khi kéo đồ thị lên/xuống. Nằm
// ở lớp trên cùng (z-index cao) với nền phủ bán trong suốt, để khi mạng lớn
// tràn xuống đáy thì phần bị che là neuron/edge chứ không phải label
function LayerLabelBar({ architecture }: LayerLabelBarProps) {
    const { x } = useViewport()

    return (
        <div className="layer-label-bar">
            <AnimatePresence initial={false}>
                {architecture.map((layer, li) => (
                    <motion.div
                        key={layer.id}
                        initial={{ scale: 0.25, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.25, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                        className="layer-label"
                        style={{ left: x + li * COL_WIDTH, width: COL_WIDTH }}
                    >
                        <b>{layer.label}</b>
                        {layer.activation && <div className="activation-tag">{layer.activation}</div>}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default LayerLabelBar
