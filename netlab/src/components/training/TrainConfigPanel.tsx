import { useState } from 'react'
import { useTraining } from '../../context/TrainingContext'
import { useLocale } from '../../context/LocaleContext'
import OptimizerPicker from './OptimizerPicker'
import NumberPicker from './NumberPicker'
import './TrainConfigPanel.css'

const LEARNING_RATE_PRESETS = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3]
const BATCH_SIZE_PRESETS = [1, 4, 8, 16, 32, 64]
const EPOCHS_PRESETS = [10, 20, 50, 100, 200, 500]

function TrainConfigPanel() {
    const { config, ready, setConfig } = useTraining()
    const { t } = useLocale()
    const [collapsed, setCollapsed] = useState(false)

    const toggleCollapsed = () => setCollapsed((c) => !c)

    const setNumberField = (field: 'learningRate' | 'batchSize' | 'epochs', value: number) => {
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
                <span>{t.trainConfig.title}</span>
                <span className="collapse-arrow">▾</span>
            </div>

            <div className="collapsible-body">
                <div className="collapsible-body-inner">
                    <div className="field-row">
                        <span>{t.trainConfig.optimizer}</span>
                        <OptimizerPicker
                            value={config.optimizer}
                            disabled={!ready}
                            onChange={(optimizer) => setConfig({ ...config, optimizer })}
                        />
                    </div>

                    <div className="field-row">
                        <span>{t.trainConfig.learningRate}</span>
                        <NumberPicker
                            value={config.learningRate}
                            presets={LEARNING_RATE_PRESETS}
                            disabled={!ready}
                            onChange={(value) => setNumberField('learningRate', value)}
                        />
                    </div>

                    <div className="field-row">
                        <span>{t.trainConfig.batchSize}</span>
                        <NumberPicker
                            value={config.batchSize}
                            presets={BATCH_SIZE_PRESETS}
                            disabled={!ready}
                            onChange={(value) => setNumberField('batchSize', value)}
                        />
                    </div>

                    <div className="field-row">
                        <span>{t.trainConfig.epochs}</span>
                        <NumberPicker
                            value={config.epochs}
                            presets={EPOCHS_PRESETS}
                            disabled={!ready}
                            onChange={(value) => setNumberField('epochs', value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrainConfigPanel
