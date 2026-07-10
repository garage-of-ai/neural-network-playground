import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlow, type Node, type NodeTypes, type EdgeTypes, type OnMoveStart, type ReactFlowInstance } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { useNetwork } from '../../context/NetworkContext'
import { useTraining } from '../../context/TrainingContext'
import type { WeightInit } from '../../types'
import { computeLayerPositions } from './layoutMath'
import { useNetworkFlowGraph, type ActiveNeuron } from './useNetworkFlowGraph'
import NeuronNode from './nodes/NeuronNode'
import EllipsisNode from './nodes/EllipsisNode'
import WeightEdge from './edges/WeightEdge'
import NetworkPulse from './NetworkPulse'
import LayerLabelBar from './LayerLabelBar'
import NetworkControls from './NetworkControls'
import './NetworkArchitecture.css'

const nodeTypes: NodeTypes = { neuron: NeuronNode, ellipsis: EllipsisNode }
const edgeTypes: EdgeTypes = { weight: WeightEdge }

const MIN_ZOOM = 0.4
const MAX_ZOOM = 2

// chừa padding đáy đủ lớn để nội dung không bị layer-label-bar che — bắt
// buộc phải ghi kèm đơn vị "px", nếu truyền số trần React Flow sẽ hiểu là
// hệ số tỉ lệ (viewport - viewport/(1+padding)) chứ không phải pixel, khiến
// padding "32" nuốt gần hết khung nhìn và ép zoom kẹp xuống minZoom
const FIT_PADDING = { top: '32px', right: '32px', bottom: '88px', left: '32px' } as const

const WEIGHT_INIT_OPTIONS: { value: WeightInit; label: string }[] = [
    { value: 'zeros', label: 'Zero' },
    { value: 'uniform', label: 'Uniform' },
    { value: 'gaussian', label: 'Gauss' },
]

function NetworkArchitecture() {
    const { architecture, weights } = useNetwork()
    const { config, setConfig, ready, pulseSignal, hasTrainedSinceReset } = useTraining()
    const [activeNeuron, setActiveNeuron] = useState<ActiveNeuron | null>(null)
    const [exitingNodes, setExitingNodes] = useState<Node[]>([])
    const prevLiveNodesRef = useRef<Node[]>([])
    const stageRef = useRef<HTMLDivElement>(null)
    const rfInstanceRef = useRef<ReactFlowInstance | null>(null)
    const hasPannedRef = useRef(false)

    const toggleNeuron = useCallback((layerIndex: number, unitIndex: number) => {
        setActiveNeuron((prev) =>
            prev && prev.layerIndex === layerIndex && prev.unitIndex === unitIndex
                ? null
                : { layerIndex, unitIndex },
        )
    }, [])

    const handleExited = useCallback((nodeId: string) => {
        setExitingNodes((prev) => prev.filter((n) => n.id !== nodeId))
    }, [])

    const callbacks = useMemo(
        () => ({ onToggleNeuron: toggleNeuron, onExited: handleExited }),
        [toggleNeuron, handleExited],
    )

    const { nodes: liveNodes, edges } = useNetworkFlowGraph(architecture, weights, activeNeuron, callbacks)

    // unit vừa bị xoá khỏi architecture sẽ biến mất khỏi liveNodes ngay lập
    // tức — giữ lại bản chụp cuối cùng của node đó (đánh dấu exiting) cho tới
    // khi animation exit trong NeuronNode chạy xong và tự gọi onExited để dọn
    // khỏi danh sách này
    if (liveNodes !== prevLiveNodesRef.current) {
        const liveIds = new Set(liveNodes.map((n) => n.id))
        const alreadyExitingIds = new Set(exitingNodes.map((n) => n.id))
        const newlyRemoved = prevLiveNodesRef.current.filter(
            (n) => !liveIds.has(n.id) && !alreadyExitingIds.has(n.id),
        )
        if (newlyRemoved.length > 0) {
            setExitingNodes((prev) => [
                ...prev,
                ...newlyRemoved.map((n) => ({ ...n, data: { ...n.data, exiting: true } })),
            ])
        }
        prevLiveNodesRef.current = liveNodes
    }

    const nodes = useMemo(() => [...liveNodes, ...exitingNodes], [liveNodes, exitingNodes])
    const layout = computeLayerPositions(architecture)

    // fit toàn bộ đồ thị vào khung nhìn (như bấm nút "fit view") — chỉ áp
    // dụng khi người dùng chưa tự pan, để không đè lên thao tác họ đang làm.
    // Gọi qua instance.fitView() trực tiếp (không dùng setViewport thủ công)
    // nên luôn phản ánh đúng kích thước node đã đo tại thời điểm gọi
    const fitStage = useCallback(() => {
        rfInstanceRef.current?.fitView({ padding: FIT_PADDING, duration: 0 })
    }, [])

    useEffect(() => {
        if (!hasPannedRef.current) fitStage()
    }, [fitStage, architecture])

    useEffect(() => {
        if (!stageRef.current) return
        const observer = new ResizeObserver(() => {
            if (!hasPannedRef.current) fitStage()
        })
        observer.observe(stageRef.current)
        return () => observer.disconnect()
    }, [fitStage])

    const handleMoveStart: OnMoveStart = useCallback((event) => {
        if (event) hasPannedRef.current = true
    }, [])

    return (
        <div className="panel network-panel">
            <div className="title">Kiến trúc mạng</div>

            <div className="network-stage" ref={stageRef} onClick={() => setActiveNeuron(null)}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    panOnDrag
                    zoomOnScroll
                    zoomOnPinch
                    zoomOnDoubleClick={false}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    proOptions={{ hideAttribution: true }}
                    onInit={(instance) => {
                        rfInstanceRef.current = instance
                        fitStage()
                    }}
                    onMoveStart={handleMoveStart}
                >
                    <NetworkPulse architecture={architecture} layout={layout} pulseSignal={pulseSignal} />
                    <LayerLabelBar architecture={architecture} />
                    <NetworkControls fitPadding={FIT_PADDING} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
                </ReactFlow>
            </div>

            <div className="legend">
                <div className="legend-dots">
                    <span><i className="dot dot--pos" />dương</span>
                    <span><i className="dot dot--zero" />0</span>
                    <span><i className="dot dot--neg" />âm</span>
                </div>

                <div className="legend-spacer" />

                <div className="weight-init">
                    <span className="weight-init__label">Khởi tạo</span>
                    <div className="weight-init__group">
                        {WEIGHT_INIT_OPTIONS.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                className={`weight-init__pill${config.weightInit === value ? ' weight-init__pill--active' : ''}`}
                                // mạng đã chạy bước nào rồi thì phải Reset mới đổi được cách
                                // khởi tạo — tránh đổi ngầm trọng số đang huấn luyện dở
                                disabled={!ready || hasTrainedSinceReset}
                                onClick={() => setConfig({ ...config, weightInit: value })}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NetworkArchitecture
