import { Fragment, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useNetwork } from '../../context/NetworkContext'
import { useTraining } from '../../context/TrainingContext'
import ActivationPicker from './ActivationPicker'
import './AbstractArchitecture.css'

const popIn = {
    initial: { scale: 0.25, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 420, damping: 18 },
}

const DELETE_CONFIRM_TIMEOUT_MS = 2200

function DeleteLayerButton({ disabled, onConfirm }: { disabled: boolean; onConfirm: () => void }) {
    const [confirming, setConfirming] = useState(false)
    const timerRef = useRef<number | null>(null)

    useEffect(() => () => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }, [])

    useEffect(() => {
        if (disabled && timerRef.current !== null) {
            window.clearTimeout(timerRef.current)
            timerRef.current = null
            setConfirming(false)
        }
    }, [disabled])

    const handleClick = () => {
        if (confirming) {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current)
            timerRef.current = null
            setConfirming(false)
            onConfirm()
            return
        }
        setConfirming(true)
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null
            setConfirming(false)
        }, DELETE_CONFIRM_TIMEOUT_MS)
    }

    return (
        <button
            type="button"
            className={`del-x${confirming ? ' del-x--confirm' : ''}`}
            disabled={disabled}
            onClick={handleClick}
            aria-label={confirming ? 'Bấm lần nữa để xác nhận xoá layer' : 'Xoá layer'}
        >
            {confirming ? 'Xoá?' : '✕'}
        </button>
    )
}

function AbstractArchitecture() {
    const { architecture, insertLayer, removeLayer, addUnit, removeUnit, setActivation } = useNetwork()
    const { hasTrainedSinceReset } = useTraining()

    const locked = hasTrainedSinceReset

    return (
        <div className={`panel abstract-panel${locked ? ' abstract-panel--locked' : ''}`}>
            <div className="title">
                Chỉnh sửa kiến trúc
                {locked && <span className="lock-tag">Reset để thay đổi kiến trúc</span>}
            </div>
            <div className="abstract-scroll">
                <div className="abstract-stack">
                    {architecture.map((layer, li) => (
                        <Fragment key={layer.id}>
                            {li > 0 && (
                                <div className="splice">
                                    <button
                                        type="button"
                                        className="insert-btn"
                                        disabled={locked}
                                        onClick={() => insertLayer(li)}
                                        aria-label="Chèn layer mới"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                            {li > 0 && <div className="arrow-right" />}

                            <motion.div layout {...popIn} className={`abstract-box abstract-box--${layer.kind}`}>
                                {layer.kind === 'hidden' && (
                                    <DeleteLayerButton disabled={locked} onConfirm={() => removeLayer(li)} />
                                )}

                                <div className="box-label">
                                    <b>{layer.label}</b>
                                </div>

                                {layer.kind === 'hidden' ? (
                                    <div className="unit-controls">
                                        <button
                                            className="mini-btn"
                                            disabled={locked}
                                            onClick={() => removeUnit(li)}
                                            aria-label="Giảm số unit"
                                        >
                                            −
                                        </button>
                                        <span className="unit-num">{layer.units}</span>
                                        <button
                                            className="mini-btn"
                                            disabled={locked}
                                            onClick={() => addUnit(li)}
                                            aria-label="Tăng số unit"
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <span className="unit-static">
                                        {layer.units} unit{layer.units > 1 ? 's' : ''}
                                    </span>
                                )}

                                {layer.activation &&
                                    (layer.kind === 'hidden' ? (
                                        <ActivationPicker
                                            value={layer.activation}
                                            disabled={locked}
                                            onChange={(activation) => setActivation(li, activation)}
                                        />
                                    ) : (
                                        <div className="act-static">{layer.activation}</div>
                                    ))}
                            </motion.div>
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AbstractArchitecture
