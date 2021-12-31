import { IUser } from '../app-interface';
import {UserActions, UserActionTypes} from './types';

export  function loginSucceed(payload: IUser): UserActionTypes{
    return {
        type: UserActions.LOGIN_SUCCEED,
        payload,
    }
};

export  function logout(payload = null): UserActionTypes{
  return {
      type: UserActions.LOGOUT,
      payload
  }
};

export function saveUserToStorage(payload: IUser ): UserActionTypes {
    return {
      type: UserActions.SAVE_USER_STORAGE,
      payload
    }
}

// export function register(payload = null): UserActionTypes {
//     return {
//       type: UserActions.REGISTER_USER,
//       payload
//     }
// }

export function getUserFromStorage(payload: IUser): UserActionTypes {
    return {
      type: UserActions.GET_USER_FROM_STORAGE,
      payload
    }
}

export  function setLanguage(payload: string): UserActionTypes{
  return {
      type: UserActions.SET_PREFERABLE_LANGUAGE,
      payload,
  }
};

export function deleteUserFromStorage(payload = null): UserActionTypes {
    return {
        type: UserActions.DELETE_USER_FROM_STORAGE,
        payload
    }
}
