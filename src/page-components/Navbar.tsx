import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'

import { RoutesPath, RoutesTitle } from '../constants/gameConstants'
import { IRootState } from '../store/rootState&Reducer'
import { setLanguage } from '../store/user/actions'
import { MobileMenu } from './MobileDropdownNav'
import { Logo } from '../common/LogoIcon'
import { I18n } from '../assets/i18n'

const mapState = (state: IRootState) => ({
    language: state.user.language,
    winWidth: state.app.windowSize.width,
})

const mapDispatch = {
    setLanguage,
}

const connector = connect(mapState, mapDispatch)

type Props = ConnectedProps<typeof connector>

export const Navbar: React.FC<Props> = (props) => {
    const { setLanguage, language, winWidth } = props
    const lang = language.slice(0, 2)

    const [mobile, setMobile] = useState(winWidth < 900)

    useEffect(() => {
        setMobile(winWidth < 900)
    }, [winWidth])

    const LogoType = () => (
        <span>
            <Logo />
            &nbsp; &nbsp;{I18n['en'].mainTitle}
        </span>
    )
    let logo: React.ReactNode = (
        <NavLink title="to home" to={RoutesPath.home} className="brand-logo">
            {!mobile ? <LogoType /> : <Logo />}
        </NavLink>
    )
    const desktopMenu = (
        <ul className="desktop-nav">
            <li title="home">
                <NavLink exact={true} className="navlink" to={RoutesPath.home}>
                    <span>{I18n['en'].homeTitle}&nbsp;</span>
                    <i className="large material-icons">{RoutesTitle.home}</i>
                </NavLink>
            </li>
            <li title="game">
                <NavLink className="navlink" to={RoutesPath.game}>
                    <span>{I18n['en'].gameTitle}&nbsp;</span>
                    <i className="large material-icons">{RoutesTitle.game}</i>
                </NavLink>
            </li>
            <li title="analysis">
                <NavLink className="navlink" to={RoutesPath.analysis}>
                    <span>{I18n['en'].analyzeTitle}&nbsp;</span>
                    <i className="large material-icons">
                        {RoutesTitle.analyze}
                    </i>
                </NavLink>
            </li>
            {/*<li title="settings">*/}
            {/*    <NavLink className="navlink" to={RoutesPath.settings}>*/}
            {/*        <i className="large material-icons">{RoutesTitle.settings}</i>*/}
            {/*    </NavLink>*/}
            {/*</li>*/}
        </ul>
    )
    return (
        <nav className="nav">
            {logo}
            <div className="right-nav">
                <DuoLanguageSwitcher
                    lang={lang}
                    langs={['ru', 'en']}
                    setLanguage={setLanguage}
                />
                {mobile ? <MobileMenu /> : desktopMenu}
            </div>
        </nav>
    )
}

export interface DouLangProps {
    langs: string[]
    lang: string

    setLanguage(l: string): void
}

export const DuoLanguageSwitcher = (props: DouLangProps) => {
    const { lang, setLanguage, langs } = props
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (lang === langs[0]) {
            setLanguage(langs[1])
        } else {
            setLanguage(langs[0])
        }
        ;(e.target as HTMLButtonElement).blur()
    }
    return (
        <button
            title="change language"
            className="change-lang-button"
            onClick={(e) => handleClick(e)}
        >
            <span
                className={`flag-icon flag-icon-${
                    lang === 'en' ? 'gb' : lang
                } flag-icon-squared`}
            >
                {' '}
            </span>
        </button>
    )
}

export default connector(Navbar)
