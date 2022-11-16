import { put, takeLatest, select, delay } from 'redux-saga/effects';
import {
    IGameResult,
    PieceColor,
    EndGameConditions,
    IGameState,
    IMoveOrder,
    IPlayer,
    IClock, IMoveToMake
} from '../models';
import {GameActions, GameActions as GM, GameActionTypes, GameActionTypes as GMA} from '../game/types'
import {ClockActions} from '../clock/types'

import { oppositeColor } from '../../game-engine/gameplay-helper-functions';
// import { Axios, setAuthorizationHeader } from '../../common/axios';
import { GameAnalysisActions } from '../gameAnalysis/types';
import { InitialGameState } from '../game/reducers';
import {AnimationDuration, DefaultMinDepth} from '../../constants/gameConstants';
import { AppActions } from '../app/types';
import {GameOptionActions as GOA} from '../gameOptions/types'
import {BoardOptionActions as BOA} from '../boardOptions/types'
import {IRootState} from "../rootState&Reducer";
import movesTree from "../../game-engine/tower-tree";
import {TowersActions} from "../board-towers/types";
import {InitialTowersState} from "../board-towers/reducers";

function* workerNewGameVSPlayer() {
    yield put({type: GOA.WAIT_RIVAL, payload: false})
    const { 
        game: {gameMode},
        gameOptions: {timing, playerColor}
    } = yield select()
    if (gameMode === 'isPlaying') {
        yield put({type: GameActions.SET_GAME, payload: InitialGameState})
    }
    let color: PieceColor = playerColor
    if (playerColor === 'random') {
        color = Math.random() < .5 ? PieceColor.w : PieceColor.b
    }
    const {timeToGame, adds, timeToFirstMove = 10} = timing
    const black = {name: 'Black'}
    const white = {name: "White"}
    const clock: IClock = {
        timeToGame: timeToGame * 60,
        adds,
        timeToFirstMove
    }
    yield put({type: BOA.REVERSE_BOARD, payload: color === PieceColor.b})
    const gamePayload: Partial<IGameState> = {
        moveOrder: {pieceOrder: PieceColor.w, playerTurn: 'White'},
        black,
        white,
        gameStarted: true,
        playerColor: color,
        history: [],
        gameConfirmed: true,
        gameMode: 'isPreparing',
        portrait: window.innerWidth / window.innerHeight < 1.3,
        ineffectiveMoves: 0,
    }
    yield put({type: GM.SET_GAME, payload: gamePayload})
    yield put({type: ClockActions.SET_CLOCK, payload: {blackClock: clock, whiteClock: clock}})
    yield put({type: GOA.FINISH_GAME_SETUP, payload: true})
    delay(AnimationDuration*3)
    yield put({type: GM.SET_GAME_MODE, payload: 'isPlaying'})
}

function* workerNewGameVsPC() {
    const {
        gameOptions: {playerColor, rivalLevel = 1},
        user: {name, rating},
        boardOptions
    } = yield select()
    movesTree.createDefaultRootBranch(boardOptions.boardSize)
    movesTree.getDepthData(movesTree.getRoot(), DefaultMinDepth)
    console.warn('tree', movesTree.getRoot())
    const moves = movesTree.getRivalMoves('')
    yield put({type: TowersActions.UPDATE_BOARD_STATE, payload: {...InitialTowersState, moves}})
    let color: PieceColor = playerColor
    if (playerColor === 'random') {
        color = Math.random() < .5 ? PieceColor.w : PieceColor.b
    }
    const rival = {name: `Bot ${rivalLevel}`}
    const moveOrder: IMoveOrder = {
        pieceOrder: PieceColor.w,
        playerTurn: color === PieceColor.w ? name : rival.name
    }
    yield put({type: BOA.REVERSE_BOARD, payload: color === PieceColor.b})
    const white = color === PieceColor.w ? {name, rating} : {name: rival.name} as IPlayer
    const black = color === PieceColor.w ? {name: rival.name, rivalLevel} : {name, rating} as IPlayer
    const gamePayload: Partial<IGameState> = {
        moveOrder,
        playerColor: color,
        white,
        black,
        history: [],
        gameConfirmed: true,
        gameStarted: true,
        gameMode: 'isPreparing',
        portrait: window.innerWidth / window.innerHeight < 1.3,
        ineffectiveMoves: 0
    }
    yield put({type: GM.SET_GAME, payload: gamePayload})
    yield put({type: AppActions.SET_PORTRAIT, payload: window.innerWidth / window.innerHeight < 1.3,})
    yield put({type: GOA.FINISH_GAME_SETUP, payload: true})
    yield delay(AnimationDuration)
    yield put({type: GM.SET_GAME_MODE, payload: 'isPlaying'})
}

function* checkDraw (payload: IMoveToMake) {
    const {gameOptions: {gameVariant}, game: {ineffectiveMoves}} = yield select()
    if ((gameVariant !== 'international' && ineffectiveMoves > 30)
        || (gameVariant === 'international' && ineffectiveMoves > 50)) {
        yield put({type: GM.END_GAME, payload: 'drawByRules'})
    }
}

// function* workerDrawOffer(action: GMA) {
//     const {gameOptions: {rivalType}, game: {gameKey}} = yield select()
//     // if (rivalType !== 'PC') sendMessage({message: 'game draw offered', payload: {gameKey}})
// }

// function* workerDrawRespond(action: GMA) {
  
//     yield put({type: GM.RIVAL_OFFER_DRAW, payload: false})
//     // sendMessage({message: 'game draw rejected', payload: {gameKey}})
// }

function* workerPlayerClockAfterMove(payload: IMoveToMake) {
    const {
        game: {gameConfirmed, history},
        clock: {whiteClock, blackClock}
    } = yield select()
    if (gameConfirmed) {
        if (payload.moveOrder.pieceOrder === PieceColor.w) {
            const payload = {...blackClock, timeToGame: blackClock.timeToGame + blackClock.adds}
            yield put({type: ClockActions.SET_BLACK_CLOCK, payload})
            yield put({type: ClockActions.WHITE_TICK})
        } else {
            const payload = {...whiteClock, timeToGame: whiteClock.timeToGame + whiteClock.adds}
            yield put({type: ClockActions.SET_WHITE_CLOCK, payload})
            yield put({type: ClockActions.BLACK_TICK})
        }
    } else if (history.length > 1) {
        yield put({type: GM.CONFIRM_START_GAME, payload: true})
        if (payload.moveOrder.pieceOrder === PieceColor.w) {
            yield put({type: ClockActions.WHITE_TICK})
        } else {
            yield put({type: ClockActions.BLACK_TICK})
        }
    } else {
        if (payload.moveOrder.pieceOrder === PieceColor.b) {
            yield put({type: ClockActions.BLACK_PRESTART_TICK})
        } else { 
            yield put({type: ClockActions.WHITE_PRESTART_TICK})
        }
    }
}

function* workerMove(action: GMA) {
    const {
        game: {gameStarted},
        gameOptions: {rivalType},
        boardAndTowers
    } = (yield select()) as IRootState
    console.warn('game move', action, boardAndTowers, movesTree.getRoot())
    const payload: IMoveToMake = action.payload as IMoveToMake
    if (!gameStarted) return
    yield checkDraw(payload)
    if (rivalType !== 'PC') {
        yield workerPlayerClockAfterMove(payload)
    }
}

function* workerGameEnd(action: GMA) {
    const {game: {moveOrder: {pieceOrder}, gameMode}, clock: {blackClock}} = yield select()
    if (gameMode === 'isOver') return
    const draw = action.payload === 'drawByAgreement' || action.payload === 'drawByRules'
    let winner: PieceColor | 'draw'
    if (action.payload === 'abandonedByWhite') {
        winner = PieceColor.b
    } else if (action.payload === 'abandonedByBlack') {
        winner = PieceColor.w
    } else if (action.payload === 'outOfTime') {
        winner = !blackClock.timeToGame ? PieceColor.w : PieceColor.b
    } else {
        winner = draw ? 'draw' : oppositeColor(pieceOrder)
    }
    yield resolveEndGame(winner, action.payload as EndGameConditions)
}

function* workerSurrender(action: GMA) {
    const winner = oppositeColor(action.payload as PieceColor)
    yield resolveEndGame(winner, 'surrender')
}

function* resolveEndGame(winner: PieceColor | 'draw', reason: EndGameConditions) {
    const {
        game: {moveOrder: {pieceOrder}, history, white, black, playerColor},
        gameOptions: {gameVariant, timing: {timeToGame, adds}}, 
        boardOptions: {boardSize}
    } = yield select()
        // const token: string = yield select((state: IRootState) => state.user.token)
        const PC = playerColor === PieceColor.w ? black.name : white.name
        const gameResult: Partial<IGameResult> & {PC: string, playerColor: PieceColor} = {
            winner,
            reason,
            timing: `${timeToGame}/${adds}`,
            playerColor,
            PC,
            gameVariant,
            movesHistory: history,
            boardSize,
            date: new Date()
        }
        const analysisPayload = {
            gameResult,
            pieceOrder,
            movesMainLine: history,
            analyzeLastGame: true,
            settingPosition: false,
            lastMove: {index: history.length - 1, move: history.slice(-1)[0]}
        }
        yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload: analysisPayload})
        const game = {
            ...InitialGameState, gameMode: 'isOver',
        } as IGameState
        yield put({type: GM.SET_GAME, payload: game})    
}

function* cancelGameWorker(action: GameActionTypes) {

    yield put({type: GM.SET_GAME_STARTED, payload: false})
    yield put({type: GM.SET_GAME_MODE, payload: 'isOver'})
}

export default function* watcherGame() {
    yield takeLatest(GM.END_GAME, workerGameEnd)
    // yield takeLatest(GM.DECLINE_DRAW, workerDrawRespond)
    // yield takeLatest(GM.OFFER_DRAW, workerDrawOffer)
    yield takeLatest(GM.MAKE_MOVE, workerMove)
    yield takeLatest(GM.SURRENDER, workerSurrender)
    yield takeLatest(GM.CANCEL_GAME, cancelGameWorker)
    yield takeLatest(GM.NEW_GAME_VS_PLAYER, workerNewGameVSPlayer)
    yield takeLatest(GM.NEW_GAME_VS_PC, workerNewGameVsPC)
}
