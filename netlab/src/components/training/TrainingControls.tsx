import { useTraining } from '../../context/TrainingContext'
import { useLocale } from '../../context/LocaleContext'
import './TrainingControls.css'

function TrainingControls() {
    const { isPlaying, ready, hasTrainedSinceReset, step, runEpoch, togglePlay, reset } = useTraining()
    const { t } = useLocale()

    return (
        <div className="transport">
            {!ready && <div className="transport-status">{t.trainingControls.connecting}</div>}
            <button className="doodle-btn transport-step" title={t.trainingControls.stepTitle} onClick={step} disabled={!ready}>
                {t.trainingControls.step}
            </button>
            <div className="transport-row">
                <button className="doodle-btn" title={t.trainingControls.epochTitle} onClick={runEpoch} disabled={!ready}>
                    {t.trainingControls.epoch}
                </button>
                <button className="doodle-btn primary" title={t.trainingControls.playTitle} onClick={togglePlay} disabled={!ready}>
                    {isPlaying ? t.trainingControls.pause : t.trainingControls.play}
                </button>
            </div>
            {/* chưa huấn luyện bước nào (hoặc vừa reset xong) thì chưa có gì để reset */}
            <button
                className="doodle-btn danger transport-reset"
                title={t.trainingControls.reset}
                onClick={reset}
                disabled={!ready || !hasTrainedSinceReset}
            >
                {t.trainingControls.reset}
            </button>
        </div>
    )
}

export default TrainingControls
