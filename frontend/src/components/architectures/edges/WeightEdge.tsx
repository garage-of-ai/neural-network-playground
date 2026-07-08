import { useState } from 'react'
import { EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import { bezierMidpoint, bezierPath, weightColor } from '../layoutMath'
import type { WeightEdgeData } from '../useNetworkFlowGraph'

// Vẫn dùng nguyên bezierPath/bezierMidpoint của layoutMath (S-curve nằm
// ngang) thay vì getBezierPath mặc định của React Flow, để giữ đúng hình
// dáng đường cong cũ. Tooltip hover dùng EdgeLabelRenderer của React Flow để
// tự động theo đúng pan/zoom của viewport thay vì tự tính toạ độ màn hình
function WeightEdge({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
    const { weight, isIncomingToActive, isDimmed } = data as WeightEdgeData
    const [hovered, setHovered] = useState(false)
    const from = { x: sourceX, y: sourceY }
    const to = { x: targetX, y: targetY }
    const mid = bezierMidpoint(from, to)

    return (
        <>
            <path
                className={'edge' + (isDimmed ? ' edge--dim' : '') + (isIncomingToActive ? ' edge--hot' : '')}
                d={bezierPath(from, to)}
                stroke={weightColor(weight)}
                strokeWidth={Math.max(1, Math.abs(weight) * 3)}
                fill="none"
                onMouseEnter={(e) => {
                    e.stopPropagation()
                    setHovered(true)
                }}
                onMouseLeave={() => setHovered(false)}
            />
            {hovered && (
                <EdgeLabelRenderer>
                    <div
                        className="edge-tooltip"
                        style={{
                            transform: `translate(-50%, -135%) translate(${mid.x}px, ${mid.y}px)`,
                            color: weightColor(weight),
                        }}
                    >
                        w = {weight.toFixed(3)}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    )
}

export default WeightEdge
