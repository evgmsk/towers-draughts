import {
    IAnalysisState,
    IGameResult,
    IMoveToMake,
    PieceColor,
    TowersMap,
} from '../models'
import { GameAnalysisActions, GameAnalysisTypes } from './types'

export function setLastMove(payload = { move: '', index: -1 }) {
    return {
        type: GameAnalysisActions.SET_LAST_MOVE,
        payload,
    }
}

export function setStartPosition(payload = true) {
    return {
        type: GameAnalysisActions.SET_START_POSITION,
        payload,
    }
}

export function setMoveOrderAction(payload: PieceColor) {
    return {
        type: GameAnalysisActions.SET_MOVE_ORDER,
        payload,
    }
}

export function setBestMoveLine(payload: { move: string; value: number }[]) {
    return {
        type: GameAnalysisActions.SET_BEST_MOVE_LINE,
        payload,
    }
}

export function makeNewMove(payload: Partial<IMoveToMake>) {
    return {
        type: GameAnalysisActions.MAKE_NEW_MOVE,
        payload,
    }
}

export function startNewLine(payload: Partial<IMoveToMake>) {
    return {
        type: GameAnalysisActions.START_NEW_LINE,
        payload,
    }
}

export function updateAnalysisState(payload: Partial<IAnalysisState>) {
    return {
        type: GameAnalysisActions.UPDATE_ANALYSIS_STATE,
        payload,
    }
}

export function setDepth(payload: number) {
    return {
        type: GameAnalysisActions.SET_DEPTH,
        payload,
    }
}

export function stepForward(payload = 0): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.STEP_FORWARD,
        payload,
    }
}

export function removePiece(payload: boolean): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.REMOVE_PIECE,
        payload,
    }
}

export function stepBack(payload = 0): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.STEP_BACK,
        payload,
    }
}

export function playMoves(payload = null): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.PLAY_MOVES,
        payload,
    }
}

export function goToPosition(payload: {
    index: number
    move: string
}): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.GO_TO_POSITION,
        payload,
    }
}

export function createAnalyzeBoard(payload = null): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.CREATE_ANALYZE_BOARD,
        payload,
    }
}

export function savePosition(payload: TowersMap): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.SAVE_POSITION,
        payload,
    }
}

export function updatePosition(
    payload: Partial<IMoveToMake>
): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.UPDATE_POSITION,
        payload,
    }
}

export function uploadGame(payload: IGameResult): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.UPLOAD_GAME,
        payload,
    }
}

export function analyzePosition(payload: boolean): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.ANALYZE_POSITION,
        payload,
    }
}
