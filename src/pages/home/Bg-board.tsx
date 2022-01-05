import React from 'react'

import './bg-board.scss'

 const BGBoard: React.FC = () => { 
    const Board = [1,2,3,4,5,6,7,8].map((v: number, i: number) => {
        return [1,2,3,4,5,6,7,8].map((h: number, j: number) => {
            const type = !((i + j) % 2) ? 'light-cell' : 'dark-cell'
            const className = type
            return (
                <div key={i + '-' + j} className={className}></div>
            )
        })
    })
                        
    return (
        <div className="bg-board">
            {Board}
        </div>
    ) 
}

export default BGBoard
