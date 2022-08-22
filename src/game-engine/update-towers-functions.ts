import { CellTowerRatio } from "../constants/gameConstants"
import {
    CellsMap,
    IBoardOptions,
    IBoardToDraw,
    IBoardToGame, 
    IGameBoard, 
    ITowerPosition, 
    PartialTower,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerTouched,
} from "../store/models"

import {BaseMoveResolver} from './common-fn-moves-resolver'
import { copyMap, getCellSize } from "./gameplay-helper-fuctions"
import { createStartBoard, updateCellsMap } from "./prestart-help-function-constants"


export class TowersUpdateResolver extends BaseMoveResolver {
    currentPosition = createStartBoard(this.size) as IBoardToGame
    previousPosition = createStartBoard(this.size) as IBoardToGame
    callBack: Function = () => {}

    setCalBack = (cb: Function) => {
        this.callBack = cb
    }

    // animateRivalMove(history: string[], board: IBoardToDraw, reversed: boolean) {
    //     this.setPositions(board.positionsTree!, history)
    //     const move = history.slice(-1)[0]
    //     const mandatory = move.includes(':')
    //     if (mandatory) {
    //         return this.animateMadatoryMove(move)
    //     }
    //     return this.animateSimpleMove(move, board, reversed)
    // }

    animateMadatoryMove(move: string) {

    }

    animateSimpleMove(move: string, board: IBoardToDraw, reversed: boolean) {
       
    }

    relocateTower(from: string, to: string, board: IGameBoard, reversed: boolean) {
        const {cellSize, cellsMap} = board
        const towers = copyMap(board.towers)
        const tower = towers.get(from) as TowerConstructor
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap, cellSize, reversed)
        towers.set(from, tower)
        console.log(tower)
        this.callBack({towers})
    }

    finalizeSimpleMove(from: string, to: string, board: IGameBoard, reversed = false) {
        const {cellSize, cellsMap} = board
        const towers = copyMap(board.towers)
        const tower = towers.get(from) as TowerConstructor
        tower.onBoardPosition = to
        tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap, cellSize, reversed)
        towers.set(to, tower)
        towers.delete(from)
        const towerTouched = null as unknown as TowerTouched
        const lastMoveSquares = [from, to]
        this.callBack({towers, towerTouched, lastMoveSquares, mouseDown: false, moveDone: true})
    }

    finalizeMandatoryMoveStep(from: string, to: string, board: IGameBoard, reversed = false, last = false) {
        const towers = copyMap(board.towers)
        const {cellSize, cellsMap} = board
        const tower = towers.get(from) as TowerConstructor
        tower.onBoardPosition = to
        if (this.GV === 'towers') {
            if (tower!.currentColor === PieceColor.w) {
                tower.bPiecesQuantity = (tower.bPiecesQuantity as number) + 1
            } else {
                tower.wPiecesQuantity = (tower.wPiecesQuantity as number) + 1
            }
        }
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
        }
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap, cellSize, reversed)
        towers.set(to, tower)
        towers.delete(from)
        console.log(tower)
        return towers
    }

    setPositions(positionsTree: Map<string, IBoardToGame>, history: string[]) {
        let currentPositionKey
        currentPositionKey = history.join('_')
        const currentPosition = positionsTree?.get(currentPositionKey)!
        this.previousPosition = {...this.currentPosition}
        this.currentPosition = currentPosition
    }

    updateTowersOnMandatoryMoveStep(from: string, to: string, state: IGameBoard, tP: string[], last=false) {
        const isTowers = this.GV === 'towers'
        const towers = this.updateTowersAfterMoveAnimation(from, to, state, isTowers, last)
        if (isTowers) {
            const middlePieceKey = tP[0]
            const middlePiece = towers.get(middlePieceKey) as PartialTower
            const takenTower = this.cuptureTower(middlePiece) as TowerConstructor
            if (!takenTower) {
                towers.delete(middlePieceKey)
            } else {
                towers.set(middlePieceKey, takenTower)
            }
            return towers
        } else if (last) {
            console.log(towers, tP)
            tP.forEach((key: string) => {
                towers.delete(key)
            })
            return towers
        }
        return towers
    }

    updateTowersToBoard(board: IBoardToGame): TowersMap {
        const towers = new Map() as TowersMap
        Object.keys(board).forEach((key: string) => {
            let tower = board[key].tower as TowerConstructor
            if (tower) {
                const _tower = new TowerConstructor(tower)
                _tower.onBoardPosition = key
                towers.set(key, _tower)
            }
        })
        return towers
    }
    
    updateMiddleTowerOnOpponentMove(key: string, state: IGameBoard, board: IBoardToGame) {
        const towers = copyMap(state.towers) as TowersMap
        const takenTower = board[key]!.tower as PartialTower
        if (takenTower) {
            const newMiddleTower = {...towers.get(key), ...takenTower} as TowerConstructor;
            towers.set(key, newMiddleTower)
        } else {
            towers.delete(key)
        }
        console.log('middle update', key, towers, board, takenTower)
        return towers
    }

    updateTowersAfterMoveAnimation(from: string, to: string, board: IBoardToDraw, wT=false, last=false): TowersMap {
        const {cellSize, cellsMap} = board
        const towers = copyMap(board.towers!) as TowersMap
        const tower = towers.get(from) as TowerConstructor
        if (wT) {
            if (tower!.currentColor === PieceColor.w) {
                tower.bPiecesQuantity = (tower.bPiecesQuantity as number) + 1
            } else {
                tower.wPiecesQuantity = (tower.wPiecesQuantity as number) + 1
            }
        }
        tower!.onBoardPosition = to
        tower!.positionInDOM = this.calcTowerPosition(to, cellsMap!, cellSize!)
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
        }
        towers.set(to, tower)
        towers.delete(from)
        return towers
    }

    animateRivalTowerMove(from: string, to: string, state: IGameBoard) {
        const {cellsMap, cellSize} = state
        const towers = copyMap(state.towers)
        const opponentTower = towers.get(from) as TowerConstructor
        opponentTower.positionInDOM = this.calcTowerPosition(to, cellsMap, cellSize)
        return {...state, towers}
    }

    calcPositionOutboardTowers = (key: string, cellSize: number, reversed: boolean) => {
        const boardElem = document.querySelector('.board__body')
        const boardHeight = Math.round(boardElem!.getBoundingClientRect().height)
        const towerWidth = CellTowerRatio * cellSize
        const dY = Math.round(cellSize / 2 - towerWidth / 2)
        const bottom = Math.round(boardHeight - cellSize / 2 - towerWidth / 2)
        const x = Math.round(-5 - cellSize + dY)
        return (reversed && key.includes('oB')) || (!reversed && key.includes('oW'))
                ? {x, y: bottom}
                : {x, y: dY}
    }

    calcTowerPosition = (key: string, map: CellsMap, cellSize: number, reversed = false): ITowerPosition => {
        if (key.includes('oB') || key.includes('oW')) {
            return this.calcPositionOutboardTowers(key, cellSize, reversed) as ITowerPosition
        }
        const cellPosition = map.get(key) as ITowerPosition
        if (!cellPosition) return  {x: 0, y: 0}
        const {x, y} = cellPosition
        const towerElem = document.querySelector('.checker-tower')
        if (!towerElem) {
            console.error(towerElem)
        }
        const {width} = towerElem!.getBoundingClientRect()
        return {x: Math.round(x - width / 2 + cellSize / 2), y: Math.round(y - width / 2  + cellSize/2)}
    }

    cancelTowerTransition(props: IGameBoard & {reversed?: boolean}) { 
        const {key} = props.towerTouched as TowerTouched
        const {cellSize, cellsMap, reversed = false} = props
        const towers = copyMap(props.towers) as TowersMap
        const tower = towers.get(key) as TowerConstructor
        tower.positionInDOM = this.calcTowerPosition(key, cellsMap, cellSize, reversed)
        towers.set(key, tower)
        this.callBack({...props, towers, towerTouched: null as unknown as TowerTouched, mouseDown: false})
    }

    updateTowersPosition = (cellSize: number, towers: TowersMap, map: CellsMap, reversed = false): TowersMap => {
        const _towers = copyMap(towers)
        towers.forEach((val: TowerConstructor, key: string) => {
            const positionInDOM = this.calcTowerPosition(key, map, cellSize, reversed)
            const tower = {...val, positionInDOM, onBoardPosition: key}
            _towers.set(key, tower)
        })
        return _towers
    }

    updateCellsPosition = (board: IBoardToDraw, boardOptions: IBoardOptions, boardRef: HTMLDivElement) => {
        const {cellsMap, cellSize, towers} = board
        const {reversedBoard, boardSize} = boardOptions
        const newCellSize = getCellSize(boardRef, boardSize);
        if (cellSize === newCellSize) return
        const newCellMap = updateCellsMap(cellsMap as CellsMap, newCellSize, reversedBoard)
        const newTowers = this.updateTowersPosition(newCellSize, towers, newCellMap, reversedBoard)
        // console.log(newTowers, towers)
        this.callBack({towers: newTowers, cellsMap: newCellMap, cellSize: newCellSize})
    }
}

const tur = new TowersUpdateResolver()

export default tur
