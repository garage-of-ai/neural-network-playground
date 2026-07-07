import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { TrainingConfig } from '../types'
import { useNetwork } from './NetworkContext'

const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
    optimizer: 'adam',
    learningRate: 0.03,
    batchSize: 16,
    epochs: 200,
    weightInit: 'uniform',
}

const INITIAL_LOSS = 0.69
const INITIAL_ACCURACY = 0.5
const HISTORY_LIMIT = 60
const PLAY_INTERVAL_MS = 500

interface TrainingContextValue {
    config: TrainingConfig
    setConfig: (config: TrainingConfig) => void
    epoch: number
    lossHistory: number[]
    accuracyHistory: number[]
    isPlaying: boolean
    step: () => void
    runEpoch: () => void
    togglePlay: () => void
    reset: () => void
}

const TrainingContext = createContext<TrainingContextValue | null>(null)

// TODO(backend): step()/runEpoch() hiện đang giả lập loss/accuracy bằng số ngẫu
// nhiên (giữ tinh thần mockups/draft-2/main.js) để UI chạy được ngay. Khi có
// backend huấn luyện thật qua websocket, chỉ cần thay nội dung 2 hàm này,
// các component tiêu thụ context (TrainingControls, CheckPanel...) không cần đổi.
export function TrainingProvider({ children }: { children: ReactNode }) {
    const { jitterWeights, resetWeights } = useNetwork()
    const [config, setConfig] = useState<TrainingConfig>(DEFAULT_TRAINING_CONFIG)
    const [epoch, setEpoch] = useState(0)
    const [lossHistory, setLossHistory] = useState<number[]>([INITIAL_LOSS])
    const [accuracyHistory, setAccuracyHistory] = useState<number[]>([INITIAL_ACCURACY])
    const [isPlaying, setIsPlaying] = useState(false)
    const intervalRef = useRef<number | null>(null)

    const step = () => {
        setEpoch((e) => e + 1)
        setLossHistory((prev) => {
            const value = Math.max(0.02, prev[prev.length - 1] * (0.9 + Math.random() * 0.08))
            const next = [...prev, value]
            return next.length > HISTORY_LIMIT ? next.slice(1) : next
        })
        setAccuracyHistory((prev) => {
            const value = Math.min(0.99, prev[prev.length - 1] + Math.random() * 0.03)
            const next = [...prev, value]
            return next.length > HISTORY_LIMIT ? next.slice(1) : next
        })
        jitterWeights()
    }

    const runEpoch = () => {
        for (let i = 0; i < 5; i++) step()
    }

    const togglePlay = () => setIsPlaying((p) => !p)

    const reset = () => {
        setIsPlaying(false)
        setEpoch(0)
        setLossHistory([INITIAL_LOSS])
        setAccuracyHistory([INITIAL_ACCURACY])
        resetWeights()
    }

    useEffect(() => {
        if (!isPlaying) return
        intervalRef.current = window.setInterval(step, PLAY_INTERVAL_MS)
        return () => {
            if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
        }
        // step() cố ý không nằm trong deps: nó luôn đọc state mới nhất qua các
        // setter dạng functional update, nên không bị "stale" dù effect chỉ
        // chạy lại khi isPlaying đổi
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying])

    return (
        <TrainingContext.Provider
            value={{ config, setConfig, epoch, lossHistory, accuracyHistory, isPlaying, step, runEpoch, togglePlay, reset }}
        >
            {children}
        </TrainingContext.Provider>
    )
}

export function useTraining() {
    const ctx = useContext(TrainingContext)
    if (!ctx) throw new Error('useTraining phải được gọi bên trong TrainingProvider')
    return ctx
}
