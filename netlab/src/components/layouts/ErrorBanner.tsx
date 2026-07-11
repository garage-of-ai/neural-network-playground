import { useEffect, useState } from 'react'
import { useEngine } from '../../context/EngineContext'
import { useLocale } from '../../context/LocaleContext'
import './ErrorBanner.css'

const AUTO_DISMISS_MS = 5000

function ErrorBanner() {
    const { lastError } = useEngine()
    const { t } = useLocale()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!lastError) return
        setVisible(true)
        const timer = window.setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
        return () => window.clearTimeout(timer)
    }, [lastError])

    if (!lastError || !visible) return null

    return (
        <div className="error-banner" role="alert">
            <span>{lastError}</span>
            <button className="error-banner-close" aria-label={t.errorBanner.closeAria} onClick={() => setVisible(false)}>
                ×
            </button>
        </div>
    )
}

export default ErrorBanner
