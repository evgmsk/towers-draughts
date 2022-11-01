import {IMoveToMake, TowersMap, TowerTouched} from "../models";

export const TowersActions = {
    CREATE_GAME_TOWERS: 'CREATE_GAME_TOWERS',
    CREATE_OUTBOARD_TOWERS: 'CREATE_OUTBOARD_TOWERS',
    CREATE_ANALYSIS_TOWERS: 'CREATE_ANALYSIS_TOWERS',
    UPDATE_TOWERS: 'UPDATE_TOWERS',
    DOM_BOARD_NEED_UPDATE: 'DOM_BOARD_NEED_UPDATE',
    TURN: 'TURN',
    UPDATE_BOARD_STATE: 'UPDATE_BOARD_STATE',
    UPDATE_BOARD_MAP: 'UPDATE_BOARD_MAP',
    UPDATE_POSITIONS_TREE: 'UPDATE_POSITIONS_TREE',
    UNDO_LAST_MOVE: 'UNDO_LAST_MOVE',
    REDO_LAST_MOVE: 'REDO_LAST_MOVE',
    UPDATE_TOUCHED_TOWER: 'UPDATE_TOUCHED_TOWER'
}

interface UpdateTouchedTower {
    type: typeof TowersActions.UPDATE_TOUCHED_TOWER,
    payload: TowerTouched
}

interface UpdateBoardSize {
    type: typeof TowersActions.DOM_BOARD_NEED_UPDATE,
    payload: number
}

interface UpdateTowersAction {
    type: typeof TowersActions.REDO_LAST_MOVE,
    payload: TowersMap
}

interface UpdatePositionsTreeAction {
    type: typeof TowersActions.UPDATE_POSITIONS_TREE,
    payload: {key: string, draughts: TowersMap}
}

interface CreateGameTowersAction {
    type: typeof TowersActions.UNDO_LAST_MOVE,
    payload: null
}

interface CreateOutboardTowersAction {
    type: typeof TowersActions.UNDO_LAST_MOVE,
    payload: null
}

interface CreateAnalysisTowersAction {
    type: typeof TowersActions.UNDO_LAST_MOVE,
    payload: null
}

interface TurnAction {
    type: typeof TowersActions.TURN,
    payload: Partial<IMoveToMake>
}

interface UndoLastMoveAction {
    type: typeof TowersActions.UPDATE_TOWERS,
    payload: null
}

interface RedoLastMoveAction {
    type: typeof TowersActions.REDO_LAST_MOVE
    payload: null
}

export type TowersActionTypes =
| TurnAction
| UndoLastMoveAction
| RedoLastMoveAction
| UpdatePositionsTreeAction
| UpdateTowersAction
| CreateGameTowersAction
| CreateAnalysisTowersAction
| CreateOutboardTowersAction
| UpdateBoardSize
| UpdateTouchedTower
