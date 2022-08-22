import React, { useEffect} from "react"
import { ConnectedProps, connect } from "react-redux"
import {useHistory} from 'react-router-dom'

import { convertToMovesHistory } from "../../game-engine/gameplay-helper-fuctions"
import { IRef } from "../../store/models"
import {analyzeLastGame, stepForward, stepBack, goToPosition, playMoves} from '../../store/gameAnalysis/actions'
import { IRootState } from "../../store/rootState&Reducer"

import './moves.scss'


const historyMapState = (state: IRootState) => ({
    movesHistory: state.game.history,
    gameMode: state.game.gameMode,
    movesMainLine: state.analyze.movesMainLine,
    lastMove: state.analyze.lastMove,
    analyzingLastGame: state.analyze.analyzeLastGame
})

const historyMapDispatch = {analyzeLastGame, stepBack, stepForward, goToPosition, playMoves}

const historyConnector = connect(historyMapState, historyMapDispatch)

const Moves:React.FC<ConnectedProps<typeof historyConnector>> = (props) => {
    const ref: IRef<HTMLDivElement> = React.createRef()
    const {
        movesHistory,
        gameMode,
        lastMove,
        movesMainLine,
        analyzeLastGame,
        analyzingLastGame,
        stepBack,
        stepForward,
        goToPosition,
        playMoves
    } = props
    
    useEffect(() => {
        const scrollDown = () => {
            const elem = ref.current
            if (!elem) return
            elem.scroll(0, elem.scrollHeight)
        }
        scrollDown()
    }, [movesHistory, ref])
    const History = useHistory()
    const mHistory = gameMode === 'isPlaying' ? movesHistory : movesMainLine!
    const length = mHistory?.length
    const moves = convertToMovesHistory(mHistory)
   
    const handleClickOnMenuItem = (e: React.MouseEvent) => {
        e.preventDefault()
        const {classList} = e.target as HTMLElement
        if (classList.contains('disabled')) return
        if (History.location.pathname === '/game') {
            History.push('/analysis')
        }
        if (!analyzingLastGame) {
            analyzeLastGame(true)
        }
        switch (true) {
            case classList.contains('to-start'):
                goToPosition({index: -1, move: ''})
                break
            case classList.contains('step-back'): {
               return stepBack()
            }
            case classList.contains('step-forward'): {
                return stepForward()
            }
            case classList.contains('to-end'): {
                return goToPosition({index: length - 1, move: mHistory.slice(-1)[0]})
            }
            case classList.contains('play-moves'): {
                return playMoves()
            }
            default:
                break
        }
    }
    const handleClickOnMove = (e: React.MouseEvent, index: number) => {
        e.preventDefault()
        if (gameMode === 'isPlaying') return
        if (History.location.pathname === '/game') {
            History.push('/analysis')
        }
        goToPosition({index, move: mHistory[index]})
    }

    const {index} = lastMove!
    const toStartClass = `moves-history-menu__item to-start${index < 0 ? ' disabled' : ''}`
    const stepBackClass = `moves-history-menu__item step-back${!index ? ' disabled' : ''}`
    const stepForwardClass = `moves-history-menu__item step-forward${index >= length - 1 ? ' disabled' : ''}`
    const toEndClass = `moves-history-menu__item to-end${index >= length - 1 ? ' disabled' : ''}`
    const playClass = `moves-history-menu__item play-moves`
    return (
        <div className="moves-history-wrapper">
            <div className="moves-history-menu">
                { gameMode === 'isPlaying' || !analyzingLastGame
                    ? <p>moves:</p> 
                    : <ul onClick={handleClickOnMenuItem}>
                        <li className={toStartClass}>
                            <i className="material-icons" >first_page</i>
                        </li>
                        <li className={stepBackClass}>
                            <i className="material-icons">chevron_left</i>
                        </li>
                        <li className={playClass}>
                            <i className="material-icons">slideshow</i>
                        </li>
                        <li className={stepForwardClass}>
                            <i className="material-icons">chevron_right</i>
                        </li>
                        <li className={toEndClass}>
                            <i className="material-icons">last_page</i>
                        </li>
                    </ul>
                }
            </div>
            <div className="moves-container" ref={ref}>           
                {
                    moves.map((move: {black: string, white: string}, i: number) => {
                        const white = (analyzingLastGame ? index : mHistory.length - 1) === i * 2
                        const black =  (analyzingLastGame ? index : mHistory.length - 1) === i * 2 + 1
                        const whiteClass = `white-move${white ? ' current-move': ''}`
                        const blackClass = `black-move${black ? ' current-move': ''}`
                        return (
                            <div className="move-wrapper" key={i}>
                                <div className="move-number">{i + 1}</div>
                                <div className="move">
                                    <div className={whiteClass} onClick={(e) => handleClickOnMove(e, i * 2)}>
                                        {move.white}
                                    </div>
                                    <div className={blackClass} onClick={(e) => handleClickOnMove(e, i * 2 + 1)}>
                                        {move.black}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div> 
    )       
}

export const MovesHistory = React.memo(historyConnector(Moves))
