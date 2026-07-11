import { useLocale } from '../../context/LocaleContext'
import './Footer.css'

function Footer() {
    const { t } = useLocale()
    return (
        <footer>
            {t.footer.credit}
        </footer>
    )
}

export default Footer
