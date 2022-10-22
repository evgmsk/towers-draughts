import { BaseBoardSize, BaseCellSize} from "../../constants/gameConstants"
import {
    CellsMap,
    IBoard,
    IPositionsTree, MMRResult, PositionsTree, TowersMap,
    TowerTouched
} from "../models"
import { BoardDraughts, BoardActionTypes } from "./types"

export const InitialDraughtsState: IBoard = {
    lastMoveSquares: [],
    towerTouched: null as unknown as TowerTouched,
    cellSize: BaseCellSize,
    cellsMap: {} as CellsMap,
    towers: {} as TowersMap,
    mandatoryMoves: [],
    freeMoves: [],
    mouseDown: false,
    towerView: "face",
    positionsTree: {} as PositionsTree,
    mandatoryMoveStep: 0,
    animationStarted: false,
    moveDone: false,
}

 export function boardReducer(state = InitialDraughtsState, action: BoardActionTypes) {
     console.warn(state, action)
    switch(action.type) {
        case BoardDraughts.UPDATE_POSITION_TREE:
            return {...state, positionsTree: action.payload as IPositionsTree}

        default:
            return {...state}
    }
}
