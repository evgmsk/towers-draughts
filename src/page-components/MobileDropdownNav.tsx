import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { RoutesPath, RoutesTitle } from '../constants/gameConstants'
import { IRef } from '../store/models'


export const MobileMenu = () => {
    const [dropdown, setDropdown] = useState(false)
    const [visible, setVisible] = useState(false)
    const mobileMenuClass = `mobile-nav${visible ? ' visible' : ' hidden'}${!dropdown ? ' display-none' : ' display'}`
    const timeout = 300
    const ref: IRef<HTMLUListElement> = React.createRef() 
    const handleDropdown = (e: React.MouseEvent) => {
        e.preventDefault() 
        if (!dropdown) {
            setDropdown(true)
            setTimeout(() => setVisible(true), timeout)
        } else {
            setVisible(false)
            setTimeout(() => setDropdown(false), timeout)
        }
    }
    const handleClickOutside = (ev: any) => {
        ev.stopPropagation()
        const elem = ref.current as HTMLElement
        if (!dropdown || !elem) {
            return
        }
        const target = ev.target as HTMLElement
        if (!elem.contains(target)) {
            setDropdown(false)
        }
    }

    useEffect(() => {
        if(!window) return
        window.addEventListener('click', handleClickOutside)
        if (!dropdown) {
            return window.removeEventListener('click', handleClickOutside)
        }
        // return window.removeEventListener('click', handleClickOutside)
    })
    
    return (
        <div onClick={handleDropdown}>
            <button  className="mobile-nav-dropdown-btn" >
                <i className="material-icons">menu</i>
            </button>
            <ul className={mobileMenuClass} ref={ref}>
                <li>
                    <NavLink exact={true} className="navlink mobile" to={RoutesPath.home}>
                        <i className="large material-icons">{RoutesTitle.home}</i>
                    </NavLink>
                </li>
                <li>
                    <NavLink className="navlink mobile" to={RoutesPath.game}>
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
        </div>
       
    )
}
