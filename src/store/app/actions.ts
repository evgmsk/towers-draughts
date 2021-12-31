import { IMessage } from '../app-interface'
import {AppActions, AppActionTypes} from './types'

export function addMessageToGameChat(payload: IMessage): AppActionTypes {
    return {
        type: AppActions.ADD_MESSAGE_TO_GAME_CHAT,
        payload
    } 
}

export function setPortrait(payload: boolean): AppActionTypes {
    return {
        type: AppActions.SET_PORTRAIT,
        payload
    }
}

export function close(payload: string): AppActionTypes {
    return ({
        type: AppActions.CLOSE, 
        payload
    })
}

export function startGame(payload: string): AppActionTypes {
    return ({
        type: AppActions.CLOSE,
        payload
    })
}

export function setWindowSize(payload: {width: number, height: number}): AppActionTypes {
    return {
        type: AppActions.WINDOW_SIZE,
        payload
    }
}
