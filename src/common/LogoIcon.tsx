import React from 'react'

import './logoIcon.scss'

export const Logo: React.FC<{size?: number}> = ({size = 16}) => {
    return <i className={`logo s-${size}`}></i>
}
