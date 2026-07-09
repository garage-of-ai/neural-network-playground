import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { ActivationFn, DatasetKind, LayerConfig, NetworkWeights } from '../types'
import { createRandomWeights } from '../utils/weights'
import { useSocket } from './SocketContext'
import { useDataset } from './DatasetContext'
import { DEFAULT_ARCHITECTURE, makeLayerId } from './defaults'

export interface PredictionGrid {
    resolution: number
    grid: number[][]
}

// số lớp của từng loại dataset — phải khớp đúng core/datasets.py (backend):
// mọi kind trừ blobs3 đều là bài toán nhị phân, chỉ blobs3 có 3 lớp
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
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
    const { sendMessage, subscribe } = useSocket()
    const { config: datasetConfig } = useDataset()
    const [architecture, setArchitecture] = useState<LayerConfig[]>(DEFAULT_ARCHITECTURE)
    // weights khởi tạo ngẫu nhiên ở client chỉ để có gì đó vẽ ngay trong lúc
    // chờ WS kết nối + session_init hoàn tất; sau đó luôn được server ghi đè
    // qua state_update (xem PLAN.API.md mục 1.8)
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

    // đổi dataset sang loại có số lớp khác (vd nhị phân <-> blobs3 3 lớp) thì
    // output layer phải đổi theo (units + activation), nếu không network sẽ
    // học trên loss vô nghĩa (BCE với nhãn 0/1/2) và decision boundary/điểm dữ
    // liệu hiện sai màu do nhãn ngoài phạm vi nhị phân bị gộp chung.
    // prevKindRef dùng để bỏ qua lần chạy effect đầu tiên khi mount (kind lúc
    // đó chỉ là giá trị mặc định, không phải người dùng vừa đổi thật)
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

        // KHÔNG dùng setArchitecture(updaterFn) ở đây: StrictMode (dev) double-
        // invoke chính updater function để phát hiện side effect không thuần
        // tuý — nếu sendMessage/setWeights nằm trong đó sẽ bị gửi/gọi 2 lần
        // cho 1 lần đổi dataset thật. Đọc thẳng `architecture` từ closure của
        // render hiện tại (như mọi handler khác trong file này) là an toàn vì
        // effect này không dồn nhiều lần cập nhật trong cùng 1 tick.
        const next = architecture.map((layer, i) => (i === outputIndex ? { ...layer, units, activation } : layer))
        setArchitecture(next)
        setWeights(createRandomWeights(next))
        sendMessage({ type: 'update_architecture', architecture: next })
        // architecture/sendMessage/setWeights cố ý không nằm trong deps: effect
        // này chỉ nên chạy khi datasetConfig.kind đổi, không phải mỗi khi
        // architecture đổi (sẽ tạo vòng lặp vô hạn vì chính effect này cũng set architecture)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datasetConfig.kind])

    // architecture và weights LUÔN được set cùng nhau ở đây — nếu chỉ đổi
    // architecture mà chờ server trả weights mới qua state_update, sẽ có 1
    // khoảng render với architecture mới nhưng weights vẫn còn shape cũ, khiến
    // useNetworkFlowGraph đọc weights[li][i][j] vượt chỉ số và crash cả app.
    // weights tính ở đây chỉ là placeholder hiển thị tạm, sẽ bị ghi đè bởi giá
    // trị thật ngay khi state_update từ server về
    const insertLayer = (atIndex: number) => {
        const next = [...architecture]
        next.splice(atIndex, 0, { id: makeLayerId(), units: 3, kind: 'hidden', label: 'Hidden Layer', activation: 'relu' })
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

    return (
        <NetworkContext.Provider
            value={{ architecture, weights, predictionGrid, insertLayer, removeLayer, addUnit, removeUnit }}
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
