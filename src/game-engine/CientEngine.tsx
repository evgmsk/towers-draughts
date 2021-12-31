import React from 'react'

import {connect, ConnectedProps} from 'react-redux'
import { endGame, updateIneffectiveMoves, surrender} from '../store/game/actions'
import { IBoardToGame, PieceColor} from "../store/app-interface";
import { oppositColor } from './gameplay-helper-fuctions'; 
import { IRootState } from '../store/rootState&Reducer';
import  mmr from './mandatory-move-resolver';
import bms from './position-evaluator'

import { turn } from '../store/board/actions';
import { AnimationDuration } from '../constants/gameConstants';
import { ISeekerProps } from './engine-interfaces';

interface IBestMove {move: string, deep: number}


const mapState = (state: IRootState) => ({
        currentPosition: state.board.currentPosition,
        engineColor: oppositColor(state.game.playerColor),
        white: state.game.white,
        black: state.game.black,
        dificulty: state.gameOptions.rivalLevel,
        timeToGame: state.gameOptions.timing.timeToGame,
        time: state.game.playerColor === PieceColor.w 
            ? state.clock.blackClock.timeToGame 
            : state.clock.whiteClock.timeToGame,
        gameVariant: state.gameOptions.gameVariant,
        moveOrder: state.game.moveOrder,
        movesHistory: state.game.history,
        gameMode: state.game.gameMode,
    })

const mapDispatch = {
    turn, endGame, updateIneffectiveMoves, surrender
}

const botConnector = connect(mapState, mapDispatch)

type BotProps = ConnectedProps<typeof botConnector>

class ClientEngine extends React.Component<BotProps, IBestMove> {
    maxDepth = 6
    componentDidMount() {
        console.log('created', this.props)
    }

    componentDidUpdate(prev: BotProps, prevState: IBestMove) {
        const {moveOrder, movesHistory, currentPosition, gameMode, engineColor} = this.props
        if (gameMode === 'isPlaying' && prev.gameMode !== 'isPlaying') {
            console.log('new game', this.props, bms.evaluationStarted)         
            const engineMove = moveOrder.pieceOrder === engineColor
            bms.resetProps(this.getSeekerProps())
            if (engineMove) {
                const props = {history: movesHistory, cP: currentPosition}
                setTimeout(() => bms.setActualMovesBranchAfterMove(props), AnimationDuration)
            }
        }
        if (moveOrder.pieceOrder !== engineColor) return        
        if (prev.movesHistory.length !== movesHistory.length) {
            if (moveOrder.pieceOrder === engineColor) {
                console.log('start engine', this.props)
                if (this.props.gameMode === 'isPlaying') {
                    const props = {history: movesHistory, cP: currentPosition}
                    bms.setActualMovesBranchAfterMove(props)
                }
            } else {
                console.log('stop engine', this.props)
                bms.startEvaluation(false)
            }
        }
    }

    getSeekerProps = (): ISeekerProps => {
        return {
            bestMoveCB: this.getMoveCB,
            maxDepth: this.maxDepth,
            engineColor: this.props.engineColor,
            evaluationStarted: true,
            game: true
        }
    }

    setMaxDeep = (deep: number) => {
        this.maxDepth = deep
    }

    getMoveCB = (move: {move: string, position: IBoardToGame, takenPices?: string[]}) => {
        const {surrender, endGame, engineColor, gameMode} = this.props
        if (move.move === 'surrender') {
            surrender(engineColor)
        } else if (!move.move) {
            endGame('noMoves')
        } else if (!!move && gameMode === 'isPlaying') {
            this.compleateMove(move)
        } 
    }

    passProps = () => {
        return {
            history: this.props.movesHistory,
            currentPosition: this.props.currentPosition,
            engineMove: this.props.moveOrder.pieceOrder === this.props.engineColor
        }
    }

    compleateMove(move:{move: string, position: IBoardToGame, takenPices?: string[]}) {
        const {moveOrder: oldOrder, turn, white, black, currentPosition} = this.props
        const moveOrder = mmr.getNewOrder({moveOrder: oldOrder, white, black})
        // console.log('old oreder', moveOrder, 'new order', nMoveOrder, currentPosition)
        if (move.move.includes(':')) {
            const takenPieces = mmr.getCapturedTowers(move.move.split(':'), currentPosition)
            const moveToSave = {...move, takenPieces}
            turn({moveToSave, moveOrder: moveOrder})
        } else {
            turn({moveToSave: move, moveOrder: moveOrder})
        }        
    }

    render() {
        return null
    }
}

export const ClientBotEngine = botConnector(ClientEngine)
