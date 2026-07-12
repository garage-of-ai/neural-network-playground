import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from '../../context/LocaleContext'
import { useFloatingPopover } from '../../hooks/useFloatingPopover'
import './NumberPicker.css'

interface NumberPickerPopoverContentProps {
    value: number
    presets: number[]
    onChange: (value: number) => void
    onClose: () => void
}

function NumberPickerPopoverContent({ value, presets, onChange, onClose }: NumberPickerPopoverContentProps) {
    const { t } = useLocale()
    const matchesPreset = presets.includes(value)
    const [customText, setCustomText] = useState(() => (matchesPreset ? '' : String(value)))

    const commitCustom = () => {
        const parsed = Number(customText)
        if (!Number.isFinite(parsed) || parsed <= 0) return
        onChange(parsed)
        onClose()
    }

    return (
        <>
            <div className="number-picker-grid">
                {presets.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        className={`number-picker-option${matchesPreset && preset === value ? ' number-picker-option--active' : ''}`}
                        onClick={() => {
                            onChange(preset)
                            onClose()
                        }}
                    >
                        {preset}
                        <span className="number-picker-check" aria-hidden="true">✓</span>
                    </button>
                ))}
            </div>

            <div className="number-picker-divider">{t.trainConfig.orCustomValue}</div>

            <div className={`number-picker-custom${!matchesPreset ? ' number-picker-custom--active' : ''}`}>
                <input
                    type="number"
                    step="any"
                    value={customText}
                    placeholder={t.trainConfig.customValuePlaceholder}
                    aria-label={t.trainConfig.customValuePlaceholder}
                    autoFocus={!matchesPreset}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            commitCustom()
                        }
                    }}
                    onBlur={(e) => {
                        // nếu focus chuyển sang một ô giá trị có sẵn, để chính ô đó xử lý
                        // click của nó — không tự ý commit giá trị tự nhập đang gõ dở
                        if (e.relatedTarget instanceof HTMLElement && e.relatedTarget.classList.contains('number-picker-option')) return
                        commitCustom()
                    }}
                />
                {!matchesPreset && <span className="number-picker-tag">{t.trainConfig.customValueInUse}</span>}
                <span className="number-picker-check" aria-hidden="true">✓</span>
            </div>
        </>
    )
}

interface NumberPickerProps {
    value: number
    presets: number[]
    disabled: boolean
    onChange: (value: number) => void
}

function NumberPicker({ value, presets, disabled, onChange }: NumberPickerProps) {
    const { open, setOpen, coords, btnRef, popRef } = useFloatingPopover(disabled)

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className="number-picker-trigger"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
            >
                {value}
            </button>

            {open &&
                createPortal(
                    <div ref={popRef} className="number-picker-popover" style={{ top: coords.top, left: coords.left }}>
                        <NumberPickerPopoverContent
                            value={value}
                            presets={presets}
                            onChange={onChange}
                            onClose={() => setOpen(false)}
                        />
                    </div>,
                    document.body,
                )}
        </>
    )
}

export default NumberPicker
