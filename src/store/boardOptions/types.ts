import { BoardNotation, IBoardOptions } from "../models";

export const BoardOptionActions = {
    SET_GAME_BOARD_OPTIONS: 'SET_GAME_BOARD_OPTIONS',
    REVERSE_BOARD: 'REVERSE_BOARD',
    SET_BOARD_THEME: 'SET_BOARD_THEME',
    SET_BOARD_NOTATION: 'SET_BOARD_NOTATION',
    SET_BOARD_SIZE: 'SET_BOARD_SIZE'
}

interface SetBoardSizeAction {
    type: typeof BoardOptionActions.SET_GAME_BOARD_OPTIONS
    payload: number
}

interface UpdateBoardOptionsAction {
    type: typeof BoardOptionActions.SET_GAME_BOARD_OPTIONS
    payload: Partial<IBoardOptions>
}

export interface ReverseBoardAction {
    type: typeof BoardOptionActions.REVERSE_BOARD
    payload: boolean
}

interface SetBoardThemeAction {
    type: typeof BoardOptionActions.SET_BOARD_THEME
    payload: string
}

interface SetBoardNotationAction {
    type: typeof BoardOptionActions.SET_BOARD_THEME
    payload: BoardNotation
}

export type BoardOptionActionTypes = UpdateBoardOptionsAction
| SetBoardThemeAction
| ReverseBoardAction
| SetBoardNotationAction
| SetBoardSizeAction
