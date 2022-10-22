import {EndGameConditions, IBoardToGame, INewGameProps, IGameMode, IGameState, IMoveOrder, IMoveProps, PieceColor} from "../models";
// import { GameOptionActions } from "../gameOptions/types";

export const GameActions = {
    SET_MOVE_ORDER: 'SET_MOVE_ORDER',
    SET_GAME_STARTED: 'SET_GAME_STARTED',
    MAKE_MOVE: 'MAKE_MOVE',
    CONFIRM_START_GAME: 'CONFIRM_START_GAME',
    UPDATE_GAME_STATE: 'UPDATE_GAME_STATE',
    INEFFECTIVE_MOVE: 'INEFFECTIVE_MOVE',
    SAVE_MOVE_TO_HISTORY: 'SAVE_HISTORY',
    SET_PLAYER_MOVE_ORDER: 'SET_PLAYER_MOVE_ORDER',
    SET_GAME: 'SET_GAME',
    END_GAME: 'END_GAME',
    OFFER_DRAW: 'OFFER_DRAW',
    DECLINE_DRAW: 'DECLINE_DRAW',
    RIVAL_OFFER_DRAW: 'RIVAL_OFFER_DRAW',
    SURRENDER: 'SURRENDER',
    SET_GAME_MODE: 'SET_GAME_MODE',
    CANCEL_GAME: 'CANCEL_GAME',
    NEW_GAME_VS_PC: 'NEW_GAME_VS_PC',
    NEW_GAME_VS_PLAYER: 'NEW_GAME_VS_PLAYER',
    CLEAR_HISTORY: 'CLEAR_HISTORY',
}

interface ClearHistoryAction {
    type: typeof GameActions.CLEAR_HISTORY,
    payload: null
}

interface NewGameVSPCAction {
    type: typeof GameActions.NEW_GAME_VS_PC,
    payload: null
}

interface NewGameVSPlayerAction {
    type: typeof GameActions.NEW_GAME_VS_PLAYER,
    payload: INewGameProps
}

interface SurrenderAction {
    type: typeof GameActions.SURRENDER,
    payload: PieceColor
}

interface CancelGameAction {
    type: typeof GameActions.CANCEL_GAME,
    payload: null
}

interface SetGameModeAction {
    type: typeof GameActions.SET_GAME_MODE,
    payload: IGameMode
}

interface SetGameAction {
    type: typeof GameActions.SET_GAME,
    payload: Partial<IGameState>
}

interface IneffectiveMoveAction {
    type: typeof GameActions.INEFFECTIVE_MOVE,
    payload: number
}

interface OpponentOfferDrawAction {
    type: typeof GameActions.RIVAL_OFFER_DRAW
    payload: null
}

interface SetPlayerMoveOrderAction {
    type: typeof GameActions.SET_PLAYER_MOVE_ORDER,
    payload: boolean
}

interface DeclineDrawAction {
    type: typeof GameActions.DECLINE_DRAW,
    payload?: boolean
}

interface SaveHistoryAction {
    type: typeof GameActions.SAVE_MOVE_TO_HISTORY,
    payload: string[]
}

interface SetMoveOrderAction {
    type: typeof GameActions.SET_MOVE_ORDER,
    payload: IMoveOrder
}

interface UpdateGameStateAction {
    type: typeof GameActions.UPDATE_GAME_STATE,
    payload: IBoardToGame
}

interface SetGameStartedAction {
    type: typeof GameActions.SET_GAME_STARTED,
    payload: boolean
}

interface OfferDrawAction {
    type: typeof GameActions.OFFER_DRAW,
    payload: boolean
}

interface MakeMoveAction {
    type: typeof GameActions.MAKE_MOVE,
    payload: IMoveProps
}

interface ConfirmStartGameAction {
    type: typeof GameActions.CONFIRM_START_GAME,
    payload: boolean
}

interface EndGameAction {
    type: typeof GameActions.END_GAME,
    payload: EndGameConditions
}

export type GameActionTypes = 
| IneffectiveMoveAction
| CancelGameAction
| SetGameStartedAction
| SetMoveOrderAction
| UpdateGameStateAction
| SaveHistoryAction
| SetPlayerMoveOrderAction
| EndGameAction
| SetGameAction
| SurrenderAction
| MakeMoveAction
| OfferDrawAction
| OpponentOfferDrawAction
| DeclineDrawAction
| ConfirmStartGameAction
| SetGameModeAction
| NewGameVSPCAction
| NewGameVSPlayerAction
| CancelGameAction
| ClearHistoryAction
