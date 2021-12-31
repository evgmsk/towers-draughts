export const oppositColor = (color) => (color === PieceColor.w ? PieceColor.b : PieceColor.w)



export class TowerConstructor {
    onBoardPosition;
    currentColor;
    wPiecesQuantity;
    bPiecesQuantity;
    positionInDOM;
    currentType;
    veiw;
    mandatoryMove;
    constructor(props) {
        this.currentType = props.currentType || TowerType.m;
        this.currentColor = props.currentColor;
        this.wPiecesQuantity = props.wPiecesQuantity || (props.currentColor === PieceColor.w ? 1 : 0);
        this.bPiecesQuantity = props.bPiecesQuantity || (props.currentColor === PieceColor.b ? 1 : 0);
        this.positionInDOM = props.positionInDOM || {x: 0, y: 0};
        this.onBoardPosition = props.onBoardPosition
        this.veiw = props.veiw || 'face'
        this.mandatoryMove = props.mandatoryMove || false
    }
}

export const PieceColor = {
    w: 'white',
    b: 'black',
}

export const TowerType = {
    m: 'man',
    k: 'king'
}

export const copyMap = (board) => {
    const nm = new Map()
    board.forEach((v, k) => {
        if (typeof v === 'object') {
            if (Array.isArray(v)) {
                nm.set(k, [...v])
            } else {
                nm.set(k, {...v})
            }
        } else {
            nm.set(k, v)
        }
    })
    return nm
}

export const copyObj = (board) => {
    return JSON.parse(JSON.stringify(board))
}

export const possibleOutOfMandatory = (state, key) => {
    const posibleMoves = new Map()
    const {mandatoryMoveStep: MS, mandatoryMoves, cellsMap } = state
    const availableSteps = mandatoryMoves
    .filter((m) => m.move.includes(key)).map((m) => m.move.split(':')[MS + 1])
    availableSteps.forEach((step) => {
        posibleMoves.set(step, cellsMap.get(step))
    })
    return posibleMoves
}

export const compareMaps = (map1, map2) => {
    return JSON.stringify([...map1.entries()]) !== JSON.stringify([...map2.entries()])
}

export const filterArrayByLength = (arr) => {
    const maxLength = arr.reduce((acc, val) => (acc > val.move.length ? acc : val.move.length), 0)
    return arr.filter((val) => val.move.length === maxLength)
}

export const crossDirections = (dir) => {
    const directions = {}
    directions[`${dir.includes('left') ? 'left' : 'right'}${dir.includes('Up') ? 'Down' : 'Up'}`] = true
    directions[`${dir.includes('left') ? 'right' : 'left'}${dir.includes('Up') ? 'Up' : 'Down'}`] = true
    return directions
}
 
export function checkMoveTargetCell(pos, pM, cellSize, ref) {
    const possibleCells =  pM.entries()
    const size = cellSize
    const boardRect = ref.current.querySelector('.board__body').getBoundingClientRect();
    const [x, y] = [pos.x - boardRect.x, pos.y - boardRect.y]
    const targetCell = [...possibleCells].filter((props) => {
        const [cellX, cellY] = [props[1].x + size / 4, props[1].y + size / 4]
        const distance = Math.sqrt(Math.pow((cellX - x), 2) + Math.pow((cellY - y), 2))
        return distance < size
    })[0]
    if (targetCell) {
        return targetCell[0]
    }
    return null
}

export const checkIfNumberOfKingsChanged = (board1, board2) => {
    const calcKings = (board) => Object.values(board).filter((cell) => 
        cell.tower && cell.tower.currentType === TowerType.k).length
    return calcKings(board1) - calcKings(board2)
}

export const convertToMovesHistory = (arr) => {
    const result = []
    for (let i = 0; i < arr.length; i += 2) {
        result.push({white: arr[i], black: arr[i+1] || ''})
    }
    return result
}

export function getCellSize(refElem, size) {
    const boardHtmlRect = refElem.querySelector('.board__body').getBoundingClientRect();
    const {width, left, right} = boardHtmlRect
    const cellWidth = (width ? width:  left - right) / size;
    return Math.round(cellWidth)
}

export function checkIfBoardFitTowers(towers, board) {
    let res = true
    towers.forEach((tower, key) => {
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
    copyMap,
    oppositColor,
    compareMaps,
    filterArrayByLength,
}

export default GHF
