import { 
    CellsMap,
    IBoardCell,
    IBoardToGame,
    IGameBoard,
    IMMRResult,
    IRef,
    ITowerPosition,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerType,
} from "../store/models"

//common functions
export const splitMove = (move: string) => {
    if (move.includes(':')) {
        return move.split(':')
    }
    return move.split('-')
}

export const oppositeColor = (color: PieceColor): PieceColor => (color === PieceColor.w ? PieceColor.b : PieceColor.w)

export const copyObj = (board: {[key: string]: any}): {[key: string]: any} => {
    return Object.keys(board).reduce((acc: {[key: string]: any}, k: string) => {
        const v = board[k]
        if (typeof v === 'object') {
            const target = Array.isArray(v) ? [] : {}
            acc[k] = Object.assign(target, v)
        } else {
            acc[k] = v
        }
        return acc
    }, {})
}

export const possibleOutOfMandatory = (state: Partial<IGameBoard>, key: string):CellsMap => {
    const possibleMoves = {} as CellsMap
    const {mandatoryMoveStep: MS, mandatoryMoves, cellsMap } = state
    const availableSteps = mandatoryMoves!
    .filter((m: IMMRResult) => m.move.includes(key)).map((m: IMMRResult) => m.move.split(':')[MS as number + 1])
    availableSteps.forEach((step: string) => {
        possibleMoves[step] = cellsMap![step] as ITowerPosition
    })
    return possibleMoves
}


export const filterArrayByLength = (arr: IMMRResult[]):  {ended: IMMRResult[], cont: IMMRResult[]} => {
    const maxLength = arr
        .reduce((acc: number, val: IMMRResult) => (acc > val.move.length ? acc : val.move.length), 0)

    const res = arr.reduce((acc: {ended: IMMRResult[], cont: IMMRResult[]}, val: IMMRResult) => {
        if(val.move.length === maxLength) {
            acc.cont.push(val)
        } else {
            acc.ended.push(val)
        }
        return acc
    }, {ended: [], cont: []})
    return res
}

export const crossDirections = (dir: string): {[key: string]: boolean} => {
    const directions = {} as {[key: string]: boolean}
    directions[`${dir.includes('left') ? 'left' : 'right'}${dir.includes('Up') ? 'Down' : 'Up'}`] = true
    directions[`${dir.includes('left') ? 'right' : 'left'}${dir.includes('Up') ? 'Up' : 'Down'}`] = true
    return directions
}
 
export function checkMoveTargetCell(pos: ITowerPosition, pM: CellsMap, cellSize: number, ref: IRef<any>) {
    const size = cellSize
    const boardRect = ref.current!.querySelector('.board__body')!.getBoundingClientRect();
    const [x, y] = [pos.x - boardRect.x, pos.y - boardRect.y]
    if (x < 0 || y < 0) {
        return null
    }
    const targetCell = [...Object.keys(pM)].filter((key: string) => {
        const value = pM[key]
        const [cellX, cellY] = [value.x + size! / 4, value.y + size! / 4]
        const distance = Math.sqrt(Math.pow((cellX - x), 2) + Math.pow((cellY - y), 2))
        return distance < size!
    })[0]
    if (targetCell) {
        return targetCell
    }
    return null
}

export const checkIfNumberOfKingsChanged = (board1: IBoardToGame, board2: IBoardToGame) => {
    const calcKings = (board: IBoardToGame) => Object.values(board).filter((cell: IBoardCell) => 
        cell.tower?.currentType === TowerType.k).length
        
    return calcKings(board1) !== calcKings(board2)
}

export const convertToMovesHistory = (arr: string[]): {white: string, black: string}[] => {
    const result: {white: string, black: string}[] = []
    for (let i = 0; i < arr.length; i += 2) {
        result.push({white: arr[i], black: arr[i+1] || ''})
    }
    return result
}

export function getCellSize(refElem: HTMLDivElement, size: number) {
    const boardHtmlRect = refElem.querySelector('.board__body')!.getBoundingClientRect();
    const {width, left, right} = boardHtmlRect
    const cellWidth = (width ? width:  left - right) / size;
    return Math.round(cellWidth)
}

export function checkIfBoardFitTowers(towers: TowersMap, board: IBoardToGame): boolean {
    let res = true
    Object.keys(towers).forEach((key: string, i: number) => {
        const tower = towers[key]
        const towerOnBoard = board[key].tower
        if (tower.onBoardPosition !== towerOnBoard?.onBoardPosition
            || tower.bPiecesQuantity !== towerOnBoard.bPiecesQuantity
            || tower.wPiecesQuantity !== towerOnBoard.wPiecesQuantity
            || tower.currentColor !== towerOnBoard.currentColor
            || tower.currentType !== towerOnBoard.currentType) {
                res = false
                throw new Error("board do not fit towers")
            }
    })
    return res
}

const GHF = {
    checkIfBoardFitTowers,
    getCellSize,
    convertToMovesHistory,
    checkIfNumberOfKingsChanged,
    checkMoveTargetCell,
    crossDirections,
    copyObj,
    oppositeColor,
    filterArrayByLength,
}

export default GHF
