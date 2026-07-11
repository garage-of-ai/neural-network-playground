import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { locales, type Locale, type Dictionary } from '../i18n/locales'

const STORAGE_KEY = 'netlab:locale'

function isLocale(value: string | null): value is Locale {
    return value === 'en' || value === 'vi'
}

interface LocaleContextValue {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: Dictionary
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return isLocale(stored) ? stored : 'en'
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, locale)
    }, [locale])

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t: locales[locale] }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useLocale() {
    const ctx = useContext(LocaleContext)
    if (!ctx) throw new Error('useLocale phải được gọi bên trong LocaleProvider')
    return ctx
}
