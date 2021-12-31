import React from 'react'
import {connect, ConnectedProps} from 'react-redux'

import { 
    TowerConstructor,
    // TowerType,
    IRef,
    TowerTouched,
    // CellsMap,
    IBoardToGame,
    TowersMap,
    IBoardProps,
    IGameBoard,
} from '../store/app-interface'
import { makeMove, endGame, updateIneffectiveMoves } from '../store/game/actions'
import {
    compareMaps,
} from '../game-engine/gameplay-helper-fuctions'
import { IRootState } from '../store/rootState&Reducer'

import {AnimationDuration} from '../constants/gameConstants'
import tur from '../game-engine/update-towers-functions'
import mmr from '../game-engine/mandatory-move-resolver'
import  TowerComponent from './tower/CheckerTower'
// import { ClientBotEngine } from '../game-engine/CientEngine'
import { Board } from './board/Board'
import { updateBoardState } from '../store/board/actions'


const mapState = (state: IRootState) => ({
    gameOptions: state.gameOptions,
    game: state.game,
    name: state.user.name,
    app: state.app,
    board: state.board,
    boardOptions: state.boardOptions
})

interface Handlers {
    handleMouseDown: (event: any) => {}
    handleMouseMove: (event: any) => {}
    handleMouseUp: (event: any) => {}
}

const mapDispatch = {endGame, makeMove, updateIneffectiveMoves, updateBoardState}

const gameConnector = connect(mapState, mapDispatch)
type GameProps = ConnectedProps<typeof gameConnector> & Handlers


export class GameClass extends React.Component<GameProps, IGameBoard> {
    private boardRef: IRef<HTMLDivElement> = React.createRef();
    mmr = mmr
    tur = tur
    handleMouseDown: (event: any) => {}
    handleMouseMove: (event: any) => {}
    handleMouseUp: (event: any) => {}
    constructor(props: GameProps) {
        super(props);
        const Props = {size: this.props.boardOptions.boardSize, GV: this.props.gameOptions.gameVariant}
        this.mmr.setProps(Props)
        this.tur.setProps(Props)
        this.handleMouseDown = this.props.handleMouseDown
        this.handleMouseMove = this.props.handleMouseMove
        this.handleMouseUp = this.props.handleMouseUp
    }

    componentDidMount() {
        if (!window) return
        const {game, board, boardOptions} = this.props
        console.log('created with state:', this.state)
        const boardRef = this.boardRef.current!
        if (game.history.length) {
            const towers = this.tur.updateTowersToBoard(board.currentPosition) as TowersMap
            const _board = {...board, towers}
            this.tur.updateCellsPosition(_board, boardOptions, boardRef);
        } else {
            this.tur.updateCellsPosition(board, boardOptions, boardRef);
        }
    }

    shouldComponentUpdate(prevProps: GameProps, prevState: IGameBoard) {
        const cond1 = JSON.stringify(prevProps) !== JSON.stringify(this.props) 
        const cond2 = JSON.stringify(prevState) !== JSON.stringify(this.state)
        return cond1 || cond2 || compareMaps(prevState.towers, this.state.towers)
    }

    componentDidUpdate(prevProps: GameProps) {
        const {
            game: {history, moveOrder: {playerTurn}, gameMode},
            name,
            app,
            board,
            boardOptions
        } = this.props
        const histLength = history.length
        if (prevProps.game.history.length < histLength && playerTurn === name) {
            console.log('updated', history.length, history[history.length -1], this.state)
            this.makePremoveAction(history[history.length - 1])  
        }
        if (JSON.stringify(app.windowSize) !== JSON.stringify(prevProps.app.windowSize)
            || (prevProps.game.gameMode !== 'isPlaying' && gameMode === 'isPlaying')) {
            this.tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
    }

    makePremoveAction = (opponentMove: string) => {
        const {game: {history, moveOrder: {pieceOrder}}, board: {currentPosition}, endGame} = this.props
        const mandatoryMoves = this.mmr.lookForMandatoryMoves(pieceOrder, currentPosition)
        const freeMoves = this.mmr.lookForAllPosibleMoves(pieceOrder, currentPosition)
        if (!mandatoryMoves.length && !freeMoves.length) {
            return setTimeout(() => endGame('noMoves'), AnimationDuration)
        }  
    }

    animateOpponentMove = (move: string, board: IBoardToGame) => {
        if (move.includes('-')) {
            this.animateSimpleMove(move)
        } else if (move.includes(':')) {
            this.animateRivalMandatoryMove(move.split(':'), board)
        }
    }

    animateSimpleMove = (move: string) => {
        const [from, to]: string[] = move.split('-')
        this.setState((state: IGameBoard) => {
            return {...this.tur.animateRivalTowerMove(from, to, state)}
        })
        const towers = this.tur.updateTowersAfterMoveAnimation(from ,to, this.state, false, true)
        setTimeout(() => {
            this.setState((state: IGameBoard) => ({...state, towers, animationStarted: false}))
        }, AnimationDuration)
    }
   
    animateRivalMandatoryMove = (move: string[], prevBoard: IBoardToGame) => {
        if (move.length < 2) console.error('move is invalid')
        // if (move.length === 2) {
        //     this.animateRivalMandatoryMoveStep(move[0], move[1], prevBoard, true)
        //     return 
        // }
        // this.animateRivalMandatoryMoveStep(move[0], move[1], prevBoard)
        setTimeout(() => this.animateRivalMandatoryMove(move.slice(1), prevBoard), AnimationDuration)
    }

    modeRestrictions = (): boolean => {
        const {game: {moveOrder: {playerTurn}, gameMode}, name} = this.props
        const {moveDone, animationStarted} = this.state
        if (gameMode === 'isPlaying') {
            return playerTurn !== name || moveDone || animationStarted!
        }
        return true
    }

    render() {
        const {towers, towerTouched, mandatoryMoves, mandatoryMoveStep, lastMoveSquares} = this.props.board
        const { boardOptions, game: {gameMode}} = this.props
        const posibleMoves = towerTouched?.posibleMoves
        const BoardProps = {boardOptions, posibleMoves, lastMove: lastMoveSquares} as IBoardProps
        const mandatoryTowers = (mandatoryMoves || []).map(m => m.move.split(':')[mandatoryMoveStep || 0])
        const {boardSize, boardTheme} = boardOptions
        const WrapperClass = `board__wrapper ${boardTheme} h${boardSize}v${boardSize}`;
        const Towers = Array.from(towers.values()).map((props: TowerConstructor, i: number) => {
            const mt = gameMode === 'isPlaying' ? mandatoryTowers.includes(props.onBoardPosition) : false
            return <TowerComponent {...props} key={props.onBoardPosition} mandatory={mt} />
        })
        return (
            <>
                <section
                    onMouseMove={this.handleMouseMove}
                    onMouseUp={this.handleMouseUp}
                    onMouseDown={this.handleMouseDown}
                    onTouchStart={this.handleMouseDown}
                    onTouchMove={this.handleMouseMove} 
                    onTouchEnd={this.handleMouseUp}
                    className={WrapperClass}
                    ref={this.boardRef}
                >   
                    {Towers}
                    <Board {...BoardProps}/>
                    {this.props.children}
                </section>
            </>
        )
    }
}

export const GameBoard = gameConnector(GameClass) 
