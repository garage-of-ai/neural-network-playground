import { useMemo } from 'react'
import type { Edge, Node } from '@xyflow/react'
import type { LayerConfig, NetworkWeights } from '../../types'
import { NEURON_SIZE, computeLayerPositions } from './layoutMath'

export interface ActiveNeuron {
    layerIndex: number
    unitIndex: number
}

export interface NeuronNodeData extends Record<string, unknown> {
    layerIndex: number
    unitIndex: number
    kind: LayerConfig['kind']
    exiting: boolean
    onToggle: (layerIndex: number, unitIndex: number) => void
    onExited: (nodeId: string) => void
}

export interface EllipsisNodeData extends Record<string, unknown> {
    hiddenCount: number
}

export interface WeightEdgeData extends Record<string, unknown> {
    weight: number
    isIncomingToActive: boolean
    isDimmed: boolean
}


export function useNetworkFlowGraph(
    architecture: LayerConfig[],
    weights: NetworkWeights,
    activeNeuron: ActiveNeuron | null,
    callbacks: {
        onToggleNeuron: (layerIndex: number, unitIndex: number) => void
        onExited: (nodeId: string) => void
    },
): { nodes: Node[]; edges: Edge[] } {
    return useMemo(() => {
        const layout = computeLayerPositions(architecture)
        const nodes: Node[] = []

        architecture.forEach((layer, li) => {
            layout[li].neurons.forEach(({ unitIndex: ni, x, y }) => {
                const id = `neuron-${layer.id}-${ni}`
                nodes.push({
                    id,
                    type: 'neuron',
                    position: { x: x - NEURON_SIZE / 2, y: y - NEURON_SIZE / 2 },
                    draggable: false,
                    selectable: false,
                    data: {
                        layerIndex: li,
                        unitIndex: ni,
                        kind: layer.kind,
                        exiting: false,
                        onToggle: callbacks.onToggleNeuron,
                        onExited: callbacks.onExited,
                    } satisfies NeuronNodeData,
                })
            })

            if (layout[li].ellipsis) {
                const id = `ellipsis-${layer.id}`
                nodes.push({
                    id,
                    type: 'ellipsis',
                    position: {
                        x: layout[li].neurons[0].x - NEURON_SIZE / 2,
                        y: layout[li].ellipsis.y - NEURON_SIZE / 2,
                    },
                    draggable: false,
                    selectable: false,
                    data: { hiddenCount: layout[li].ellipsis.hiddenCount } satisfies EllipsisNodeData,
                })
            }
        })

        const edges: Edge[] = []
        layout.slice(0, -1).forEach((fromLayer, li) => {
            fromLayer.neurons.forEach(({ unitIndex: i }) => {
                layout[li + 1].neurons.forEach(({ unitIndex: j }) => {
                    const w = weights[li]?.[i]?.[j] ?? 0
                    const isIncomingToActive =
                        activeNeuron !== null && activeNeuron.layerIndex === li + 1 && activeNeuron.unitIndex === j
                    const isDimmed = activeNeuron !== null && !isIncomingToActive

                    edges.push({
                        id: `edge-${li}-${i}-${j}`,
                        type: 'weight',
                        source: `neuron-${architecture[li].id}-${i}`,
                        target: `neuron-${architecture[li + 1].id}-${j}`,
                        selectable: false,
                        data: {
                            weight: w,
                            isIncomingToActive,
                            isDimmed,
                        } satisfies WeightEdgeData,
                    })
                })
            })
        })

        return { nodes, edges }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [architecture, weights, activeNeuron, callbacks])
}
