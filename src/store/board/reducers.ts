import { BaseBoardSize, BaseCellSize} from "../../constants/gameConstants"
import { createStartBoard } from "../../game-engine/prestart-help-function-constants"
import {
    CellsMap,
    IGameBoard,
    IPositionsTree,
    TowersMap,
    TowerTouched
} from "../models"
import { BoardActions, BoardActionTypes } from "./types"

export const InitialBoardState: IGameBoard = {
    lastMoveSquares: [],
    towerTouched: null as unknown as TowerTouched,
    cellSize: BaseCellSize,
    cellsMap: {} as CellsMap,
    currentPosition: createStartBoard(BaseBoardSize),
    towers: {} as TowersMap,
    mandatoryMoves: [],
    // possibleMoves: {},
    mouseDown: false,
    towerView: "face",
    mandatoryMoveStep: 0,
    animationStarted: false,
    moveDone: false
}

 export function boardReducer(state = InitialBoardState, action: BoardActionTypes) {
    switch(action.type) {
        case BoardActions.UPDATE_POSITION_TREE:
            return {...state, positionsTree: action.payload as IPositionsTree}
        case BoardActions.UPDATE_BOARD_STATE:
            return {...state, ...action.payload as Partial<IGameBoard>}
        default:
            return {...state}
    }
}
