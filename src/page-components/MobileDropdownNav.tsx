import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { RoutesPath, RoutesTitle } from '../constants/gameConstants'

export const MobileMenu = () => {
    const [dropdown, setDropdown] = useState(false)
    const mobileMenuClass = `mobile-nav ${
        !dropdown ? ' display-none' : ' display'
    }`
    const handleDropdown = (e: React.MouseEvent) => {
        if ((e.target as HTMLDivElement).innerText === 'menu' && !dropdown) {
            setDropdown(true)
        } else {
            setDropdown(false)
        }
    }

    useEffect(() => {
        const handleClickOutside = (ev: any) => {
            const dropdownEl = document.querySelector(
                '.mobile-nav-dropdown__wrapper'
            )
            if (dropdownEl && !dropdownEl.contains(ev.target)) {
                setDropdown(false)
                window.removeEventListener('click', handleClickOutside)
            }
        }
        window.addEventListener('click', handleClickOutside)
    })

    return (
        <div className="mobile-nav-dropdown__wrapper" onClick={handleDropdown}>
            <button className="mobile-nav-dropdown-btn" type="button">
                <i className="material-icons">menu</i>
            </button>
            <ul className={mobileMenuClass}>
                <li>
                    <NavLink
                        exact={true}
                        className="navlink mobile"
                        to={RoutesPath.home}
                    >
                        <i className="large material-icons">
                            {RoutesTitle.home}
                        </i>
                    </NavLink>
                </li>
                <li>
                    <NavLink className="navlink mobile" to={RoutesPath.game}>
                        <i className="large material-icons">
                            {RoutesTitle.game}
                        </i>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        className="navlink mobile"
                        to={RoutesPath.analysis}
                    >
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
        </div>
    )
}
