import { useState } from 'react'
import { useTraining } from '../../context/TrainingContext'
import type { Optimizer } from '../../types'
import './TrainConfigPanel.css'

function TrainConfigPanel() {
    const { config, ready, setConfig } = useTraining()
    const [collapsed, setCollapsed] = useState(false)

    const toggleCollapsed = () => setCollapsed((c) => !c)

    // input số cho phép xoá trắng khi gõ (Number('') === 0) — chỉ đẩy lên
    // server khi giá trị hợp lệ, tránh round-trip vô nghĩa luôn bị backend từ
    // chối (schema yêu cầu > 0) và hiện banner lỗi mỗi lần người dùng xoá ô
    const setPositiveNumberField = (field: 'learningRate' | 'batchSize' | 'epochs', raw: string) => {
        const value = Number(raw)
        if (!Number.isFinite(value) || value <= 0) return
        setConfig({ ...config, [field]: value })
    }

    return (
        <div className={`panel collapsible-panel${collapsed ? ' collapsed' : ''}`}>
            <div
                className="title collapsible-header"
                role="button"
                tabIndex={0}
                aria-expanded={!collapsed}
                onClick={toggleCollapsed}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleCollapsed()
                    }
                }}
            >
                <span>Cấu hình huấn luyện</span>
                <span className="collapse-arrow">▾</span>
            </div>

            <div className="collapsible-body">
                <div className="collapsible-body-inner">
                    <div className="field-row">
                        <span>Optimizer</span>
                        <select
                            value={config.optimizer}
                            onChange={(e) => setConfig({ ...config, optimizer: e.target.value as Optimizer })}
                            disabled={!ready}
                        >
                            <option value="sgd">SGD</option>
                            <option value="sgd-momentum">SGD + Momentum</option>
                            <option value="adam">Adam</option>
                        </select>
                    </div>

                    <div className="field-row">
                        <span>Learning rate</span>
                        <input
                            className="value-pill"
                            type="number"
                            step={0.01}
                            min={0.001}
                            value={config.learningRate}
                            onChange={(e) => setPositiveNumberField('learningRate', e.target.value)}
                            disabled={!ready}
                        />
                    </div>

                    <div className="field-row">
                        <span>Batch size</span>
                        <input
                            className="value-pill"
                            type="number"
                            min={1}
                            value={config.batchSize}
                            onChange={(e) => setPositiveNumberField('batchSize', e.target.value)}
                            disabled={!ready}
                        />
                    </div>

                    <div className="field-row">
                        <span>Số epoch</span>
                        <input
                            className="value-pill"
                            type="number"
                            min={1}
                            value={config.epochs}
                            onChange={(e) => setPositiveNumberField('epochs', e.target.value)}
                            disabled={!ready}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrainConfigPanel
