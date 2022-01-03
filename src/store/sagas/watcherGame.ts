import { put, takeLatest, select, delay } from 'redux-saga/effects';
import {
    IGameResult,
    PieceColor,
    EndGameConditions,
    IMoveProps,
    IGameState,
    IMoveOrder,
    IPlayer,
    INewGameProps,
    IClock
} from '../app-interface';
import {GameActions, GameActions as GM, GameActionTypes, GameActionTypes as GMA} from '../game/types'
import {ClockActions} from '../clock/types'
// import {sendMessage} from '../../web-sockets/ws'
// import { IRootState } from '../rootState&Reducer';
import { oppositColor } from '../../game-engine/gameplay-helper-fuctions';
// import { Axios, setAuthorizationHeader } from '../../common/axios';
import { GameAnalysisActions } from '../gameAnalysis/types';
import {checkIfNumberOfKingsChanged} from '../../game-engine/gameplay-helper-fuctions'
import { InitialGameState } from '../game/reducers';
import { AnimationDuration } from '../../constants/gameConstants';
import { AppActions } from '../app/types';
import { BoardActions } from '../board/types';
import {GameOptionActions as GOA} from '../gameOptions/types'
import {BoardOptionActions as BOA} from '../boardOptions/types'
import mmr from '../../game-engine/mandatory-move-resolver'
import tur from '../../game-engine/update-towers-functions'

function* workerNewGameVSPlayer(action: GMA) {
    yield put({type: GOA.WAIT_RIVAL, payload: false})
    const { 
        game: {gameMode},
        user: {name = 'Player1'},
        boardOptions: {boardSize},
        gameOptions: {gameVariant, timing, playerColor}
    } = yield select()
    let color: PieceColor = playerColor
    if (playerColor === 'random') {
        color = Math.random() < .5 ? PieceColor.w : PieceColor.b
    }
    const {timeToGame, adds, timeToFirstMove} = timing
    const black = {name: 'Black'}
    const white = {name: "White"}
    const clock: IClock = {
        timeToGame,
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
        gameConfirmed: false,
        gameMode: 'isPreparing',
        portrait: window.innerWidth / window.innerHeight < 1.3,
        ineffectiveMoves: 0,
    }
    tur.setProps({GV: gameVariant, size: boardSize})
    mmr.setProps({GV: gameVariant, size: boardSize})
    yield put({type: BoardActions.CREATE_GAME_BOARD})
    yield put({type: GM.SET_GAME, payload: gamePayload})
    yield put({type: ClockActions.SET_CLOCK, payload: {blackClock: clock, whiteClock: clock}})
    yield put({type: GOA.FINISH_GAME_SETUP, payload: true})
    delay(AnimationDuration*3)
    yield put({type: GM.SET_GAME_MODE, payload: 'isPlaying'})
}

function* workerNewGameVsPC() {
    console.log('game vs pc')
    const {
        gameOptions: {playerColor, rivalLevel = 1, gameVariant},
        boardOptions: {boardSize},
        user: {name, rating},
        game: {gameMode}
    } = yield select()
    if (gameMode === 'isPlaying') {
        yield put({type: GameActions.SET_GAME, payload: InitialGameState})
    }
    yield delay(30)
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
    mmr.setProps({GV: gameVariant, size: boardSize})
    tur.setProps({GV: gameVariant, size: boardSize})
    yield put({type: BoardActions.CREATE_GAME_BOARD})
    yield put({type: GM.SET_GAME, payload: gamePayload})
    yield put({type: AppActions.SET_PORTRAIT, payload: window.innerWidth / window.innerHeight < 1.3,})
    yield put({type: GOA.FINISH_GAME_SETUP, payload: true})
    delay(AnimationDuration*3)
    yield put({type: GM.SET_GAME_MODE, payload: 'isPlaying'})
}

function* pcGameCase (payload: IMoveProps, ineffectiveMoves: number) {
    const {gameOptions: {gameVariant}, board: {currentPosition}} = yield select()
    const numberOfKingsChanged = checkIfNumberOfKingsChanged(currentPosition, payload.moveToSave.position)
    if (numberOfKingsChanged) {
        console.error('kings', payload)
    }
    if (payload.moveToSave.move.includes(':') || numberOfKingsChanged) {
        yield put({type: GM.INEFFECTIVE_MOVE, payload: 0})
    } else if ((gameVariant !== 'international' && ineffectiveMoves < 36) 
        || (gameVariant === 'international' && ineffectiveMoves < 50)) {
        yield put({type: GM.INEFFECTIVE_MOVE, payload: ineffectiveMoves + 1})
    } else {
        yield put({type: GM.END_GAME, payload: 'drawByRules'})
    }
}

// function* workerDrawOffer(action: GMA) {
//     const {gameOptions: {rivalType}, game: {gameKey}} = yield select()
//     // if (rivalType !== 'PC') sendMessage({message: 'game draw offered', payload: {gameKey}})
// }

function* workerDrawRespond(action: GMA) {
  
    yield put({type: GM.RIVAL_OFFER_DRAW, payload: false})
    // sendMessage({message: 'game draw rejected', payload: {gameKey}})
}

function* workerPlayerClockAfterMove(payload: IMoveProps) {
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
        gameOptions: {rivalType},
        game: {gameKey, gameStarted, ineffectiveMoves},
        user: {name}
    } = yield select()
    const payload: IMoveProps = action.payload as IMoveProps
    payload.gameKey = gameKey
    if (!gameStarted) return
    const PlayerTurn = payload.moveOrder.playerTurn
    if (rivalType === 'PC') {
        yield pcGameCase(payload, ineffectiveMoves)
    } else if (rivalType !== 'PC' &&  PlayerTurn!== name) {
        // sendMessage({message: 'game move', payload})
    } else if (rivalType !== 'PC') {
        workerPlayerClockAfterMove(payload)
    }
}

function* workerGameEnd(action: GMA) {
    const {game: {moveOrder: {pieceOrder}}, clock: {blackClock}} = yield select()
    const draw = action.payload === 'drawByAgreement' || action.payload === 'drawByRules'
    let winner: PieceColor | 'draw'
    if (action.payload === 'abandonedByWhite') {
        winner = PieceColor.b
    } else if (action.payload === 'abandonedByBlack') {
        winner = PieceColor.w
    } else if (action.payload === 'outOfTime') {
        winner = !blackClock.timeToGame ? PieceColor.w : PieceColor.b
    } else {
        winner = draw ? 'draw' : oppositColor(pieceOrder)
    }
    yield resolveEndGame(winner, action.payload as EndGameConditions)
}

function* workerSurrender(action: GMA) {
    const winner = oppositColor(action.payload as PieceColor)
    yield resolveEndGame(winner, 'surrender')
}

function* resolveEndGame(winner: PieceColor | 'draw', reason: EndGameConditions) {
    const { 
        game: {history, white, black, playerColor},
    } = yield select(state => state)
    const {
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
        yield put({type: GameAnalysisActions.SAVE_GAME_RESULT, payload: gameResult})
        const analysisPayload = {
            movesMainLine: history,
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
    yield takeLatest(GM.DECLINE_DRAW, workerDrawRespond)
    // yield takeLatest(GM.OFFER_DRAW, workerDrawOffer)
    yield takeLatest(GM.MAKE_MOVE, workerMove)
    yield takeLatest(GM.SURRENDER, workerSurrender)
    yield takeLatest(GM.CANCEL_GAME, cancelGameWorker)
    yield takeLatest(GM.NEW_GAME_VS_PLAYER, workerNewGameVSPlayer)
    yield takeLatest(GM.NEW_GAME_VS_PC, workerNewGameVsPC)
}
