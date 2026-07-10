import { useState } from 'react'
import DatasetPreview from './DatasetPreview'
import { useDataset } from '../../context/DatasetContext'
import type { DatasetKind } from '../../types'
import './DatasetPanel.css'

const DATASETS: DatasetKind[] = ['circle', 'xor', 'gauss', 'spiral', 'moons', 'blobs3']

function DatasetPanel() {
    const { config, ready, setKind, setTrainSplit, setNoise } = useDataset()

    
    const [previewIndex, setPreviewIndex] = useState(DATASETS.indexOf(config.kind))
    const previewKind = DATASETS[previewIndex]
    const isSelected = previewKind === config.kind

    const gotoDataset = (step: number) => {
        setPreviewIndex((prev) => (prev + step + DATASETS.length) % DATASETS.length)
    }

    return (
        <div className="panel dataset-panel">
            <div className="title">Tập dữ liệu</div>

            <div className="dataset-carousel">
                <button
                    className="carousel-arrow carousel-arrow--left"
                    aria-label="Dataset trước"
                    onClick={() => gotoDataset(-1)}
                >
                    <svg viewBox="0 0 32 32">
                        <polygon points="26,4 4,16 26,28" />
                    </svg>
                </button>
                <div className="dataset-focus">
                    <DatasetPreview kind={previewKind} />
                    <div className="dataset-name">{previewKind}</div>
                </div>
                <button
                    className="carousel-arrow carousel-arrow--right"
                    aria-label="Dataset kế tiếp"
                    onClick={() => gotoDataset(1)}
                >
                    <svg viewBox="0 0 32 32">
                        <polygon points="6,4 28,16 6,28" />
                    </svg>
                </button>
            </div>
            {isSelected ? (
                <div className="dataset-confirm dataset-confirm--selected">
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                        <polyline points="4,10 8,14 16,5" />
                    </svg>
                    Đã chọn
                </div>
            ) : (
                <button className="doodle-btn primary dataset-confirm" onClick={() => setKind(previewKind)} disabled={!ready}>
                    Chọn dataset này
                </button>
            )}

            <div className="slider-row">
                <label>
                    <span>Train / Test</span>
                    <span>{config.trainSplit} / {100 - config.trainSplit}</span>
                </label>
                <input
                    type="range"
                    min={50}
                    max={95}
                    value={config.trainSplit}
                    onChange={(e) => setTrainSplit(Number(e.target.value))}
                    disabled={!ready}
                />
            </div>

            <div className="slider-row">
                <label>
                    <span>Nhiễu (noise)</span>
                    <span>{config.noise}%</span>
                </label>
                <input
                    type="range"
                    min={0}
                    max={50}
                    value={config.noise}
                    onChange={(e) => setNoise(Number(e.target.value))}
                    disabled={!ready}
                />
            </div>
        </div>
    )
}

export default DatasetPanel
