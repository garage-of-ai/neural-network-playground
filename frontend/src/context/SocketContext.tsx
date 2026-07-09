import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { ClientMessage, ServerMessage } from '../types'
import { DEFAULT_ARCHITECTURE, DEFAULT_DATASET_CONFIG, DEFAULT_TRAINING_CONFIG } from './defaults'

const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? 'ws://localhost:8000/ws/training'
const RECONNECT_DELAY_MS = 1500

type Listener<T extends ServerMessage['type']> = (msg: Extract<ServerMessage, { type: T }>) => void

interface SocketContextValue {
    /** true khi kết nối WS đang mở (raw readyState === OPEN) */
    connected: boolean
    /** true sau khi nhận state_update đầu tiên — nghĩa là session_init đã được server xử lý xong */
    ready: boolean
    lastError: string | null
    sendMessage: (msg: ClientMessage) => void
    subscribe: <T extends ServerMessage['type']>(type: T, listener: Listener<T>) => () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
    const wsRef = useRef<WebSocket | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listenersRef = useRef(new Map<string, Set<(msg: any) => void>>())
    const [connected, setConnected] = useState(false)
    const [ready, setReady] = useState(false)
    const [lastError, setLastError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        let reconnectTimer: number | null = null

        const connect = () => {
            if (cancelled) return
            const ws = new WebSocket(WS_URL)
            wsRef.current = ws

            ws.onopen = () => {
                if (wsRef.current !== ws) return
                setConnected(true)
                const initMessage: ClientMessage = {
                    type: 'session_init',
                    architecture: DEFAULT_ARCHITECTURE,
                    trainingConfig: DEFAULT_TRAINING_CONFIG,
                    datasetConfig: DEFAULT_DATASET_CONFIG,
                }
                ws.send(JSON.stringify(initMessage))
            }

            // mất kết nối (server restart, mạng chập chờn...) không được để
            // app kẹt vĩnh viễn ở trạng thái "chưa ready" — tự thử kết nối lại
            // sau 1 khoảng cố định, huỷ nếu component đã unmount.
            // Guard wsRef.current !== ws: sự kiện close của 1 kết nối đã bị
            // thay thế (vd StrictMode dev mount 2 lần) có thể bắn ra SAU khi
            // 1 kết nối mới hơn đã được gán vào wsRef — nếu không check, nó
            // sẽ xoá nhầm tham chiếu tới kết nối mới đang sống, khiến
            // sendMessage() im lặng không gửi được gì nữa dù UI vẫn "ready"
            ws.onclose = () => {
                if (wsRef.current !== ws) return
                setConnected(false)
                setReady(false)
                wsRef.current = null
                if (!cancelled) reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS)
            }

            ws.onmessage = (event) => {
                if (wsRef.current !== ws) return
                let msg: ServerMessage
                try {
                    msg = JSON.parse(event.data)
                } catch {
                    return
                }

                if (msg.type === 'state_update') setReady(true)
                if (msg.type === 'error') setLastError(msg.message)

                listenersRef.current.get(msg.type)?.forEach((listener) => listener(msg))
            }
        }

        connect()

        return () => {
            cancelled = true
            if (reconnectTimer !== null) window.clearTimeout(reconnectTimer)
            wsRef.current?.close()
            wsRef.current = null
        }
    }, [])

    const sendMessage = (msg: ClientMessage) => {
        const ws = wsRef.current
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg))
        }
    }

    const subscribe: SocketContextValue['subscribe'] = (type, listener) => {
        if (!listenersRef.current.has(type)) listenersRef.current.set(type, new Set())
        listenersRef.current.get(type)!.add(listener)
        return () => listenersRef.current.get(type)?.delete(listener)
    }

    return (
        <SocketContext.Provider value={{ connected, ready, lastError, sendMessage, subscribe }}>
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket phải được gọi bên trong SocketProvider')
    return ctx
}
