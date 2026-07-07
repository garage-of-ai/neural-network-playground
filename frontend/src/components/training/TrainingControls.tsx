import { useTraining } from '../../context/TrainingContext'
import './TrainingControls.css'

function TrainingControls() {
    const { isPlaying, step, runEpoch, togglePlay, reset } = useTraining()

    return (
        <div className="transport">
            <button className="doodle-btn transport-step" title="Huấn luyện 1 bước" onClick={step}>
                Bước
            </button>
            <div className="transport-row">
                <button className="doodle-btn" title="Huấn luyện 1 vòng" onClick={runEpoch}>
                    Vòng
                </button>
                <button className="doodle-btn primary" title="Huấn luyện / Tạm dừng" onClick={togglePlay}>
                    {isPlaying ? 'Tạm dừng' : 'Chạy'}
                </button>
            </div>
            <button className="doodle-btn danger transport-reset" title="Reset" onClick={reset}>
                Reset
            </button>
        </div>
    )
}

export default TrainingControls
