import React from 'react'

import './page-components.scss'

interface SideBarProps {
    children: React.ReactNode, side: string
}

export const SideBar: React.FC<SideBarProps> = (props) => {
    const ClassName = `side-bar_${props.side}`
    return (
        <div className={ClassName}>
            {props.children}
        </div>) 
}
