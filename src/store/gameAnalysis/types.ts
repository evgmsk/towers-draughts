import {IAnalysisState, IBoardToGame, IGameResult, IMoveProps, PieceColor} from "../models"

export const GameAnalysisActions = {
    ANALYZE_LAST_GAME: 'ANALYZE_LAST_GAME',
    UPLOAD_GAME: "UPLOAD_GAME",
    SAVE_GAME_RESULT: 'SAVE_GAME_RESULT',
    SETTING_BOARD: 'SETTING_BOARD',
    UPDATE_POSITION: 'UPDATE_POSITION',
    STEP_FORWARD: 'STEP_FORWARD',
    STEP_BACK: "STEP_BACK",
    SAVE_POSITION: "SAVE_POSITION",
    GO_TO_POSITION: 'GO_TO_POSITION',
    CREATE_POSITION_TREE: 'CREATE_POSITION_TREE',
    UPDATE_ANALYSIS_STATE: 'UPDATE_ANALYSIS_STATE',
    EVALUATE_POSITION: 'EVALUATE_POSITION',
    SET_DEPTH: 'SET_DEPTH',
    PLAY_MOVES: 'PLAY_MOVES',
    SET_START_POSITION: 'SET_START_POSITION',
    REMOVE_PIECE: 'REMOVE_PIECE',
    START_NEW_LINE: 'START_NEW_LINE',
    MAKE_NEW_MOVE: 'MAKE_NEW_MOVE',
    SET_MOVE_ORDER: 'SET_MOVE_ORDER',
    SET_BEST_MOVE_LINE: 'SET_BEST_MOVE_LINE'
} 

export interface MakeNewMoveAction {
    type: typeof GameAnalysisActions.MAKE_NEW_MOVE,
    payload: Partial<IMoveProps>
}

export interface SetMoveOrder {
    type: typeof GameAnalysisActions.SET_MOVE_ORDER
    payload: PieceColor
}

export interface SetBestMoveAction {
    type: typeof GameAnalysisActions.SET_BEST_MOVE_LINE,
    payload: {move: string, value: number}[]
}

export interface StartNewLineAction {
    type: typeof GameAnalysisActions.START_NEW_LINE,
    payload: IMoveProps
}

export interface RemovePieceAction {
    type: typeof GameAnalysisActions.REMOVE_PIECE,
    payload: boolean
}

export interface PlayMovesAction {
    type: typeof GameAnalysisActions.PLAY_MOVES,
    payload: null
}

export interface SetDepthAction {
    type: typeof GameAnalysisActions.SET_DEPTH
    payload: number
}

export interface EvaluatePositionAction {
    type: typeof GameAnalysisActions.EVALUATE_POSITION
    payload: boolean
}

export interface UpdateAnalysisStateAction {
    type: typeof GameAnalysisActions.UPDATE_ANALYSIS_STATE,
    payload: Partial<IAnalysisState>
}

export interface CreatePositionTreeAction {
    type: typeof GameAnalysisActions.CREATE_POSITION_TREE,
    payload: Map<string, IBoardToGame>
}

export interface SavePositionAction {
    type: typeof GameAnalysisActions.SAVE_POSITION,
    payload: Map<string, IBoardToGame>
}

export interface GoToPositionAction {
    type: typeof GameAnalysisActions.GO_TO_POSITION
    payload: {index: number, move: string}
}

export interface StepForwardAction {
    type: typeof GameAnalysisActions.STEP_FORWARD,
    payload: number
}

export interface StepBackAction {
    type: typeof GameAnalysisActions.STEP_BACK,
    payload: number
}

export interface UpdatePositionActions {
    type: typeof GameAnalysisActions.UPDATE_POSITION,
    payload: Partial<IMoveProps>
}

export interface SettingBoardAction {
    type: typeof GameAnalysisActions.SETTING_BOARD
    payload: boolean
}

export interface AnalyzeLastGame {
    type: typeof GameAnalysisActions.ANALYZE_LAST_GAME,
    payload: boolean
}

export interface UploadGame {
    type: typeof GameAnalysisActions.UPLOAD_GAME,
    payload: IGameResult
}

export interface SaveGameResult {
    type: typeof GameAnalysisActions.SAVE_GAME_RESULT,
    payload: IGameResult
}

export interface SetStartPositionAction {
    type: typeof GameAnalysisActions.SET_START_POSITION,
    payload: null
}

export type GameAnalysisTypes = AnalyzeLastGame 
| UploadGame
| SaveGameResult 
| SettingBoardAction 
| UpdatePositionActions
| GoToPositionAction
| StepForwardAction
| StepBackAction
| SavePositionAction
| CreatePositionTreeAction
| UpdateAnalysisStateAction
| RemovePieceAction
| StartNewLineAction
| MakeNewMoveAction
| SetStartPositionAction
| SetBestMoveAction
| EvaluatePositionAction
| PlayMovesAction
| SetDepthAction
| SetMoveOrder


