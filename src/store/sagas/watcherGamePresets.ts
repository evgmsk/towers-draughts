import { put, select, takeLatest } from 'redux-saga/effects'

import {
    FindOpponentAction,
    GameOptionActions as GOA,
    SetGameVariantAction,
} from '../gameOptions/types'
import { GameActions as GA } from '../game/types'
import { BoardOptionActions } from '../boardOptions/types'
import mmr from '../../game-engine/moves-resolver'
import { GameVariants } from '../models'
import { IRootState } from '../rootState&Reducer'
import {
    createCellsMap,
    createDefaultTowers,
    createOutBoardTowers,
} from '../../game-engine/prestart-help-function'
import { TowersActions } from '../board-towers/types'
import tur from '../../game-engine/towers-updater'

function* findRival(action: FindOpponentAction) {
    const {
        gameOptions: { rivalType },
    } = yield select()
    if (rivalType === 'PC') {
        yield put({ type: GA.NEW_GAME_VS_PC })
    } else if (rivalType === 'player') {
        console.log('player')
        yield put({ type: GA.NEW_GAME_VS_PLAYER })
    }
}

// function* lookForRival() {
//     const {
//         boardOptions: {boardSize},
//         gameOptions: {
//             playerColor,
//             timing: {timeToGame, adds},
//             gameVariant
//         },
//         user: {
//             rating
//         }
//     } = yield select()
//     const payload = {boardSize, playerColor, timing: `${timeToGame}/${adds}`, gameVariant, rating}
//     const message = "rival"
//     try {
//         console.log('send')
//         // sendMessage({message, payload})
//     } catch(e) {
//         console.log(e)
//         yield put({type: GOA.FINISH_GAME_SETUP, payload: false})
//         yield put({type: GOA.WAIT_RIVAL, payload: false})
//     }
// }

// function* cancelRival() {
//     const {gameOptions: {gameVariant, timing}} = yield select()
//     yield put({type: GOA.WAIT_RIVAL, payload: false})
//     // const payload = {waitingListKey: `${gameVariant}${timing.timeToGame}/${timing.adds}`}
//     // sendMessage({message: 'cancel rival', payload})
// }

function* workerGameVariant(action: SetGameVariantAction) {
    const {
        game: { gameMode },
        analyze: { analyzingPosition },
        boardAndTowers,
        boardOptions,
    } = (yield select()) as IRootState
    const size = action.payload === 'international' ? 10 : 8
    mmr.setProps({ GV: action.payload as GameVariants, size })
    tur.setProps({ GV: action.payload as GameVariants, size })
    yield put({ type: BoardOptionActions.SET_BOARD_SIZE, payload: size })
    const settingPosition = gameMode === 'isOver' && !analyzingPosition
    const cellsMap = createCellsMap(size)
    const towers = settingPosition
        ? createOutBoardTowers({}, size)
        : createDefaultTowers(size)
    const rect = document.querySelector('.board__body')?.getBoundingClientRect()
    if (rect) {
        const boardStateProps = tur.updateCellsAndTowersPosition(
            { ...boardAndTowers, towers, cellsMap },
            { ...boardOptions, boardSize: size },
            rect
        )
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: { ...boardStateProps, moves: [] },
        })
    }
}

export default function* watcherPreGame() {
    yield takeLatest(GOA.FIND_RIVAL, findRival)
    // yield takeLatest(GOA.CANCEL_RIVAL_WAITING, cancelRival)
    yield takeLatest(GOA.SET_GAME_VARIANT, workerGameVariant)
}
