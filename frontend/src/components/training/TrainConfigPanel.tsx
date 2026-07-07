import { useState } from 'react'
import { useTraining } from '../../context/TrainingContext'
import type { Optimizer, WeightInit } from '../../types'
import './TrainConfigPanel.css'

function TrainConfigPanel() {
    const { config, setConfig } = useTraining()
    const [collapsed, setCollapsed] = useState(false)

    const toggleCollapsed = () => setCollapsed((c) => !c)

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
                            onChange={(e) => setConfig({ ...config, learningRate: Number(e.target.value) })}
                        />
                    </div>

                    <div className="field-row">
                        <span>Batch size</span>
                        <input
                            className="value-pill"
                            type="number"
                            min={1}
                            value={config.batchSize}
                            onChange={(e) => setConfig({ ...config, batchSize: Number(e.target.value) })}
                        />
                    </div>

                    <div className="field-row">
                        <span>Số epoch</span>
                        <input
                            className="value-pill"
                            type="number"
                            min={1}
                            value={config.epochs}
                            onChange={(e) => setConfig({ ...config, epochs: Number(e.target.value) })}
                        />
                    </div>

                    <div className="field-row">
                        <span>Khởi tạo trọng số</span>
                        <select
                            value={config.weightInit}
                            onChange={(e) => setConfig({ ...config, weightInit: e.target.value as WeightInit })}
                        >
                            <option value="zeros">Zeros</option>
                            <option value="uniform">Uniform ngẫu nhiên</option>
                            <option value="gaussian">Gauss chuẩn</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrainConfigPanel
