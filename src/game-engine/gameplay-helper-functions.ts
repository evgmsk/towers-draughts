import {CellsMap, IBoard, ITowerPosition, MMRResult, PieceColor, TowersMap,} from '../store/models'

//common functions

export const splitMove = (move: string) => {
    if (move.includes(':')) {
        return move.split(':')
    }
    return move.split('-')
}

export const oppositeColor = (color: PieceColor): PieceColor =>
    color === PieceColor.white ? PieceColor.black : PieceColor.white

export const oppositeDirection = (dir: string): string => {
    switch (dir) {
        case 'leftDown':
            return 'rightUp'
        case 'rightUp':
            return 'leftDown'
        case 'leftUp':
            return 'rightDown'
        default:
            return 'leftUp'
    }
}

export const copyObj = (board: {
    [key: string]: any
}): { [key: string]: any } => {
    return Object.keys(board).reduce(
        (acc: { [key: string]: any }, k: string) => {
            const v = board[k]
            if (typeof v === 'object') {
                const target = Array.isArray(v) ? [] : {}
                acc[k] = Object.assign(target, v)
            } else {
                acc[k] = v
            }
            return acc
        },
        {}
    )
}

export const possibleOutOfMoves = (state: IBoard, key: string): CellsMap => {
    const { mandatoryMoveStep: step = 0, moves, cellsMap } = state
    return moves.reduce((acc, move) => {
        if (move.move[step] === key) {
            const cellKey = move.move[step + 1]
            acc[cellKey] = cellsMap[cellKey]
        }
        return acc
    }, {} as CellsMap)
}

export const filterMoveByLength = (
    arr: MMRResult[]
): { ended: MMRResult[]; cont: MMRResult[] } => {
    const maxLength = arr.reduce(
        (acc: number, val: MMRResult) =>
            acc > val.move.length ? acc : val.move.length,
        0
    )
    return arr.reduce(
        (acc: { ended: MMRResult[]; cont: MMRResult[] }, val: MMRResult) => {
            if (val.move.length === maxLength) {
                acc.cont.push(val)
            } else {
                acc.ended.push(val)
            }
            return acc
        },
        { ended: [], cont: [] }
    )
}

export function checkMoveTargetCell(
    cursPos: ITowerPosition,
    cM: CellsMap,
    cellSize: number,
    rect: DOMRect
) {
    const [x, y] = [cursPos.x - rect.x, cursPos.y - rect.y]
    return x < 0 || y < 0
        ? null
        : Object.keys(cM).filter((key: string) => {
              const cellPos = cM[key]
              const [centerX, centerY] = [
                  cellPos.x + cellSize / 2,
                  cellPos.y + cellSize / 2,
              ]
              const distance = Math.sqrt(
                  Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)
              )
              return distance < cellSize / 2
          })[0]
}

export const checkIfNumberOfKingsChanged = (
    board1: TowersMap,
    board2: TowersMap,
    move: string[]
) => {
    if (!board1[move[0]].currentType || !board2[move[1]].currentType) {
        console.error('invalid props in check king number')
    }
    return board1[move[0]].currentType !== board2[move[1]].currentType
}

export const convertToMovesHistory = (
    arr: string[]
): { white: string; black: string }[] => {
    const result: { white: string; black: string }[] = []
    for (let i = 0; i < arr.length; i += 2) {
        result.push({ white: arr[i], black: arr[i + 1] || '' })
    }
    return result
}

export const isDev = () =>
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

export const compareArrays = (arr1: string[], arr2: string[]): boolean => {
    let equal = true
    for (let i = 0; i < arr1.length; i++) {
        equal = arr1[i] === arr2[i]
        if (!equal) break
    }
    return equal
}

const fun = {
    convertToMovesHistory,
    checkIfNumberOfKingsChanged,
    copyObj,
    oppositeColor,
    oppositeDirection,
    possibleOutOfMoves,
}

export default fun
