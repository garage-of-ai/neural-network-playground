import { useTraining } from '../../context/TrainingContext'
import './TrainingControls.css'

function TrainingControls() {
    const { isPlaying, ready, hasTrainedSinceReset, step, runEpoch, togglePlay, reset } = useTraining()

    return (
        <div className="transport">
            {!ready && <div className="transport-status">Đang kết nối máy chủ...</div>}
            <button className="doodle-btn transport-step" title="Huấn luyện 1 bước" onClick={step} disabled={!ready}>
                Chạy 1 bước
            </button>
            <div className="transport-row">
                <button className="doodle-btn" title="Huấn luyện 1 vòng" onClick={runEpoch} disabled={!ready}>
                    Chạy 1 vòng
                </button>
                <button className="doodle-btn primary" title="Huấn luyện / Tạm dừng" onClick={togglePlay} disabled={!ready}>
                    {isPlaying ? 'Tạm dừng' : 'Chạy liên tục'}
                </button>
            </div>
            {/* chưa huấn luyện bước nào (hoặc vừa reset xong) thì chưa có gì để reset */}
            <button
                className="doodle-btn danger transport-reset"
                title="Reset"
                onClick={reset}
                disabled={!ready || !hasTrainedSinceReset}
            >
                Reset
            </button>
        </div>
    )
}

export default TrainingControls
