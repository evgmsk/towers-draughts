import React from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {
    CellsMap,
    IAnalysisBoard,
    IBoardProps,
    IBoardToDraw,
    IBoardToGame,
    IMMRResult, IPositionsTree,
    IRef,
    ITowerPosition,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerTouched,
    TowerType,
} from '../../store/models'
import {clearHistory, makeMove} from '../../store/game/actions'
import {makeNewMove, setBestMoveLine, updateAnalysisState} from '../../store/gameAnalysis/actions'
import {
    checkMoveTargetCell,
    copyObj,
    possibleOutOfMandatory,
} from '../../game-engine/gameplay-helper-functions'

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
import { ISeekerProps} from "../../game-engine/engine-interfaces";
import {IGameBoard} from "../../store/models";

const UnusedTowers = (props: {color: PieceColor, towers: TowersMap}) => {
    const {color, towers} = props
    const subStr = color === PieceColor.w ? 'oW' : 'oB'
    const number = Object.keys(towers).filter((key: string) => key.includes(subStr)).length
    return <span className={`unused-${color}`}>{number}</span>
}

const mapState = (state: IRootState) => ({
    gameOptions: state.gameOptions,
    windowSize: state.app.windowSize,
    analysis: state.analyze,
    board: state.board,
    boardOptions: state.boardOptions,
    bestMoveLine: state.analyze.bestMoveLine,
})

const mapDispatch = {
    updateAnalysisState,
    makeMove,
    makeNewMove,
    updateBoardState,
    reverseBoard,
    clearHistory,
    finishGameSetup,
    setBestMoveLine
}

const gameAnalyzeConnector = connect(mapState, mapDispatch)
type GameAnalyzeProps = ConnectedProps<typeof gameAnalyzeConnector>

type AnalysisBoardState = IAnalysisBoard & {[key: string]: any}

export class GameBoard extends React.Component<GameAnalyzeProps, AnalysisBoardState> {
    private boardRef: IRef<HTMLDivElement> = React.createRef()

    componentDidMount() {
        if (!window) return
        const {
            analysis: {pieceOrder, analyzeLastGame, depth, movesMainLine},
            finishGameSetup,
            board: {currentPosition: position}
        } = this.props
        console.warn('start analyze with props', this.props)
        tur.setCallBack(this.props.updateBoardState)
        finishGameSetup(false)
        this.createBoardToAnalysis()
        setTimeout(() => {
            const {board, boardOptions} = this.props
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!);
        },0)
        bms.setBestLineCB(this.bestLineCB)
        if (analyzeLastGame) {
            this.makePremoveAction()
            const props: ISeekerProps = {
                game: false,
                maxDepth: depth,
            }
            bms.setState(props)
            bms.updateAfterRivalMove({history: movesMainLine!, cP: position, pieceOrder})
        }

    }

    componentDidUpdate(prevProps: GameAnalyzeProps) {
        const {
            gameOptions: {gameVariant},
            boardOptions: {reversedBoard},
            analysis: {analyzeLastGame, settingPosition, pieceOrder, startPosition, lastMove},
            boardOptions,
            board: {currentPosition, cellSize, cellsMap},
            board,
            windowSize
        } = this.props
        // console.log('props', this.props)
        if ((analyzeLastGame && !prevProps.analysis.analyzeLastGame)
            || (startPosition && !prevProps.analysis.startPosition)) {
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
            this.makePremoveAction()
        }
        if (!settingPosition && prevProps.analysis.settingPosition) {
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
            if (JSON.stringify(prevProps.board.currentPosition) !== JSON.stringify(currentPosition)) {
                let towers = tur.updateTowersToBoard(currentPosition)
                towers = tur.updateTowersPosition(cellSize, towers, cellsMap, reversedBoard)
                this.makePremoveAction(towers)
            } else {
                this.makePremoveAction()
            }
        }
        if (gameVariant !== prevProps.gameOptions.gameVariant) {
            const {updateBoardState, boardOptions} = this.props
            const board = createEmptyBoardForCustomPosition({boardOptions}) as IBoardToDraw
            updateBoardState(board)
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
        if ((!settingPosition && pieceOrder !== prevProps.analysis.pieceOrder)
            || lastMove.move !== prevProps.analysis.lastMove.move
            || boardOptions.reversedBoard !== prevProps.boardOptions.reversedBoard) {
            const reversed = this.props.boardOptions.reversedBoard
            const towers = tur.updateTowersPosition(cellSize!, board.towers, cellsMap!, reversed)
            this.makePremoveAction(towers)
        }
        if (JSON.stringify(windowSize) !== JSON.stringify(prevProps.windowSize)) {
            tur.updateCellsPosition(board, boardOptions, this.boardRef.current!)
        }
    }

    bestLineCB = (line: {move: string, value: number}[]) => {
        console.warn('line', line)
        this.props.setBestMoveLine(line)
    }

    makePremoveAction = (towers?: TowersMap) => {
        const {
            analysis: {pieceOrder},
            updateBoardState,
            board: {currentPosition},
        } = this.props
        const mandatoryMoves = mmr.lookForMandatoryMoves(pieceOrder, currentPosition)
        const propsToUpdate: Partial<IGameBoard> = {
            mandatoryMoveStep: 0,
            mouseDown: false,
            moveDone: false,
        }
        if (mandatoryMoves.length) {
            propsToUpdate.mandatoryMoves = mandatoryMoves!
        }
        if (towers) {
            propsToUpdate.towers = towers!
        }
        // console.warn('premove', propsToUpdate)
        updateBoardState(propsToUpdate)
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
        const positionsTree = {} as IPositionsTree
        positionsTree.sp = currentPosition
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
        if (analyzeLastGame && movesHistory && Object.keys(positionsTree || {}).length) {
            // console.warn('set current endPosition', this.props.analysis)
            payload = createAnalysisBoard({boardOptions})
        } else {
            // console.log('clear history')
            clearHistory()
            payload = createEmptyBoardForCustomPosition({boardOptions})
        }
        // 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
        updateBoardState({...payload })
    }

    updateCurrentPositionWhileSettingBoard = (tower: TowerConstructor) => {
        const {board, updateBoardState} = this.props
        const {wPiecesQuantity, bPiecesQuantity, currentColor, currentType, onBoardPosition} = tower
        const key = onBoardPosition
        const onBoardTower = {...newOnBoardTower(currentColor, currentType), wPiecesQuantity, bPiecesQuantity, key}
        const currentPosition = copyObj(board.currentPosition)
        // console.log('update current endPosition', tower, board, currentPosition)
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
                towers = tur.updateTowersOnMandatoryMoveStep(from, cellKey, board, tP, true)
                makeNewMove({moveToSave})
                nCP = fitMoves[0].position
                mouseDown = false
            } else {
                const tP = fitMoves[0].takenPieces![mandatoryMoveStep]
                _mandatoryMoves = fitMoves
                _mandatoryMoveStep = mandatoryMoveStep! + 1
                towers = tur.updateTowersOnMandatoryMoveStep(from, cellKey, board, [tP])
            }
        } else {
            nCP = mmr.makeFreeMove(from, cellKey, currentPosition)
            makeNewMove({moveToSave: {move, position: nCP}})
            towers = tur.updateTowersAfterMoveAnimation(from, cellKey, board, false, true)
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
        const cellsToCheck =  !settingPosition
            ? towerTouched.possibleMoves as CellsMap
            : cellsMap
        const cellKey = checkMoveTargetCell({x: clientX, y: clientY}, cellsToCheck, cellSize, this.boardRef)
        if (!cellKey) {
            // console.log('out of endPosition')
            return tur.cancelTowerTransition({...board, reversed: reversedBoard})
        }
        if (towerTouched.key )
        if (!settingPosition) {
            this.handleUpToMove(cellKey)
        } else if (!towers[cellKey]) {
            this.handleSettingPieces(cellKey)
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
        delete towers[t2.onBoardPosition]
        towers![tower.onBoardPosition] = tower as TowerConstructor
        this.updateCurrentPositionWhileSettingBoard(tower)
        return towers!
    }

    setTowerOnBoard = (cellKey: string, reversed = false):TowersMap => {
        const { towers, cellsMap, cellSize} = this.props.board
        const towerTouched = this.props.board.towerTouched
        const tower = towers![towerTouched!.key]!
        tower.positionInDOM = tur.calcTowerPosition(cellKey, cellsMap!, cellSize!, reversed)
        tower.onBoardPosition = cellKey
        const _towers = copyObj(towers!) as TowersMap
        _towers![cellKey] = tower
        delete _towers![towerTouched!.key]
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
        const mergingTower = towers![towerTouched!.key]
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
            console.log('merging tower', tower, mergingTower)
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
            tur.cancelTowerTransition({...board, reversed: reversedBoard})
        }
    }

    handleSettingPieces = (cellKey: string) => {
        const {
            updateBoardState,
            board: {towerTouched, towers},
            board,
            boardOptions: {reversedBoard}
        } = this.props
        let tower = towers![cellKey]
        const reversed = reversedBoard
        if (!tower) {
            const _towers = this.setTowerOnBoard(cellKey, reversed)
            const currentPosition = copyObj(board.currentPosition)
            const {currentColor, currentType} = _towers[cellKey] as TowerConstructor
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
            tur.cancelTowerTransition({...board, reversed})
        }
    }

    handleRemoveTower = (tower: TowerConstructor) => {
        const towers = copyObj(this.props.board.towers) as TowersMap
        const {boardOptions: {reversedBoard}, updateBoardState, board: {cellSize}, board} = this.props
        const {onBoardPosition, wPiecesQuantity, bPiecesQuantity} = tower
        const towersKeysArray = Object.keys(this.props.board.towers)
        const whiteUnusedQuantity = towersKeysArray.filter((v: string) => v.includes('oW')).length
        const blackUnusedQuantity = towersKeysArray.filter((v: string) => v.includes('oB')).length
        const currentPosition = copyObj(board.currentPosition)
        currentPosition[onBoardPosition].tower = null
        delete towers[onBoardPosition]
        for (let i = 0; i < wPiecesQuantity; i++) {
            const key = `oW w${whiteUnusedQuantity + i}`
            const positionInDOM = tur.calcPositionOutboardTowers(key, cellSize, reversedBoard) as ITowerPosition
            const wTower = new TowerConstructor({
                currentColor: PieceColor.w,
                positionInDOM,
                onBoardPosition: key
            })
            towers[key] = wTower
        }
        for (let i = 0; i < bPiecesQuantity; i++) {
            const key = `oB b${blackUnusedQuantity + i}`
            const positionInDOM = tur.calcPositionOutboardTowers(key, cellSize, reversedBoard) as ITowerPosition
            const bTower = new TowerConstructor({
                currentColor: PieceColor.b,
                positionInDOM,
                onBoardPosition: key
            })
            towers[key] = bTower
        }
        updateBoardState({towers,currentPosition})
    }

    handleRemovePiece = (key: string) => {
        const {
            board: {cellSize},
            board,
            boardOptions: {reversedBoard},
            gameOptions: {gameVariant},
            updateBoardState
        } = this.props
        const currentPosition = copyObj(board.currentPosition)
        if (!currentPosition[key]) {
            return tur.cancelTowerTransition({...board, reversed: reversedBoard})
        }
        currentPosition[key].tower = null
        const towers = copyObj(board.towers!) as TowersMap
        const tower = towers[key]! as TowerConstructor
        if (gameVariant === 'towers' && (tower.wPiecesQuantity + tower.bPiecesQuantity) > 1) {
            return this.handleRemoveTower(tower)
        }
        let outboardKey = tower.currentColor === PieceColor.w ? `oW w` : 'oB b'
        const outboardPiecesNumber = Object.keys(towers)
            .filter(k => towers[k].onBoardPosition.includes(outboardKey)).length
        outboardKey = `${outboardKey}${outboardPiecesNumber}`
        tower.onBoardPosition = outboardKey
        tower.currentType = TowerType.m
        tower.positionInDOM = tur.calcPositionOutboardTowers(outboardKey, cellSize, reversedBoard)
        towers[outboardKey] = tower
        delete towers[key]
        updateBoardState({towers, currentPosition, mouseDown: false, towerTouched: null as unknown as TowerTouched})
    }

    handleMouseMove = (event: any) => {
        const {board: {towerTouched, moveDone, mouseDown}, analysis: {settingPosition}, updateBoardState} = this.props
        if (!towerTouched || moveDone || (!mouseDown && !settingPosition)) {
            return
        }
        const {key, startCursorPosition: SCP, startTowerPosition: STP} = towerTouched;
        const {clientX, clientY} = event.type === 'touchmove' ? event.changedTouches['0'] : event
        const towers = copyObj(this.props.board.towers!) as TowersMap
        const tower = copyObj(towers[key])! as TowerConstructor
        const newPosition = {x: STP.x + clientX - SCP.x, y: STP.y + clientY - SCP.y}
        const pos = tower.positionInDOM!
        tower.positionInDOM = newPosition
        const deltaX = Math.abs(pos.x - newPosition.x)
        const deltaY = Math.abs(pos.y - newPosition.y)
        if ( deltaX + deltaY >= 6) {
            towers[key] = tower
            updateBoardState({towers})
        }
    }

    handleTowerRelocation(from: string, to: string) {
        const {board, boardOptions: {reversedBoard}, updateBoardState} = this.props
        const currentPosition = copyObj(board.currentPosition)
        const towers = copyObj(board.towers)
        const tower = currentPosition[from]
        if (!tower) {
            return tur.cancelTowerTransition({...board, reversed: reversedBoard})
        }
        currentPosition[from].tower = null
        currentPosition[to].tower = tower
        towers[to] = tower
        delete towers[from]
        updateBoardState({currentPosition, towers, towerTouched: null as unknown as TowerTouched})
    }

    handleSettingPositionMouseDown = (props: {[key: string]: any}) => {
        const {
            board,
            board: {cellSize, cellsMap, towers, towerTouched, currentPosition},
            boardOptions: { reversedBoard }
        } = this.props
        const {target, clientX, clientY} = props
        const targetKey = checkMoveTargetCell({x: clientX, y: clientY}, cellsMap, cellSize, this.boardRef)
        if (!targetKey  || targetKey === towerTouched?.key) {
            return tur.cancelTowerTransition({...board, reversed: reversedBoard})
        }
        // if (!currentPosition[targetKey]?.tower && towerTouched!.key.length < 4) {
        //     return this.handleTowerRelocation(towerTouched!.key, targetKey)
        // }
        // if (targetKey !== towerTouched?.key && currentPosition[targetKey].tower) {
        //
        // }
    }

    handleMouseDown = (event: any) => {
        const {
            analysis: {settingPosition, removePiece},
            board: {towerTouched},
        } = this.props
        const {target, clientX, clientY} = event.type === 'touchstart' ? event.changedTouches['0'] : event
        console.warn('down', towerTouched, removePiece)
        if (!towerTouched && !removePiece) {
            return this.setTouchedTower({target, clientX, clientY})
        }
        if (removePiece) {
            const towerKey = (target as HTMLDivElement).getAttribute('data-indexes') as string
            return towerKey && towerKey.length < 4 ? this.handleRemovePiece(towerKey): null
        }
        if (settingPosition) {
            return this.handleSettingPositionMouseDown({target, clientX, clientY})
        }
    }

    setTouchedTower(props: {[key: string]: any}) {

        const {target, clientX, clientY} = props
        const {
            analysis: {pieceOrder, settingPosition},
            board: {mandatoryMoves, cellsMap, currentPosition, towers},
            updateBoardState
        } = this.props
        const classList = (target as HTMLDivElement).classList
        if (!classList.contains('checker-tower')) { return }
        if (!settingPosition && !classList.contains(pieceOrder)) { return }
        const key = (target as HTMLDivElement).getAttribute('data-indexes') as string
        const tower = towers![key]!
        let possibleMoves: CellsMap = cellsMap
        console.warn('touched', props, settingPosition, key)
        if (mandatoryMoves?.length) {
            possibleMoves = possibleOutOfMandatory(this.props.board, key)
        } else if (!settingPosition) {
            possibleMoves = tower.currentType === TowerType.m
                ? mmr.manTowerFreeMoves(tower, currentPosition!, cellsMap!)
                : mmr.kingTowerFreeMoves(key, currentPosition!, cellsMap!)
        }
        if (!Object.keys(possibleMoves).length) {
            // sound
            return
        }
        const towerTouched: TowerTouched = {
            key,
            possibleMoves,
            startCursorPosition: {x: clientX, y: clientY},
            startTowerPosition: tower.positionInDOM!,
            towerColor: tower.currentColor,
            towerType: tower.currentType as TowerType
        }
        console.warn('update props', towerTouched)
        updateBoardState({towerTouched, mouseDown: true})
    }

    contextMenuHandler = (e: React.MouseEvent) => {
        const {analysis: {settingPosition}, updateBoardState} = this.props
        e.preventDefault()
        if (!settingPosition) { return }
        const target = e.target as HTMLElement
        if (!target.classList.contains('checker-tower')) { return }
        const key = target.getAttribute('data-indexes')!
        const tower = copyObj(this.props.board.towers![key] as TowerConstructor)! as TowerConstructor
        tower.currentType = tower.currentType === TowerType.m ? TowerType.k : TowerType.m
        const towers = copyObj(this.props.board.towers!) as TowersMap
        towers![key] = tower
        updateBoardState({towers})
    }

    render() {
        const {boardOptions, board: {towerTouched}, board} = this.props
        const {towers, mandatoryMoves, mandatoryMoveStep, lastMoveSquares} = board
        const boardProps = {
            boardOptions,
            possibleMoves: towerTouched?.possibleMoves,
            lastMove: lastMoveSquares
        }  as IBoardProps
        const {boardSize, boardTheme, reversedBoard} = boardOptions
        const WrapperClass = `board__wrapper ${boardTheme} h${boardSize}v${boardSize}${reversedBoard ? ' reversed' : ''}`;
        const mandatoryTowers = (mandatoryMoves || []).map(m => m.move.split(':')[mandatoryMoveStep || 0])
        const Towers = (Object.keys(towers!)).map((key: string, i: number) => {
            const tower = towers[key]
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
