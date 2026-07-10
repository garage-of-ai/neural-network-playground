import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { ClientMessage, ServerMessage } from '../types'
import { DEFAULT_ARCHITECTURE, DEFAULT_DATASET_CONFIG, DEFAULT_TRAINING_CONFIG } from './defaults'
import { TrainingEngine } from '../engine/trainingEngine'

type Listener<T extends ServerMessage['type']> = (msg: Extract<ServerMessage, { type: T }>) => void

interface EngineContextValue {
    connected: boolean
    ready: boolean
    lastError: string | null
    sendMessage: (msg: ClientMessage) => void
    subscribe: <T extends ServerMessage['type']>(type: T, listener: Listener<T>) => () => void
}

const EngineContext = createContext<EngineContextValue | null>(null)

export function EngineProvider({ children }: { children: ReactNode }) {
    const engineRef = useRef<TrainingEngine | null>(null)
    if (!engineRef.current) engineRef.current = new TrainingEngine()

    const initializedRef = useRef(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listenersRef = useRef(new Map<string, Set<(msg: any) => void>>())
    const [connected, setConnected] = useState(false)
    const [ready, setReady] = useState(false)
    const [lastError, setLastError] = useState<string | null>(null)

    const publish = (msg: ServerMessage) => {
        if (msg.type === 'state_update') setReady(true)
        if (msg.type === 'error') setLastError(msg.message)
        listenersRef.current.get(msg.type)?.forEach((listener) => listener(msg))
    }

    const dispatch = (msg: ClientMessage) => {
        const engine = engineRef.current!
        try {
            switch (msg.type) {
                case 'session_init': {
                    const { datasetPoints, stateUpdate, predictionGrid } = engine.initSession(msg.architecture, msg.trainingConfig, msg.datasetConfig)
                    publish(datasetPoints)
                    publish(stateUpdate)
                    publish(predictionGrid)
                    break
                }
                case 'update_architecture': {
                    const { stateUpdate, predictionGrid } = engine.rebuildNetwork(msg.architecture)
                    publish(stateUpdate)
                    publish(predictionGrid)
                    break
                }
                case 'update_dataset': {
                    const { datasetPoints, predictionGrid } = engine.rebuildDataset(msg.datasetConfig)
                    publish(datasetPoints)
                    publish(predictionGrid)
                    break
                }
                case 'update_training_config': {
                    const result = engine.updateTrainingConfig(msg.trainingConfig)
                    if (result.weightsChanged) {
                        publish(result.stateUpdate)
                        publish(result.predictionGrid)
                    }
                    break
                }
                case 'step': {
                    const { stateUpdate, predictionGrid } = engine.step()
                    publish(stateUpdate)
                    publish(predictionGrid)
                    break
                }
                case 'run_epoch': {
                    const { stateUpdate, predictionGrid } = engine.runEpoch()
                    publish(stateUpdate)
                    publish(predictionGrid)
                    break
                }
                case 'reset': {
                    const { stateUpdate, predictionGrid } = engine.reset()
                    publish(stateUpdate)
                    publish(predictionGrid)
                    break
                }
            }
        } catch (exc) {
            publish({ type: 'error', message: exc instanceof Error ? exc.message : String(exc), code: 'internal_error' })
        }
    }


    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true
        setConnected(true)
        dispatch({
            type: 'session_init',
            architecture: DEFAULT_ARCHITECTURE,
            trainingConfig: DEFAULT_TRAINING_CONFIG,
            datasetConfig: DEFAULT_DATASET_CONFIG,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const sendMessage = (msg: ClientMessage) => dispatch(msg)

    const subscribe: EngineContextValue['subscribe'] = (type, listener) => {
        if (!listenersRef.current.has(type)) listenersRef.current.set(type, new Set())
        listenersRef.current.get(type)!.add(listener)
        return () => listenersRef.current.get(type)?.delete(listener)
    }

    return (
        <EngineContext.Provider value={{ connected, ready, lastError, sendMessage, subscribe }}>
            {children}
        </EngineContext.Provider>
    )
}

export function useEngine() {
    const ctx = useContext(EngineContext)
    if (!ctx) throw new Error('useEngine phải được gọi bên trong EngineProvider')
    return ctx
}
