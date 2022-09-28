import { IAnalysisState, IBoardToGame, IGameResult, IMoveProps} from "../models";
import { GameAnalysisActions, GameAnalysisTypes } from "./types";


export function setStartPosition(payload = null) {
    return {
        type: GameAnalysisActions.SET_START_POSITION,
        payload
    }
}

export function setBestMoveLine(payload: {move: string, value: number[]}) {
    return {
        type: GameAnalysisActions.SET_BEST_MOVE_LINE,
        payload
    }
}

export function makeNewMove(payload: Partial<IMoveProps>) {
    return {
        type: GameAnalysisActions.MAKE_NEW_MOVE,
        payload
    }
}

export function startNewLine(payload:IMoveProps) {
    return {
        type: GameAnalysisActions.START_NEW_LINE,
        payload
    }
}

export function updateAnalysisState(payload: Partial<IAnalysisState>) {
    return {
        type: GameAnalysisActions.UPDATE_ANALYSIS_STATE,
        payload
    }
}

export function evaluatePosition(payload: boolean) {
    return {
        type: GameAnalysisActions.EVALUATE_POSITION,
        payload
    }
}
export function setDepth(payload:number) {
    return {
        type: GameAnalysisActions.SET_DEPTH,
        payload
    }
}

export function createPositionTree(payload: Map<string, IBoardToGame>): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.CREATE_POSITION_TREE,
        payload
    }
}

export function stepForward(payload = 0): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.STEP_FORWARD,
        payload
    }
}

export function removePiece(payload: boolean): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.REMOVE_PIECE,
        payload
    }
}

export function stepBack(payload = 0): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.STEP_BACK,
        payload
    }
}

export function playMoves(payload = null): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.PLAY_MOVES,
        payload
    }
}

export function goToPosition(payload: {index: number, move: string}): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.GO_TO_POSITION,
        payload
    }
}

export function savePosition(payload: Map<string, IBoardToGame>): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.SAVE_POSITION,
        payload
    }
}

export function updatePosition(payload: Partial<IMoveProps>): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.UPDATE_POSITION,
        payload
    }
}

export function downloadGame(payload: IGameResult): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.DOWNLOAD_GAME,
        payload
    }
}

export function saveGameResult(payload: IGameResult): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.SAVE_GAME_RESULT,
        payload
    }
}

export function analyzeLastGame(payload: boolean): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.ANALYZE_LAST_GAME,
        payload
    }
}

export function settingBoard(payload: boolean): GameAnalysisTypes {
    return {
        type: GameAnalysisActions.SETTING_BOARD,
        payload
    }
}
