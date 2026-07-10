import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { ActivationFn, DatasetKind, LayerConfig, NetworkWeights } from '../types'
import { createRandomWeights } from '../utils/weights'
import { useEngine } from './EngineContext'
import { useDataset } from './DatasetContext'
import { DEFAULT_ARCHITECTURE, makeLayerId } from './defaults'

export interface PredictionGrid {
    resolution: number
    grid: number[][]
}


const MULTI_CLASS_UNITS: Partial<Record<DatasetKind, number>> = { blobs3: 3 }

function outputShapeForDataset(kind: DatasetKind): { units: number; activation: ActivationFn } {
    const units = MULTI_CLASS_UNITS[kind] ?? 1
    return { units, activation: units > 1 ? 'softmax' : 'sigmoid' }
}

interface NetworkContextValue {
    architecture: LayerConfig[]
    weights: NetworkWeights
    predictionGrid: PredictionGrid | null
    insertLayer: (atIndex: number) => void
    removeLayer: (index: number) => void
    addUnit: (index: number) => void
    removeUnit: (index: number) => void
    setActivation: (index: number, activation: ActivationFn) => void
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
    const { sendMessage, subscribe } = useEngine()
    const { config: datasetConfig } = useDataset()
    const [architecture, setArchitecture] = useState<LayerConfig[]>(DEFAULT_ARCHITECTURE)
    const [weights, setWeights] = useState<NetworkWeights>(() => createRandomWeights(DEFAULT_ARCHITECTURE))
    const [predictionGrid, setPredictionGrid] = useState<PredictionGrid | null>(null)

    useEffect(() => {
        const unsubState = subscribe('state_update', (msg) => setWeights(msg.weights))
        const unsubGrid = subscribe('prediction_grid', (msg) => setPredictionGrid({ resolution: msg.resolution, grid: msg.grid }))
        return () => {
            unsubState()
            unsubGrid()
        }
    }, [subscribe])

    const prevDatasetKindRef = useRef<DatasetKind | null>(null)
    useEffect(() => {
        if (prevDatasetKindRef.current === null) {
            prevDatasetKindRef.current = datasetConfig.kind
            return
        }
        if (prevDatasetKindRef.current === datasetConfig.kind) return
        prevDatasetKindRef.current = datasetConfig.kind

        const { units, activation } = outputShapeForDataset(datasetConfig.kind)
        const outputIndex = architecture.length - 1
        const outputLayer = architecture[outputIndex]
        if (outputLayer.units === units && outputLayer.activation === activation) return

        const next = architecture.map((layer, i) => (i === outputIndex ? { ...layer, units, activation } : layer))
        setArchitecture(next)
        setWeights(createRandomWeights(next))
        sendMessage({ type: 'update_architecture', architecture: next })
        
    }, [datasetConfig.kind])

    
    const insertLayer = (atIndex: number) => {
        const next = [...architecture]
        next.splice(atIndex, 0, { id: makeLayerId(), units: 3, kind: 'hidden', label: 'Hidden Layer', activation: 'sigmoid' })
        setArchitecture(next)
        setWeights(createRandomWeights(next))
        sendMessage({ type: 'update_architecture', architecture: next })
    }

    const removeLayer = (index: number) => {
        const next = architecture.filter((_, i) => i !== index)
        setArchitecture(next)
        setWeights(createRandomWeights(next))
        sendMessage({ type: 'update_architecture', architecture: next })
    }

    const addUnit = (index: number) => {
        const next = architecture.map((layer, i) => (i === index ? { ...layer, units: layer.units + 1 } : layer))
        setArchitecture(next)
        setWeights(createRandomWeights(next))
        sendMessage({ type: 'update_architecture', architecture: next })
    }

    const removeUnit = (index: number) => {
        if (architecture[index].units <= 1) return
        const next = architecture.map((layer, i) => (i === index ? { ...layer, units: layer.units - 1 } : layer))
        setArchitecture(next)
        setWeights(createRandomWeights(next))
        sendMessage({ type: 'update_architecture', architecture: next })
    }

    const setActivation = (index: number, activation: ActivationFn) => {
        if (architecture[index]?.kind !== 'hidden') return
        const next = architecture.map((layer, i) => (i === index ? { ...layer, activation } : layer))
        setArchitecture(next)
        sendMessage({ type: 'update_architecture', architecture: next })
    }

    return (
        <NetworkContext.Provider
            value={{ architecture, weights, predictionGrid, insertLayer, removeLayer, addUnit, removeUnit, setActivation }}
        >
            {children}
        </NetworkContext.Provider>
    )
}

export function useNetwork() {
    const ctx = useContext(NetworkContext)
    if (!ctx) throw new Error('useNetwork phải được gọi bên trong NetworkProvider')
    return ctx
}
