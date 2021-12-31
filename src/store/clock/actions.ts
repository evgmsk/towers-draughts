import { IClock } from "../app-interface"
import { ClockActionTypes, ClockActions } from "../clock/types"

export function setClock(payload: any): ClockActionTypes {
    return {
        type: ClockActions.SET_CLOCK,
        payload
    }
}

export function blackPrestartTick(): ClockActionTypes {
    return {
        type: ClockActions.BLACK_PRESTART_TICK,
    }
}

export function whitePrestartTick(): ClockActionTypes {
    return {
        type: ClockActions.WHITE_PRESTART_TICK,
    } 
}

export function blackTick(): ClockActionTypes {
    return {
        type: ClockActions.BLACK_TICK,
    }
}

export function whiteTick(): ClockActionTypes {
    return {
        type: ClockActions.WHITE_TICK,
    }
}

export function setBlackClock(payload: IClock): ClockActionTypes {
    return {
        type: ClockActions.SET_BLACK_CLOCK,
        payload
    }
}

export function setWhiteClock(payload: IClock): ClockActionTypes {
    return {
        type: ClockActions.SET_WHITE_CLOCK,
        payload
    }
}
   