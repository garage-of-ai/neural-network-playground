import { AnimatePresence, motion } from 'motion/react'
import { useViewport } from '@xyflow/react'
import { useLocale } from '../../context/LocaleContext'
import type { LayerConfig } from '../../types'
import { COL_WIDTH } from './layoutMath'

interface LayerLabelBarProps {
    architecture: LayerConfig[]
}

function LayerLabelBar({ architecture }: LayerLabelBarProps) {

    const { x, zoom } = useViewport()
    const { t } = useLocale()

    return (
        <div className="layer-label-bar">
            <AnimatePresence initial={false}>
                {architecture.map((layer, li) => (
                    <motion.div
                        key={layer.id}
                        initial={{ scale: 0.25, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.25, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                        className="layer-label"
                        style={{ left: x + li * COL_WIDTH * zoom, width: COL_WIDTH * zoom }}
                    >
                        <b>{t.layerKind[layer.kind]}</b>
                        {layer.activation && <div className="activation-tag">{layer.activation}</div>}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default LayerLabelBar
