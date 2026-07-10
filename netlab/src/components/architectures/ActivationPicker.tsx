import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ActivationFn } from '../../types'
import './ActivationPicker.css'

// softmax cố ý không có trong danh sách này — chỉ output layer đa lớp mới
// dùng softmax, và giá trị đó do outputShapeForDataset() tự quản theo dataset
// (xem NetworkContext.tsx), không phải lựa chọn thủ công của người dùng
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

// Popover được portal thẳng vào <body> và định vị bằng position:fixed (toạ độ
// tự đo bằng JS) thay vì position:absolute lồng trong cây DOM bình thường.
// Lý do: nút này nằm trong .abstract-scroll (overflow-x:auto) — theo spec CSS,
// khi 1 trục overflow khác "visible" thì trục còn lại (dù để mặc định hay set
// "hidden") đều bị ép tính lại thành "auto", nên mọi phần tử absolute con của
// nó đều bị cắt mất theo chiều dọc nếu vượt khung. Portal ra <body> né hẳn vấn
// đề này.
function ActivationPicker({ value, disabled, onChange }: ActivationPickerProps) {
    const [open, setOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const popRef = useRef<HTMLDivElement>(null)

    // đo vị trí NGAY sau khi popover được gắn vào DOM nhưng TRƯỚC khi trình
    // duyệt vẽ khung hình đó ra (useLayoutEffect, không phải useEffect) — nhờ
    // vậy không có khung hình nào bị lộ ra ở toạ độ (0,0) tạm thời trước khi
    // biết đúng vị trí nút
    useLayoutEffect(() => {
        if (!open) return
        const btn = btnRef.current
        const pop = popRef.current
        if (!btn || !pop) return
        const rect = btn.getBoundingClientRect()
        const popRect = pop.getBoundingClientRect()
        let left = rect.left + rect.width / 2 - popRect.width / 2
        left = Math.max(8, Math.min(left, window.innerWidth - popRect.width - 8))
        let top = rect.bottom + 6
        if (top + popRect.height > window.innerHeight - 8) top = rect.top - popRect.height - 6
        setCoords({ top, left })
    }, [open])

    useEffect(() => {
        if (!open) return

        const close = () => setOpen(false)
        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as Node
            if (btnRef.current?.contains(target) || popRef.current?.contains(target)) return
            setOpen(false)
        }

        window.addEventListener('resize', close)
        // scroll không nổi bọt (bubble) — bắt ở pha capture trên window mới
        // nhận được sự kiện cuộn xảy ra bên trong .abstract-scroll
        window.addEventListener('scroll', close, true)
        document.addEventListener('mousedown', onDocMouseDown)
        return () => {
            window.removeEventListener('resize', close)
            window.removeEventListener('scroll', close, true)
            document.removeEventListener('mousedown', onDocMouseDown)
        }
    }, [open])

    // panel có thể bị khoá ngay trong lúc popover đang mở (vd người dùng vừa mở
    // popover vừa bấm "Chạy 1 bước" ở panel khác) — tự đóng lại cho nhất quán
    useEffect(() => {
        if (disabled) setOpen(false)
    }, [disabled])

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
