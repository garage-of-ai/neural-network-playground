import { Fragment, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useNetwork } from '../../context/NetworkContext'
import { useTraining } from '../../context/TrainingContext'
import ActivationPicker from './ActivationPicker'
import './AbstractArchitecture.css'

// spring "nảy" khi 1 box mới vừa được chèn — chỉ box THẬT SỰ mới mount (key=
// layer.id chưa từng render) mới chạy animation này; các box còn lại chỉ dịch
// chuyển vị trí êm nhờ layout animation của Framer Motion
const popIn = {
    initial: { scale: 0.25, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 420, damping: 18 },
}

const DELETE_CONFIRM_TIMEOUT_MS = 2200

// badge tròn ở góc khối — bấm lần 1 chuyển sang trạng thái "Xoá?" (rung nhẹ),
// phải bấm thêm lần 2 trong vòng DELETE_CONFIRM_TIMEOUT_MS mới thật sự xoá,
// tránh xoá nhầm layer chỉ vì lỡ tay bấm 1 cái
function DeleteLayerButton({ disabled, onConfirm }: { disabled: boolean; onConfirm: () => void }) {
    const [confirming, setConfirming] = useState(false)
    const timerRef = useRef<number | null>(null)

    useEffect(() => () => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }, [])

    // panel có thể bị khoá ngay giữa lúc đang chờ xác nhận (vd người dùng vừa
    // bấm xoá vừa bấm "Chạy 1 bước" ở panel khác) — huỷ trạng thái chờ cho nhất quán
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
    // mạng đã chạy ít nhất 1 bước kể từ lần reset gần nhất → khoá toàn bộ
    // panel (chèn/xoá layer, đổi unit, đổi hàm kích hoạt) để tránh sửa kiến
    // trúc ngầm trong lúc trọng số đang huấn luyện dở; chỉ Reset mới mở khoá
    // lại (cùng tín hiệu hasTrainedSinceReset dùng để khoá nút chọn cách khởi
    // tạo trọng số ở NetworkArchitecture và mở khoá nút Reset ở TrainingControls)
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
