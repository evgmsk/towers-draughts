import { BaseBoardSize, BaseCellSize} from "../../constants/gameConstants"
import { createStartBoard } from "../../game-engine/prestart-help-function-constants"
import { 
    IBoardAndTowers, 
    IBoardToGame,
    TowerTouched 
} from "../app-interface"
import { BoardActions, BoardActionTypes } from "./types"

export const InitialBoardState: IBoardAndTowers = {
    lastMoveSquares: [],
    towerTouched: null as unknown as TowerTouched,
    cellSize: BaseCellSize,
    cellsMap: new Map(),
    currentPosition: createStartBoard(BaseBoardSize),
    towers: new Map(),
    mandatoryMoves: [],
    posibleMoves: new Map(),
    mouseDown: false,
    towerView: "face",
    mandatoryMoveStep: 0,
    animationStarted: false,
    moveDone: false
}

 export function boardReducer(state = InitialBoardState, action: BoardActionTypes) {
    switch(action.type) {
        case BoardActions.UPDATE_POSITION_TREE:
            return {...state, positionsTree: action.payload as Map<string, IBoardToGame>}
        case BoardActions.UPDATE_BOARD_STATE:
            return {...state, ...action.payload as Partial<IBoardAndTowers>}
        default:
            return {...state}
    }
}
