import {IBoard, IMoveToMake, MMRResult, TowersMap, TowerTouched} from "../models";
import { TowersActions, TowersActionTypes } from "./types";


export function updatePositionTree(payload: { key: string, value: TowersMap }) {
    return {
        type: TowersActions.UPDATE_POSITIONS_TREE,
        payload
    }
}

// export function updateBoardSize(payload: number) {
//     return {
//         type: TowersActions.DOM_BOARD_NEED_UPDATE,
//         payload
//     }
// }

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

export function updateMoves(payload: {moves: MMRResult[]}): TowersActionTypes {
    return {
        type: TowersActions.UPDATE_MOVES,
        payload
    }
}

export function setTouchedTower(payload: { key: string, clientX: number, clientY: number }): TowersActionTypes {
    return {
        type: TowersActions.SET_TOUCHED_TOWER,
        payload
    }
}

export function updateTouchedTower(payload: TowerTouched): TowersActionTypes {
    return {
        type: TowersActions.UPDATE_TOUCHED_TOWER,
        payload
    }
}

export function boardNeedUpdate(payload: DOMRect): TowersActionTypes {
    return {
        type: TowersActions.DOM_BOARD_NEED_UPDATE,
        payload
    }
}


export function cancelTowerTransition(payload = null) {
    return {
        type: TowersActions.CANCEL_TOWER_TRANSITION,
        payload
    }
}

export function updateTowers(payload: TowersMap): TowersActionTypes {
    return {
        type: TowersActions.UPDATE_TOWERS,
        payload
    }
}

export function updateBoardState(payload: Partial<IBoard>): TowersActionTypes {
    return {
        type: TowersActions.UPDATE_BOARD_STATE,
        payload
    }
}


// export function createOutboardTowers() {
//     return {
//         type: TowersActions.CREATE_OUTBOARD_TOWERS
//     }
// }
//
// export function createGameTowers() {
//     return {
//         type: TowersActions.CREATE_GAME_TOWERS
//     }
// }
