import { motion } from 'motion/react'
import type { NodeProps } from '@xyflow/react'
import type { LayerLabelNodeData } from '../useNetworkFlowGraph'
import { COL_WIDTH } from '../layoutMath'

function LayerLabelNode({ id, data }: NodeProps) {
    const { label, activation, exiting, onExited } = data as LayerLabelNodeData

    return (
        <motion.div
            initial={{ scale: 0.25, opacity: 0 }}
            animate={exiting ? { scale: 0.25, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            onAnimationComplete={() => {
                if (exiting) onExited(id)
            }}
            className="layer-label"
            style={{ width: COL_WIDTH }}
        >
            <b>{label}</b>
            {activation && <div className="activation-tag">{activation}</div>}
        </motion.div>
    )
}

export default LayerLabelNode
