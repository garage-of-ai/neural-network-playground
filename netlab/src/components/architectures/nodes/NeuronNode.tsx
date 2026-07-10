import { motion } from 'motion/react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NeuronNodeData } from '../useNetworkFlowGraph'

// spring "nảy" khi 1 neuron mới vừa được chèn — animation exit dùng chung
// popScale, chỉ đảo chiều (1 -> 0.25) và tự gọi onExited khi chạy xong để cha
// xoá node thật khỏi mảng nodes (React Flow không tự animate exit)
const popScale = { type: 'spring' as const, stiffness: 420, damping: 18 }

function NeuronNode({ id, data }: NodeProps) {
    const { layerIndex, unitIndex, kind, exiting, onToggle, onExited } = data as NeuronNodeData

    return (
        <motion.div
            initial={{ scale: 0.25, opacity: 0 }}
            animate={exiting ? { scale: 0.25, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={popScale}
            onAnimationComplete={() => {
                if (exiting) onExited(id)
            }}
            className={`neuron neuron--${kind}`}
            onClick={(e) => {
                e.stopPropagation()
                onToggle(layerIndex, unitIndex)
            }}
        >
            <Handle type="target" position={Position.Left} className="neuron-handle" />
            {kind === 'input' && `x${unitIndex + 1}`}
            {kind === 'output' && 'ŷ'}
            <Handle type="source" position={Position.Right} className="neuron-handle" />
        </motion.div>
    )
}

export default NeuronNode
