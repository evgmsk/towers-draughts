import React from 'react'

import {connect, ConnectedProps} from 'react-redux'
import {endGame, surrender} from '../store/game/actions'
import {IBoardToGame, PieceColor} from "../store/models";
import {oppositeColor} from './gameplay-helper-fuctions';
import {IRootState} from '../store/rootState&Reducer';
import mmr from './mandatory-move-resolver';
import bms from './best-move-seeker';

import {turn} from '../store/board/actions';
import {AnimationDuration} from '../constants/gameConstants';
import {IEvaluatingState, ISeekerProps, ValueDynamic} from './engine-interfaces';

interface IBestMove {move: string, deep: number}


const mapState = (state: IRootState) => ({
    currentPosition: state.board.currentPosition,
    engineColor: oppositeColor(state.game.playerColor),
    white: state.game.white,
    black: state.game.black,
    rivalLevel: state.gameOptions.rivalLevel,
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
    turn, endGame, surrender
}

const botConnector = connect(mapState, mapDispatch)

type BotProps = ConnectedProps<typeof botConnector>

class ClientEngine extends React.Component<BotProps, IBestMove> {
    componentDidMount() {
        console.log('created', this.props)
    }

    componentDidUpdate(prev: BotProps, prevState: IBestMove) {
        const {moveOrder, movesHistory, currentPosition, gameMode, engineColor} = this.props
        const engineMove = moveOrder.pieceOrder === engineColor
        const props = {history: movesHistory, cP: currentPosition, pieceOrder: moveOrder.pieceOrder}
        if (gameMode === 'isPlaying' && prev.gameMode !== 'isPlaying') {
            console.log('new game', this.props)
            bms.setState(this.getSeekerProps())
            bms.setBestMoveCB(this.moveCB)
            if (engineMove) {
                setTimeout(() => bms.setActualMovesBranchAfterMove(props), AnimationDuration)
            }
        }
        if (prev.movesHistory.length !== movesHistory.length) {
            if (this.props.gameMode === 'isPlaying' && engineMove) {
                console.log('start engine', this.props)
                bms.setActualMovesBranchAfterMove(props)
            } else {
                console.log('stop engine', this.props)
                bms.setEvaluatingMove('')
            }
        }
    }

    getSeekerProps = (): ISeekerProps => {
        return {
            maxDepth: 6,
            position: this.props.currentPosition,
            pieceOrder: this.props.moveOrder.pieceOrder,
            game: true,
            lastMove: '',
            rootKey: '',
            rootKeyLength: 0
        }
    }

    moveCB = (move: {move: string, position: IBoardToGame}) => {
        const {surrender, endGame, engineColor, gameMode} = this.props
        if (move.move === 'surrender') {
            surrender(engineColor)
        } else if (!move.move) {
            endGame('noMoves')
        } else if (!!move && gameMode === 'isPlaying') {
            this.completeMove(move)
        }
    }

    passProps = () => {
        return {
            history: this.props.movesHistory,
            currentPosition: this.props.currentPosition,
            pieceOrder: this.props.moveOrder.pieceOrder
        }
    }

    completeMove(move:{move: string, position: IBoardToGame}) {
        const {moveOrder: oldOrder, turn, white, black, currentPosition} = this.props
        const moveOrder = mmr.getNewOrder({moveOrder: oldOrder, white, black})
        // console.log('old order', moveOrder, 'new order', nMoveOrder, currentPosition)
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
