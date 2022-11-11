import {IBoard, IMoveToMake, MMRResult, TowersMap, TowerTouched} from "../models";

export const TowersActions = {
    // CREATE_GAME_TOWERS: 'CREATE_GAME_TOWERS',
    // CREATE_OUTBOARD_TOWERS: 'CREATE_OUTBOARD_TOWERS',
    UPDATE_TOWERS: 'UPDATE_TOWERS',
    DOM_BOARD_NEED_UPDATE: 'DOM_BOARD_NEED_UPDATE',
    TURN: 'TURN',
    UPDATE_BOARD_STATE: 'UPDATE_BOARD_STATE',
    UPDATE_POSITIONS_TREE: 'UPDATE_POSITIONS_TREE',
    UNDO_LAST_MOVE: 'UNDO_LAST_MOVE',
    UPDATE_TOUCHED_TOWER: 'UPDATE_TOUCHED_TOWER',
    CANCEL_TOWER_TRANSITION: 'CANCEL_TOWER_TRANSITION',
    SET_TOUCHED_TOWER: 'SET_TOUCHED_TOWER',
    UPDATE_MOVES: 'UPDATE_MOVES',
    MOUSE_DOWN: 'MOUSE_DOWN',
    MOUSE_MOVE: 'MOUSE_MOVE',
    MOUSE_UP: 'MOUSE_UP'
}

interface UpdateMoves {
    type: typeof TowersActions.UPDATE_MOVES,
    payload: {mandatoryMoves: MMRResult[], freeMoves: MMRResult[]}
}

interface SetTouchedTower {
    type: typeof TowersActions.SET_TOUCHED_TOWER,
    payload: { key: string, clientX: number, clientY: number }
}

interface CancelTowerTransitionAction {
    type: typeof TowersActions.CANCEL_TOWER_TRANSITION,
    payload: null
}

interface UpdateTouchedTower {
    type: typeof TowersActions.UPDATE_TOUCHED_TOWER,
    payload: TowerTouched
}

interface UpdateBoardState {
    type: typeof TowersActions.UPDATE_BOARD_STATE,
    payload: Partial<IBoard>
}

interface UpdateTowersAction {
    type: typeof TowersActions.UPDATE_TOWERS,
    payload: TowersMap
}

interface UpdatePositionsTreeAction {
    type: typeof TowersActions.UPDATE_POSITIONS_TREE,
    payload: {key: string, towers: TowersMap}
}

interface BoardNeedUpdateAction {
    type: typeof TowersActions.DOM_BOARD_NEED_UPDATE,
    payload: DOMRect
}

// interface CreateGameTowersAction {
//     type: typeof TowersActions.UNDO_LAST_MOVE,
//     payload: null
// }
//
// interface CreateOutboardTowersAction {
//     type: typeof TowersActions.UNDO_LAST_MOVE,
//     payload: null
// }

interface TurnAction {
    type: typeof TowersActions.TURN,
    payload: Partial<IMoveToMake>
}

interface UndoLastMoveAction {
    type: typeof TowersActions.UNDO_LAST_MOVE,
    payload: null
}

export type TowersActionTypes =
| TurnAction
| UndoLastMoveAction
| UpdatePositionsTreeAction
| UpdateTowersAction
| BoardNeedUpdateAction
// | CreateGameTowersAction
// | CreateOutboardTowersAction
| UpdateTouchedTower
| UpdateBoardState
| SetTouchedTower
| UpdateMoves
| CancelTowerTransitionAction
