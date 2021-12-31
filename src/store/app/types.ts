import { IMessage } from "../app-interface"

export const AppActions = {
    // CHECK_LOCAL_STORAGE: 'CHECK_LOCAL_STORAGE',
    SET_PORTRAIT: 'SET_PORTRAIT',
    CLOSE: 'CLOSE',
    WINDOW_SIZE: 'WINDOW_SIZE',
    ADD_MESSAGE_TO_GAME_CHAT: 'ADD_MESSAGE_TO_GAME_CHAT',
    ADD_MESSAGE_TO_COMMON_CHAT: 'ADD_MESSAGE_TO_COMMON_CHAT',
}

export interface AddToGameChatAction {
    type: typeof AppActions.ADD_MESSAGE_TO_GAME_CHAT
    payload: IMessage
}

export interface AddToCommonChatAction {
    type: typeof AppActions.ADD_MESSAGE_TO_COMMON_CHAT
    payload: IMessage
}

export interface SetWindowSize {
    type: typeof AppActions.WINDOW_SIZE
    payload: {width: number, height: number}
}

export interface SetPortraitAction {
    type: typeof AppActions.SET_PORTRAIT,
    payload: boolean
}

export interface CloseAction {
    type: typeof AppActions.CLOSE,
    payload: string
}

export type AppActionTypes = SetPortraitAction 
| CloseAction 
| SetWindowSize
| AddToCommonChatAction
| AddToGameChatAction
