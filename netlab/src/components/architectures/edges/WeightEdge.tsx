import { useState } from 'react'
import { EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import { bezierMidpoint, bezierPath, weightColor } from '../layoutMath'
import type { WeightEdgeData } from '../useNetworkFlowGraph'

// độ dày vùng bắt hover, cố định — không tỉ lệ theo |weight| như nét vẽ
// thật, để cạnh trọng số nhỏ (nét ~1px) vẫn dễ trỏ chuột vào
const HIT_WIDTH = 14

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
    const d = bezierPath(from, to)
    const isHot = isIncomingToActive || hovered

    return (
        <>
            {/* path vô hình, dày hơn hẳn nét vẽ thật — nhận hover/tooltip thay cho
                nét mảnh bên dưới nó về mặt thị giác (2 path cùng toạ độ) */}
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
                strokeWidth={Math.max(1, Math.abs(weight) * 3)}
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
