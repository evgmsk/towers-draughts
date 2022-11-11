import {BaseBoardSize, BaseCellSize} from "../../constants/gameConstants"
import {
    CellsMap,
    IBoard,
    MMRResult,
    PositionsTree,
    TowersMap,
    TowerTouched
} from "../models"
import { TowersActions, TowersActionTypes } from "./types"
import {createCellsMap, createDefaultTowers} from "../../game-engine/prestart-help-function";

const cellsMap = createCellsMap(BaseBoardSize) as CellsMap

export const InitialTowersState: IBoard = {
    lastMoveSquares: [],
    towerTouched: null as unknown as TowerTouched,
    cellSize: BaseCellSize,
    cellsMap,
    towers: createDefaultTowers(BaseBoardSize) as TowersMap,
    moves: [],
    towerView: "face",
    positionsTree: {} as PositionsTree,
    mandatoryMoveStep: 0,
    moveDone: false,
}

export function towersReducer(state = InitialTowersState, action: TowersActionTypes) {
    const _state = (Object.assign({}, state))
    switch(action.type) {
        case TowersActions.UPDATE_POSITIONS_TREE:
            return Object.assign(_state, {positionsTree: action.payload as PositionsTree})
        case TowersActions.UPDATE_TOWERS:
            return Object.assign(_state, {towers: action.payload as TowersMap})
        case TowersActions.UPDATE_MOVES:
            return Object.assign(_state, {moves: action.payload as MMRResult})
        case TowersActions.UPDATE_BOARD_STATE:
            return Object.assign(_state, action.payload as Partial<IBoard>)
        case TowersActions.UPDATE_TOUCHED_TOWER:
            return Object.assign(_state, {towerTouched: action.payload as TowerTouched})
        default:
            return _state
    }
}
