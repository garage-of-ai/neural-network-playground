import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controls, ReactFlow, type Node, type NodeTypes, type EdgeTypes, type OnMoveStart, type ReactFlowInstance } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { useNetwork } from '../../context/NetworkContext'
import { useTraining } from '../../context/TrainingContext'
import { computeLayerPositions, stageSize } from './layoutMath'
import { useNetworkFlowGraph, type ActiveNeuron } from './useNetworkFlowGraph'
import NeuronNode from './nodes/NeuronNode'
import EllipsisNode from './nodes/EllipsisNode'
import WeightEdge from './edges/WeightEdge'
import NetworkPulse from './NetworkPulse'
import LayerLabelBar from './LayerLabelBar'
import './NetworkArchitecture.css'

const nodeTypes: NodeTypes = { neuron: NeuronNode, ellipsis: EllipsisNode }
const edgeTypes: EdgeTypes = { weight: WeightEdge }

function NetworkArchitecture() {
    const { architecture, weights } = useNetwork()
    const { pulseSignal } = useTraining()
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

    // căn cho trung trực ngang (đường ngang chia đôi theo chiều cao) của hình
    // vẽ trùng với trung trực ngang của network-stage — chỉ áp dụng khi người
    // dùng chưa tự pan, để không đè lên thao tác họ đang làm
    const centerVertically = useCallback(() => {
        if (!stageRef.current || !rfInstanceRef.current) return
        const stageHeight = stageRef.current.clientHeight
        const contentHeight = stageSize(architecture).height
        rfInstanceRef.current.setViewport({ x: 0, y: (stageHeight - contentHeight) / 2, zoom: 1 })
    }, [architecture])

    useEffect(() => {
        if (!hasPannedRef.current) centerVertically()
    }, [centerVertically])

    useEffect(() => {
        if (!stageRef.current) return
        const observer = new ResizeObserver(() => {
            if (!hasPannedRef.current) centerVertically()
        })
        observer.observe(stageRef.current)
        return () => observer.disconnect()
    }, [centerVertically])

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
                    minZoom={0.4}
                    maxZoom={2}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    proOptions={{ hideAttribution: true }}
                    onInit={(instance) => {
                        rfInstanceRef.current = instance
                        centerVertically()
                    }}
                    onMoveStart={handleMoveStart}
                >
                    <NetworkPulse architecture={architecture} layout={layout} pulseSignal={pulseSignal} />
                    <LayerLabelBar architecture={architecture} />
                    <Controls showInteractive={false} position="bottom-right" />
                </ReactFlow>
            </div>

            <div className="legend">
                <span><i className="dot dot--pos" />dương</span>
                <span><i className="dot dot--zero" />0</span>
                <span><i className="dot dot--neg" />âm</span>
            </div>
        </div>
    )
}

export default NetworkArchitecture
