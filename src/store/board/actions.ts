import { IBoardAndTowers, IMoveProps } from "../app-interface";
import { BoardActions, BoardActionTypes } from "./types";


export function updateBoardSize(payload: number) {
    return {
        type: BoardActions.UPDATE_BOARD_SIZE,
        payload
    }
}

export function updateBoardState(payload: Partial<IBoardAndTowers>) {
    return {
        type: BoardActions.UPDATE_BOARD_STATE,
        payload
    }
}

export function turn(payload: Partial<IMoveProps>) {
    return {
        type: BoardActions.TURN,
        payload
    }
}

export function undoLastMove(payload = null): BoardActionTypes {
    return {
        type: BoardActions.UNDO_LAST_MOVE,
        payload
    }
}
