import en, { type Dictionary } from './en'
import vi from './vi'

export type Locale = 'en' | 'vi'
export type { Dictionary }

export const locales: Record<Locale, Dictionary> = { en, vi }

// Tên ngôn ngữ hiển thị bằng chính ngôn ngữ đó (endonym) — không dịch qua locale đang chọn.
export const LANGUAGE_LABELS: Record<Locale, string> = {
    en: 'English',
    vi: 'Tiếng Việt',
}
