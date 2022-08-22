import { IUser } from "../models"

export const UserActions = {
    LOGIN_SUCCEED: 'LOGIN_SUCCEED',
    REGISTER_USER: 'REGISTERE_USER',
    SAVE_USER_STORAGE: 'SAVE_USER_STORAGE',
    GET_USER_FROM_STORAGE: 'GET_USER_FROM_STORAGE',
    CHECK_TOKEN_EXPIRATION: 'CHECK_TOKEN_EXPIRATION',
    EXPIRE_TOKEN: 'TOKEN_EXPEXPIRE',
    DELETE_USER_FROM_STORAGE: 'DELETE_USER_FROM_STORAGE',
    LOGOUT: 'LOGOUT',
    SEND_AUTH_REQUEST: 'SEND_AUTH_REQUEST',
    SET_PREFERABLE_LANGUAGE: 'SET_PREFERABLE_LANGUAGE',
    CHECK_STORAGE: 'CHECK_STORAGE',
}

interface CheckStorageAction {
    type: typeof UserActions.CHECK_STORAGE,
    payload: null
}

interface LoginUserAction {
    type: typeof UserActions.LOGIN_SUCCEED,
    payload: IUser
}

interface SetPreferableLangaugeAction {
    type: typeof UserActions.SET_PREFERABLE_LANGUAGE,
    payload: string
}

interface LogoutUserAction {
    type: typeof UserActions.LOGIN_SUCCEED,
    payload: null
}

interface RegisterUserAction {
    type: typeof UserActions.REGISTER_USER,
    payload: boolean
}

interface SaveUserStorageAction {
    type: typeof UserActions.SAVE_USER_STORAGE,
    payload: IUser
}

interface GetUserStorageAction {
    type: typeof UserActions.GET_USER_FROM_STORAGE,
    payload: IUser
}

interface DeleteUserStorageAction {
    type: typeof UserActions.DELETE_USER_FROM_STORAGE,
    payload: null
}

export type UserActionTypes = GetUserStorageAction 
    | SaveUserStorageAction 
    | RegisterUserAction 
    | LoginUserAction
    | LogoutUserAction
    | DeleteUserStorageAction 
    | SetPreferableLangaugeAction
    | CheckStorageAction
