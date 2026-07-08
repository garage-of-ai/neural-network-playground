import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LayerConfig, NetworkWeights } from '../types'
import { createRandomWeights, jitterWeights as jitterWeightsMatrix } from '../utils/weights'

let nextLayerId = 0
const makeLayerId = () => `layer-${nextLayerId++}`

const DEFAULT_ARCHITECTURE: LayerConfig[] = [
    { id: makeLayerId(), units: 2, kind: 'input', label: 'Input' },
    { id: makeLayerId(), units: 4, kind: 'hidden', label: 'Hidden Layer', activation: 'relu' },
    { id: makeLayerId(), units: 4, kind: 'hidden', label: 'Hidden Layer', activation: 'tanh' },
    { id: makeLayerId(), units: 1, kind: 'output', label: 'Output', activation: 'sigmoid' },
]

interface NetworkContextValue {
    architecture: LayerConfig[]
    weights: NetworkWeights
    insertLayer: (atIndex: number) => void
    removeLayer: (index: number) => void
    addUnit: (index: number) => void
    removeUnit: (index: number) => void
    jitterWeights: () => void
    resetWeights: () => void
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
    const [architecture, setArchitecture] = useState<LayerConfig[]>(DEFAULT_ARCHITECTURE)
    const [weights, setWeights] = useState<NetworkWeights>(() => createRandomWeights(DEFAULT_ARCHITECTURE))

    // architecture và weights luôn được set cùng nhau trong 1 lần gọi (React 18
    // batch chung thành 1 re-render) để tránh 2 state lệch nhau ở giữa 2 lần render
    const insertLayer = (atIndex: number) => {
        const next = [...architecture]
        next.splice(atIndex, 0, { id: makeLayerId(), units: 3, kind: 'hidden', label: 'Hidden Layer', activation: 'relu' })
        setArchitecture(next)
        setWeights(createRandomWeights(next))
    }

    const removeLayer = (index: number) => {
        const next = architecture.filter((_, i) => i !== index)
        setArchitecture(next)
        setWeights(createRandomWeights(next))
    }

    const addUnit = (index: number) => {
        const next = architecture.map((layer, i) => (i === index ? { ...layer, units: layer.units + 1 } : layer))
        setArchitecture(next)
        setWeights(createRandomWeights(next))
    }

    const removeUnit = (index: number) => {
        if (architecture[index].units <= 1) return
        const next = architecture.map((layer, i) => (i === index ? { ...layer, units: layer.units - 1 } : layer))
        setArchitecture(next)
        setWeights(createRandomWeights(next))
    }

    const jitterWeights = () => setWeights((prev) => jitterWeightsMatrix(prev))
    const resetWeights = () => setWeights(createRandomWeights(architecture))

    return (
        <NetworkContext.Provider
            value={{ architecture, weights, insertLayer, removeLayer, addUnit, removeUnit, jitterWeights, resetWeights }}
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
