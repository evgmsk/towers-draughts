import {PieceColor, TowerType, TowerConstructor} from './gameplay-helper-fuctions'
export const BaseCellSize = 50
export const defaultWhiteTowerCells8x8 = ['a1', 'a3', 'b2', 'c1', 'c3', 'd2', 'e1', 'e3', 'f2', 'g1', 'g3', 'h2',]
export const defaultBlackTowerCells8x8 = ['a7', 'b8', 'b6', 'c7', 'd8', 'd6', 'e7', 'f8', 'f6', 'g7', 'h8', 'h6']
export const defaultWhiteTowerCells = defaultWhiteTowerCells8x8
.concat(['i1', 'i3', 'k2', 'b4', 'd4', 'f4', 'h4', 'k4'])
export const defaultBlackTowerCells = defaultBlackTowerCells8x8
.filter((x) => !x.includes('6'))
.concat(['i7', 'k10', 'k8', 'i9', 'a9', 'c9', 'e9', 'g9', 'b10', 'd10', 'f10', 'h10'])
export const getDefaultBlackTowersCells = (boardSize) => {
    return boardSize === 8 ? defaultBlackTowerCells8x8 : defaultBlackTowerCells
}

export const getDefaultWhiteTowersCells = (boardSize) => {
    return boardSize === 8 ? defaultWhiteTowerCells8x8 : defaultWhiteTowerCells
}
export const BaseBoardSize = 8;
export const TopLegendValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm'];
export const SideLegendValues = new Array(12).fill(0).map((i, j) => j + 1);
export const oppositColor = (color) => { return color === PieceColor.w ? PieceColor.b : PieceColor.w }

export const createEmptyBoard = (size = 8) => {
    const GameBoard = {}
    for(let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++) {
            if ((i + j + 1) % 2) {
                const key = `${TopLegendValues[i]}${SideLegendValues[j]}`;
                GameBoard[key] = {boardKey: key, tower: null, neighbors: defineNeighborCells(i ,j, size)}
            }
        }
    }
    return GameBoard
}

export const createStartBoardToDraw = (props) => {
    const { 
        boardOptions,
    } = props
    const {boardSize, reversedBoard} = boardOptions 
    const currentPosition = createStartBoard(boardSize)
    const positionsTree = new Map()
    positionsTree.set('sp', currentPosition)
    return {
        towers: createDefaultTowers(boardSize),
        cellSize: BaseCellSize,
        cellsMap: createCellsMap(boardSize, BaseCellSize, reversedBoard),
        animationStarted: false,
        mandatoryMoves: [],
        moveDone: false,
        mandatoryMoveStep: 0,
        currentPosition,
        mouseDown: false,
        lastMoveSquares: [],
        positionsTree
    }
}

export const createEmptyBoardForCustomPosition = (props) => {
    const {boardSize, reversedBoard} = props.boardOptions
    const currentPosition = createStartBoard(boardSize)
    const positionsTree = new Map()
    positionsTree.set('sp', currentPosition)
    return {
        towers: createOutBoardTowers(boardSize),
        cellSize: BaseCellSize,
        cellsMap: createCellsMap(boardSize, BaseCellSize, reversedBoard),
        currentPosition,
        positionsTree,
        mandatoryMoves: [],
        mandatoryMoveStep: 0,
        mouseDown: false,
        lastMoveSquares: []
    }
}

export const createAnalysisBoard = (props) => { 
    const {boardOptions: {boardSize, reversedBoard}} = props   
    return {
        cellSize: BaseCellSize,
        cellsMap: createCellsMap(boardSize, BaseCellSize, reversedBoard),
        mandatoryMoves: [],
        mandatoryMoveStep: 0,
        mouseDown: false,
        lastMoveSquares: [],
    }
}

export const defineCellDomPosition = (key, cellSize, reversed = false, boardSize = 8) => {
    const topInd = reversed ? TopLegendValues.slice(0, boardSize).reverse() : TopLegendValues.slice(0, boardSize)
    const sideInd = reversed ? SideLegendValues.slice(0, boardSize) : SideLegendValues.slice(0, boardSize).reverse()
    const y = sideInd.indexOf(parseInt(key.slice(1))) * cellSize 
    const x = topInd.indexOf(key[0]) * cellSize
    return {x, y}
}

export const createCellsMap = (boardSize, cellSize = BaseCellSize, reversed = false) => {
    const map = new Map()
    Object.keys(createEmptyBoard(boardSize)).forEach((key) => {
        map.set(key, defineCellDomPosition(key, cellSize, reversed, boardSize))
    })
    return map
}

export const updateCellsMap = (cellsMap, cellSize, reversed = false) => {
    const boardSize = cellsMap.size === 50 ? 10 : 8
    const newMap = new Map()
    cellsMap.forEach((val, key) => {
        newMap.set(key, defineCellDomPosition(key, cellSize, reversed, boardSize))
    })
    return newMap
}

export function defineNeighborCells(i, j, size) {
    const topLegend = TopLegendValues.slice(0, size)
    const sideLegend = SideLegendValues.slice(0, size) 
    const neighbors = {}
    if (i) {
        if (j < size - 1) {
            neighbors.leftUp = `${topLegend[i - 1]}${sideLegend[j + 1]}` 
        }
        if (j) {
            neighbors.leftDown = `${topLegend[i - 1]}${sideLegend[j - 1]}`
        }
    }
    if (i < size - 1) {
        if (j < size - 1) {
                neighbors.rightUp = `${topLegend[i + 1]}${sideLegend[j + 1]}` 
            }
        if (j) {
            neighbors.rightDown = `${topLegend[i + 1]}${sideLegend[j - 1]}`
        }
    }
    return neighbors
}

export const newOnBoardTower = (currentColor, currentType = TowerType.m) => {
    const wPiecesQuantity = currentColor === PieceColor.w ? 1 : 0
    const bPiecesQuantity = currentColor === PieceColor.b ? 1 : 0
    return {currentColor, currentType, wPiecesQuantity, bPiecesQuantity}
}

export function createStartBoard (boardSize) {
    const board = createEmptyBoard(boardSize)
    const DBTC = getDefaultBlackTowersCells(boardSize)
    const DWTC = getDefaultWhiteTowersCells(boardSize)
    for (let key of Object.keys(board)) {
        board[key].tower = (DBTC.includes(key) && newOnBoardTower(PieceColor.b))
        || (DWTC.includes(key) ? newOnBoardTower(PieceColor.w) : null)
    }
    return board
}

const defaultTowerProps = (cell, color) => ({
    currentType: TowerType.m,
    currentColor: color,
    onBoardPosition: cell,
    bPiecesQuantity: color === PieceColor.w ? 0 : 1,
    wPiecesQuantity: color === PieceColor.w ? 1 : 0,
})

export const createDefaultTowers = (boardSize) => {
    const towers = new Map()
    getDefaultBlackTowersCells(boardSize).forEach((key) => {
        towers.set(key, new TowerConstructor(defaultTowerProps(key, PieceColor.b)))
    })
    getDefaultWhiteTowersCells(boardSize).forEach((key) => {
        towers.set(key, new TowerConstructor(defaultTowerProps(key, PieceColor.w)))
    })
    return towers
}

export const createOutBoardTowers = (boardSize) => {
    const towers = new Map()
    getDefaultBlackTowersCells(boardSize).forEach((key, i) => {
        const oBKey = `oB b${i}`
        towers.set(oBKey, new TowerConstructor(defaultTowerProps(oBKey, PieceColor.b)))
    })
    getDefaultWhiteTowersCells(boardSize).forEach((key, i) => {
        const oBKey = `oW w${i}`
        towers.set(oBKey, new TowerConstructor(defaultTowerProps(oBKey, PieceColor.w)))
    })
    return towers
}
