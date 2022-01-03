import {GameOptionActions, GameOptionActionTypes} from './types'
import {
    PieceColor,
    IGameOptionState,
    Timing,
    RivalType,
    GameVariants,
    GameType,
} from '../app-interface'

export const InitialGameOptionsState: IGameOptionState = {
    gameVariant: 'towers',
    timing: {timeToGame: 5, adds: 0},
    playerColor: 'random',
    rivalType: 'PC',
    rivalLevel: 1,
    gameSetupFinished: false,
    waitingRival: false,
    gameType: 'ranked'
}

export function gameOptionsReducer(state = InitialGameOptionsState, action: GameOptionActionTypes): IGameOptionState {
    switch(action.type) {
        case GameOptionActions.SET_GAME_TYPE: {
            return {...state, gameType: action.payload as GameType}
        }    
        case(GameOptionActions.CHOOSE_COLOR):
            return {...state, playerColor: action.payload as PieceColor | 'random'}
        case(GameOptionActions.SET_GAME_TIMING): {
            return {...state, timing: action.payload as Timing}
        }
        case(GameOptionActions.SET_RIVAL_TYPE): {
            return {...state, rivalType: action.payload as RivalType}
        }
        case(GameOptionActions.SET_RIVAL_LEVEL): {
            return {...state, rivalLevel: action.payload as number}
        }
        case(GameOptionActions.FINISH_GAME_SETUP):
            return {...state, gameSetupFinished: action.payload as boolean}
        case GameOptionActions.WAIT_RIVAL:
            return {...state, waitingRival: action.payload as boolean}
        case GameOptionActions.SET_GAME_VARIANT:
            return {...state, gameVariant: action.payload as GameVariants}
        default: 
            return {...state}    
    }
}
