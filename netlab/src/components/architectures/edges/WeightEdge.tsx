import { useState } from 'react'
import { EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import { bezierMidpoint, bezierPath, weightColor } from '../layoutMath'
import type { WeightEdgeData } from '../useNetworkFlowGraph'


const HIT_WIDTH = 14

function WeightEdge({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
    const { weight, isIncomingToActive, isDimmed } = data as WeightEdgeData
    const [hovered, setHovered] = useState(false)
    const from = { x: sourceX, y: sourceY }
    const to = { x: targetX, y: targetY }
    const mid = bezierMidpoint(from, to)
    const d = bezierPath(from, to)
    const isHot = isIncomingToActive || hovered

    return (
        <>
            <path
                className="edge-hit"
                d={d}
                strokeWidth={HIT_WIDTH}
                onMouseEnter={(e) => {
                    e.stopPropagation()
                    setHovered(true)
                }}
                onMouseLeave={() => setHovered(false)}
            />
            <path
                className={'edge' + (isDimmed ? ' edge--dim' : '') + (isHot ? ' edge--hot' : '')}
                d={d}
                stroke={weightColor(weight)}
                strokeWidth={Math.max(1, Math.abs(weight) * 1.5)}
                fill="none"
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
