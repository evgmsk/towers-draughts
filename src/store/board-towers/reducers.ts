import { BaseBoardSize, BaseCellSize} from "../../constants/gameConstants"
import {
    CellsMap,
    IBoard,
    IPositionsTree,
    PositionsTree,
    TowersMap,
    TowerTouched
} from "../models"
import { TowersActions, TowersActionTypes } from "./types"

export const InitialTowersState: IBoard = {
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

export function towersReducer(state = InitialTowersState, action: TowersActionTypes) {
    // console.warn(state, action)
    const _state = (Object.assign({}, state))
    switch(action.type) {
        case TowersActions.UPDATE_POSITIONS_TREE:
            return Object.assign(_state, {positionsTree: action.payload as IPositionsTree})
        case TowersActions.UPDATE_TOWERS:
            return Object.assign(_state, {towers: action.payload as TowersMap})
        case TowersActions.UPDATE_BOARD_STATE:
            return Object.assign(_state, action.payload as Partial<IBoard>)
        case TowersActions.UPDATE_BOARD_MAP:
            return Object.assign(_state, action.payload as CellsMap)
        case TowersActions.UPDATE_TOUCHED_TOWER:
            return Object.assign(_state, action.payload as TowerTouched)
        default:
            return _state
    }
}
