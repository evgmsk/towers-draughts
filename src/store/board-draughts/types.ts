import {IMoveToMake, TowersMap} from "../models";

export const BoardDraughts = {
    CREATE_DRAUGHTS: 'CREATE_DRAUGHTS',
    UPDATE_DRAUGHTS: 'UPDATE_DRAUGHTS',
    TURN: 'TURN',
    UPDATE_POSITION_TREE: 'UPDATE_POSITION_TREE',
    UNDO_LAST_MOVE: 'UNDO_LAST_MOVE',
    REDO_LAST_MOVE: 'REDO_LAST_MOVE',
}

interface UpdateDraughtsAction {
    type: typeof BoardDraughts.REDO_LAST_MOVE,
    payload: TowersMap
}

interface UpdatePositionsTreeAction {
    type: typeof BoardDraughts.UPDATE_POSITION_TREE,
    payload: {key: string, draughts: TowersMap}
}

interface CreateDraughtsAction {
    type: typeof BoardDraughts.UNDO_LAST_MOVE,
    payload: null
}

interface TurnAction {
    type: typeof BoardDraughts.TURN,
    payload: Partial<IMoveToMake>
}

interface UndoLastMoveAction {
    type: typeof BoardDraughts.UPDATE_DRAUGHTS,
    payload: null
}

interface RedoLastMoveAction {
    type: typeof BoardDraughts.CREATE_DRAUGHTS
    payload: null
}

export type BoardActionTypes =
| TurnAction
| UndoLastMoveAction
| RedoLastMoveAction
| UpdatePositionsTreeAction
| UpdateDraughtsAction
| CreateDraughtsAction
