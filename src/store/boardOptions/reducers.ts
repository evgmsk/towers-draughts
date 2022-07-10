import { BaseBoardSize } from "../../constants/gameConstants"
import {  
    BoardNotation, 
    IBoardOptions,
} from "../app-interface"
import { BoardOptionActions, BoardOptionActionTypes } from "./types"


export const InitialBoardOptionsState: IBoardOptions = {
    boardTheme: 'standart',
    withOutLegend: false,
    legendsInside: false,
    boardNotation: BoardNotation.r,
    boardSize: BaseBoardSize,
    reversedBoard: false,
}

 export function boardOptionsReducer(state = InitialBoardOptionsState, action: BoardOptionActionTypes) {
    switch(action.type) {
        case BoardOptionActions.REVERSE_BOARD: {
            return {...state, reversedBoard: action.payload as boolean}
        }
        case BoardOptionActions.SET_BOARD_NOTATION:
            return {...state, boardNotation: action.payload as BoardNotation}
        case BoardOptionActions.SET_BOARD_SIZE:
            return {...state, boardSize: action.payload as number}
        case BoardOptionActions.SET_BOARD_THEME:
            return {...state, boardTheme: action.payload as string}
        case BoardOptionActions.SET_GAME_BOARD_OPTIONS:
            return {...state, ...action.payload as IBoardOptions}
        default:
            return {...state}
    }
}
