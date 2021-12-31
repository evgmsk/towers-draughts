import { BoardNotation, IBoardOptions } from "../app-interface";
import { BoardOptionActions, BoardOptionActionTypes } from "./types";


export function setBaordTheme(payload: string): BoardOptionActionTypes {
    return {
        type: BoardOptionActions.SET_GAME_BOARD_OPTIONS,
        payload
    }
}
export function updateBoardOptions(payload: Partial<IBoardOptions>): BoardOptionActionTypes {
    return {
        type: BoardOptionActions.SET_GAME_BOARD_OPTIONS,
        payload
    }
}

export function setBoardSize(payload: number): BoardOptionActionTypes {
    return {
        type: BoardOptionActions.SET_BOARD_SIZE,
        payload
    }
}

export function setBoardNotation(payload: BoardNotation): BoardOptionActionTypes {
    return {
        type: BoardOptionActions.SET_BOARD_NOTATION,
        payload
    }
}

export function reverseBoard(payload: boolean): BoardOptionActionTypes {
    return {
        type: BoardOptionActions.REVERSE_BOARD,
        payload
    }
}
