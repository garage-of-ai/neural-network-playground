import { Fragment } from 'react'
import { motion } from 'motion/react'
import { useNetwork } from '../../context/NetworkContext'
import './AbstractArchitecture.css'

// spring "nảy" khi 1 box mới vừa được chèn — chỉ box THẬT SỰ mới mount (key=
// layer.id chưa từng render) mới chạy animation này; các box còn lại chỉ dịch
// chuyển vị trí êm nhờ layout animation của Framer Motion
const popIn = {
    initial: { scale: 0.25, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 420, damping: 18 },
}

function AbstractArchitecture() {
    const { architecture, insertLayer, removeLayer, addUnit, removeUnit } = useNetwork()

    return (
        <div className="panel abstract-panel">
            <div className="title">Kiến trúc (dạng khối)</div>
            <div className="abstract-scroll">
                <div className="abstract-stack">
                    {architecture.map((layer, li) => (
                        <Fragment key={layer.id}>
                            {li > 0 && (
                                <div className="insert-row">
                                    <span className="insert-line" />
                                    <button className="insert-btn" onClick={() => insertLayer(li)}>+ layer</button>
                                    <span className="insert-line" />
                                </div>
                            )}
                            {li > 0 && <div className="arrow-right" />}

                            <motion.div layout {...popIn} className={`abstract-box abstract-box--${layer.kind}`}>
                                <div className="box-info">
                                    <b>{layer.label}</b>
                                    <span>{layer.units} unit{layer.units > 1 ? 's' : ''}</span>
                                    {layer.activation && <span className="act-name">({layer.activation})</span>}
                                </div>
                                {layer.kind === 'hidden' && (
                                    <div className="box-controls">
                                        <div className="unit-controls">
                                            <button className="mini-btn" onClick={() => removeUnit(li)}>−</button>
                                            <button className="mini-btn" onClick={() => addUnit(li)}>+</button>
                                        </div>
                                        <button className="mini-btn remove-layer" onClick={() => removeLayer(li)}>x</button>
                                    </div>
                                )}
                            </motion.div>
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AbstractArchitecture
