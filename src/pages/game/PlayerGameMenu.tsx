import { ConnectedProps, connect} from "react-redux"
import { Logo } from "../../common/LogoIcon"
import { 
    endGame,
    declineDraw,
    offerDraw,
    cancelGame,
    confirmStartGame,
    setGameMode,
    surrender
} from "../../store/game/actions"
import {undoLastMove} from '../../store/board/actions'
import { findRival, finishGameSetup } from "../../store/gameOptions/actions"
import { IRootState } from "../../store/rootState&Reducer"
import { PieceColor } from "../../game-engine/js-engine/gameplay-helper-fuctions"
import { analyzeLastGame } from "../../store/gameAnalysis/actions"
import { useHistory } from "react-router"

const gameMenuMapState = (state: IRootState) => ({
    drawOffered: state.game.rivalOfferedDraw,
    gameConfirmed: state.game.gameConfirmed,
    playerColor: state.game.playerColor,
    gameMode: state.game.gameMode,
    pcGame: state.gameOptions.rivalType === 'PC',
    historyLength: state.game.history.length > 2
})

const gameMenuMapDispatch = {
    endGame,
    declineDraw,
    offerDraw,
    cancelGame,
    confirmStartGame,
    findRival,
    finishGameSetup,
    setGameMode,
    surrender,
    undoLastMove,
    analyzeLastGame,
}

const gameMenuConnector = connect(gameMenuMapState, gameMenuMapDispatch)

const GameMenuComponent: React.FC<ConnectedProps<typeof gameMenuConnector>> = (props) => {
    const history = useHistory()
    const {
        surrender,
        endGame,
        declineDraw,
        drawOffered,
        offerDraw,
        gameConfirmed,
        gameMode,
        findRival,
        finishGameSetup,
        setGameMode,
        cancelGame,
        playerColor,
        pcGame,
        undoLastMove,
        historyLength,
        analyzeLastGame
    } = props

    const reason = playerColor === PieceColor.w ? `abandonedByWhite` : 'abandonedByBlack'

    const handleCancelGame = (e: React.MouseEvent) => {
        cancelGame()
    }
   
    const handleDrawOffer = (e: React.MouseEvent) => {
        e.preventDefault()
        offerDraw()
    }

    const handleAnalizeGame = (e: React.MouseEvent) => {
        if (gameMode === 'isPlaying') {
            endGame(reason)
            setGameMode('isAnalyzing')
        }
        analyzeLastGame(true)
        history.push('/analysis')
    }

    const handleUndo = () => {
        if (historyLength ) {
            undoLastMove()
        }
    }

    const handleResetGameOption = () => {
        if (gameMode === 'isPlaying') {
            endGame(reason)
        }
        finishGameSetup(false)
       
    }

    const handleNewGame = () => {
        if (gameMode === 'isPlaying') {
            endGame(reason)
        }
        findRival()
    }
   
    const undoClass = !historyLength ? "game-menu__item hide-undo" : "game-menu__item"
    if (pcGame && gameConfirmed) {
        return (
            <ul className="game-menu">
                <li title="undo move" className={undoClass} role="button" onClick={handleUndo}>
                    <i className="material-icons">history</i>
                </li>
                <li title="new game" role="button" className="game-menu__item" onClick={handleNewGame}>
                    <Logo size={13} />
                </li>
                <li 
                    title="game options" 
                    role="button" className="game-menu__item" 
                    onClick={handleResetGameOption}
                >
                    <i className="material-icons">settings_applications</i>
                </li>
                <li title="analize game" role="button" className="game-menu__item" onClick={handleAnalizeGame}>
                    <i className="material-icons">zoom_in</i>
                </li>
            </ul>
        )
    }

    if (gameMode === 'isPlaying' && !gameConfirmed) {
        return (
            <ul className="game-menu">
                <li title="cancel game" className="game-menu__item" role="button" onClick={handleCancelGame}>
                    <i className="material-icons">close</i>
                </li>
            </ul>
        )
    }

    if (gameMode !== 'isPlaying') {
        return (
            <ul className="game-menu">
                <li title="new game" role="button" className="game-menu__item" onClick={findRival}>
                    <Logo size={13} />
                </li>
                <li 
                    title="game options" 
                    role="button" className="game-menu__item" 
                    onClick={() => finishGameSetup(false)}
                >
                    <i className="material-icons">settings_applications</i>
                </li>
                <li title="analize game" role="button" className="game-menu__item" onClick={handleAnalizeGame}>
                    <i className="material-icons">zoom_in</i>
                </li>
            </ul>
        )
    }
    
    return ( 
        <ul className="game-menu">
            {!drawOffered
                ? <>
                    <li 
                        title="resign"
                        role="button"
                        className="game-menu__item"
                        onClick={() => surrender(playerColor)}
                    >
                        <i className="material-icons">flag</i>
                    </li>
                    <li 
                        title="offer draw"
                        role="button"
                        className="game-menu__item"
                        onClick={handleDrawOffer}
                    >
                        <i className="offer_draw">1/2</i>
                    </li>
                </>
                : <>
                    <li 
                        role="button" 
                        title="accept draw"
                        className="game-menu__item"
                        onClick={() => endGame('drawByAgreement')}
                    >
                        <i className="material-icons">thumb_up</i>
                    </li>
                    <li 
                        role="button"
                        title="decline draw"
                        className="game-menu__item"
                        onClick={() => declineDraw(false)}
                    >
                        <i className="material-icons">thumb_down</i>
                    </li>
                </>
            }
        </ul>
    )
}

export const GameMenu = gameMenuConnector(GameMenuComponent)
