import {
    INeighborCells,
    TowersMap,
    PieceColor,
    TowerConstructor,
    TowerType,
    IBoardToGame,
    PartialTower,
    IBoardOptions,
    IAnalysisBoard,
    IGameBoard,
    CellsMap,
    IPositionsTree, IBoard, Board,
} from "../store/models"
import {
    TopLegendValues,
    SideLegendValues,
    BaseCellSize,
    getDefaultBlackTowersCells,
    getDefaultWhiteTowersCells
} from '../constants/gameConstants'

export const oppositColor = (color: PieceColor) => { return color === PieceColor.w ? PieceColor.b : PieceColor.w }


export const createBoardWithoutDraughts = (size: number = 8) => {
    const GameBoard: Board = {}
    for(let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++) {
            if ((i + j + 1) % 2) {
                const key = `${TopLegendValues[i]}${SideLegendValues[j]}`;
                GameBoard[key] = {boardKey: key, neighbors: defineNeighborCells(i ,j, size)}
            }
        }
    }
    return GameBoard
}
export const createEmptyBoard = (size: number = 8) => {
    const GameBoard: IBoardToGame = {}
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

export const createStartBoardToDraw = (props: {boardOptions: IBoardOptions}): IGameBoard => {
    const { 
        boardOptions,
    } = props
    const {boardSize, reversedBoard} = boardOptions 
    const currentPosition = createStartBoard(boardSize)
    const positionsTree = {} as IPositionsTree
    positionsTree.sp = currentPosition
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
        positionsTree,
        towerView: 'face'
    }
}

export const createEmptyBoardForCustomPosition = (props: {[key: string]: any}): IAnalysisBoard => {
    const {boardSize, reversedBoard} = props.boardOptions
    const currentPosition = createEmptyBoard(boardSize)
    const positionsTree = {} as IPositionsTree
    positionsTree.sp = currentPosition
    return {
        towers: createOutBoardTowers(boardSize),
        cellSize: BaseCellSize,
        cellsMap: createCellsMap(boardSize, BaseCellSize, reversedBoard),
        currentPosition,
        positionsTree,
        mandatoryMoves: [],
        mandatoryMoveStep: 0,
        mouseDown: false,
        lastMoveSquares: [],
        towerView: 'face',
    }
}

export const createAnalysisBoard = (props: {boardOptions: IBoardOptions}): Partial<IAnalysisBoard> => { 
    const {boardOptions: {boardSize, reversedBoard}} = props   
    return {
        cellSize: BaseCellSize,
        cellsMap: createCellsMap(boardSize  as number, BaseCellSize, reversedBoard),
        mandatoryMoves: [],
        mandatoryMoveStep: 0,
        mouseDown: false,
        lastMoveSquares: [],
    }
}

export const defineCellDomPosition = (key: string, cellSize: number, reversed = false, boardSize = 8) => {
    const topInd = reversed ? TopLegendValues.slice(0, boardSize).reverse() : TopLegendValues.slice(0, boardSize)
    const sideInd = reversed ? SideLegendValues.slice(0, boardSize) : SideLegendValues.slice(0, boardSize).reverse()
    const y = sideInd.indexOf(parseInt(key.slice(1))) * cellSize 
    const x = topInd.indexOf(key[0]) * cellSize
    return {x, y}
}

export const createCellsMap = (boardSize: number, cellSize = BaseCellSize, reversed = false) => {
    const map = {} as CellsMap
    Object.keys(createEmptyBoard(boardSize)).forEach((key: string) => {
        map[key] = defineCellDomPosition(key, cellSize, reversed, boardSize)
    })
    return map
}

export const updateCellsMap = (cellsMap: CellsMap, cellSize: number, reversed = false) => {
    const boardSize = Object.keys(cellsMap).length === 50 ? 10 : 8
    const newMap = {} as CellsMap
    Object.keys(cellsMap).forEach((key: string) => {
        newMap[key] = defineCellDomPosition(key, cellSize, reversed, boardSize)
    })
    return newMap
}

export function defineNeighborCells(i: number, j: number, size: number): INeighborCells {
    const topLegend = TopLegendValues.slice(0, size)
    const sideLegend = SideLegendValues.slice(0, size) 
    const neighbors: INeighborCells = {}
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

export const newOnBoardTower = (currentColor: PieceColor, currentType = TowerType.m): PartialTower => {
    const wPiecesQuantity = currentColor === PieceColor.w ? 1 : 0
    const bPiecesQuantity = currentColor === PieceColor.b ? 1 : 0
    return {currentColor, currentType, wPiecesQuantity, bPiecesQuantity}
}

export function createStartBoard (boardSize: number): IBoardToGame {
    const board: IBoardToGame = createEmptyBoard(boardSize)
    const DBTC = getDefaultBlackTowersCells(boardSize)
    const DWTC = getDefaultWhiteTowersCells(boardSize)
    for (let key of Object.keys(board)) {
        board[key].tower = (DBTC.includes(key) && newOnBoardTower(PieceColor.b))
        || (DWTC.includes(key) ? newOnBoardTower(PieceColor.w) : null)
    }
    return board
}

const defaultTowerProps = (cell: string, color: PieceColor, ): TowerConstructor => ({
    currentType: TowerType.m,
    currentColor: color,
    onBoardPosition: cell,
    bPiecesQuantity: color === PieceColor.w ? 0 : 1,
    wPiecesQuantity: color === PieceColor.w ? 1 : 0,
})

export const createDefaultTowers = (boardSize: number): TowersMap => {
    const towers = {} as TowersMap
    getDefaultBlackTowersCells(boardSize).forEach((key: string) => {
        towers[key] = new TowerConstructor(defaultTowerProps(key, PieceColor.b))
    })
    getDefaultWhiteTowersCells(boardSize).forEach((key: string) => {
        towers[key] = new TowerConstructor(defaultTowerProps(key, PieceColor.w))
    })
    return towers
}

export const createOutBoardTowers = (boardSize: number): TowersMap => {
    const towers = {} as TowersMap
    getDefaultBlackTowersCells(boardSize).forEach((key: string, i: number) => {
        const oBKey = `oB b${i}`
        towers[oBKey] = new TowerConstructor(defaultTowerProps(oBKey, PieceColor.b))
    })
    getDefaultWhiteTowersCells(boardSize).forEach((key: string, i: number) => {
        const oBKey = `oW w${i}`
        towers[oBKey] = new TowerConstructor(defaultTowerProps(oBKey, PieceColor.w))
    })
    return towers
}
