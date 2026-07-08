import { useCallback, useMemo, useRef, useState } from 'react'
import { ReactFlow, type Node, type NodeTypes, type EdgeTypes } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { useNetwork } from '../../context/NetworkContext'
import { useTraining } from '../../context/TrainingContext'
import { computeLayerPositions } from './layoutMath'
import { useNetworkFlowGraph, type ActiveNeuron } from './useNetworkFlowGraph'
import NeuronNode from './nodes/NeuronNode'
import LayerLabelNode from './nodes/LayerLabelNode'
import EllipsisNode from './nodes/EllipsisNode'
import WeightEdge from './edges/WeightEdge'
import NetworkPulse from './NetworkPulse'
import './NetworkArchitecture.css'

const nodeTypes: NodeTypes = { neuron: NeuronNode, layerLabel: LayerLabelNode, ellipsis: EllipsisNode }
const edgeTypes: EdgeTypes = { weight: WeightEdge }

function NetworkArchitecture() {
    const { architecture, weights } = useNetwork()
    const { pulseSignal } = useTraining()
    const [activeNeuron, setActiveNeuron] = useState<ActiveNeuron | null>(null)
    const [exitingNodes, setExitingNodes] = useState<Node[]>([])
    const prevLiveNodesRef = useRef<Node[]>([])

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

    // layer/unit vừa bị xoá khỏi architecture sẽ biến mất khỏi liveNodes ngay
    // lập tức — giữ lại bản chụp cuối cùng của node đó (đánh dấu exiting) cho
    // tới khi animation exit trong NeuronNode/LayerLabelNode chạy xong và tự
    // gọi onExited để dọn khỏi danh sách này
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

    return (
        <div className="panel network-panel">
            <div className="title">Kiến trúc mạng</div>

            <div className="network-stage" onClick={() => setActiveNeuron(null)}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    panOnDrag
                    zoomOnScroll={false}
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    minZoom={1}
                    maxZoom={1}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <NetworkPulse architecture={architecture} layout={layout} pulseSignal={pulseSignal} />
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
