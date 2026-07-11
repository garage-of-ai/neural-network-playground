import './Header.css'
import LanguageSwitcher from './LanguageSwitcher'

function Header() {
    return(
        <div className="header">
            <div className="app-title">netlab</div>
            <div className="header-actions">
                <LanguageSwitcher />
            </div>
        </div>
    )
}

export default Header;