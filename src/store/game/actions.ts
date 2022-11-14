import {
    IGameState,
    EndGameConditions,
    IGameMode,
    PieceColor,
    INewGameProps, TowersMap, IMoveToMake
} from '../models'
import {GameActionTypes, GameActions} from './types'

export function clearHistory(payload = null): GameActionTypes {
    return {
        type: GameActions.CLEAR_HISTORY,
        payload
    }
}

export function surrender(payload: PieceColor): GameActionTypes {
    return {
        type: GameActions.SURRENDER,
        payload
    }
}

export function setGameMode(payload: IGameMode): GameActionTypes {
    return {
        type: GameActions.SET_GAME_MODE,
        payload
    }
}

export function setGame(payload: Partial<IGameState>): GameActionTypes {
    return {
        type: GameActions.SET_GAME,
        payload
    }
}

export function updateGameState(payload: TowersMap): GameActionTypes {
    return {
        type: GameActions.UPDATE_GAME_STATE,
        payload
    }
}

export function setGameStarted(payload: boolean): GameActionTypes {
    return ({
        type: GameActions.SET_GAME_STARTED,
        payload
    })   
}

export function endGame(payload: EndGameConditions): GameActionTypes {
    return {
        type: GameActions.END_GAME,
        payload
    }
}

export function makeMove(payload: IMoveToMake): GameActionTypes {
    return {
        type: GameActions.MAKE_MOVE,
        payload
    }
}

export function cancelGame(): GameActionTypes {
    return {
        type: GameActions.CANCEL_GAME
    }
}

export function declineDraw(payload?: boolean): GameActionTypes {
    return {
        type: GameActions.DECLINE_DRAW,
        payload
    }
}

export function opponentOfferDraw(): GameActionTypes {
    return {
        type: GameActions.RIVAL_OFFER_DRAW
    }
}

export function offerDraw(): GameActionTypes {
    return {
        type: GameActions.OFFER_DRAW
    }
}

export function newGameVSPC(payload = null): GameActionTypes {
    return {
        type: GameActions.NEW_GAME_VS_PLAYER,
        payload
    }
}

export function newGameVSPlayer(payload: INewGameProps): GameActionTypes {
    return {
        type: GameActions.NEW_GAME_VS_PLAYER,
        payload
    }
}
