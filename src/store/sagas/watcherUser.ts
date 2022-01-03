import { call, put, takeLatest, select} from 'redux-saga/effects';

// import { Axios, setAuthorizationHeader } from '../../common/axios';
import {storageName} from '../../constants/gameConstants'
import { IUser } from '../app-interface';
import {UserActions, UserActionTypes} from '../user/types'
// import {sendMessage} from '../../web-sockets/ws'
import { IRootState } from '../rootState&Reducer';

function* workerStorage(action: UserActionTypes ) {
    if (!window) return
    const userData = JSON.parse(localStorage.getItem(storageName) as string)
    if (!userData) {
        return
    }
    yield
    // try {
    //     const payload = JSON.stringify({userId: userData.userId, token: userData.token})
    //     // const respond: {[key: string]: any} = yield call(Axios.post, '/api/auth/token', payload)
    //     // const {token} = respond.data
    //     yield put({type: UserActions.GET_USER_FROM_STORAGE, payload: {...userData, token}})
    //     localStorage.setItem(storageName, JSON.stringify({...userData, token}))
    //     sendMessage({message: 'user authorized', payload: token})
    // } catch(e) {
    //     console.error(e)
    // }
}

function* workerLogin(action: UserActionTypes) {
    const payload = JSON.stringify(action.payload as IUser)
    localStorage.setItem(storageName, payload)
    yield
}

function* workerLogout() {
    let token: string = yield select((state: IRootState) => state.user.token)
    if (!token) {
        token = JSON.parse(localStorage.getItem(storageName) as string).token
    }
    // sendMessage({message: 'user logout'})
    localStorage.removeItem(storageName)
    // setAuthorizationHeader(token)
    // yield call(Axios, '/api/auth/logout')
}

export default function* watcherUser() {
    yield takeLatest(UserActions.CHECK_STORAGE, workerStorage)
    yield takeLatest(UserActions.LOGIN_SUCCEED, workerLogin)
    yield takeLatest(UserActions.LOGOUT, workerLogout)
}
