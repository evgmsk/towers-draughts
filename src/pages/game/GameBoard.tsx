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
} from '../../store/models'
import { endGame, updateIneffectiveMoves } from '../../store/game/actions'
import {
    checkMoveTargetCell,
    possibleOutOfMandatory,
    copyObj
    ,
} from '../../game-engine/gameplay-helper-functions'
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
    windowSize: state.app.windowSize,
    board: state.board,
    boardOptions: state.boardOptions,
})

const mapDispatch = {endGame, turn, updateIneffectiveMoves, updateBoardState, finishGameSetup}

const gameConnector = connect(mapState, mapDispatch)
type GameProps = ConnectedProps<typeof gameConnector>

export class GameClass extends React.Component<GameProps, IGameBoard> {
    private boardRef: IRef<HTMLDivElement> = React.createRef();
    componentDidMount() {
        if (!window) return
        const {game: {history}, board, boardOptions, updateBoardState} = this.props
        console.log('created with state:', this.props.board)
        tur.setCalBack(updateBoardState)
        if (history.length) {
            const towers = tur.updateTowersToBoard(board.currentPosition) as TowersMap
            const _board = {...board, towers}
            tur.updateCellsPosition(_board, boardOptions, this.boardRef.current!);
        } else {
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!);
        }
    }
    componentWillUnmount() {
        // this.props.finishGameSetup(false)
    }
    
    shouldComponentUpdate(prevProps: GameProps, prevState: IGameBoard) {
        return JSON.stringify(prevProps) !== JSON.stringify(this.props)
    }

    componentDidUpdate(prevProps: GameProps) {
        const {
            game: {history, gameMode, moveOrder: {pieceOrder}, playerColor},
            gameOptions: {rivalType},
            board,
            windowSize,
            boardOptions,
        } = this.props
        const histLength = history.length 
        // console.log(this.props)
        if (prevProps.game.history.length !== histLength 
            && ((pieceOrder === playerColor && rivalType === "PC") || rivalType === 'player')) {
            console.log('updated', this.props.board, this.props.game)
            this.makePremoveAction(history[history.length - 1])  
        }
        if (prevProps.game.gameMode !== 'isPlaying' && gameMode === 'isPlaying') {
            console.log('new game started', this.props)
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
        if (JSON.stringify(windowSize) !== JSON.stringify(prevProps.windowSize)) {
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
    }

    makePremoveAction = (opponentMove: string) => {
        const {
            game: {moveOrder: {pieceOrder}},
            endGame,
            updateBoardState,
            board: {currentPosition},
        } = this.props
        const mandatoryMoves = mmr.lookForMandatoryMoves(pieceOrder, currentPosition)
        console.log('mand moves', mandatoryMoves)
        if (!mandatoryMoves.length && !mmr.lookForAllFreeMoves(pieceOrder, currentPosition).length) {
            console.log('no moves', this.props)
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
            const moveProps = {moveToSave: fitMoves[0], moveOrder: mmr.getNewOrder(game)}
            const takenPieces = fitMoves[0].takenPieces!
            const tP = gameVariant === 'towers' ? [takenPieces![mandatoryMoveStep]] : takenPieces
            let towers = tur.updateTowersOnMandatoryMoveStep(from, to, board, tP, true)
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
                towers: tur.updateTowersOnMandatoryMoveStep(from, to, board, [tP]),
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
        const to = checkMoveTargetCell({x: clientX, y: clientY}, towerTouched.possibleMoves, cellSize, this.boardRef)
        const cancelProps = {...board, reversed}
        if (!to) {
            tur.cancelTowerTransition(cancelProps)
        } else {
            const from = towerTouched.key
            if (mandatoryMoves?.length) {
                this.makePlayerMandatoryMoveStep(to)
            } else {
                tur.finalizeSimpleMove(from, to, board, reversed)
                const props =  {moveOrder, white, black, currentPosition}
                const moveProps = mmr.getPropsToMakeFreeMove(from, to, props)
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
        const towers = copyObj(this.props.board.towers)
        const tower = towers[key]! as TowerConstructor
        const newPosition = {x: STP.x + clientX - SCP.x, y: STP.y + clientY - SCP.y}
        const currentPosition = tower.positionInDOM!
        tower.positionInDOM = newPosition
        const deltaX = Math.abs(currentPosition.x - newPosition.x)
        const deltaY = Math.abs(currentPosition.y - newPosition.y)
        
        if ( deltaX + deltaY >= 6) {
            towers[key] = tower
            updateBoardState({towers})
        }
    }

    handleMouseDown = (event: any) => {
        const {game: {moveOrder: {pieceOrder}}, board, updateBoardState} = this.props
        const {mandatoryMoves, cellsMap, towers, currentPosition} = board
        
        const {target, clientX, clientY} = event.type === 'touchstart' ? event.changedTouches['0'] : event
        const classList = (target as HTMLDivElement).classList
        if (!(classList.contains('checker-tower') && classList.contains(pieceOrder))) return
        
        const towerKey = (target as HTMLDivElement).getAttribute('data-indexes') as string
        const tower = towers[towerKey]!
        if (!tower) {
            console.error(towerKey, board)
            return
        }
        let possibleMoves: CellsMap
        if (mandatoryMoves?.length) {
           possibleMoves = possibleOutOfMandatory(this.props.board, towerKey)
        } else {
            possibleMoves = tower.currentType === TowerType.m
            ? mmr.manTowerFreeMoves(tower, currentPosition, cellsMap)
            : mmr.kingTowerFreeMoves(towerKey, currentPosition, cellsMap)
        }
        console.log('mouse down', tower, possibleMoves)
        // if (!possibleMoves) {
        //     // sound
        //     return
        // }
        const towerTouched: TowerTouched = {
            key: towerKey,
            possibleMoves,
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
        const possibleMoves = towerTouched?.possibleMoves
        const BoardProps = {boardOptions, possibleMoves, lastMove: lastMoveSquares} as IBoardProps
        const mandatoryTowers = (mandatoryMoves || []).map(m => m.move.split(':')[mandatoryMoveStep || 0])
        const {boardSize, boardTheme} = boardOptions
        const WrapperClass = `board__wrapper ${boardTheme} h${boardSize}v${boardSize}`;
        const Towers = Array.from(Object.keys(towers)).map((key: string, i: number) => {
            const tower = towers[key]
            const mt = gameMode === 'isPlaying' ? mandatoryTowers.includes(tower.onBoardPosition) : false
            return <TowerComponent {...tower} key={tower.onBoardPosition} mandatory={mt} />
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
