import type { NodeProps } from '@xyflow/react'
import type { EllipsisNodeData } from '../useNetworkFlowGraph'

function EllipsisNode({ data }: NodeProps) {
    const { hiddenCount } = data as EllipsisNodeData

    return (
        <div className="layer-ellipsis" title={`còn ${hiddenCount} unit nữa`}>
            ⋮
        </div>
    )
}

export default EllipsisNode
