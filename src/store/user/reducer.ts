import { IUser } from '../models'
import { UserActions as UA, UserActionTypes } from './types'

export const InitialUserState: IUser = {
    name: null as unknown as string,
    userId: null as unknown as string,
    token: null as unknown as string,
    rating: 0,
    language: navigator.language,
}

export function userReducer(
    state = InitialUserState,
    action: UserActionTypes
): IUser {
    switch (action.type) {
        case UA.LOGIN_SUCCEED: {
            return { ...state, ...(action.payload as IUser) }
        }
        case UA.SET_PREFERABLE_LANGUAGE:
            return { ...state, language: action.payload as string }
        case UA.LOGOUT:
            return { ...state, ...InitialUserState }
        case UA.GET_USER_FROM_STORAGE: {
            return { ...state, ...(action.payload as IUser) }
        }
        default:
            return state
    }
}
