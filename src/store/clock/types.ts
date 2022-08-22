import { IClock } from "../models";

export const ClockActions = {
    WHITE_TICK: 'WHITE_TICK',
    BLACK_TICK: 'BLACK_TICK',
    SET_WHITE_CLOCK: 'SET_WHITE_CLOCK',
    SET_BLACK_CLOCK: 'SET_BLACK_CLOCK',
    WHITE_PRESTART_TICK: 'WHITE_PRESTART_TICK',
    BLACK_PRESTART_TICK: 'BLACK_PRESTART_TICK',
    SET_CLOCK: 'SET_CLOCK'
}

interface WhitePrestartTickAction {
    type: typeof ClockActions.WHITE_PRESTART_TICK,
    payload: number
}

interface BlackPrestartTickAction {
    type: typeof ClockActions.BLACK_PRESTART_TICK,
    payload: number
}

interface BlackTickAction {
    type: typeof ClockActions.BLACK_TICK,
    payload?: number
}

interface WhiteTickAction {
    type: typeof ClockActions.WHITE_TICK,
    payload?: number
}


interface SetWhiteClockAction {
    type: typeof ClockActions.SET_WHITE_CLOCK,
    payload: IClock
}

interface SetBlackClockAction {
    type: typeof ClockActions.SET_BLACK_CLOCK,
    payload: IClock
}

interface SetClockAction {
    type: typeof ClockActions.SET_CLOCK,
    payload: {whiteClock: IClock, blackClock: IClock}
}


export type ClockActionTypes = WhitePrestartTickAction
| BlackPrestartTickAction
| SetWhiteClockAction
| SetBlackClockAction
| WhiteTickAction
| BlackTickAction
| SetClockAction
