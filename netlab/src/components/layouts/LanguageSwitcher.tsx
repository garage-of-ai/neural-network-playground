import ukFlag from '../../assets/flags/uk.jpeg'
import vnFlag from '../../assets/flags/vn.jpeg'
import { useLocale } from '../../context/LocaleContext'
import { LANGUAGE_LABELS, type Locale } from '../../i18n/locales'
import './LanguageSwitcher.css'

const FLAGS: Record<Locale, string> = { en: ukFlag, vi: vnFlag }
const ORDER: Locale[] = ['en', 'vi']

function LanguageSwitcher() {
    const { locale, setLocale, t } = useLocale()

    return (
        <div className="language-switcher" role="group" aria-label={t.language.picker}>
            {ORDER.map((code) => (
                <button
                    key={code}
                    type="button"
                    className={`flag-btn${locale === code ? ' selected' : ''}`}
                    aria-pressed={locale === code}
                    aria-label={LANGUAGE_LABELS[code]}
                    onClick={() => setLocale(code)}
                >
                    <span className="flag-frame">
                        <img src={FLAGS[code]} alt="" />
                    </span>
                    {locale === code && (
                        <span className="check-badge" aria-hidden="true">✓</span>
                    )}
                </button>
            ))}
        </div>
    )
}

export default LanguageSwitcher
