import React from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {
    CellsMap,
    IAnalysisBoard,
    IBoardProps,
    IBoardToDraw,
    IBoardToGame,
    IMMRResult,
    IRef,
    ITowerPosition,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerTouched,
    TowerType,
} from '../../store/app-interface'
import {clearHistory, makeMove} from '../../store/game/actions'
import {makeNewMove, updateAnalysisState} from '../../store/gameAnalysis/actions'
import {
    checkMoveTargetCell,
    copyMap,
    copyObj,
    possibleOutOfMandatory,
} from '../../game-engine/gameplay-helper-fuctions'

import {
    createAnalysisBoard,
    createEmptyBoard,
    createEmptyBoardForCustomPosition,
    newOnBoardTower,
} from '../../game-engine/prestart-help-function-constants'
// import {AnimationDuration} from '../../constants/gameConstants'
import tur from '../../game-engine/update-towers-functions'
import mmr from '../../game-engine/mandatory-move-resolver'
import TowerComponent from '../../game-components/tower/CheckerTower'
import {Board} from '../../game-components/board/Board'
import {IRootState} from '../../store/rootState&Reducer'
import {updateBoardState} from '../../store/board/actions'
import bms from '../../game-engine/best-move-seeker'
import {reverseBoard} from '../../store/boardOptions/actions'
import {finishGameSetup} from '../../store/gameOptions/actions'
import {ISeekerProps} from "../../game-engine/engine-interfaces";

const UnusedTowers = (props: {color: PieceColor, towers: TowersMap}) => {
    const {color, towers} = props
    const subStr = color === PieceColor.w ? 'oW' : 'oB'
    const number = [...towers.keys()].filter((key: string) => key.includes(subStr)).length
    return <span className={`unused-${color}`}>{number}</span>
}

const mapState = (state: IRootState) => ({
    gameOptions: state.gameOptions,
    windowSize: state.app.windowSize,
    analysis: state.analyze,
    board: state.board,
    boardOptions: state.boardOptions,
})

const mapDispatch = {
    updateAnalysisState,
    makeMove,
    makeNewMove,
    updateBoardState,
    reverseBoard,
    clearHistory,
    finishGameSetup
}

const gameAnalyzeConnector = connect(mapState, mapDispatch)
type GameAnalyzeProps = ConnectedProps<typeof gameAnalyzeConnector>

type AnalysisBoardState = IAnalysisBoard & {[key: string]: any}

export class GameBoard extends React.Component<GameAnalyzeProps, AnalysisBoardState> {
    private boardRef: IRef<HTMLDivElement> = React.createRef()
    mmr = mmr
    tur = tur
    bms = bms
    constructor(props: GameAnalyzeProps) {
        super(props);
        console.log(props)
        const Props = {GV: props.gameOptions.gameVariant, size: props.boardOptions.boardSize}
        this.mmr.setProps(Props)
        this.tur.setProps(Props)
        this.tur.setCalBack(this.props.updateBoardState)
    }

    componentDidMount() {
        if (!window) return
        this.props.finishGameSetup(false)
        this.createBoardToAnalysis()
        const {analysis: {depth}} = this.props
        setTimeout(() => {
            const {board, boardOptions} = this.props
            console.log(this.props)
            this.tur.updateCellsPosition(board, boardOptions, this.boardRef.current!);
        },0)
        const gameResult = this.props.analysis.gameResult
        const props: ISeekerProps = {
            pieceOrder: PieceColor.w,
            position: this.props.board.currentPosition,
            game: false,
            maxDepth: depth,
            lastMove: gameResult?.movesHistory.slice(-1)[0] || '',
            evaluationStarted: true
        }
        bms.setState(props)
    }

    componentDidUpdate(prevProps: GameAnalyzeProps) {
        const {
            updateBoardState,
            gameOptions: {gameVariant},
            boardOptions: {reversedBoard},
            analysis: {analyzeLastGame, settingPosition, pieceOrder, startPosition, lastMove},
            boardOptions,
            board: {currentPosition, cellSize, cellsMap},
            board
        } = this.props

        console.log(this.props)
        const mandatoryMoves = this.mmr.lookForMandatoryMoves(pieceOrder, currentPosition)
        if ((analyzeLastGame && !prevProps.analysis.analyzeLastGame)
            || (settingPosition && !prevProps.analysis.settingPosition)
            || (startPosition && !prevProps.analysis.startPosition)) {
            this.tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
        if (!settingPosition && prevProps.analysis.settingPosition) {
            if (JSON.stringify(prevProps.board.currentPosition) !== JSON.stringify(currentPosition)) {
                let towers = this.tur.updateTowersToBoard(currentPosition)
                towers = this.tur.updateTowersPosition(cellSize, towers, cellsMap, reversedBoard)
                updateBoardState({
                    currentPosition, towers, mandatoryMoves, mandatoryMoveStep: 0
                })
            } else {
                const mandatoryMoves = this.mmr.lookForMandatoryMoves(pieceOrder, currentPosition)
                if (mandatoryMoves.length) {
                    updateBoardState({mandatoryMoveStep: 0, mandatoryMoves})
                }
            }
        }
        if (gameVariant !== prevProps.gameOptions.gameVariant) {
            const {updateBoardState, boardOptions} = this.props
            const board = createEmptyBoardForCustomPosition({boardOptions}) as IBoardToDraw
            updateBoardState(board)
            this.tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
        if ((!settingPosition && pieceOrder !== prevProps.analysis.pieceOrder)
            || lastMove.move !== prevProps.analysis.lastMove.move
            || boardOptions.reversedBoard !== prevProps.boardOptions.reversedBoard) {
            const reversed = this.props.boardOptions.reversedBoard
            const towers = this.tur.updateTowersPosition(cellSize!, board.towers, cellsMap!, reversed)
            updateBoardState({
                currentPosition, mandatoryMoves, mandatoryMoveStep: 0, towers
            })
        }
    }

    componentWillUnmount() {
        const {updateAnalysisState, boardOptions, updateBoardState} = this.props
        updateAnalysisState({
            analyzeLastGame: false,
            movesMainLine: [],
            settingPosition: true,
            movesCurrentLine: [],

        })
        const currentPosition = createEmptyBoard(boardOptions.boardSize)
        const positionsTree = new Map()
        positionsTree.set('sp', currentPosition)
        updateBoardState({
            currentPosition,
            positionsTree
        })
    }

    createBoardToAnalysis = () => {
        const {
            analysis: {analyzeLastGame, gameResult: {movesHistory}, settingPosition},
            boardOptions,
            board: {positionsTree},
            updateBoardState,
            clearHistory,
        } = this.props
        let payload
        if (settingPosition && boardOptions.reversedBoard) {
            reverseBoard(false)
        }
        if (analyzeLastGame && movesHistory && positionsTree?.size) {
            // console.log(currentPosition)
            payload = createAnalysisBoard({boardOptions})
        } else {
            console.log('clear history')
            clearHistory('sdsf' as unknown as null)
            payload = createEmptyBoardForCustomPosition({boardOptions})
        }
        // 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
        updateBoardState({...payload })
    }

    updateCurrentPositionWhileSettingBoard = (tower: TowerConstructor) => {
        console.log('update current position')
        const {board, updateBoardState} = this.props
        const {wPiecesQuantity, bPiecesQuantity, currentColor, currentType, onBoardPosition} = tower
        const key = onBoardPosition
        const onBoardTower = {...newOnBoardTower(currentColor, currentType), wPiecesQuantity, bPiecesQuantity, key}
        const currentPosition = copyObj(board.currentPosition)
        currentPosition[key].tower = onBoardTower
        updateBoardState({currentPosition})
    }

    handleUpToMove = (cellKey: string) => {
        const {
            board: {currentPosition, towerTouched, mandatoryMoves, mandatoryMoveStep},
            makeNewMove,
            updateBoardState,
            gameOptions: {gameVariant},
            board,
        } = this.props
        let { mouseDown} = this.props.board
        const from = towerTouched!.key
        let move = `${from}-${cellKey}`, towers: TowersMap, nCP: IBoardToGame = currentPosition
        let _towerTouched = null as unknown as TowerTouched, _mandatoryMoves: IMMRResult[] = [], _mandatoryMoveStep = 0
        if (mandatoryMoves?.length) {
            move = `${from}:${cellKey}`
            const fitMoves = mandatoryMoves!.filter((m: IMMRResult) => m.move.includes(move))
            if (fitMoves[0].move.split(':').length === mandatoryMoveStep as number + 2) {
                const takenPieces = fitMoves[0].takenPieces!
                const tP = gameVariant === 'towers' ? [takenPieces![mandatoryMoveStep]] : takenPieces
                const moveToSave = fitMoves[0]
                towers = this.tur.updateTowersOnMandatoryMoveStep(from, cellKey, board, tP, true)
                makeNewMove({moveToSave})
                nCP = fitMoves[0].position
                mouseDown = false
            } else {
                const tP = fitMoves[0].takenPieces![mandatoryMoveStep]
                _mandatoryMoves = fitMoves
                _mandatoryMoveStep = mandatoryMoveStep! + 1
                towers = this.tur.updateTowersOnMandatoryMoveStep(from, cellKey, board, [tP])
            }
        } else {
            nCP = this.mmr.makeFreeMove(from, cellKey, currentPosition)
            makeNewMove({moveToSave: {move, position: nCP}})
            towers = this.tur.updateTowersAfterMoveAnimation(from, cellKey, board, false, true)
            mouseDown = false
        }
        updateBoardState({
            currentPosition: nCP,
            mouseDown,
            towers,
            mandatoryMoves: _mandatoryMoves,
            mandatoryMoveStep: _mandatoryMoveStep,
            towerTouched: _towerTouched,
        })
    }

    handleMouseUp = (event: any) => {
        const {
            analysis: {settingPosition},
            boardOptions: {reversedBoard},
            board: {towerTouched, moveDone, cellsMap, cellSize, towers},
            board,
        } = this.props

        if (!towerTouched || moveDone) {
            return
        }
        const {clientX, clientY} = event.type === 'touchend' ? event.changedTouches['0'] : event
        let cellsToCheck =  towerTouched.possibleMoves as CellsMap
        if (settingPosition) {
            cellsToCheck = cellsMap
        }
        const cellKey = checkMoveTargetCell({x: clientX, y: clientY}, cellsToCheck, cellSize, this.boardRef)
        if (!cellKey) {
            console.log('out of position')
            this.tur.cancelTowerTransition({...board, reversed: reversedBoard})
        } else {
            if (!settingPosition) {
                this.handleUpToMove(cellKey)
            } else if (!towers.get(cellKey)) {
                this.handleSettingPieces(cellKey)
            }
        }
    }

    mergeTowers = (t1: TowerConstructor, t2: TowerConstructor): TowersMap => {
        const {towers} = this.props.board
        const tower = copyObj(t1) as TowerConstructor
        tower.wPiecesQuantity = t1.wPiecesQuantity! + t2.wPiecesQuantity!
        tower.bPiecesQuantity = t1.bPiecesQuantity! + t2.bPiecesQuantity!
        if (t1.currentColor !== t2.currentColor) {
            tower!.currentColor = t2.currentColor
        }
        towers!.delete(t2.onBoardPosition)
        towers!.set(tower.onBoardPosition, tower as TowerConstructor)
        this.updateCurrentPositionWhileSettingBoard(tower)
        return towers!
    }

    setTowerOnBoard = (cellKey: string, reversed = false):TowersMap => {
        const { towers, cellsMap, cellSize} = this.props.board
        const towerTouched = this.props.board.towerTouched
        const tower = towers!.get(towerTouched!.key)!
        tower.positionInDOM = this.tur.calcTowerPosition(cellKey, cellsMap!, cellSize!, reversed)
        tower.onBoardPosition = cellKey
        const _towers = copyMap(towers!)
        _towers!.set(cellKey, tower)
        _towers!.delete(towerTouched!.key)
        this.updateCurrentPositionWhileSettingBoard(tower)
        return _towers
    }

    handleSettingTowers = (tower: TowerConstructor) => {
        const {
            analysis: {removePiece},
            updateBoardState,
            boardOptions: {reversedBoard},
            board: {towerTouched, towers},
            board,
        } = this.props
        const mergingTower = towers!.get(towerTouched!.key)
        const case1 = tower.bPiecesQuantity > 0
            && tower.wPiecesQuantity > 0
            && mergingTower!.wPiecesQuantity > 0
            && mergingTower!.bPiecesQuantity > 0
        const case2 = tower.currentColor === mergingTower!.currentColor
            && mergingTower!.wPiecesQuantity > 0
            && mergingTower!.bPiecesQuantity > 0
        const case3 = tower.currentColor !== mergingTower!.currentColor
            &&tower.bPiecesQuantity > 0
            && tower.wPiecesQuantity > 0
        if (!case1 && !case2 && !case3 && tower.onBoardPosition !== mergingTower?.onBoardPosition) {
            console.log(tower, mergingTower)
            const _towers = this.mergeTowers(tower, mergingTower!)
            let TT = null as unknown as TowerTouched
            if(!removePiece) {
                const {key} = towerTouched!
                const index = parseInt(key.slice(4))
                if (index > 0) {
                    const nextKey = `${key.slice(0, 4)}${index - 1}`
                    TT = {...towerTouched, key: nextKey} as TowerTouched
                    updateBoardState({towers: _towers, towerTouched: TT})
                } else {
                    updateBoardState({towers: _towers, mouseDown: false, towerTouched: TT})
                }
            }
        } else {
            this.tur.cancelTowerTransition({...board, reversed: reversedBoard})
        }
    }

    handleSettingPieces = (cellKey: string) => {
        const {
            updateBoardState,
            board: {towerTouched, towers},
            board,
        } = this.props
        let tower = towers!.get(cellKey)
        const reversed = this.props.boardOptions.reversedBoard
        if (!tower) {
            const _towers = this.setTowerOnBoard(cellKey, reversed)
            const currentPosition = copyObj(board.currentPosition)
            const {currentColor, currentType} = _towers.get(cellKey) as TowerConstructor
            currentPosition[cellKey].tower = newOnBoardTower(currentColor, currentType)
            let TT = null as unknown as TowerTouched
            const {key} = towerTouched!
            const index = parseInt(key.slice(4))
            if (index > 0) {
                const nextKey = `${key.slice(0, 4)}${index - 1}`
                TT = {...towerTouched, key: nextKey} as TowerTouched
                updateBoardState({towers: _towers, currentPosition, towerTouched: TT})
            } else {
                updateBoardState({towers: _towers, mouseDown: false, currentPosition, towerTouched: TT})
            }
        } else if (this.props.gameOptions.gameVariant === 'towers') {
            this.handleSettingTowers(tower)
        } else {
            this.tur.cancelTowerTransition({...board, reversed})
        }
    }

    handleRemoveTower = (tower: TowerConstructor) => {
        const towers = copyMap(this.props.board.towers)
        const {boardOptions: {reversedBoard}, updateBoardState, board: {cellSize}, board} = this.props
        const {onBoardPosition, wPiecesQuantity, bPiecesQuantity} = tower
        const towersKeysArray = [...this.props.board.towers.keys()]
        const whiteUnusedQuantity = towersKeysArray.filter((v: string) => v.includes('oW')).length
        const blackUnusedQuantity = towersKeysArray.filter((v: string) => v.includes('oB')).length
        const currentPosition = copyObj(board.currentPosition)
        currentPosition[onBoardPosition].tower = null
        updateBoardState({currentPosition})
        towers.delete(onBoardPosition)
        for (let i = 0; i < wPiecesQuantity; i++) {
            const key = `oW w${whiteUnusedQuantity + i}`
            const positionInDOM = this.tur.calcPositionOutboardTowers(key, cellSize, reversedBoard) as ITowerPosition
            const wTower = new TowerConstructor({
                currentColor: PieceColor.w,
                positionInDOM,
                onBoardPosition: key
            })
            console.log(positionInDOM, key, reversedBoard, wTower)
            towers.set(key, wTower)
        }
        for (let i = 0; i < bPiecesQuantity; i++) {
            const key = `oB b${blackUnusedQuantity + i}`
            const positionInDOM = this.tur.calcPositionOutboardTowers(key, cellSize, reversedBoard) as ITowerPosition

            const bTower = new TowerConstructor({
                currentColor: PieceColor.b,
                positionInDOM,
                onBoardPosition: key
            })
            console.log(positionInDOM, key, reversedBoard, bTower)
            towers.set(key, bTower)
        }
        updateBoardState({towers})
    }

    handleRemovePiece = (key: string) => {
        const {board: {cellSize}, board, boardOptions: {reversedBoard}, updateBoardState} = this.props
        const currentPosition = copyObj(board.currentPosition)
        if (!currentPosition[key]) {
            if (this.props.board.towerTouched) {
                this.tur.cancelTowerTransition({...board, reversed: reversedBoard})
            }
            return console.error(key, currentPosition)
        }
        currentPosition[key].tower = null
        const towers = copyMap(this.props.board.towers!)
        const tower = towers.get(key)! as TowerConstructor
        if (this.props.gameOptions.gameVariant === 'towers' && (tower.wPiecesQuantity + tower.bPiecesQuantity) > 1) {
            return this.handleRemoveTower(tower)
        }
        let outboardKey = tower.currentColor === PieceColor.w ? `oW w` : 'oB b'
        const outboardPicesNumber = [...towers.values()].filter(t => t.onBoardPosition.includes(outboardKey)).length
        outboardKey = `${outboardKey}${outboardPicesNumber}`
        tower.onBoardPosition = outboardKey
        tower.currentType = TowerType.m
        tower.positionInDOM = this.tur.calcPositionOutboardTowers(outboardKey, cellSize, reversedBoard)
        towers.set(outboardKey, tower)
        towers.delete(key)
        // console.log(towers, tower, key)
        updateBoardState({towers, currentPosition, mouseDown: false, towerTouched: null as unknown as TowerTouched})
    }

    handleMouseMove = (event: any) => {
        const {board: {towerTouched, moveDone, mouseDown}, analysis: {settingPosition}, updateBoardState} = this.props
        if (!towerTouched || moveDone || (!mouseDown && !settingPosition)) {
            return
        }
        const {key, startCursorPosition: SCP, startTowerPosition: STP} = towerTouched;
        const {clientX, clientY} = event.type === 'touchmove' ? event.changedTouches['0'] : event
        const towers = copyMap(this.props.board.towers!)
        const tower = copyObj(towers.get(key))! as TowerConstructor
        const newPosition = {x: STP.x + clientX - SCP.x, y: STP.y + clientY - SCP.y}
        const pos = tower.positionInDOM!
        tower.positionInDOM = newPosition
        const deltaX = Math.abs(pos.x - newPosition.x)
        const deltaY = Math.abs(pos.y - newPosition.y)
        if ( deltaX + deltaY >= 6) {
            towers.set(key, tower)
            updateBoardState({towers})
        }
    }

    handleSettingPositionMouseDown = (props: {[key: string]: any}) => {
        const {analysis: {removePiece}, board, board: {cellSize, cellsMap, towers}, updateBoardState} = this.props
        const {target, clientX, clientY} = props
        const reversed = this.props.boardOptions.reversedBoard
        const towerKey = (target as HTMLDivElement).getAttribute('data-indexes') as string
        if (!towerKey) {
            this.tur.cancelTowerTransition({...board, reversed})
        }
        console.log(target, removePiece)
        if (removePiece) {
            return this.handleRemovePiece(towerKey)
        } else if (!removePiece && this.props.board.towerTouched) {
            const cellKey = checkMoveTargetCell({x: clientX, y: clientY}, cellsMap, cellSize, this.boardRef)
            if (cellKey) {
                return this.handleSettingPieces(cellKey)
            }
            return
        } else {
            const tower = towers!.get(towerKey)!
            const towerTouched: TowerTouched = {
                key: towerKey,
                possibleMoves: new Map(),
                startCursorPosition: {x: clientX, y: clientY},
                startTowerPosition: tower.positionInDOM!,
                towerColor: tower.currentColor,
                towerType: tower.currentType as TowerType
            }
            updateBoardState({towerTouched, mouseDown: true})
        }
    }

    handleMouseDown = (event: any) => {
        console.log(event)
        const {
            analysis: {pieceOrder, settingPosition},
            board: {mandatoryMoves, cellsMap, towers, currentPosition},
            updateBoardState
        } = this.props
        const {target, clientX, clientY} = event.type === 'touchstart' ? event.changedTouches['0'] : event
        const classList = (target as HTMLDivElement).classList
        if (!classList.contains('checker-tower')) return
        if (settingPosition) return this.handleSettingPositionMouseDown({target, clientX, clientY})
        if (!classList.contains(pieceOrder)) return
        const towerKey = (target as HTMLDivElement).getAttribute('data-indexes') as string
        const tower = towers!.get(towerKey)!
        let possibleMoves: CellsMap
        if (mandatoryMoves?.length) {
            possibleMoves = possibleOutOfMandatory(this.props.board, towerKey)
        } else {
            possibleMoves = tower.currentType === TowerType.m
                ? this.mmr.manTowerFreeMoves(tower, currentPosition!, cellsMap!)
                : this.mmr.kingTowerFreeMoves(towerKey, currentPosition!, cellsMap!)
        }
        if (!possibleMoves.size) {
            // sound
            return
        }
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

    contextMenuHandler = (e: React.MouseEvent) => {
        const {analysis: {settingPosition}, updateBoardState} = this.props
        e.preventDefault()
        if (!settingPosition) { return }
        const target = e.target as HTMLElement
        if (!target.classList.contains('checker-tower')) { return }
        const key = target.getAttribute('data-indexes')!
        const tower = copyObj(this.props.board.towers!.get(key) as TowerConstructor)! as TowerConstructor
        tower.currentType = tower.currentType === TowerType.m ? TowerType.k : TowerType.m
        const towers = copyMap(this.props.board.towers!)
        towers!.set(key, tower)
        updateBoardState({towers})
    }

    render() {
        const {boardOptions, board: {towerTouched}, board} = this.props
        const {towers, mandatoryMoves, mandatoryMoveStep, lastMoveSquares} = board
        const boardProps = {boardOptions, possibleMoves: towerTouched?.possibleMoves, lastMove: lastMoveSquares}  as IBoardProps
        const {boardSize, boardTheme, reversedBoard} = boardOptions
        const WrapperClass = `board__wrapper ${boardTheme} h${boardSize}v${boardSize}${reversedBoard ? ' reversed' : ''}`;
        const mandatoryTowers = (mandatoryMoves || []).map(m => m.move.split(':')[mandatoryMoveStep || 0])
        const Towers = Array.from(towers!.values()).map((tower: TowerConstructor, i: number) => {
            const mt = mandatoryTowers.includes(tower.onBoardPosition)
            return <TowerComponent {...tower} key={tower.onBoardPosition} mandatory={mt} />
        })
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
                        <UnusedTowers color={PieceColor.w} towers={towers!} />
                    </div>
                    <div className="pieces-box black-b">
                        <UnusedTowers color={PieceColor.b} towers={towers!} />
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
