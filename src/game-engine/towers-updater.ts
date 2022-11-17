
import {
    CellsMap, IBoard, IBoardBase,
    IBoardOptions,
    ITowerPosition, MMRResult, MoveWithRivalMoves,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerTouched, TowerType,
} from "../store/models"
import {BaseMoveResolver} from './moves-resolver'
import { copyObj } from "./gameplay-helper-functions"
import movesTree from "./tower-tree";


export class TowersUpdateResolver extends BaseMoveResolver {

    animateTowerRelocation(from: string, to: string, board: IBoardBase) {
        const {cellSize, cellsMap} = board
        const towers = copyObj(board.towers!) as TowersMap
        const tower = towers[from] as TowerConstructor
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap!, cellSize!)
        towers[from] = tower
        return towers
    }

    finalizeSimpleMove(from: string, to: string, board: IBoardBase) {
        const {cellSize, cellsMap} = board
        const towers = copyObj(board.towers!) as TowersMap
        const tower = towers[from] as TowerConstructor
        tower.onBoardPosition = to
        tower.currentType = this.checkTowerTypeChanging(to, tower.currentColor, tower.currentType)
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap!, cellSize!)
        towers[to] = tower
        delete towers[from]
        const towerTouched = null as unknown as TowerTouched
        const lastMoveSquares = [from, to]
        return {towers, towerTouched, lastMoveSquares, mouseDown: false, moveDone: true}
    }

    updateTowersOnMandatoryMoveStep(from: string, to: string, state: IBoard, tP: string[], last=false) {
        const isTowers = this.GV === 'towers'
        const towers = this.updateTowersAfterMoveAnimation(from, to, state, isTowers, last)
        if (isTowers) {
            const middlePieceKey = tP[0]
            const middlePiece = towers[middlePieceKey] as TowerConstructor
            const takenTower = this.captureTower(middlePiece) as TowerConstructor
            if (!takenTower) {
                delete towers[middlePieceKey]
            } else {
                towers[middlePieceKey] = takenTower
            }
            return towers
        } else if (last) {
            tP.forEach((key: string) => {
                delete towers[key]
            })
            return towers
        }
        return towers
    }

    takeDraughts(takenDraughts: string[], _towers: TowersMap): TowersMap {
        const towers = copyObj(_towers) as TowersMap
        takenDraughts.forEach(dr => {
            delete towers[dr]
        })
        return towers
    }

    updateTowersAfterMoveAnimation(from: string, to: string, board: IBoard, wT= false, last= false): TowersMap {
        const {cellSize, cellsMap} = board
        const towers = copyObj(board.towers!) as TowersMap
        const tower = towers[from] as TowerConstructor
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
            tower.currentType = this.checkTowerTypeChanging(to, tower.currentColor, tower.currentType)
        }
        towers[to] = tower
        delete towers[from]
        return towers
    }

    animateRivalTowerMove(from: string, to: string, state: IBoard) {
        const {cellsMap, cellSize} = state
        const towers = copyObj(state.towers)
        const opponentTower = towers.get(from) as TowerConstructor
        opponentTower.positionInDOM = this.calcTowerPosition(to, cellsMap, cellSize)
        return {...state, towers}
    }

    mergeTowers = (t1: TowerConstructor, t2: TowerConstructor, towers: TowersMap): TowersMap => {
        const tower = copyObj(t1) as TowerConstructor
        tower.wPiecesQuantity += t2.wPiecesQuantity!
        tower.bPiecesQuantity += t2.bPiecesQuantity!
        tower.currentColor = t2.currentColor
        tower.currentType = t2.currentType
        delete towers[t2.onBoardPosition]
        towers[tower.onBoardPosition] = tower
        return towers
    }

    calcPositionOutboardBoxes = (key: string) => {
        const boardRect = document.querySelector('.board__body')?.getBoundingClientRect()
        const whiteBox = document.querySelector('.pieces-box.white-black')
        const blackBox = document.querySelector('.pieces-box.black-black')
        if (!whiteBox || !blackBox || !boardRect) {
            return {x: 0, y: 0}
        }
        const {x, y} = key.includes('oW')
            ? whiteBox.getBoundingClientRect()
            : blackBox.getBoundingClientRect()
        return {x: x - boardRect.x, y: y - boardRect.y}
    }

    calcTowerPosition = (key: string, map: CellsMap, cellSize: number): ITowerPosition => {
        const outboardTower = key.includes('oB') || key.includes('oW')
        const cellPosition = !outboardTower
            ? map[key] || {x: 0, y: 0}
            : this.calcPositionOutboardBoxes(key)
        const {x, y} = cellPosition
        const towerElem = document.querySelector('.checker-tower')
        if (!towerElem) {
            console.error(towerElem)
        }
        const {width} = towerElem!.getBoundingClientRect()
        return {x: Math.round(x - width / 2 + cellSize / 2), y: Math.round(y - width / 2  + cellSize/2)}
    }

    getUnusedTowers(towers: TowersMap) {
        return Object.keys(towers).reduce((acc, key) => {
            acc.white += key.includes('oW') ? 1 : 0
            acc.black += key.includes('oB') ? 1 : 0
            return acc
        }, {black: 0, white: 0})
    }

    cancelTowerTransition(props: IBoard) {
        const {key} = props.towerTouched as TowerTouched
        const {cellSize, cellsMap} = props
        const towers = copyObj(props.towers!) as TowersMap
        const tower = towers[key] as TowerConstructor
        tower.positionInDOM = this.calcTowerPosition(key, cellsMap, cellSize)
        towers[key] = tower
        return towers
    }

    updateTowersPosition(cellSize: number, towers: TowersMap, map: CellsMap): TowersMap {
        const _towers = copyObj(towers) as TowersMap
        Object.keys(towers).forEach((key: string) => {
            _towers[key].positionInDOM = this.calcTowerPosition(key, map, cellSize)
        })
        return _towers
    }

    handleUpToMove = (cellKey: string, board: IBoard ) => {
        const { towerTouched, moves, mandatoryMoveStep: mms} = board
        let moveToSave = null, boardProps = null
        if (!towerTouched) { return {moveToMake: moveToSave, boardProps} }
        const from = towerTouched.key
        let towers = copyObj(board.towers), step = [from, cellKey]
        if (!moves.length) {
            console.error('no moves')
            return {moveToMake: moveToSave, boardProps}
        }
        const fitMoves = moves.filter((m: MMRResult) => {
            const moveToCheck = m.takenPieces ? m.move.slice(mms, mms + 2) : m.move
            return step[0] === moveToCheck[0] && step[1] === moveToCheck[1]
        })
        const {endPosition, takenPieces, move: _move} = fitMoves[0],
            takenPiece = takenPieces ? takenPieces[mms] : null,
            lastStep = _move.length === mms + 2

        if (lastStep) {
            const move = _move.join(takenPiece ? ':' : '-')
            const rivalMoves = movesTree.getRivalMoves(move)
            moveToSave = {
                move,
                takenPieces: takenPiece ? takenPieces : undefined,
                position: endPosition,
                rivalMoves,
            } as MoveWithRivalMoves
            towers = takenPiece
                ? tur.updateTowersOnMandatoryMoveStep(from, cellKey, board, [takenPiece], true)
                : tur.updateTowersAfterMoveAnimation(from, cellKey, board, false, true)
        } else if (takenPiece) {
            towers = tur.updateTowersOnMandatoryMoveStep(from, cellKey, board, [takenPiece])
        }
        return {
            boardProps: {
                towers,
                mandatoryMoveStep: takenPiece && !lastStep ? mms + 1 : 0,
                towerTouched: null as unknown as TowerTouched,
            },
            moveToSave
        }
    }


    getCellSize(boardRect: DOMRect, size: number) {
        const {width, left, right} = boardRect
        const cellWidth = (width ? width:  left - right) / size;
        return Math.round(cellWidth)
    }


    handleRemoveTower = (tower: TowerConstructor, board: IBoard) => {
        const {cellSize, cellsMap} = board
        const towers = copyObj(board.towers) as TowersMap
        const {onBoardPosition, wPiecesQuantity, bPiecesQuantity} = tower
        delete towers[onBoardPosition]
        const unusedTowers = tur.getUnusedTowers(towers)
        for (let i = 0; i < wPiecesQuantity; i++) {
            const key = `oW w${unusedTowers.white + i}`
            const positionInDOM = tur.calcTowerPosition(key, cellsMap, cellSize)
            towers[key] =  new TowerConstructor({
                currentColor: PieceColor.w,
                positionInDOM,
                onBoardPosition: key
            })
        }
        for (let i = 0; i < bPiecesQuantity; i++) {
            const key = `oB b${unusedTowers.black + i}`
            const positionInDOM = tur.calcTowerPosition(key, cellsMap, cellSize)
            towers[key] = new TowerConstructor({
                currentColor: PieceColor.b,
                positionInDOM,
                onBoardPosition: key
            })
        }
        return towers
    }

    handleRemovePiece = (key: string, board: IBoard) => {
        const {cellsMap, cellSize} = board
        let towers = copyObj(board.towers)
        const tower = towers[key]! as TowerConstructor
        delete towers[key]
        if (this.GV === 'towers' && (tower.wPiecesQuantity + tower.bPiecesQuantity) > 1) {
            return this.handleRemoveTower(tower, board)
        }
        let outboardKey = tower.currentColor === PieceColor.w ? `oW w` : 'oB black'
        const outboardPiecesNumber = Object.keys(towers)
            .filter(k => towers[k].onBoardPosition.includes(outboardKey)).length
        outboardKey = `${outboardKey}${outboardPiecesNumber}`
        tower.onBoardPosition = outboardKey
        tower.currentType = TowerType.m
        tower.positionInDOM = tur.calcTowerPosition(outboardKey, cellsMap, cellSize)
        towers[outboardKey] = tower
        return towers
    }

    handleSettingPieces = (cellKey: string, board: IBoard): Partial<IBoard> => {
        const {cellSize, cellsMap} = board
        const towerTouched = copyObj(board.towerTouched!) as TowerTouched, {key} = towerTouched
        const positionInDOM = this.calcTowerPosition(cellKey, cellsMap, cellSize)
        let towers = copyObj(board.towers), tower = towers[cellKey]
        if (tower && this.GV === 'towers') {
            return this.handleSettingTowers(tower, board)
        }
        if (key.length > 3) {
            const lastUnusedTower = parseInt(key.slice(4))
            const nextUnusedTowerKey = lastUnusedTower
                ? `${key.slice(0, 4)}${lastUnusedTower - 1}`
                : null
            towers[cellKey] = new TowerConstructor({
                onBoardPosition: cellKey,
                currentColor: towerTouched.towerColor,
                currentType: towerTouched.towerType,
                positionInDOM
            })
            delete towers[key]
            return nextUnusedTowerKey
                ? {towers, towerTouched: {...towerTouched!, key: nextUnusedTowerKey}}
                : {towers, towerTouched: null as unknown as TowerTouched}

        } else {
            towers[cellKey] = {
                ...towers[key],
                onBoardPosition: cellKey,
                positionInDOM
            }
            delete towers[key]
            return {towers, towerTouched: null as unknown as TowerTouched}
        }
    }

    handleSettingTowers = (tower: TowerConstructor, board: IBoard) => {
        const {towerTouched} = board
        let towers = copyObj(board.towers)
        const {key} = towerTouched!
        const mergingTower = towers[key]
        const index = parseInt(key.slice(4))
        let _towerTouched = !index
            ? null as unknown as TowerTouched
            : {...towerTouched, key: `${key.slice(0, 4)}${index - 1}`} as TowerTouched
        if (tower.onBoardPosition !== mergingTower?.onBoardPosition) {
            towers = tur.mergeTowers(tower, mergingTower!, towers)
        } else {
            towers = tur.cancelTowerTransition(board)
        }
        return {towers, mouseDown: false, towerTouched: _towerTouched}
    }

    updateCellsAndTowersPosition(board: IBoard, BO: IBoardOptions, boardRect?: DOMRect) {
        const {cellsMap, cellSize, towers} = board
        const {reversedBoard, boardSize} = BO
        const newCellSize = boardRect? this.getCellSize(boardRect, boardSize) : cellSize;
        const newCellMap = this.updateCellsMap(cellsMap, newCellSize, reversedBoard)
        const newTowers = this.updateTowersPosition(newCellSize, towers, newCellMap)
        return {towers: newTowers, cellsMap: newCellMap, cellSize: newCellSize}
    }
}

export const tur = new TowersUpdateResolver()

export default tur
