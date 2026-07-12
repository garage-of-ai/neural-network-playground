import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Trạng thái + vị trí cho một popover "nổi" (position: fixed, portal vào body).
 * Dùng position: fixed thay vì absolute vì nút mở popover thường nằm trong một
 * container có overflow: hidden (vd. animation đóng/mở của panel) — absolute sẽ
 * bị cắt mất, còn fixed thoát ra ngoài được.
 */
export function useFloatingPopover(disabled: boolean) {
    const [open, setOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)
    const popRef = useRef<HTMLDivElement>(null)

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
        window.addEventListener('scroll', close, true)
        document.addEventListener('mousedown', onDocMouseDown)
        return () => {
            window.removeEventListener('resize', close)
            window.removeEventListener('scroll', close, true)
            document.removeEventListener('mousedown', onDocMouseDown)
        }
    }, [open])

    useEffect(() => {
        if (disabled) setOpen(false)
    }, [disabled])

    return { open, setOpen, coords, btnRef, popRef }
}
