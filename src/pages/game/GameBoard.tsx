import React from 'react'
import {connect, ConnectedProps} from 'react-redux'

import { 
    TowerConstructor,
    TowerType,
    IRef,
    TowerTouched,
    CellsMap,
    TowersMap,
    IBoardProps,
    IGameBoard,
    IMMRResult,
} from '../../store/app-interface'
import { endGame, updateIneffectiveMoves } from '../../store/game/actions'
import {
    checkMoveTargetCell,
    possibleOutOfMandatory,
    compareMaps,
    copyMap,
} from '../../game-engine/gameplay-helper-fuctions'
import { IRootState } from '../../store/rootState&Reducer'
import {AnimationDuration} from '../../constants/gameConstants'
import tur from '../../game-engine/update-towers-functions'
import mmr from '../../game-engine/mandatory-move-resolver'
import  TowerComponent from '../../game-components/tower/CheckerTower'
import { ClientBotEngine } from '../../game-engine/CientEngine'
import { Board } from '../../game-components/board/Board'
import { turn, updateBoardState } from '../../store/board/actions'
import {finishGameSetup} from '../../store/gameOptions/actions'


const mapState = (state: IRootState) => ({
    gameOptions: state.gameOptions,
    game: state.game,
    name: state.user.name,
    positionsTree: state.board.positionsTree,
    app: state.app,
    board: state.board,
    boardOptions: state.boardOptions,
})

const mapDispatch = {endGame, turn, updateIneffectiveMoves, updateBoardState, finishGameSetup}

const gameConnector = connect(mapState, mapDispatch)
type GameProps = ConnectedProps<typeof gameConnector>

export class GameClass extends React.Component<GameProps, IGameBoard> {
    private boardRef: IRef<HTMLDivElement> = React.createRef();
    mmr = mmr
    tur = tur
    
    componentDidMount() {
        if (!window) return
        const {game: {history}, board, boardOptions, updateBoardState} = this.props
        console.log('created with state:', this.props.board)
        this.tur.setCalBack(updateBoardState)
        if (history.length) {
            const towers = this.tur.updateTowersToBoard(board.currentPosition) as TowersMap
            const _board = {...board, towers}
            this.tur.updateCellsPosition(_board, boardOptions, this.boardRef.current!);
        } else {
            this.tur.updateCellsPosition(board, boardOptions, this.boardRef.current!);
        }
    }
    componentWillUnmount() {
        // this.props.finishGameSetup(false)
    }
    
    shouldComponentUpdate(prevProps: GameProps, prevState: IGameBoard) {
        const cond1 = JSON.stringify(prevProps) !== JSON.stringify(this.props) 
        return cond1 || compareMaps(prevProps.board.towers, this.props.board.towers)
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
        if (prevProps.game.history.length !== histLength && playerTurn === name) {
            console.log('updated', this.props.board, this.props.game)
            this.makePremoveAction(history[history.length - 1])  
        }
        if (prevProps.game.gameMode !== 'isPlaying' && gameMode === 'isPlaying') {
            console.log('new game started', this.props)
            this.tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
        if (JSON.stringify(app.windowSize) !== JSON.stringify(prevProps.app.windowSize)) {
            this.tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
    }

    makePremoveAction = (opponentMove: string) => {
        const {
            game: {moveOrder: {pieceOrder}},
            endGame,
            updateBoardState,
            board: {currentPosition},
        } = this.props
        const mandatoryMoves = this.mmr.lookForMandatoryMoves(pieceOrder, currentPosition)
        if (!mandatoryMoves.length && !this.mmr.lookForAllPosibleMoves(pieceOrder, currentPosition).length) {
            return setTimeout(() => endGame('noMoves'), AnimationDuration)
        }
        updateBoardState({
            mandatoryMoves,
            mandatoryMoveStep: 0,
            mouseDown: false,
            moveDone: false
        })
    }

    makePlayerMandatoryMoveStep = (to: string) => {
        const {mandatoryMoves, mandatoryMoveStep, towerTouched} = this.props.board
        const {game, turn, board, updateBoardState, gameOptions: {gameVariant}} = this.props
        const from = towerTouched!.key
        const fitMoves = mandatoryMoves!.filter((m: IMMRResult) => m.move.includes(`${from}:${to}`))
        if (fitMoves[0].move.split(':').length === 2 + (mandatoryMoveStep as number)) {
            const moveProps = {moveToSave: fitMoves[0], moveOrder: this.mmr.getNewOrder(game)}
            const takenPieces = fitMoves[0].takenPieces!
            const tP = gameVariant === 'towers' ? [takenPieces![mandatoryMoveStep]] : takenPieces
            let towers = this.tur.updateTowersOnMandatoryMoveStep(from, to, board, tP, true)
            console.log('towers;', towers)
            updateBoardState({
                mandatoryMoves: [] as unknown as IMMRResult[],
                mandatoryMoveStep: 0,
                towerTouched: null as unknown as TowerTouched,
                towers,
                lastMoveSquares: moveProps.moveToSave.move.split(':'),
                currentPosition: moveProps.moveToSave.position,
                mouseDown: false,
                moveDone: true,
            })
            turn(moveProps)
        } else {
            const tP = fitMoves[0].takenPieces![mandatoryMoveStep]
            updateBoardState({
                mandatoryMoves: fitMoves,
                mandatoryMoveStep: mandatoryMoveStep as number + 1,
                towerTouched: null as unknown as TowerTouched,
                towers: this.tur.updateTowersOnMandatoryMoveStep(from, to, board, [tP]),
                lastMoveSquares: fitMoves[0].move.slice(mandatoryMoveStep as number + 1).split(':'),
                mouseDown: false,
            })
        }
    }

    handleMouseUp = (event: any) => {
        const {
            towerTouched,
            cellSize,
            moveDone,
            mandatoryMoves,
            currentPosition
        } = this.props.board as IGameBoard
        const { board, game: {moveOrder, white, black}, turn} = this.props
        if (!towerTouched || moveDone) {
            return
        }
        const reversed = this.props.boardOptions.reversedBoard
        const {clientX, clientY} = event.type === 'touchend' ? event.changedTouches['0'] : event
        const to = checkMoveTargetCell({x: clientX, y: clientY}, towerTouched.posibleMoves, cellSize, this.boardRef)
        const cancelProps = {...board, reversed}
        if (!to) {
            this.tur.cancelTowerTransition(cancelProps)
        } else {
            const from = towerTouched.key
            if (mandatoryMoves?.length) {
                this.makePlayerMandatoryMoveStep(to)
            } else {
                this.tur.finalizeSimpleMove(from, to, board, reversed)
                const props =  {moveOrder, white, black, currentPosition}
                const moveProps = this.mmr.getPropsToMakeFreeMove(from, to, props)
                turn(moveProps)
            }
        }
    }
    
    handleMouseMove = (event: any) => {
        const {board: {towerTouched, moveDone, mouseDown}, updateBoardState} = this.props
        if (!towerTouched || moveDone || !mouseDown) {
            return
        }
        const {key, startCursorPosition: SCP, startTowerPosition: STP} = towerTouched;
        const {clientX, clientY} = event.type === 'touchmove' ? event.changedTouches['0'] : event
        const towers = copyMap(this.props.board.towers)
        const tower = towers.get(key)! as TowerConstructor
        const newPosition = {x: STP.x + clientX - SCP.x, y: STP.y + clientY - SCP.y}
        const currentPosition = tower.positionInDOM!
        tower.positionInDOM = newPosition
        const deltaX = Math.abs(currentPosition.x - newPosition.x)
        const deltaY = Math.abs(currentPosition.y - newPosition.y)
        
        if ( deltaX + deltaY >= 6) {
            towers.set(key, tower)
            updateBoardState({towers})
        }
    }

    handleMouseDown = (event: any) => {
        const {game: {moveOrder: {pieceOrder}}, board, updateBoardState} = this.props
        const {mandatoryMoves, cellsMap, towers, currentPosition} = board
        if (this.modeRestrictions()) return
        const {target, clientX, clientY} = event.type === 'touchstart' ? event.changedTouches['0'] : event
        const classList = (target as HTMLDivElement).classList
        if (!(classList.contains('checker-tower') && classList.contains(pieceOrder))) return
        const towerKey = (target as HTMLDivElement).getAttribute('data-indexes') as string
        const tower = towers.get(towerKey)!
        if (!tower) {
            console.error(towerKey, board)
            return
        }
        let posibleMoves: CellsMap
        if (mandatoryMoves?.length) {
           posibleMoves = possibleOutOfMandatory(this.props.board, towerKey)
        } else {
            posibleMoves = tower.currentType === TowerType.m 
            ? this.mmr.manTowerFreeMoves(tower, currentPosition, cellsMap)
            : this.mmr.kingTowerFreeMoves(towerKey, currentPosition, cellsMap)
        }
        if (!posibleMoves.size) {
            // sound
            return
        }
        const towerTouched: TowerTouched = {
            key: towerKey,
            posibleMoves,
            startCursorPosition: {x: clientX, y: clientY},
            startTowerPosition: tower.positionInDOM!,
            towerColor: tower.currentColor,
            towerType: tower.currentType as TowerType
        }
        updateBoardState({towerTouched, mouseDown: true})
    }

    modeRestrictions = (): boolean => {
        const {game: {moveOrder: {playerTurn}, gameMode}, name, board: {moveDone, animationStarted}} = this.props
        if (gameMode === 'isPlaying') {
            return playerTurn !== name || moveDone || animationStarted
        }
        return true
    }

    render() {
        const {towers, towerTouched, mandatoryMoves, mandatoryMoveStep, lastMoveSquares} = this.props.board
        const {boardOptions, game: {gameMode}} = this.props
        // console.log(towers)
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
                </section>
                {this.props.gameOptions.rivalType === 'PC' && <ClientBotEngine />}
            </>
        )
    }
}

export const GameBoard = gameConnector(GameClass) 
