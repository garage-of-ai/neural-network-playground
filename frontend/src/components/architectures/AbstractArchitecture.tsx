import { Fragment } from 'react'
import { useNetwork } from '../../context/NetworkContext'
import './AbstractArchitecture.css'

function AbstractArchitecture() {
    const { architecture, insertLayer, removeLayer, addUnit, removeUnit } = useNetwork()

    return (
        <div className="panel abstract-panel">
            <div className="title">Kiến trúc (dạng khối)</div>
            <div className="abstract-scroll">
                <div className="abstract-stack">
                    {architecture.map((layer, li) => (
                        <Fragment key={li}>
                            {li > 0 && (
                                <div className="insert-row">
                                    <span className="insert-line" />
                                    <button className="insert-btn" onClick={() => insertLayer(li)}>+ layer</button>
                                    <span className="insert-line" />
                                </div>
                            )}
                            {li > 0 && <div className="arrow-right" />}

                            <div className={`abstract-box abstract-box--${layer.kind}`}>
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
                            </div>
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AbstractArchitecture
