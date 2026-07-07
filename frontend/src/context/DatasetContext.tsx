import { createContext, useContext, useState, type ReactNode } from 'react'
import type { DatasetConfig, DatasetKind } from '../types'

const DEFAULT_CONFIG: DatasetConfig = { kind: 'circle', trainSplit: 80, noise: 10 }

interface DatasetContextValue {
    config: DatasetConfig
    setKind: (kind: DatasetKind) => void
    setTrainSplit: (value: number) => void
    setNoise: (value: number) => void
}

const DatasetContext = createContext<DatasetContextValue | null>(null)

export function DatasetProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<DatasetConfig>(DEFAULT_CONFIG)

    const setKind = (kind: DatasetKind) => setConfig((c) => ({ ...c, kind }))
    const setTrainSplit = (trainSplit: number) => setConfig((c) => ({ ...c, trainSplit }))
    const setNoise = (noise: number) => setConfig((c) => ({ ...c, noise }))

    return (
        <DatasetContext.Provider value={{ config, setKind, setTrainSplit, setNoise }}>
            {children}
        </DatasetContext.Provider>
    )
}

export function useDataset() {
    const ctx = useContext(DatasetContext)
    if (!ctx) throw new Error('useDataset phải được gọi bên trong DatasetProvider')
    return ctx
}
