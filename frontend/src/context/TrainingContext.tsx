import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { TrainingConfig } from '../types'
import { useSocket } from './SocketContext'
import { DEFAULT_TRAINING_CONFIG } from './defaults'

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
    pulseSignal: number
    /** session_init đã được server xử lý xong, an toàn để gửi step/run_epoch/reset */
    ready: boolean
    step: () => void
    runEpoch: () => void
    togglePlay: () => void
    reset: () => void
}

const TrainingContext = createContext<TrainingContextValue | null>(null)

export function TrainingProvider({ children }: { children: ReactNode }) {
    const { sendMessage, subscribe, ready } = useSocket()
    const [config, setConfigState] = useState<TrainingConfig>(DEFAULT_TRAINING_CONFIG)
    const [epoch, setEpoch] = useState(0)
    const [lossHistory, setLossHistory] = useState<number[]>([INITIAL_LOSS])
    const [accuracyHistory, setAccuracyHistory] = useState<number[]>([INITIAL_ACCURACY])
    const [isPlaying, setIsPlaying] = useState(false)
    const [pulseSignal, setPulseSignal] = useState(0)
    const intervalRef = useRef<number | null>(null)

    // toàn bộ epoch/loss/accuracy/weights giờ do server tính, context này chỉ
    // là nơi lưu lại state_update mới nhất để component vẽ lại (xem PLAN.API.md 1.8)
    useEffect(() => {
        const unsub = subscribe('state_update', (msg) => {
            setEpoch(msg.epoch)
            // animation "batch bay qua mạng" chỉ nên chạy khi có 1 bước huấn
            // luyện thật (step/run_epoch) — các state_update khác (session_init,
            // reset, đổi kiến trúc, đổi khởi tạo trọng số) đều đánh dấu
            // weightsReset=true vì chỉ đổi trọng số chứ không có batch nào chạy
            if (!msg.weightsReset) setPulseSignal((n) => n + 1)
            setLossHistory((prev) => {
                const next = msg.weightsReset ? [msg.loss] : [...prev, msg.loss]
                return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next
            })
            setAccuracyHistory((prev) => {
                const next = msg.weightsReset ? [msg.accuracy] : [...prev, msg.accuracy]
                return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next
            })
        })
        return unsub
    }, [subscribe])

    const setConfig = (next: TrainingConfig) => {
        setConfigState(next)
        sendMessage({ type: 'update_training_config', trainingConfig: next })
    }

    const step = () => sendMessage({ type: 'step' })
    const runEpoch = () => sendMessage({ type: 'run_epoch' })
    const togglePlay = () => setIsPlaying((p) => !p)

    const reset = () => {
        setIsPlaying(false)
        sendMessage({ type: 'reset' })
    }

    useEffect(() => {
        if (!isPlaying) return
        intervalRef.current = window.setInterval(step, PLAY_INTERVAL_MS)
        return () => {
            if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
        }
        // step() cố ý không nằm trong deps: nó chỉ gửi 1 WS message không phụ
        // thuộc state cục bộ nào, nên không có nguy cơ "stale" khi effect chỉ
        // chạy lại lúc isPlaying đổi
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying])

    return (
        <TrainingContext.Provider
            value={{ config, setConfig, epoch, lossHistory, accuracyHistory, isPlaying, pulseSignal, ready, step, runEpoch, togglePlay, reset }}
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
