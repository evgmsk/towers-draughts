import { call, put, takeLatest, select } from 'redux-saga/effects';

import {FindOpponentAction, SetGameVariantAction, GameOptionActions as GOA} from '../gameOptions/types'
// import { BoardOptionActions as BOA } from '../boardOptions/types';
import {GameActions as GA} from '../game/types'
import { createEmptyBoard} from '../../game-engine/prestart-help-function-constants';
// import { sendMessage } from '../../web-sockets/ws';
import { GameAnalysisActions } from '../gameAnalysis/types';
import { BoardOptionActions } from '../boardOptions/types';


 
function* findRival(action: FindOpponentAction) {
    const {gameOptions: {rivalType}} = yield select()
    if (rivalType === 'PC') {
        yield put({type: GA.NEW_GAME_VS_PC})
    } else if (rivalType === 'player') {
        console.log('look for rival') 
        yield put({type: GOA.WAIT_RIVAL, payload: true})
        yield call(lookForRival)
    }
}

function* lookForRival() {
    const {
        boardOptions: {boardSize}, 
        gameOptions: {
            playerColor,
            timing: {timeToGame, adds}, 
            gameVariant
        },
        user: {
            rating
        }
    } = yield select()
    const payload = {boardSize, playerColor, timing: `${timeToGame}/${adds}`, gameVariant, rating}
    const message = "rival"
    try {
        console.log('send')
        // sendMessage({message, payload})
    } catch(e) {
        console.log(e)
        yield put({type: GOA.FINISH_GAME_SETUP, payload: false})
        yield put({type: GOA.WAIT_RIVAL, payload: false})
    }
}


function* cancelRival() {
    const {gameOptions: {gameVariant, timing}} = yield select()
    yield put({type: GOA.WAIT_RIVAL, payload: false})
    const payload = {waitingListKey: `${gameVariant}${timing.timeToGame}/${timing.adds}`}
    // sendMessage({message: 'cancel rival', payload})
}

function* workerGameVariant(action: SetGameVariantAction) {
    if (action.payload === 'international') {
        yield put({type: BoardOptionActions.SET_BOARD_SIZE, payload: 10})
        yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload: {currentPosition: createEmptyBoard(10)}})
    } else {
        yield put({type: BoardOptionActions.SET_BOARD_SIZE, payload: 8})
        yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload: {currentPosition: createEmptyBoard(8)}})
    }
}

export default function* watcherPreGame() {
    yield takeLatest(GOA.FIND_RIVAL, findRival);
    yield takeLatest(GOA.CANCEL_RIVAL_WAITING, cancelRival)
    yield takeLatest(GOA.SET_GAME_VARIANT, workerGameVariant)
}
