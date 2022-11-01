import {IMoveToMake, TowersMap, TowerTouched} from "../models";
import { TowersActions, TowersActionTypes } from "./types";

export function updatePositionTree(payload: { key: string, value: TowersMap }) {
    return {
        type: TowersActions.UPDATE_POSITIONS_TREE,
        payload
    }
}

export function updateBoardSize(payload: number) {
    return {
        type: TowersActions.DOM_BOARD_NEED_UPDATE,
        payload
    }
}

export function turn(payload: Partial<IMoveToMake>) {
    return {
        type: TowersActions.TURN,
        payload
    }
}

export function undoLastMove(payload = null): TowersActionTypes {
    return {
        type: TowersActions.UNDO_LAST_MOVE,
        payload
    }
}

export function updateTouchedTower(payload: TowerTouched) {
    return {
        type: TowersActions.UPDATE_TOUCHED_TOWER,
        payload
    }
}

export function createAnalysisTowers() {
    return {
        type: TowersActions.CREATE_ANALYSIS_TOWERS
    }
}

export function createOutboardTowers() {
    return {
        type: TowersActions.CREATE_OUTBOARD_TOWERS
    }
}

export function createGameTowers() {
    return {
        type: TowersActions.CREATE_GAME_TOWERS
    }
}
