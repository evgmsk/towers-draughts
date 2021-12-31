import { call, select, takeLatest } from 'redux-saga/effects';
// import { setAuthorizationHeader, Axios } from '../../common/axios';
import { sendMessage } from '../../web-sockets/ws';
import { AppActionTypes, AppActions } from '../app/types';

function* workerClose(action: AppActionTypes) {
    const token = (action as {payload: string}).payload
    yield
    // setAuthorizationHeader(token)
    // const {user: {userId}} = yield select()
    // sendMessage({message: 'close', payload: userId})
    // yield call (Axios, '/api/auth/close')
}

export default function* watcherApp() {
    yield takeLatest(AppActions.CLOSE, workerClose)
}