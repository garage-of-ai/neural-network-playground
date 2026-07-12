import { createPortal } from 'react-dom'
import type { ActivationFn } from '../../types'
import { useFloatingPopover } from '../../hooks/useFloatingPopover'
import './ActivationPicker.css'


export const ACTIVATION_OPTIONS: { id: ActivationFn; label: string }[] = [
    { id: 'relu', label: 'ReLU' },
    { id: 'tanh', label: 'Tanh' },
    { id: 'sigmoid', label: 'Sigmoid' },
    { id: 'linear', label: 'Linear' },
]

const CURVE_PATH: Record<string, string> = {
    relu: 'M3,19 L13,19 L23,3',
    tanh: 'M3,21 C8,21 8,12 13,12 C18,12 18,3 23,3',
    sigmoid: 'M3,20 C9,20 10,14 13,12 C16,10 17,4 23,4',
    linear: 'M3,22 L23,3',
}
const BASELINE_PATH: Record<string, string | null> = {
    relu: 'M3,19 L23,19',
    tanh: 'M3,12 L23,12',
    sigmoid: 'M3,20 L23,20',
    linear: null,
}

function ActivationCurveIcon({ id }: { id: ActivationFn }) {
    const baseline = BASELINE_PATH[id]
    return (
        <svg viewBox="0 0 26 26" className="activation-curve-icon" aria-hidden="true">
            {baseline && (
                <path d={baseline} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.4} strokeDasharray="2 2" fill="none" />
            )}
            <path d={CURVE_PATH[id]} stroke="currentColor" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </svg>
    )
}

interface ActivationPickerProps {
    value: ActivationFn
    disabled: boolean
    onChange: (activation: ActivationFn) => void
}

function ActivationPicker({ value, disabled, onChange }: ActivationPickerProps) {
    const { open, setOpen, coords, btnRef, popRef } = useFloatingPopover(disabled)

    const currentLabel = ACTIVATION_OPTIONS.find((o) => o.id === value)?.label ?? value

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className="activation-trigger"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
            >
                <ActivationCurveIcon id={value} />
                {currentLabel}
            </button>

            {open &&
                createPortal(
                    <div ref={popRef} className="activation-popover" style={{ top: coords.top, left: coords.left }}>
                        {ACTIVATION_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                className={`activation-option${opt.id === value ? ' activation-option--active' : ''}`}
                                onClick={() => {
                                    onChange(opt.id)
                                    setOpen(false)
                                }}
                            >
                                <ActivationCurveIcon id={opt.id} />
                                {opt.label}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    )
}

export default ActivationPicker
