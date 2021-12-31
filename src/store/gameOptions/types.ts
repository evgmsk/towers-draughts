import { GameVariants, PieceColor, Online, IPlayer, Timing, RivalType, GameType } from "../app-interface";

export const GameOptionActions = {
    CHOOSE_COLOR: 'CHOOSE_COLOR',
    SET_TIME_LIMIT: 'SET_TIME_LIMIT',
    SET_TIME_ADDS: 'SET_TIME_ADDS',
    SET_GAME_TIMING: 'SET_GAME_TIMING',
    SET_RIVAL: 'SET_RIVAL',
    SET_PLAYER: 'SET_PLAYER',
    SET_GAME_VARIANT: 'SET_GAME_VARIANT',
    SET_RIVAL_ONLINE_STATUS: 'SET_RIVAL_ONLINE_STATUS',
    SET_PLAYER_ONLINE_STATUS: 'SET_PLAYER_ONLINE_STATUS',
    SET_GAME_TYPE: 'SET_GAME_TYPE',
    SET_RIVAL_LEVEL: 'SET_RIVAL_LEVEL',
    FIND_RIVAL: 'FIND_RIVAL',
    SET_RIVAL_TYPE: 'SET_RIVAL_TYPE',
    FINISH_GAME_SETUP: 'FINISH_GAME_SETUP',
    WAIT_RIVAL: 'WAIT_RIVAL',
    CANCEL_RIVAL_WAITING: 'CANCEL_RIVAL_WAITING',
    REMATCH_REQUEST: 'REMATCH_REQUEST',
};

interface SetGameTypeAction {
    type: typeof GameOptionActions.SET_GAME_TYPE,
    payload: GameType
}

interface SetRivalLevelAction {
    type: typeof GameOptionActions.SET_RIVAL_LEVEL
    payload: number
}

interface RequestRematchAction {
    type: typeof GameOptionActions.REMATCH_REQUEST,
    payload: null,
}

interface CancelRivalWaitingAction {
    type: typeof GameOptionActions.CANCEL_RIVAL_WAITING,
    payload: null
}

interface FinishGameSetupAcion {
    type: typeof GameOptionActions.FINISH_GAME_SETUP
    payload: boolean
}

interface SetOpponentTypeAction {
    type: typeof GameOptionActions.SET_RIVAL_TYPE
    payload: RivalType
}

interface SetGameTimingAction {
    type: typeof GameOptionActions.SET_GAME_TIMING,
    payload: Timing
}

interface SetOpponentStatusAction {
    type: typeof GameOptionActions.SET_RIVAL_ONLINE_STATUS,
    payload: Online
}

export interface SetGameVariantAction {
    type: typeof GameOptionActions.SET_GAME_VARIANT,
    payload: GameVariants
}

interface SetPlayerAction {
    type: typeof GameOptionActions.SET_RIVAL,
    payload: IPlayer
}

interface SetPlayerStatusAction {
    type: typeof GameOptionActions.SET_RIVAL_ONLINE_STATUS,
    payload: Online
}

export interface ChooseColorAction {
    type: typeof GameOptionActions.CHOOSE_COLOR,
    payload: PieceColor | 'random'
}

interface SetRivalAction {
    type: typeof GameOptionActions.SET_RIVAL,
    payload: IPlayer
}

export interface FindOpponentAction {
    type: typeof GameOptionActions.FIND_RIVAL
}

export interface WaitRivalAction {
    type: typeof GameOptionActions.WAIT_RIVAL,
    payload: boolean
}

export type GameOptionActionTypes = SetRivalAction
| ChooseColorAction
| SetOpponentStatusAction
| SetPlayerStatusAction
| SetPlayerAction
| SetGameVariantAction
| SetGameTimingAction
| SetOpponentTypeAction
| FinishGameSetupAcion
| WaitRivalAction
| CancelRivalWaitingAction
| RequestRematchAction
| SetGameTypeAction
| SetRivalLevelAction
