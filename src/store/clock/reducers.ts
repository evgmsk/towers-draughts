import { PrestartTimeLimit, DefaultTime } from "../../constants/gameConstants"
import {  IClock } from "../app-interface"
import { ClockActionTypes, ClockActions } from "../clock/types"

export interface IClockState  {whiteClock: IClock, blackClock: IClock}

export const InitialClockState: IClockState = {
    whiteClock: {
        timeToFirstMove: PrestartTimeLimit,
        timeToGame: DefaultTime,
        adds: 0
    },
    blackClock:{
        timeToFirstMove: PrestartTimeLimit,
        timeToGame: DefaultTime,
        adds: 0
    },
}

export function clockReducer(state: IClockState = InitialClockState, action: ClockActionTypes): IClockState {
    switch(action.type) {
        case ClockActions.SET_BLACK_CLOCK: {
            return {...state, blackClock: action.payload as IClock}
        }
        case ClockActions.SET_WHITE_CLOCK: {
            return {...state, whiteClock: action.payload as IClock}
        }
        case(ClockActions.BLACK_PRESTART_TICK): {
            const timeToFirstMove = state.blackClock.timeToFirstMove! - 1
            return {...state, blackClock: {...state.blackClock, timeToFirstMove}}
        }   
        case(ClockActions.WHITE_PRESTART_TICK): {
            const timeToFirstMove = state.whiteClock.timeToFirstMove! - 1
            return {...state, whiteClock: {...state.whiteClock, timeToFirstMove}}
        }
        case(ClockActions.WHITE_TICK): {
            const timeToGame = state.whiteClock.timeToGame - 1
            return {...state, whiteClock: {...state.whiteClock, timeToGame}}
        }   
        case(ClockActions.BLACK_TICK): {
            const timeToGame = state.blackClock.timeToGame - 1
            return {...state, blackClock: {...state.blackClock, timeToGame}}
        }
        case ClockActions.SET_CLOCK: {
            return {...state, ...action.payload as {whiteClock: IClock, blackClock: IClock}}
        }
        default:
            return state 
    }
}
