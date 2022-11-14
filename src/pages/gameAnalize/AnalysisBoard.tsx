import React from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {
    // IAnalysisBoard,
    IBoardProps, IMoveToMake,
    IRef,
    PieceColor,
    TowersMap,
    TowerTouched,
    TowerType,
} from '../../store/models'
import {setGameMode} from '../../store/game/actions'
import {makeNewMove, setBestMoveLine, updateAnalysisState} from '../../store/gameAnalysis/actions'
import {
    checkMoveTargetCell,
    copyObj,
} from '../../game-engine/gameplay-helper-functions'
import {
    createOutBoardTowers,
} from '../../game-engine/prestart-help-function'

import {TowerComponent} from '../../game-components/tower/CheckerTower'
import {Board} from '../../game-components/board/Board'
import {IRootState} from '../../store/rootState&Reducer'
import bms from '../../game-engine/best-move-seeker-towers'
import {finishGameSetup} from '../../store/gameOptions/actions'
import mmr from "../../game-engine/moves-resolver"
import tur from '../../game-engine/towers-updater'
import {
    updateTouchedTower,
    undoLastMove,
    updateTowers,
    updateBoardState,
    setTouchedTower,
} from "../../store/board-towers/actions";
import {InitialGameAnalysisState} from "../../store/gameAnalysis/reducers";
import {InitialTowersState} from "../../store/board-towers/reducers";


const UnusedTowers = React.memo((props: {color: PieceColor, number: number}) => {
    const {color, number} = props
    return <span className={`unused-${color}`}>{number}</span>
})

const mapState = (state: IRootState) => ({
    GV: state.gameOptions.gameVariant,
    windowSize: state.app.windowSize,
    analysis: state.analyze,
    boardAndTowers: state.boardAndTowers,
    boardOptions: state.boardOptions,
    bestMoveLine: state.analyze.bestMoveLine,
    gameMode: state.game.gameMode
})

const mapDispatch = {
    setTouchedTower,
    updateTowers,
    updateAnalysisState,
    makeNewMove,
    updateBoardState,
    setGameMode,
    finishGameSetup,
    setBestMoveLine,
    updateTouchedTower,
    undoLastMove,
}

const gameAnalyzeConnector = connect(mapState, mapDispatch)
type GameAnalyzeProps = ConnectedProps<typeof gameAnalyzeConnector>

type AnalysisBoardState = {[key: string]: any}

export class GameBoard extends React.Component<GameAnalyzeProps, AnalysisBoardState> {
    private boardRef: IRef<HTMLDivElement> = React.createRef()

    componentDidMount() {
        if (!window) return
        const {
            analysis: {analyzeLastGame, gameResult},
            finishGameSetup,
            setGameMode,
            boardOptions,
            boardAndTowers,
            updateBoardState,
        } = this.props
        console.warn('start analyze with props', this.props)
        finishGameSetup(false)
        setGameMode('isAnalyzing')
        const rect = this.boardRef.current?.querySelector('.board__body')?.getBoundingClientRect()
        let towers = copyObj(boardAndTowers.towers)
        if ((!analyzeLastGame || !gameResult.movesHistory.length) && rect) {
            towers = createOutBoardTowers({}, boardOptions.boardSize)
        }
        const payload = tur.updateCellsAndTowersPosition({...boardAndTowers, towers}, boardOptions, rect)
        updateBoardState(payload)
        bms.setBestLineCB(this.bestLineCB)
    }

    componentDidUpdate(prevProps: GameAnalyzeProps) {

    }

    bestLineCB = (line: {move: string, value: number}[]) => {
        this.props.setBestMoveLine(line)
    }

    componentWillUnmount() {
        const {updateAnalysisState, updateBoardState} = this.props
        updateAnalysisState(InitialGameAnalysisState)
        updateBoardState(InitialTowersState)
    }

    handleMouseUp = (event: any) => {
        const {
            analysis: {settingPosition},
            boardAndTowers: {towerTouched, moveDone, cellsMap, cellSize},
            boardAndTowers,
            updateBoardState,
            makeNewMove
        } = this.props
        if (!towerTouched || moveDone) {
            return
        }
        const {clientX, clientY} = event.type === 'touchend' ? event.changedTouches['0'] : event
        const cellsToCheck = !settingPosition
            ? towerTouched.possibleMoves
            : cellsMap
        const bRect = this.boardRef.current?.getBoundingClientRect()!
        const targetKey = checkMoveTargetCell({x: clientX, y: clientY}, cellsToCheck, cellSize, bRect)
        if (!targetKey) {
            const towers = tur.cancelTowerTransition(boardAndTowers)
            updateBoardState({towers, towerTouched: null as unknown as TowerTouched})
            return
        }
        if (!settingPosition) {
            const {boardProps, moveToSave} = tur.handleUpToMove(targetKey, boardAndTowers)
            moveToSave && makeNewMove({moveToSave} as Partial<IMoveToMake>)
            boardProps && updateBoardState(boardProps)
        } else if (towerTouched.key !== targetKey) {
            const propsToBoard = tur.handleSettingPieces(targetKey, boardAndTowers)
            updateBoardState(propsToBoard)
        }
    }

    handleMouseMove = (event: any) => {
        const {
            boardAndTowers: {towerTouched},
            boardAndTowers,
            updateTowers
        } = this.props
        if (!towerTouched) {
            return
        }
        const {key, startCursorPosition: SCP, startTowerPosition: STP} = towerTouched;
        const {clientX, clientY} = event.type === 'touchmove' ? event.changedTouches['0'] : event
        const towers = copyObj(boardAndTowers.towers) as TowersMap
        const tower = towers[key]
        const newPosition = {x: STP.x + clientX - SCP.x, y: STP.y + clientY - SCP.y}
        const currentPos = tower.positionInDOM
        tower.positionInDOM = newPosition
        const deltaX = Math.abs(currentPos.x - newPosition.x)
        const deltaY = Math.abs(currentPos.y - newPosition.y)
        if ( deltaX + deltaY >= 6) {
            towers[key] = tower
            updateTowers(towers)
        }
    }

    handleMouseDown = (event: any) => {
        const {
            analysis: {removePiece, settingPosition, pieceOrder},
            boardAndTowers: {towerTouched, towers},
            boardAndTowers: board,
            updateTowers,
            updateBoardState,
            setTouchedTower
        } = this.props
        const {target, clientX, clientY} = event.type === 'touchstart' ? event.changedTouches['0'] : event
        const classList = (target as HTMLDivElement).classList
        const targetKey = (target as HTMLDivElement).getAttribute('data-indexes') as string
        if ((!towerTouched && !classList.contains('checker-tower'))
            || (!settingPosition && pieceOrder !== towers[targetKey].currentColor)) {
            return
        }
        if (!towerTouched && !removePiece && (settingPosition || targetKey.length < 4)) {
            return setTouchedTower({key: targetKey, clientX, clientY})
        }
        if (towerTouched && !targetKey) {
            const towers = tur.cancelTowerTransition(board)
            updateBoardState({
                towers,
                towerTouched: null as unknown as TowerTouched,
            })
        }
        if (removePiece && targetKey && targetKey.length < 4) {
            const towers = tur.handleRemovePiece(targetKey, board)
            console.warn('rem', removePiece && targetKey && targetKey.length < 4, towers)
            updateTowers(towers)
        }
    }

    contextMenuHandler = (e: React.MouseEvent) => {
        const {analysis: {settingPosition}, updateTowers, boardAndTowers} = this.props
        e.preventDefault()
        const target = e.target as HTMLElement
        if (!settingPosition || !target.classList.contains('checker-tower')) { return }
        const key = target.getAttribute('data-indexes')!
        const towers = copyObj(boardAndTowers.towers) as TowersMap
        const tower = towers[key]
        tower.currentType = tower.currentType === TowerType.m ? TowerType.k : TowerType.m
        updateTowers(towers)
    }

    render() {
        const {boardOptions, boardAndTowers: {towerTouched}, boardAndTowers} = this.props
        const {towers, moves, mandatoryMoveStep, lastMoveSquares} = boardAndTowers
        const boardProps = {
            boardOptions,
            possibleMoves: towerTouched?.possibleMoves,
            lastMove: lastMoveSquares
        }  as IBoardProps
        const {boardSize, boardTheme, reversedBoard} = boardOptions
        const WrapperClass = `board__wrapper ${boardTheme} h${boardSize}v${boardSize}${reversedBoard ? ' reversed' : ''}`;
        const mandatoryTowers = (moves || []).filter(m => m.takenPieces).map(m => m.move[mandatoryMoveStep])
        const isTowers= mmr.GV === 'towers'
        const Towers = (Object.keys(towers!)).map((key: string) => {
            const tower = towers[key]
            tower.mandatory = mandatoryTowers.includes(tower.onBoardPosition)
            return <TowerComponent {...tower} key={tower.onBoardPosition} isTowers={isTowers} bs={boardSize} />
        })
        const {white, black} = tur.getUnusedTowers(towers)
        return (
            <section
                onContextMenu={this.contextMenuHandler}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseDown={this.handleMouseDown}
                onTouchStart={this.handleMouseDown}
                onTouchMove={this.handleMouseMove}
                onTouchEnd={this.handleMouseUp}
                className={WrapperClass}
                ref={this.boardRef}
            >
                <div className="piece-boxes-container">
                    <div className="pieces-box white-b">
                        <UnusedTowers color={PieceColor.w} number={white} />
                    </div>
                    <div className="pieces-box black-b">
                        <UnusedTowers color={PieceColor.b} number={black} />
                    </div>
                </div>
                {Towers}
                <Board {...boardProps} />
            </section>
        )
    }
}

export const GameBoardComponent =  gameAnalyzeConnector(GameBoard)

export default GameBoardComponent
