import React from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { IRootState } from '../../../store/rootState&Reducer'
import {requestRematch, findRival, finishGameSetup} from '../../../store/gameOptions/actions'
import {analyzeLastGame} from '../../../store/gameAnalysis/actions'

import './game-end-popup.scss'
import { useHistory } from 'react-router'
import { setGameMode } from '../../../store/game/actions'


const stateMap = (state: IRootState) => ({
    gameResult: state.analyze.gameResult,
    gameOver: state.game.gameMode === 'isOver',
})

const dispatchMap = {
    requestRematch,
    findRival,
    finishGameSetup,
    analyzeLastGame,
    setGameMode
}

const connestor = connect(stateMap, dispatchMap)

const GameEndPopup: React.FC<ConnectedProps<typeof connestor>> = (props) => {
    const {
        requestRematch,
        findRival,
        gameOver,
        gameResult: {reason, winner, movesHistory},
        gameResult: {playerColor},
        finishGameSetup,
        analyzeLastGame,
        setGameMode
    } = props
      
    const history = useHistory()
    const win = winner && winner === playerColor
    const notAbandonByPlayer = !(reason && reason.startsWith('abandon') && reason.includes(playerColor as string))
    let message
    if (!winner) {
        message = 'Game canceled'
    } else {
        message = winner === 'draw' ? 'Draw' : `You ${win ? 'win' : 'lose'}`
    }
    const handleClick = (e: any) => {
        setGameMode('isPreparing')
        const classList = e.target.classList
        const containClass = (cl: string) => classList.contains(cl)
        if (containClass('rematch')) {
            requestRematch()
        } else if (containClass('new-rival')) {
            findRival()
        } else if (containClass('game-options')) {
            finishGameSetup(false)
        } else if (containClass('analyze-game')) {
            analyzeLastGame(true)
            history.push('/analysis')  
        }
    }
    const popupHTML = (
        <section className="game-end-popup">
            <header className={`popup-header ${win ? 'win-bg' : 'lose-bg'}`}>
                <h4 className="popup-title">{message}</h4> 
                <span className="material-icons" onClick={() => setGameMode('isPreparing')}>cancel</span>
            </header>
            <div className="popup-body">

            </div>
            <div className={`popup-footer ${win ? 'win-bg' : 'lose-bg'}`} onClick={handleClick}>
                <button className="popup-button rematch" type="button">
                    rematch
                </button>
                <button className="popup-button new-rival" type="button">
                    new
                </button>
                <button className="popup-button game-options" type="button">
                    options
                </button>
                {movesHistory 
                    ? <button className="popup-button analyze-game" type="button">
                        analyze
                    </button>
                    : null
                }
            </div>
        </section>
    )
    
    return  (
        <>
            {
                gameOver && notAbandonByPlayer ? popupHTML : null
            }
        </>
       
    ) 
}

export default connestor(GameEndPopup)
