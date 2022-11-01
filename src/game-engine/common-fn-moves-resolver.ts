import { BaseBoardSize } from "../constants/gameConstants";
import {
    BoardCell,
    CellsMap,
    GameVariants,
    IBoardCell,
    IBoardToGame,
    IDiagonals,
    IGameState,
    IMoveOrder,
    IMoveProps,
    ITowerPosition,
    PartialTower,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerType,
    IMove
} from "../store/models"
import {  copyObj, crossDirections, oppositeColor } from "./gameplay-helper-functions";
import { createEmptyBoard } from "./prestart-help-function-constants";

export interface IEvaluationData {
    freeMoves: IMove[],
    mandatoryMoves: IMove[],
    Towers: number,
    Kings: number,
    value: number
}

export class BaseMoveResolver {
    GV: GameVariants = 'towers'
    size: number = BaseBoardSize
    board = createEmptyBoard(this.size)
    evData = {
        white: {} as IEvaluationData,
        black: {} as IEvaluationData
    }
    setProps = (props: {GV: GameVariants, size: number}) => {
        this.GV = props.GV
        this.size = props.size
        this.board = createEmptyBoard(props.size)
    }

    get data() {
        return this.evData
    }

    checkTowerTypeChanging(to: string, boardSize: number, color: PieceColor, type: TowerType): TowerType {
        if ((parseInt(to.slice(1)) === boardSize && color === PieceColor.w)
            || (parseInt(to.slice(1)) === 1 && color === PieceColor.b)) {
            return TowerType.k
        } 
        return type
    }

    getCapturedPieceKey = (from: string, to: string, board: IBoardToGame): string => {
        const interval = this.getInterval(from, to, board)
        const key = interval.filter(c => c.tower)[0]
        if (key) return key.boardKey
        console.error(`invalid move - tower to take did not find ${from}:${to}`, board);
        return ''
    }

    getInterval(start: string, end: string, board: IBoardToGame): IBoardCell[] {
        if (board[end].tower) {
            console.error('board', board, start, end)
        }
        const dir = this.getMoveDirection([start, end])
        let cell = board[start]
        const interval = []
        while(true) {
            const nextCellKey = cell!.neighbors[dir]
            if (!nextCellKey || nextCellKey === end) break
            cell = board[nextCellKey]
            interval.push(cell)
        } 
        return interval
    }

    getIntervalWithDraughts(start: string, end: string, towers: TowersMap): IBoardCell[] {
        if (towers[end]) {
            console.error('towers', towers, start, end)
        }
        const dir = this.getMoveDirection([start, end])
        let cell = this.board[start]
        const interval = []
        while(true) {
            const nextCellKey = cell!.neighbors[dir]
            if (!nextCellKey || nextCellKey === end) break
            cell = this.board[nextCellKey]
            interval.push(cell)
        }
        return interval
    }

    getDiagonalWithDraughts(direction: string, startCellKey: string): BoardCell[] {
        let cell = this.board[startCellKey]
        const diagonal = [cell]
        while (cell) {
            const nextCellKey = cell!.neighbors[direction]
            if (nextCellKey) {
                const nextCell = this.board[nextCellKey]
                diagonal.push(nextCell)
                cell = nextCell
            } else {
                break
            }
        }
        return diagonal;
    }

    getDiagonal(direction: string, startCellKey: string, board: IBoardToGame): IBoardCell[] {
        let cell = board[startCellKey]
        const diagonal = [cell]
        while (cell) {
            const nextCellKey = cell!.neighbors[direction]
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

    getDiagonals(cell: string,
                 board:  IBoardToGame, preDirected = ''): IDiagonals {
        const neighbors = board[cell]!.neighbors
        const diagonals = {} as IDiagonals
        const availableDirections = (d: string) => (!!preDirected ? crossDirections(preDirected)[d] : true)
        Object.keys(neighbors).filter((d: string) => availableDirections(d)).forEach((dir: string) => {
            diagonals[dir] = this.getDiagonal(dir, cell, board)
        })
        return diagonals
    }

    getMoveDirection(move: string[]): string {
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

    captureTower = (tower: PartialTower): PartialTower | null => {
        if (this.GV !== 'towers') {
            return null as unknown as PartialTower
        }
        const {currentColor, bPiecesQuantity, wPiecesQuantity} = tower
        const white = currentColor === PieceColor.w
        const newTower = {
           ...tower,
            currentType: TowerType.m,
            wPiecesQuantity: white ? (wPiecesQuantity as number) - 1 : wPiecesQuantity,
            bPiecesQuantity: white ? bPiecesQuantity : (bPiecesQuantity as number) - 1,
        }
        if (!newTower.bPiecesQuantity && !newTower.wPiecesQuantity) {
            return null as unknown as PartialTower
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

    cellMoveRestrictions(color: PieceColor, key: string, cellKey: string) {
        return color === PieceColor.w
            ? parseInt(key.slice(1)) < parseInt(cellKey.slice(1))
            : parseInt(key.slice(1)) > parseInt(cellKey.slice(1))
    }

    checkNeighborsIsEmpty(key: string, board: IBoardToGame, color: PieceColor): string[] {
        return Object.keys(board[key].neighbors).reduce((acc: string[], nKey: string) => {
            const cellKey = board[key].neighbors[nKey]
            return !board[cellKey]!.tower && this.cellMoveRestrictions(color, key, cellKey)
                ? acc.concat(`${key}-${cellKey}`)
                : acc
        }, [])
    }

    lookForTowerFreeMoves = (boardKey: string, board: IBoardToGame, color: PieceColor): string[] => {
        const tower = board[boardKey].tower
        if (tower!.currentType === TowerType.m) {
            return this.checkNeighborsIsEmpty(boardKey, board, color)
        } else {
            return this.lookForKingFreeMoves(boardKey, board)
        }
    }

    lookForAllFreeMoves = (color: PieceColor, board: IBoardToGame, towers?: TowersMap): string[] => {
        let result: string[] = []
        for (let key of Object.keys(towers || board)) {
            const cell = board[key]
            if (cell.tower?.currentColor !== color) {
                continue
            }
            const moves = this.lookForTowerFreeMoves(key, board, color)
            if (moves.length) {
                result = result.concat(moves)
            }
        }
        return result
    }

    getCapturedTowers(move: string[], position: IBoardToGame, tP: string[] = [], i = 0): string[] {
        const moveLength = move.length
        if (moveLength < 2) return tP
        tP.push(this.getCapturedPieceKey(move[i], move[i+1], position))
        if (moveLength === 2 || i === moveLength - 2) {
            return tP
        }
        i += 1
        return this.getCapturedTowers(move, position, tP, i)
    }

    getFromToKeys = (moveArr: string[], board: IBoardToGame): string[] => {
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
        throw Error('start tower in rivalMove not found')
    }

    makeMoveWithoutTakingPieces = (move: string[], board: IBoardToGame): IBoardToGame => {
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
            console.error('board was updated incorrectly without taken', move, _board, board)
        }
        return _board
    }
    
    getNewOrder = (props: Partial<IGameState>): IMoveOrder => {
        const newPieceOrder = oppositeColor(props.moveOrder!.pieceOrder)
        const moveOrder = {
            pieceOrder:  newPieceOrder,
            playerTurn: props[newPieceOrder]!.name,
        }
        return moveOrder
    }

    getPropsToMakeFreeMove = (from: string, to: string, props: {[key: string]: any}): IMoveProps => {
        const newPieceOrder = oppositeColor(props.moveOrder!.pieceOrder)
        const moveOrder = {
            pieceOrder:  newPieceOrder,
            playerTurn: props[newPieceOrder]!.name,
        }
        const position = this.makeFreeMove(from, to, props.currentPosition!)
        return {moveOrder, moveToSave: {move: `${from}-${to}`, position}}
    }

    makeFreeMove(from: string, to: string, board: IBoardToGame): IBoardToGame {
        const newBoard = copyObj(board)
        if (!newBoard[from]) {
            console.error('makeFreeMove invalid props', from, to, board)
        }
        const tower = {...newBoard[from].tower as TowerConstructor}
        const boardSize = Math.sqrt(Object.keys(board).length * 2)
        tower.currentType = this.checkTowerTypeChanging(to, boardSize, tower.currentColor, tower.currentType)
        newBoard[to].tower = tower
        newBoard[from].tower = null
        return newBoard
    }

    checkDiagonalForKingMove(diag: IBoardCell[]) {
        const startCellKey = diag[0].boardKey
        const moves = [] as string[]
        for (let cell of diag.slice(1)) {
            if (cell.tower) break
            moves.push(`${startCellKey}-${cell.boardKey}`)
        }
        return moves
    }

    manTowerFreeMoves = (tower: TowerConstructor, board: IBoardToGame, cellsMap: CellsMap) => {
        const key = tower.onBoardPosition
        const color = tower.currentColor
        const possibleMoves =  {} as CellsMap
        const cellNeighbors = board![key]!.neighbors
        Object.keys(cellNeighbors!).forEach((k: string) => {
            const cellKey = cellNeighbors[k]
            const cell = board![cellKey]
            const [towerLine, neighborLine] = [parseInt(key.slice(1)), parseInt(cellKey.slice(1))]
            if ((color === PieceColor.b && !cell!.tower && towerLine > neighborLine)
                || (color === PieceColor.w && !cell!.tower && towerLine < neighborLine)) {
                possibleMoves[cellKey] = cellsMap[cellKey] as ITowerPosition
            }
        })
        return possibleMoves
    }

    checkLastLine(to: string, whiteMove: boolean): boolean {
        const currentLine = parseInt(to.slice(1))
        return (whiteMove && currentLine === this.size) || (!whiteMove && currentLine === 0)
    }

    lookForKingFreeMoves(cellKey: string, board: IBoardToGame): string[] {
        const diagonals = this.getDiagonals(cellKey, board)
        let moves = [] as string[]
        Object.keys(diagonals).forEach((key: string) => {
            const diag = diagonals[key]
            moves = moves.concat(this.checkDiagonalForKingMove(diag))
        })
        return moves
    }

    kingTowerFreeMoves = (key: string, board: IBoardToGame, cellsMap: CellsMap): CellsMap => {
        const moves = this.lookForKingFreeMoves(key, board)
        const possibleMoves = {} as CellsMap
        moves.forEach((m: string) => {
            const moveSteps = m.split('-')
            const cellKey = moveSteps[moveSteps.length - 1]
            possibleMoves[cellKey] = cellsMap[cellKey] as ITowerPosition
        })
        return possibleMoves
    }

    makeMandatoryMove = (move: string[], board: IBoardToGame): IBoardToGame => {
        if (move.length < 2) console.error(`makeObligatedMove: incorrect move length`)
        const nextMove = this.getFromToKeys(move, board)
        if (!nextMove.length) {
            return board
        }
        if (nextMove.length === 2) {
            return this.makeMandatoryMoveStep(nextMove, board, true)
        }
        const newBoard = this.makeMandatoryMoveStep(nextMove as string[],board)
        return this.makeMandatoryMove(nextMove.slice(1), newBoard)
    }

    updateBoardOnMandatoryMoveStep = (move: string[], board: IBoardToGame): IBoardToGame => {
        if (this.GV === 'towers') {
            return this.makeMandatoryMove(move, board)
        }
        return this.makeMoveWithoutTakingPieces(move, board)
    }

    makeMandatoryMoveStep = (move: string[], board: IBoardToGame, last=false): IBoardToGame => {
        const newBoard = copyObj(board)
        const [from, to] = move
        if (from === to || !to || !from) {
            console.error('error in step', move, board)
        }
        const tower = copyObj(board[from])!.tower as TowerConstructor
        let middlePieceKey = this.getCapturedPieceKey(from, to, board)
        const newMiddleTower = this.captureTower(newBoard[middlePieceKey].tower)
        if (!tower || !middlePieceKey) {
            console.error('invalid board:', JSON.stringify(board), 'rivalMove:', move)
            return board
        }
        if (this.GV === 'towers') {
            if (tower.currentColor === PieceColor.w) {
                tower.bPiecesQuantity! += 1
            } else {
                tower.wPiecesQuantity! += 1
            }
        }
        newBoard[from]!.tower = null
        newBoard[middlePieceKey].tower = newMiddleTower
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
           
        }
        newBoard[to]!.tower = tower as PartialTower
        if (newBoard[move[0]].tower || !newBoard[move[1]].tower?.currentColor) {
            console.error('board was updated incorrectly', move, newBoard, board)
        }
        return newBoard
    }
}
