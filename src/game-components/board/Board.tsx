import React from 'react'

import {BoardNotation, IBoardProps, ICell} from '../../store/models'
import {TopLegendValues, SideLegendValues} from '../../constants/gameConstants'

import './board.scss';


export const Cell: React.FC<ICell> = props  => {
    return (<div className={props.className} data-indexes={props.indexes}>
                {props.children}
            </div>)
}

export const Board: React.FC<IBoardProps> = (props) => { 
    // // useEffect(() => {
    //     console.log('render board with props: ', props)
    // })
    const {
        boardOptions: {
            boardSize,
            boardNotation,
            reversedBoard,
        },
        lastMove,
        possibleMoves = new Map()
    } = props
    const DefaultTL = TopLegendValues.slice(0, boardSize)
    const DefaultSL = SideLegendValues.slice(0, boardSize)
    const SL  = reversedBoard ? DefaultSL : DefaultSL.reverse()
    const TL = reversedBoard ? DefaultTL.reverse() : DefaultTL
    let k = reversedBoard ? 51 : 0


    const Board = SL.map((v: number, i: number) => {
        return TL.map((h: string, j: number) => {
            if(reversedBoard) {
                k = (i + j) % 2 ? k - 1 : k
            } else {
                k = (i + j) % 2 ? k + 1 : k
            }
            const type = !((i + j) % 2) ? 'light' : 'dark'
            const index = `${h}${v}`
            const marked = possibleMoves.get(index) ? 'marked' : ''
            const moveIndex = lastMove.indexOf(index)
            const highlighted = moveIndex >= 0 ? `highlighted${moveIndex}` : ''
            const className = `board__cell ${type} ${marked} ${highlighted}`.trim()
            return (
                <Cell
                    key={i + '-' + j}
                    indexes={index}
                    className={className}
                >
              {
                        boardNotation === BoardNotation.i && ((i + j) % 2) 
                        ? <span className="board__cell-number">{k}</span> 
                        : null
                    }
                    {
                        boardNotation === BoardNotation.r && !j 
                        ? <span className="board__label-value ver">{SL[i]}</span>
                        : null
                    }
                    {
                        boardNotation === BoardNotation.r && i + 1=== SL.length 
                        ? <span className="board__label-value hor">{TL[j]}</span> 
                        : null
                    }
                </Cell>
            )
        })
    })
                        
    return (
         <div className="board__body">
            {Board}
        </div>
    )  
}
