import { Fragment, useState } from 'react'
import { useNetwork } from '../../context/NetworkContext'
import { COL_WIDTH, NEURON_SIZE, bezierMidpoint, bezierPath, computeLayerPositions, stageSize, weightColor } from './layoutMath'
import './NetworkArchitecture.css'

interface ActiveNeuron {
    layerIndex: number
    unitIndex: number
}

interface Tooltip {
    x: number
    y: number
    weight: number
}

function NetworkArchitecture() {
    const { architecture, weights } = useNetwork()
    const [activeNeuron, setActiveNeuron] = useState<ActiveNeuron | null>(null)
    const [tooltip, setTooltip] = useState<Tooltip | null>(null)

    const positions = computeLayerPositions(architecture)
    const { width, height } = stageSize(architecture)

    const toggleNeuron = (layerIndex: number, unitIndex: number) => {
        setActiveNeuron((prev) =>
            prev && prev.layerIndex === layerIndex && prev.unitIndex === unitIndex
                ? null
                : { layerIndex, unitIndex },
        )
    }

    return (
        <div className="panel network-panel">
            <div className="title">Kiến trúc mạng</div>

            <div className="network-stage" onClick={() => setActiveNeuron(null)}>
                <div className="network-inner" style={{ width, height }}>
                    <svg className="network-edges" viewBox={`0 0 ${width} ${height}`}>
                        {positions.slice(0, -1).map((fromLayer, li) =>
                            fromLayer.map((fromPos, i) =>
                                positions[li + 1].map((toPos, j) => {
                                    const w = weights[li][i][j]
                                    // chỉ giữ sáng các cạnh ĐẾN node đang được toggle
                                    const isIncomingToActive =
                                        activeNeuron !== null &&
                                        activeNeuron.layerIndex === li + 1 &&
                                        activeNeuron.unitIndex === j
                                    const isDimmed = activeNeuron !== null && !isIncomingToActive

                                    return (
                                        <path
                                            key={`${li}-${i}-${j}`}
                                            className={
                                                'edge' + (isDimmed ? ' edge--dim' : '') + (isIncomingToActive ? ' edge--hot' : '')
                                            }
                                            d={bezierPath(fromPos, toPos)}
                                            stroke={weightColor(w)}
                                            strokeWidth={Math.max(1, Math.abs(w) * 3)}
                                            onMouseEnter={(e) => {
                                                e.stopPropagation()
                                                const mid = bezierMidpoint(fromPos, toPos)
                                                setTooltip({ x: mid.x, y: mid.y, weight: w })
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    )
                                }),
                            ),
                        )}
                    </svg>

                    {architecture.map((layer, li) => (
                        <Fragment key={li}>
                            <div className="layer-label" style={{ left: li * COL_WIDTH, width: COL_WIDTH }}>
                                <b>{layer.label}</b>
                                {layer.activation && <div className="activation-tag">{layer.activation}</div>}
                            </div>
                            {positions[li].map((pos, ni) => (
                                <div
                                    key={ni}
                                    className={`neuron neuron--${layer.kind}`}
                                    style={{ left: pos.x - NEURON_SIZE / 2, top: pos.y - NEURON_SIZE / 2 }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleNeuron(li, ni)
                                    }}
                                >
                                    {layer.kind === 'input' && `x${ni + 1}`}
                                    {layer.kind === 'output' && 'ŷ'}
                                </div>
                            ))}
                        </Fragment>
                    ))}

                    {tooltip && (
                        <div
                            className="edge-tooltip"
                            style={{ left: tooltip.x, top: tooltip.y, color: weightColor(tooltip.weight) }}
                        >
                            w = {tooltip.weight.toFixed(3)}
                        </div>
                    )}
                </div>
            </div>

            <div className="legend">
                <span><i className="dot dot--pos" />dương</span>
                <span><i className="dot dot--zero" />0</span>
                <span><i className="dot dot--neg" />âm</span>
            </div>
        </div>
    )
}

export default NetworkArchitecture
