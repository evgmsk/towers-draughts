import { IPlayer, Online, RivalType, PieceColor, Timing, GameVariants, GameType } from '../app-interface';
import {GameOptionActionTypes, GameOptionActions, FindOpponentAction} from './types'


export function setRivalLevel(payload: number): GameOptionActionTypes {
    return {
        type: GameOptionActions.SET_RIVAL_LEVEL,
        payload
    }
}

export function setPlayerColor(payload: PieceColor | 'random'): GameOptionActionTypes {
    return ({
        type: GameOptionActions.CHOOSE_COLOR,
        payload
    });
};

export function setPlayer(payload: IPlayer): GameOptionActionTypes {
    return ({
        type: GameOptionActions.SET_PLAYER,
        payload
    });
};

export function setOpponent(payload: IPlayer): GameOptionActionTypes {
    return ({
        type: GameOptionActions.SET_RIVAL,
        payload
    });
};

export function setOpponentType(payload: RivalType): GameOptionActionTypes {
    return {
        type: GameOptionActions.SET_RIVAL_TYPE,
        payload
    }
}

export function setOpponentStatus(payload: Online): GameOptionActionTypes {
    return ({
        type: GameOptionActions.SET_RIVAL_ONLINE_STATUS,
        payload
    });
};

export function setTiming(payload: Timing): GameOptionActionTypes {
    return ({
        type: GameOptionActions.SET_GAME_TIMING,
        payload
    });
};

export function setPlayerStatus (payload: Online): GameOptionActionTypes {
    return {
        type: GameOptionActions.SET_RIVAL_ONLINE_STATUS,
        payload
    }
}

export function findRival(): FindOpponentAction  {
    return {type: GameOptionActions.FIND_RIVAL}
}

export function finishGameSetup(payload: boolean): GameOptionActionTypes {
    return {
        type: GameOptionActions.FINISH_GAME_SETUP,
        payload
    }
}
 
export function waitingRival(payload: boolean): GameOptionActionTypes {
    return {
        type: GameOptionActions.WAIT_RIVAL,
        payload
    }
}

export function setGameVariant(payload: GameVariants): GameOptionActionTypes {
    return {
        type: GameOptionActions.SET_GAME_VARIANT,
        payload
    }
}

export function cancelRivalWaiting(payload = null): GameOptionActionTypes {
    return {
        type: GameOptionActions.CANCEL_RIVAL_WAITING,
        payload
    }
}

export function requestRematch(payload = null): GameOptionActionTypes {
    return {
        type: GameOptionActions.REMATCH_REQUEST,
        payload
    }
}

export function setGameType(payload: GameType): GameOptionActionTypes {
    return {
        type: GameOptionActions.SET_GAME_TYPE,
        payload
    }
}
