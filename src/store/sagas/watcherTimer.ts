import { put, takeLatest, delay, select} from 'redux-saga/effects';

import { Interval} from '../../constants/gameConstants';
import { PieceColor } from '../models';
import { ClockActions, ClockActionTypes } from '../clock/types';
import { GameActions, GameActionTypes} from '../game/types'
import { GameAnalysisActions } from '../gameAnalysis/types';

function* workerGameClock() { 
    const {
        game: {
            gameStarted,
            gameConfirmed,
            moveOrder
        },
        clock: {
            whiteClock,
            blackClock,
        }
    } = yield select()
    if (!gameConfirmed || !gameStarted) {
        return
    }
    if (whiteClock.timeToGame <= 0 || blackClock.timeToGame <= 0) {
        yield put ({type: GameActions.END_GAME, payload: 'outOfTime'})
        return
    }
    yield delay(Interval)
    if (moveOrder.pieceOrder === PieceColor.w) {
        yield put({type: ClockActions.WHITE_TICK})
    } else {
        yield put({type: ClockActions.BLACK_TICK})
    }  
}


function* workerStartClock(action: GameActionTypes) {
    const {gameOptions: {rivalType}, game: {gameConfirmed}} = yield select()
    console.warn(rivalType, action.payload === 'isPlaying' && rivalType !== 'PC')
    if (action.payload === 'isPlaying' && rivalType !== 'PC') {
        console.warn('oops')
        yield gameConfirmed
            ? put({type: ClockActions.WHITE_TICK})
            : put({type: ClockActions.WHITE_PRESTART_TICK})
    }
}

function* workerPreTicks(action: ClockActionTypes) {
    const {
        clock: {
            blackClock,
            whiteClock,
        },
        game: {
            gameMode,
            gameConfirmed,
        },
    } = yield select()
    if (gameMode !== 'isPlaying' || gameConfirmed) {
        return
    }
    if (whiteClock.timeToFirstMove <= 0 || blackClock.timeToFirstMove <= 0) {
        yield put({type: GameActions.CANCEL_GAME})
        yield put({type: GameAnalysisActions.SAVE_GAME_RESULT, payload: {}})
        return
    }
    yield delay(Interval)
    const {game: {moveOrder: {pieceOrder}}} = yield select()
    if (pieceOrder === PieceColor.b) {
        yield put({type: ClockActions.BLACK_PRESTART_TICK})
    } else {
        yield put({type: ClockActions.WHITE_PRESTART_TICK})
    } 
}

export default function* watcherTimer() {
    yield takeLatest(GameActions.SET_GAME_MODE, workerStartClock)
    yield takeLatest(ClockActions.WHITE_PRESTART_TICK, workerPreTicks)
    yield takeLatest(ClockActions.BLACK_PRESTART_TICK, workerPreTicks)
    yield takeLatest(ClockActions.BLACK_TICK, workerGameClock)
    yield takeLatest(ClockActions.WHITE_TICK, workerGameClock)
}
