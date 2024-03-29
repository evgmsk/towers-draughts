import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { convertToMovesHistory } from '../../game-engine/gameplay-helper-functions'
import { IRef } from '../../store/models'
import {
    analyzePosition,
    goToPosition,
    playMoves,
    stepBack,
    stepForward,
} from '../../store/gameAnalysis/actions'
import { IRootState } from '../../store/rootState&Reducer'

import './moves.scss'

const historyMapState = (state: IRootState) => ({
    movesHistory: state.game.history,
    gameMode: state.game.gameMode,
    movesMainLine: state.analyze.movesMainLine,
    analyzingPosition: state.analyze.analyzingPosition,
    currentMove: state.analyze.lastMove,
})

const historyMapDispatch = {
    analyzePosition,
    stepBack,
    stepForward,
    goToPosition,
    playMoves,
}

const historyConnector = connect(historyMapState, historyMapDispatch)

const Moves: React.FC<ConnectedProps<typeof historyConnector>> = (props) => {
    const ref: IRef<HTMLDivElement> = React.createRef()
    const {
        movesHistory,
        gameMode,
        movesMainLine,
        analyzePosition,
        analyzingPosition,
        stepBack,
        stepForward,
        goToPosition,
        playMoves,
        currentMove,
    } = props

    useEffect(() => {
        const scrollDown = () => {
            const elem = ref.current
            if (!elem) return
            elem.scroll(0, elem.scrollHeight)
        }
        scrollDown()
    }, [movesHistory, ref, movesMainLine])
    const History = useHistory()
    const mHistory = gameMode === 'isPlaying' ? movesHistory : movesMainLine!
    const length = mHistory?.length
    const moves = convertToMovesHistory(mHistory)

    const handleClickOnMenuItem = (e: React.MouseEvent) => {
        e.preventDefault()
        const { classList } = e.target as HTMLElement
        if (classList.contains('disabled') || gameMode === 'isPlaying') return
        if (History.location.pathname === '/game') {
            History.push('/analysis')
        }
        if (!analyzingPosition) {
            analyzePosition(true)
        }
        switch (true) {
            case classList.contains('to-start'):
                goToPosition({ index: -1, move: '' })
                break
            case classList.contains('step-back'): {
                return stepBack()
            }
            case classList.contains('step-forward'): {
                return stepForward()
            }
            case classList.contains('to-end'): {
                return goToPosition({
                    index: length - 1,
                    move: mHistory[mHistory.length - 1],
                })
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
        if (!analyzingPosition) return
        if (History.location.pathname === '/game') {
            History.push('/analysis')
        }
        goToPosition({ index, move: mHistory[index] })
    }
    const { index } = currentMove
    const baseClass = 'moves-history-menu__item'
    const toStartClass = `${baseClass} to-start${index < 0 ? ' disabled' : ''}`
    const stepBackClass = `${baseClass} step-back${!index ? ' disabled' : ''}`
    const stepForwardClass = `${baseClass} step-forward${
        index >= length - 1 ? ' disabled' : ''
    }`
    const toEndClass = `${baseClass} to-end${
        index >= length - 1 ? ' disabled' : ''
    }`
    const playClass = `${baseClass} play-moves`
    const Moves = moves.map(
        (move: { black: string; white: string }, i: number) => {
            const white = index === i * 2
            const black = index === i * 2 + 1
            const pointer = analyzingPosition ? ' cursor-pointer' : ''
            const whiteClass = `white-move${
                white ? ' current-move' : ''
            }${pointer}`
            const blackClass = `black-move${
                black ? ' current-move' : ''
            }${pointer}`
            return (
                <div className="move-wrapper" key={i}>
                    <div className="move-number">{i + 1}</div>
                    <div className="move">
                        <div
                            className={whiteClass}
                            onClick={(e) => handleClickOnMove(e, i * 2)}
                        >
                            {move.white}
                        </div>
                        <div
                            className={blackClass}
                            onClick={(e) => handleClickOnMove(e, i * 2 + 1)}
                        >
                            {move.black}
                        </div>
                    </div>
                </div>
            )
        }
    )
    return (
        <div className="moves-history-wrapper">
            <div className="moves-history-menu">
                {!analyzingPosition ? (
                    <p>Moves:</p>
                ) : (
                    <ul onClick={handleClickOnMenuItem}>
                        <li className={toStartClass}>
                            <i className="material-icons">first_page</i>
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
                )}
            </div>
            <div className="moves-container" ref={ref}>
                {Moves}
            </div>
        </div>
    )
}

export const MovesHistory = React.memo(historyConnector(Moves))
