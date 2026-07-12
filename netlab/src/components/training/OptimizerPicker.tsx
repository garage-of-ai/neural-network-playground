import { createPortal } from 'react-dom'
import type { Optimizer } from '../../types'
import { useFloatingPopover } from '../../hooks/useFloatingPopover'
import './OptimizerPicker.css'

const OPTIMIZER_OPTIONS: { id: Optimizer; label: string; shortLabel: string }[] = [
    { id: 'sgd', label: 'SGD', shortLabel: 'SGD' },
    { id: 'sgd-momentum', label: 'SGD + Momentum', shortLabel: 'SGD + Momentum' },
    { id: 'adam', label: 'Adam', shortLabel: 'Adam' },
]

const CURVE_PATH: Record<Optimizer, string> = {
    sgd: 'M4,5 L8,15 L11,9 L14,19 L17,12 L20,21 L22,17',
    'sgd-momentum': 'M4,5 C8,10 6,17 10,15 C14,13 12,20 16,19 C19,18.3 20,20 22,19.5',
    adam: 'M4,4 C9,7 11,15 14,18 C17,20.3 19,21.3 22,21.6',
}

function OptimizerCurveIcon({ id }: { id: Optimizer }) {
    return (
        <svg viewBox="0 0 26 26" className="optimizer-curve-icon" aria-hidden="true">
            <path d="M3,3 L3,23 L23,23" stroke="currentColor" strokeOpacity={0.28} strokeWidth={1.2} fill="none" />
            <path d={CURVE_PATH[id]} stroke="currentColor" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

interface OptimizerPickerProps {
    value: Optimizer
    disabled: boolean
    onChange: (optimizer: Optimizer) => void
}

function OptimizerPicker({ value, disabled, onChange }: OptimizerPickerProps) {
    const { open, setOpen, coords, btnRef, popRef } = useFloatingPopover(disabled)

    const current = OPTIMIZER_OPTIONS.find((o) => o.id === value)

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className="optimizer-trigger"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
            >
                <OptimizerCurveIcon id={value} />
                {current?.shortLabel ?? value}
            </button>

            {open &&
                createPortal(
                    <div ref={popRef} className="optimizer-popover" style={{ top: coords.top, left: coords.left }}>
                        {OPTIMIZER_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                className={`optimizer-option${opt.id === value ? ' optimizer-option--active' : ''}`}
                                onClick={() => {
                                    onChange(opt.id)
                                    setOpen(false)
                                }}
                            >
                                <OptimizerCurveIcon id={opt.id} />
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    )
}

export default OptimizerPicker
