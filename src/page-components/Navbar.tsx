import React, { useEffect, useState } from 'react'
import {useHistory} from 'react-router-dom'
import {NavLink} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

import {RoutesPath, RoutesTitle} from '../constants/gameConstants'
import {IRootState} from '../store/rootState&Reducer'
import {findRival} from '../store/gameOptions/actions'
import {setLanguage} from '../store/user/actions'
import {MobileMenu} from './MobileDropdownNav'
import { Logo } from '../common/LogoIcon'
import {I18n} from '../assets/i18n'


const mapState = (state: IRootState) => ({
    language: state.user.language,
    winWidth: state.app.windowSize.width
})

const mapDispatch = {
   setLanguage, findRival
}

const connector = connect(mapState, mapDispatch)

type Props = ConnectedProps<typeof connector>

export const Navbar: React.FC<Props> = (props) => {
    const {setLanguage, language, findRival, winWidth} = props
    const isAuth = true
    const lang = language.slice(0,2)
    const history = useHistory()
    const handleLogoClick = (event: React.MouseEvent) => {
        event.preventDefault()
        findRival()
        history.push('/game')
    }
    // const i18n = I18n[lang]
    const [mobile, setMobile] = useState(window?.innerWidth < 500)

    useEffect(() => {
        setMobile(winWidth < 500)
    }, [winWidth])
    const notAuthLogo = mobile ? I18n['en'].mainTitle : I18n['en'].shortMainTitle
    const isAuthLogo = mobile ? <Logo size={18} /> : I18n['en'].mainTitle
    let logo: React.ReactNode = !isAuth 
        ? <NavLink title="to home" to={RoutesPath.home} className="brand-logo">{notAuthLogo}</NavLink>
        : <div title="new game" className="brand-logo" onClick={handleLogoClick}>{isAuthLogo}</div>
        
    return (
        <nav className="nav">
            <div className="nav-wrapper">
                {logo}
                <div className="right-nav">
                    <DuoLanguageSwitcher lang={lang} langs={['ru', 'en']} setLanguage={setLanguage}/>
                    <MobileMenu />
                    <ul className="desktop-nav">
                        <li title="home">
                            <NavLink exact={true} className="navlink" to={RoutesPath.home} >
                                <i className="large material-icons">{RoutesTitle.home}</i>
                            </NavLink>
                        </li>
                        <li title="game">
                            <NavLink className="navlink" to={RoutesPath.game}>
                                <i className="large material-icons">{RoutesTitle.game}</i>
                            </NavLink>
                        </li>
                        <li title="game analize">
                            <NavLink className="navlink" to={RoutesPath.analysis}>
                                <i className="large material-icons">{RoutesTitle.analyze}</i>
                            </NavLink>
                        </li>
                        <li title="settings">
                            <NavLink className="navlink" to={RoutesPath.settings}>
                                <i className="large material-icons">{RoutesTitle.settings}</i>
                            </NavLink>
                        </li>
                    </ul>
                    {/* <LoginBar /> */}
                </div>
            </div>
        </nav>
    )
}

export interface DouLangProps {
    langs: string[],
    setLanguage(l: string): void,
    lang: string
}

export const DuoLanguageSwitcher = (props: DouLangProps) => {
    const { lang, setLanguage, langs } = props;
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (lang === langs[0]) {
            setLanguage(langs[1])
        } else {
            setLanguage(langs[0])
        }
        (e.target as HTMLButtonElement).blur();
    };
    return <button title="change language" className="change-lang-button" onClick={e => handleClick(e)}>
        <span className={`flag-icon flag-icon-${lang === 'en' ? 'gb' : lang} flag-icon-squared`}></span>
    </button>
};

export default connector(Navbar)
