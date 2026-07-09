import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { DatasetConfig, DatasetKind, DatasetPoint } from '../types'
import { useSocket } from './SocketContext'
import { DEFAULT_DATASET_CONFIG } from './defaults'

// tránh spam WS khi người dùng kéo slider trainSplit/noise liên tục — xem
// ghi chú thiết kế ở PLAN.API.md mục 1.3
const SLIDER_DEBOUNCE_MS = 300

interface DatasetContextValue {
    config: DatasetConfig
    trainPoints: DatasetPoint[]
    testPoints: DatasetPoint[]
    ready: boolean
    setKind: (kind: DatasetKind) => void
    setTrainSplit: (value: number) => void
    setNoise: (value: number) => void
}

const DatasetContext = createContext<DatasetContextValue | null>(null)

export function DatasetProvider({ children }: { children: ReactNode }) {
    const { sendMessage, subscribe, ready } = useSocket()
    const [config, setConfig] = useState<DatasetConfig>(DEFAULT_DATASET_CONFIG)
    const [trainPoints, setTrainPoints] = useState<DatasetPoint[]>([])
    const [testPoints, setTestPoints] = useState<DatasetPoint[]>([])
    const debounceRef = useRef<number | null>(null)

    useEffect(() => {
        const unsub = subscribe('dataset_points', (msg) => {
            setTrainPoints(msg.train)
            setTestPoints(msg.test)
        })
        return unsub
    }, [subscribe])

    const sendUpdateDebounced = (next: DatasetConfig) => {
        if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
        debounceRef.current = window.setTimeout(() => {
            sendMessage({ type: 'update_dataset', datasetConfig: next })
        }, SLIDER_DEBOUNCE_MS)
    }

    const setKind = (kind: DatasetKind) => {
        const next = { ...config, kind }
        setConfig(next)
        // đổi kind là hành động rời rạc (bấm nút xác nhận), gửi ngay không debounce
        sendMessage({ type: 'update_dataset', datasetConfig: next })
    }

    const setTrainSplit = (trainSplit: number) => {
        const next = { ...config, trainSplit }
        setConfig(next)
        sendUpdateDebounced(next)
    }

    const setNoise = (noise: number) => {
        const next = { ...config, noise }
        setConfig(next)
        sendUpdateDebounced(next)
    }

    return (
        <DatasetContext.Provider value={{ config, trainPoints, testPoints, ready, setKind, setTrainSplit, setNoise }}>
            {children}
        </DatasetContext.Provider>
    )
}

export function useDataset() {
    const ctx = useContext(DatasetContext)
    if (!ctx) throw new Error('useDataset phải được gọi bên trong DatasetProvider')
    return ctx
}
