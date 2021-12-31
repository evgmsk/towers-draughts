import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import { NavLink } from 'react-router-dom'
import { RoutesPath, RoutesTitle } from '../constants/gameConstants'
import { IRootState } from '../store/rootState&Reducer'
import { logout } from '../store/user/actions'

const mapState = (state: IRootState) => ({token: state.user.token, name: state.user.name})

const mapDispatch = {logout}

const connector = connect(mapState, mapDispatch)

type Props = ConnectedProps<typeof connector>

const LoginBarComponent = (props: Props) => {
    const {logout, token, name} = props
    const isAuth = !!token

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault()
        logout();
    }

    const logoutClassName = `logout-wrapper ${isAuth ? 'user' : 'not-user'}`

    return (
        <ul className={logoutClassName}>
            {isAuth && <li className="user-surname">
                    <NavLink title="go to profile" to={RoutesPath.profile}>
                        <i className="large material-icons">{RoutesTitle.profile}</i>
                        <span>{name}</span>
                    </NavLink>
                </li>}
            {!isAuth && <li>
                    <NavLink title="login" to={RoutesPath.auth}>
                        <i className="large material-icons">{RoutesTitle.auth}</i>
                    </NavLink>
                </li>}
            {isAuth && <li title="logout"  className="user-surname logout">
                    <a href="/" onClick={handleLogout}>
                    <i className="large material-icons">logout</i>
                </a>
            </li>}
        </ul>
    )
}

export const LoginBar = connector(LoginBarComponent)
