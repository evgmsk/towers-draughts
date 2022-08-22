import { IBoardAndTowers, IMoveProps } from "../models";

export const BoardActions = {
    CREATE_GAME_BOARD: 'CREATE_GAME_BOARD',
    CREATE_SETUP_BOARD: 'CREATE_SETUP_BOARD',
    CREATE_ANALYSIS_BOARD: 'CREATE_ANALYSIS_BOARD',
    UPDATE_BOARD_STATE: 'UPDATE_BOARD_STATE',
    UPDATE_BOARD_SIZE: 'UPDATE_BOARD_SIZE',
    UPDATE_BOARD_MAP: 'UPDATE_BOARD_MAP',
    TURN: 'TURN',
    UPDATE_POSITION_TREE: 'CREATE_POSITION_TREE',
    UNDO_LAST_MOVE: 'UNDO_LAST_MOVE',
}

interface UndoLastMoveAction {
    type: typeof BoardActions.UNDO_LAST_MOVE,
    payload: null
}

interface TurnAction {
    type: typeof BoardActions.TURN,
    payload: Partial<IMoveProps>
}

interface UpdateBoardStateAction {
    type: typeof BoardActions.UPDATE_BOARD_STATE,
    payload: Partial<IBoardAndTowers>
}

interface CreateGameBoardAction {
    type: typeof BoardActions.CREATE_GAME_BOARD,
    payload: null
}

interface CreateAnalysisBoardAction {
    type: typeof BoardActions.CREATE_ANALYSIS_BOARD
    payload: null
}

interface CreateSetupBoardAction {
    type: typeof BoardActions.CREATE_SETUP_BOARD
    payload: null
}

interface UpdateBoardSizeAction {
    type: typeof BoardActions.UPDATE_BOARD_SIZE
    payload: number
}

export type BoardActionTypes = UpdateBoardStateAction
| CreateAnalysisBoardAction
| CreateGameBoardAction
| CreateSetupBoardAction
| UpdateBoardSizeAction
| TurnAction
| UndoLastMoveAction
