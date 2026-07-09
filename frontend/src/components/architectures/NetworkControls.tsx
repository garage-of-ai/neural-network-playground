import { Controls, ControlButton, useReactFlow, useViewport } from '@xyflow/react'

type FitPadding = { top: `${number}px`; right: `${number}px`; bottom: `${number}px`; left: `${number}px` }

// icon SVG copy nguyên từ Controls mặc định của React Flow (PlusIcon/MinusIcon/
// FitViewIcon nội bộ, không được export ra ngoài) để giữ đúng hình dạng gốc
// khi tự dựng lại thứ tự nút
function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" />
        </svg>
    )
}

function MinusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5">
            <path d="M0 0h32v4.2H0z" />
        </svg>
    )
}

function FitViewIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30">
            <path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" />
        </svg>
    )
}

interface NetworkControlsProps {
    fitPadding: FitPadding
    minZoom: number
    maxZoom: number
}

// Controls mặc định của React Flow không cho tuỳ chỉnh thứ tự nút (luôn
// zoomIn → zoomOut → fitView) — tự dựng 3 ControlButton theo thứ tự
// zoomIn → fitView → zoomOut để nút "vừa khung" nằm giữa hai nút zoom
function NetworkControls({ fitPadding, minZoom, maxZoom }: NetworkControlsProps) {
    const { zoomIn, zoomOut, fitView } = useReactFlow()
    const { zoom } = useViewport()

    return (
        <Controls showZoom={false} showFitView={false} showInteractive={false} position="top-right">
            <ControlButton
                className="react-flow__controls-zoomin"
                title="phóng to"
                aria-label="phóng to"
                disabled={zoom >= maxZoom}
                onClick={() => zoomIn()}
            >
                <PlusIcon />
            </ControlButton>
            <ControlButton
                className="react-flow__controls-fitview"
                title="vừa khung"
                aria-label="vừa khung"
                onClick={() => fitView({ padding: fitPadding, duration: 200 })}
            >
                <FitViewIcon />
            </ControlButton>
            <ControlButton
                className="react-flow__controls-zoomout"
                title="thu nhỏ"
                aria-label="thu nhỏ"
                disabled={zoom <= minZoom}
                onClick={() => zoomOut()}
            >
                <MinusIcon />
            </ControlButton>
        </Controls>
    )
}

export default NetworkControls
