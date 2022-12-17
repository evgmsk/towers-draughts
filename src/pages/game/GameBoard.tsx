import React from 'react'
import { connect, ConnectedProps } from 'react-redux'

import {
    IBoard,
    IBoardProps,
    IRef,
    TowerConstructor,
    TowerTouched,
} from '../../store/models'
import { endGame } from '../../store/game/actions'
import {
    checkMoveTargetCell,
    copyObj,
    isDev,
} from '../../game-engine/gameplay-helper-functions'
import { IRootState } from '../../store/rootState&Reducer'
import { AnimationDuration } from '../../constants/gameConstants'
import mmr from '../../game-engine/moves-resolver'
import { TowerComponent } from '../../game-components/tower/CheckerTower'
import { ClientBotEngine } from '../../game-engine/CientEngine'
import { Board } from '../../game-components/board/Board'
import {
    setTouchedTower,
    turn,
    updateBoardState,
    updateTowers,
} from '../../store/board-towers/actions'
import { finishGameSetup } from '../../store/gameOptions/actions'
import tur from '../../game-engine/towers-updater'

const mapState = (state: IRootState) => ({
    gameOptions: state.gameOptions,
    game: state.game,
    name: state.user.name,
    board: state.boardAndTowers,
    boardOptions: state.boardOptions,
})

const mapDispatch = {
    endGame,
    turn,
    updateBoardState,
    finishGameSetup,
    updateTowers,
    setTouchedTower,
}

const gameConnector = connect(mapState, mapDispatch)
type GameProps = ConnectedProps<typeof gameConnector>

export class GameClass extends React.Component<GameProps, IBoard> {
    private boardRef: IRef<HTMLDivElement> = React.createRef()
    componentDidMount() {
        if (!window) return
        if (isDev()) console.log('created with state:', this.props)
        this.updateTowers()
    }

    componentWillUnmount() {
        // this.props.finishGameSetup(false)
    }

    shouldComponentUpdate(prevProps: GameProps, prevState: IBoard) {
        return JSON.stringify(prevProps) !== JSON.stringify(this.props)
    }

    componentDidUpdate(prevProps: GameProps) {
        const {
            game: {
                history,
                gameMode,
                moveOrder: { pieceOrder },
                playerColor,
            },
            gameOptions: { rivalType },
        } = this.props
        if (
            prevProps.game.history.length !== history.length &&
            ((pieceOrder === playerColor && rivalType === 'PC') ||
                rivalType === 'player')
        ) {
            this.makePremoveAction()
        }
        if (
            prevProps.game.gameMode !== 'isPlaying' &&
            gameMode === 'isPlaying'
        ) {
            this.updateTowers()
        }
    }

    updateTowers() {
        const { board, boardOptions, updateBoardState } = this.props
        const boardRect = this.boardRef.current?.getBoundingClientRect()
        if (boardRect) {
            const boardProps = tur.updateCellsAndTowersPosition(
                board,
                boardOptions,
                boardRect
            )
            updateBoardState(boardProps)
        }
    }

    makePremoveAction = () => {
        const {
            endGame,
            board: { moves },
        } = this.props
        if (!moves.length) {
            return setTimeout(() => endGame('noMoves'), AnimationDuration)
        }
    }

    handleMouseUp = (event: any) => {
        const {
            board: { towerTouched, moveDone, cellSize },
            board,
            game: { moveOrder: oldOrder, white, black },
            updateBoardState,
            turn,
        } = this.props
        if (!towerTouched || moveDone) {
            return
        }
        const { clientX, clientY } =
                event.type === 'touchend' ? event.changedTouches['0'] : event,
            boardRect = this.boardRef.current?.getBoundingClientRect()!,
            possMoves = towerTouched.possibleMoves,
            targetKey = checkMoveTargetCell(
                { x: clientX, y: clientY },
                possMoves,
                cellSize,
                boardRect
            )
        if (!targetKey) {
            const towers = tur.cancelTowerTransition(board)
            updateBoardState({
                towers,
                towerTouched: null as unknown as TowerTouched,
            })
            return
        }
        const { boardProps, moveToSave } = tur.handleUpToMove(targetKey, board)
        // console.warn(moveToSave, boardProps)
        if (moveToSave) {
            const moveOrder = mmr.getNewOrder({
                moveOrder: oldOrder,
                white,
                black,
            })
            turn({ moveToSave, moveOrder })
        }
        boardProps && updateBoardState(boardProps)
    }

    handleMouseMove = (event: any) => {
        const {
            board: { towerTouched, moveDone },
            updateTowers,
        } = this.props
        if (!towerTouched || moveDone) {
            return
        }
        const {
            key,
            startCursorPosition: SCP,
            startTowerPosition: STP,
        } = towerTouched
        const { clientX, clientY } =
            event.type === 'touchmove' ? event.changedTouches['0'] : event
        const towers = copyObj(this.props.board.towers)
        const tower = towers[key]! as TowerConstructor
        const newPosition = {
            x: STP.x + clientX - SCP.x,
            y: STP.y + clientY - SCP.y,
        }
        const currentPosition = tower.positionInDOM
        tower.positionInDOM = newPosition
        const deltaX = Math.abs(currentPosition.x - newPosition.x)
        const deltaY = Math.abs(currentPosition.y - newPosition.y)
        if (deltaX + deltaY >= 6) {
            towers[key] = tower
            updateTowers(towers)
        }
    }

    handleMouseDown = (event: any) => {
        const {
            board: { towerTouched, moveDone },
            board,
            game: {
                moveOrder: { pieceOrder },
            },
            updateBoardState,
            setTouchedTower,
        } = this.props
        const { target, clientX, clientY } =
            event.type === 'touchstart' ? event.changedTouches['0'] : event
        const classList = (target as HTMLDivElement).classList
        const targetKey = (target as HTMLDivElement).getAttribute(
            'data-indexes'
        ) as string
        if (
            !classList.contains('checker-tower') ||
            moveDone ||
            !classList.contains(pieceOrder)
        ) {
            return
        }
        if (!towerTouched) {
            return setTouchedTower({ key: targetKey, clientX, clientY })
        }
        if (towerTouched && !targetKey) {
            const towers = tur.cancelTowerTransition(board)
            updateBoardState({
                towers,
                towerTouched: null as unknown as TowerTouched,
            })
        }
    }

    render() {
        const {
                board: {
                    towers,
                    towerTouched,
                    moves,
                    mandatoryMoveStep,
                    lastMoveSquares,
                },
                boardOptions,
            } = this.props,
            mandatory = moves.filter((m) => m.takenPieces),
            possibleMoves = towerTouched?.possibleMoves,
            BoardProps = {
                boardOptions,
                possibleMoves,
                lastMove: lastMoveSquares,
            } as IBoardProps,
            mandatoryTowers = mandatory.map(
                (m) => m.move[mandatoryMoveStep || 0]
            ),
            { boardSize, boardTheme } = boardOptions,
            WrapperClass = `board__wrapper ${boardTheme} h${boardSize}v${boardSize}`
        const Towers = Array.from(Object.keys(towers)).map((key: string) => {
            const tower = towers[key]
            tower.mandatory = mandatoryTowers.includes(tower.onBoardPosition)
            return (
                <TowerComponent
                    {...tower}
                    key={tower.onBoardPosition}
                    isTowers={mmr.GV === 'towers'}
                    bs={boardSize}
                />
            )
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
                    <Board {...BoardProps} />
                </section>
                {this.props.gameOptions.rivalType === 'PC' && (
                    <ClientBotEngine />
                )}
            </>
        )
    }
}

export const GameBoard = gameConnector(GameClass)
