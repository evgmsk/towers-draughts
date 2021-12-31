import { BaseBoardSize } from "../../constants/gameConstants";

import {  copyObj, crossDirections, oppositColor, PieceColor, TowerType } from "./gameplay-helper-fuctions";
import { createEmptyBoard } from "./prestart-help-function-constants";

export class BaseMoveResolver {
    GV = 'towers'
    size = BaseBoardSize

    setProps = (props) => {
        this.GV = props.GV
        this.size = props.size
    }

    checkTowerTypeChanging(to, boardSize, color, type) {
        if ((parseInt(to.slice(1)) === boardSize && color === PieceColor.w)
            || (parseInt(to.slice(1)) === 1 && color === PieceColor.b)) {
            return TowerType.k
        } 
        return type
    }

    getCapturedPieceKey = (from, to, board) => {
        const diag = this.getDiagonal(this.getMoveDirection([from, to]), from, board)
        const color = board[from].tower?.currentColor
        for (let cell of diag) {
            if (cell.tower && cell.tower.currentColor !== color) {
                return cell.boardKey
            }
        }
        if (!color) {
            throw new Error(`invalid move tower to move do not exist ${from}:${to}`);
        }
        throw new Error(`invalid move - tower to take did not find ${from}:${to} in ${JSON.stringify(board)}`);
    }

    getDiagonal(direction, startCellKey, board) {
        let cell = board[startCellKey]
        const diagonal = [cell]
        while (cell) {
            const nextCellKey = cell.neighbors[direction]
            if (nextCellKey) {
                const nextCell = board[nextCellKey]
                diagonal.push(nextCell)
                cell = nextCell
            } else {
                break
            }
        }
        return diagonal;
    }

    getDiagonals(cell, board, preDirected = '') {
        const neighbors = board[cell].neighbors
        const diagonals = {}
        const availibleDirections = (d) => (!!preDirected ? crossDirections(preDirected)[d] : true)
        Object.keys(neighbors).filter((d) => availibleDirections(d)).forEach((dir) => {
            diagonals[dir] = this.getDiagonal(dir, cell, board)
        })
        return diagonals
    }

    getMoveDirection(move) {
        const [from, to] = move
        if (from[0] > to[0]) {
            if (parseInt(from.slice(1)) > parseInt(to.slice(1))) {
                return 'leftDown'
            }else {
                return 'leftUp'
            }
        } else {
            if (parseInt(from.slice(1)) > parseInt(to.slice(1))) {
                return 'rightDown'
            } else {
                return 'rightUp'
            }
        }
    }

    cuptureTower = (tower) => {
        if (this.GV !== 'towers') {
            return null
        }
        const {currentColor, bPiecesQuantity, wPiecesQuantity} = tower
        const white = currentColor === PieceColor.w
        const newTower = {
           ...tower,
            currentType: TowerType.m,
            wPiecesQuantity: white ? wPiecesQuantity - 1 : wPiecesQuantity,
            bPiecesQuantity: white ? bPiecesQuantity : bPiecesQuantity - 1,
        }
        if (!newTower.bPiecesQuantity && !newTower.wPiecesQuantity) {
            return null
        } else {
            if (white && !newTower.wPiecesQuantity) {
                newTower.currentColor = PieceColor.b
            } else if (!white && !newTower.bPiecesQuantity) {
                newTower.currentColor = PieceColor.w
            }
        }
        return newTower
    }
}

export class MoveResolveCommons extends BaseMoveResolver {

    checkNeighborsIsEmpty(key, board, color) {
        return Object.values(board[key].neighbors).filter((cellKey) => {
            const condition = color === PieceColor.w
                ? parseInt(key.slice(1)) < parseInt(cellKey.slice(1)) 
                : parseInt(key.slice(1)) > parseInt(cellKey.slice(1))
            return condition  && !board[cellKey].tower
        }).map((fN) => `${key}-${fN}`)
    }

    lookForTowerFreeMoves = (boardKey, board, color) => { 
        const tower = board[boardKey].tower
        if (tower.currentType === TowerType.m) {
            return this.checkNeighborsIsEmpty(boardKey, board, color)
        } else {
            return this.lookForKingFreeMoves(boardKey, board)
        }
    }

    lookForAllPosibleMoves = (color, board) => {
        let result = []
        for (let key of Object.keys(board)) {
            const cell = board[key]
            if(cell.tower?.currentColor === color) {
                const moves = this.lookForTowerFreeMoves(key, board, color)
                if (moves.length) {
                    result = [...result, ...moves]
                }
            }
        }
        return result
    }

    getCapturedTowers(move, position, tP = [], i = 0) {
        const moveLength = move.length
        if (moveLength < 2) return tP
        tP.push(this.getCapturedPieceKey(move[i], move[i+1], position))
        if (moveLength === 2 || i === moveLength - 2) {
            return tP
        }
        i += 1
        return this.getCapturedTowers(move, position, tP, i)
    }

    getFromToKeys = (moveArr, board) => {
        let i = 0
        while(i < moveArr.length) {
            if(board[moveArr[i]].tower) {
                const repetition = moveArr.lastIndexOf(moveArr[i])
                if (repetition  < 0) {
                    return moveArr.slice(i)
                } else if (moveArr.slice(repetition).length > 1) {
                    return moveArr.slice(repetition)
                } else {
                    return []
                }
            }
            i++
        }
        throw Error('start tower in move not found')
    }

    makeMoveWithoutTakingPieces = (move, board) => {
        const _board = copyObj(board)
        const nextMoves = this.getFromToKeys(move, board)
        const [from, to] = [nextMoves[0], nextMoves.slice(-1)[0]]
        if (from !== to) {
            const fromTower = {..._board[from].tower}
            const whiteMove = fromTower.currentColor === PieceColor.w
            if (this.checkLastLine(to, whiteMove) && this.GV !== 'international') {
                fromTower.currentType = TowerType.k
            }
            _board[to].tower = fromTower
            _board[from].tower = null
        }

        if (!_board[to]?.tower) {
            console.error('error on board', move, _board, board)
        }
        if (_board[from].tower && !_board[to].tower?.currentColor) {
            console.error('board was updated incorrectly whithout taken', move, _board, board)
        }
        return _board
    }

    getBoardFromTowers = (towers) => {
        const board = createEmptyBoard(this.size)
        towers.forEach((value, key) => {
            const {wPiecesQuantity, bPiecesQuantity, currentColor, currentType} = value
            if (!key.includes(' ')) {
                 board[key].tower = {wPiecesQuantity, bPiecesQuantity, currentColor, currentType}
            }
        })
        return board
    }
    
    getNewOrder = (props) => {
        const newPieceOrder = oppositColor(props.moveOrder.pieceOrder)
        const moveOrder = {
            pieceOrder:  newPieceOrder,
            playerTurn: props[newPieceOrder].name,
        }
        return moveOrder
    }

    getPropsToMakeFreeMove = (from, to, props) => {
        const newPieceOrder = oppositColor(props.moveOrder.pieceOrder)
        const moveOrder = {
            pieceOrder:  newPieceOrder,
            playerTurn: props[newPieceOrder].name,
        }
        const position = this.makeFreeMove(from, to, props.currentPosition)
        return {moveOrder, moveToSave: {move: `${from}-${to}`, position}}
    }

    makeFreeMove(from, to, board) {
        const newBoard = copyObj(board)
        if (!newBoard[from]) {
            console.error('makeFreeMove invalid props', from, to, board)
        }
        const tower = newBoard[from].tower
        const boardSize = Math.sqrt(Object.keys(board).length * 2)
        tower.currentType = this.checkTowerTypeChanging(to, boardSize, tower.currentColor, tower.currentType)
        newBoard[to].tower = tower
        newBoard[from].tower = null
        return newBoard
    }

    checkDiagonalForKingMove(diag) {
        const startCellKey = diag[0].boardKey
        const moves = []
        for (let cell of diag.slice(1)) {
            if (cell.tower) break
            moves.push(`${startCellKey}-${cell.boardKey}`)
        }
        return moves
    }

    manTowerFreeMoves = (tower, board, cellsMap) => {
        const key = tower.onBoardPosition
        const color = tower.currentColor
        const posibleMoves =  new Map()
        const cellNeighbors = board[key].neighbors
        Object.values(cellNeighbors).forEach((k) => {
            const cell = board[k] 
            const [towerLine, neighborLine] = [parseInt(key.slice(1)), parseInt(k.slice(1))]
            if ((color === PieceColor.b && !cell.tower && towerLine > neighborLine)
                || (color === PieceColor.w && !cell.tower && towerLine < neighborLine)) {
                posibleMoves.set(k, cellsMap.get(k))
            }
        })
        return posibleMoves
    }

    checkLastLine(to, whiteMove) {
        const currentLine = parseInt(to.slice(1))
        return (whiteMove && currentLine === this.size) || (!whiteMove && currentLine === 0)
    }

    lookForKingFreeMoves(cellKey, board) {
        const diagonals = this.getDiagonals(cellKey, board)
        let moves = []
        Object.values(diagonals).forEach((diag) => {
            moves = moves.concat(this.checkDiagonalForKingMove(diag))
        })
        return moves
    }

    kingTowerFreeMoves = (key, board, cellsMap) => {
        const moves = this.lookForKingFreeMoves(key, board)
        const posibleMoves = new Map()
        moves.forEach((m) => {
            const moveSteps = m.split('-')
            const cellKey = moveSteps[moveSteps.length - 1]
            posibleMoves.set(cellKey, cellsMap.get(cellKey))
        })
        return posibleMoves
    }

    makeMandatoryMove = (move, board) => {
        if (move.length < 2) console.error(`makeObligatedMove: incorrect move length`)
        const nextMove = this.getFromToKeys(move, board)
        if (!nextMove.length) {
            return board
        }
        if (nextMove.length === 2) {
            return this.makeMandatoryMoveStep(nextMove, board, true)
        }
        const newBoard = this.makeMandatoryMoveStep(nextMove, board)
        return this.makeMandatoryMove(nextMove.slice(1), newBoard)
    }

    updateBoardOnMandatoryMoveStep = (move, board) => {
        if (this.GV === 'towers') {
            return this.makeMandatoryMove(move, board)
        }
        return this.makeMoveWithoutTakingPieces(move, board)
    }

    makeMandatoryMoveStep = (move, board, last=false) => {
        const newBoard = copyObj(board)
        const [from, to] = move
        if (from === to || !to || !from) {
            console.error('error in step', move, board)
        }
        const tower = copyObj(board[from]).tower
        let middlePieceKey = this.getCapturedPieceKey(from, to, board)
        const newMiddleTower = this.cuptureTower(newBoard[middlePieceKey].tower)
        if (!tower || !middlePieceKey) {
            console.error('invalid board:', JSON.stringify(board), 'move:', move)
            return board
        }
        if (this.GV === 'towers') {
            if (tower.currentColor === PieceColor.w) {
                tower.bPiecesQuantity += 1
            } else {
                tower.wPiecesQuantity += 1
            }
        }
        newBoard[from].tower = null
        newBoard[middlePieceKey].tower = newMiddleTower
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
           
        }
        newBoard[to].tower = tower
        if (newBoard[move[0]].tower || !newBoard[move[1]].tower?.currentColor) {
            console.error('board was updated incorrectly', move, newBoard, board)
        }
        return newBoard
    }
}
