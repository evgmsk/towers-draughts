import { IApp, IMessage } from '../models'
import {AppActions, AppActionTypes} from './types'

export const AppDefaultState: IApp = {
    windowSize: {width: window?.innerWidth || 100, height: window?.innerHeight || 100},
    portrait: (window?.innerWidth || 100) / (window?.innerHeight || 100) < 1.3,
    commonChat: [] as IMessage[],
    gameChat: [] as IMessage[],
}


export function appReducer(state = AppDefaultState, action: AppActionTypes): IApp {
    switch (action.type) {
        case AppActions.WINDOW_SIZE:
            return {...state, windowSize: action.payload as {width: number, height: number}}
        case AppActions.SET_PORTRAIT:
            return {...state, portrait: action.payload as boolean}
        default:
            return state
    }
}
