import { Fragment, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNetwork } from '../../context/NetworkContext'
import { useTraining } from '../../context/TrainingContext'
import {
    COL_WIDTH,
    NEURON_SIZE,
    bezierMidpoint,
    bezierPath,
    computeLayerPositions,
    stageSize,
    weightColor,
} from './layoutMath'
import NetworkPulse from './NetworkPulse'
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

// spring "nảy" khi 1 layer/neuron mới vừa được chèn — chỉ phần tử THẬT SỰ mới
// mount (key=layer.id chưa từng render) mới chạy animation này, các phần tử
// còn lại chỉ dịch chuyển vị trí êm nhờ layout animation của Framer Motion
const popIn = {
    initial: { scale: 0.25, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 420, damping: 18 },
}

function NetworkArchitecture() {
    const { architecture, weights } = useNetwork()
    const { pulseSignal } = useTraining()
    const [activeNeuron, setActiveNeuron] = useState<ActiveNeuron | null>(null)
    const [tooltip, setTooltip] = useState<Tooltip | null>(null)

    const layout = computeLayerPositions(architecture)
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
                        {layout.slice(0, -1).map((fromLayer, li) =>
                            fromLayer.neurons.map(({ unitIndex: i, ...fromPos }) =>
                                layout[li + 1].neurons.map(({ unitIndex: j, ...toPos }) => {
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
                        <NetworkPulse architecture={architecture} layout={layout} pulseSignal={pulseSignal} />
                    </svg>

                    {architecture.map((layer, li) => (
                        <Fragment key={layer.id}>
                            <motion.div
                                layout
                                className="layer-label"
                                style={{ left: li * COL_WIDTH, width: COL_WIDTH }}
                            >
                                <b>{layer.label}</b>
                                {layer.activation && <div className="activation-tag">{layer.activation}</div>}
                            </motion.div>
                            <AnimatePresence initial={false}>
                                {layout[li].neurons.map(({ unitIndex: ni, x, y }) => (
                                    <motion.div
                                        key={`${layer.id}-${ni}`}
                                        layout
                                        {...popIn}
                                        className={`neuron neuron--${layer.kind}`}
                                        style={{ left: x - NEURON_SIZE / 2, top: y - NEURON_SIZE / 2 }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleNeuron(li, ni)
                                        }}
                                    >
                                        {layer.kind === 'input' && `x${ni + 1}`}
                                        {layer.kind === 'output' && 'ŷ'}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {layout[li].ellipsis && (
                                <div
                                    className="layer-ellipsis"
                                    style={{
                                        left: layout[li].neurons[0].x - NEURON_SIZE / 2,
                                        top: layout[li].ellipsis.y - NEURON_SIZE / 2,
                                    }}
                                    title={`còn ${layout[li].ellipsis.hiddenCount} unit nữa`}
                                >
                                    ⋮
                                </div>
                            )}
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
