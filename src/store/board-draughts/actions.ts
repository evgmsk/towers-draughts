import { IMoveToMake, TowersMap} from "../models";
import { BoardDraughts, BoardActionTypes } from "./types";

export function updatePositionTree(payload: { key: string, value: TowersMap }) {
    return {
        type: BoardDraughts.UPDATE_POSITION_TREE,
        payload
    }
}

export function turn(payload: Partial<IMoveToMake>) {
    return {
        type: BoardDraughts.TURN,
        payload
    }
}

export function undoLastMove(payload = null): BoardActionTypes {
    return {
        type: BoardDraughts.UNDO_LAST_MOVE,
        payload
    }
}

export function redoLastMove(payload = null): BoardActionTypes {
    return {
        type: BoardDraughts.REDO_LAST_MOVE,
        payload
    }
}

export function updateDraughts(payload: TowersMap) {
    return {
        type: BoardDraughts.UPDATE_DRAUGHTS,
        payload
    }
}

