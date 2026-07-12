import { motion } from 'motion/react'
import type { NodeProps } from '@xyflow/react'
import type { EllipsisNodeData } from '../useNetworkFlowGraph'

const popScale = { type: 'spring' as const, stiffness: 420, damping: 18 }

function EllipsisNode({ id, data }: NodeProps) {
    const { hiddenCount, exiting, onExited } = data as EllipsisNodeData

    return (
        <motion.div
            initial={{ scale: 0.25, opacity: 0 }}
            animate={exiting ? { scale: 0.25, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={popScale}
            onAnimationComplete={() => {
                if (exiting) onExited(id)
            }}
            className="layer-ellipsis"
            title={`còn ${hiddenCount} unit nữa`}
        >
            ⋮
        </motion.div>
    )
}

export default EllipsisNode
