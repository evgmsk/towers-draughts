import { put, takeLatest, select, call, delay } from 'redux-saga/effects';

import { IGameResult, PieceColor, IMoveProps, IAnalysisState} from '../app-interface';

import { copyMap, oppositColor, splitMove } from '../../game-engine/gameplay-helper-fuctions';
// import { Axios, setAuthorizationHeader } from '../../common/axios';
import { GameAnalysisActions, GameAnalysisTypes } from '../gameAnalysis/types';
import { createDefaultTowers, createEmptyBoard, createStartBoard} from '../../game-engine/prestart-help-function-constants';
import { InitialGameAnalysisState } from '../gameAnalysis/reducers';
import { IRootState } from '../rootState&Reducer';
import { BoardActions } from '../board/types';
import tur from '../../game-engine/update-towers-functions'
import { AnimationDuration } from '../../constants/gameConstants';

// function* workerUploadGame(action: GameAnalysisTypes) {
//     const token: string = yield select((state) => state.user.token)
//     try {
//         setAuthorizationHeader(token)
//         const respond: {[key: string]: any} = yield call(Axios.post, '/api/game/upload', JSON.stringify(action.payload))
//         console.log(respond.data as IGameResult)
//     } catch(e) {
//         console.log(e)
//     }
// }

function* workerUpdatePosition(action: GameAnalysisTypes) {
    const {analyze, board: {positionsTree}} = yield select()
    const {
        movesCurrentLine,
        movesMainLine,
        lastMove,
    } = analyze as IAnalysisState
    const {moveToSave: {move, position}} = action.payload as IMoveProps
    let nextLastMove, nextPositionKey;
    if (movesMainLine![lastMove.index] === lastMove.move && movesMainLine!.length === lastMove.index + 1) {
        nextLastMove = {move, index: lastMove.index + 1}
        nextPositionKey = `${movesMainLine?.join('_')}_${move}`
        positionsTree!.set(nextPositionKey, position!)
        yield put({
            type: GameAnalysisActions.UPDATE_ANALYSIS_STATE,
            payload: {
                ...analyze,
                lastMove: nextLastMove,
                positionsTree,
                movesMainLine: movesMainLine?.push(move)
            }
        })
    } else if (movesMainLine![lastMove.index] === lastMove.move && movesMainLine!.length > lastMove.index + 1) {
        nextLastMove = {move, index: lastMove.index + 1}
        nextPositionKey = `${movesMainLine?.join('_')}_${move}`
        positionsTree!.set(nextPositionKey, position!)
        const newCurrentLine = [...movesMainLine!.slice(0, lastMove.index + 1), lastMove.move]
        yield put({
            type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, 
            payload: {...analyze, lastMove: nextLastMove, movesCurrentLine: newCurrentLine}
        })
        yield put({type: BoardActions.UPDATE_BOARD_STATE, payload: {positionsTree}})
    } else if (movesCurrentLine!.slice(-1)[0] === lastMove.move) {
        nextLastMove = {move, index: lastMove.index + 1}
        nextPositionKey = `${movesCurrentLine?.join('_')}_${move}`
        positionsTree!.set(nextPositionKey, position!)
        yield put({
            type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, 
            payload: {...analyze, lastMove: nextLastMove, movesCurrentLine: movesCurrentLine?.push(move)}
        })
        yield put({type: BoardActions.UPDATE_BOARD_STATE, payload: {positionsTree}})
    }
}

function* workerStepForward(action: GameAnalysisTypes) {
    const {analyze, board: {positionsTree}} = yield select()
    const {
        movesCurrentLine,
        movesMainLine,
        lastMove,
        pieceOrder
    } = analyze as IAnalysisState
    let nextLastMove, currentPosition;
    if (lastMove.index < 0) {
        const move = movesMainLine![0]
        nextLastMove = {index: 0, move}
        currentPosition = positionsTree?.get(move)
    } else if (movesMainLine![lastMove.index] === lastMove.move 
        && lastMove.index < movesMainLine!.length - 1) {
            nextLastMove = {move: movesMainLine![lastMove.index + 1], index: lastMove.index + 1}
            currentPosition = positionsTree!.get(movesMainLine!.slice(0, nextLastMove.index + 1).join('_'))
    } else if (movesCurrentLine![lastMove.index] === lastMove.move 
        && lastMove.index < movesCurrentLine!.length - 1) {
            nextLastMove = {move: movesCurrentLine![lastMove.index + 1], index: lastMove.index + 1}
            currentPosition = positionsTree!.get(movesCurrentLine!.slice(0, nextLastMove.index + 1).join('_'))
    }
    yield put({
        type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, 
        payload: {...analyze, lastMove: nextLastMove, pieceOrder: oppositColor(pieceOrder)}
    })
    yield put({
        type: BoardActions.UPDATE_BOARD_STATE,
        payload: {currentPosition}
    })
}

function* workerGoToPosition(action: GameAnalysisTypes) {
    // console.log(action)
    const {analyze, boardOptions, board: {positionsTree, cellsMap, cellSize}} = yield select()
    const {
        movesCurrentLine,
        movesMainLine,
    } = analyze as IAnalysisState
    const {index, move} = action.payload as {index: number, move: string}
    let currentPosition, lastMove, pieceOrder
    if (index < 0) {
        currentPosition = createStartBoard(boardOptions.boardSize)
    } else if (movesMainLine![index] === move) {
        currentPosition = positionsTree!.get(movesMainLine!.slice(0, index + 1).join('_'))
        console.log(positionsTree, movesMainLine!.slice(0, index + 1).join('_'), currentPosition)
    } else if (movesCurrentLine![index] === move) {
        currentPosition = positionsTree!.get(movesCurrentLine!.slice(0, index + 1).join('_'))
    }
    let towers  = tur.updateTowersToBoard(currentPosition)
    towers = tur.updateTowersPosition(cellSize, towers, cellsMap, boardOptions.reversedBoard)
    pieceOrder = index % 2 ? PieceColor.w : PieceColor.b
    lastMove = action.payload
    const payload = { lastMove, pieceOrder}
    yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload})
    yield put({
        type: BoardActions.UPDATE_BOARD_STATE,
        payload: {currentPosition, towers}
    })
}

function* workerPlayMoves(action: GameAnalysisTypes) {
    
    const {analyze, board: {positionsTree, cellSize, cellsMap}, boardOptions: {reversedBoard}} = yield select()
    const {
        movesCurrentLine,
        movesMainLine,
        lastMove,
        pieceOrder,
    } = analyze as IAnalysisState
    let nextLastMove, currentPosition;
    const nextIndex = lastMove.index + 1
    if (lastMove.index < 0) {
        nextLastMove = {move: movesMainLine![0], index: 0}
        currentPosition = positionsTree!.get(movesMainLine![0])
    } else if (movesMainLine![lastMove.index] === lastMove.move) {
        nextLastMove = {move: movesMainLine![lastMove.index + 1], index: lastMove.index + 1}
        currentPosition = positionsTree!.get(movesMainLine!.slice(0, nextLastMove.index + 1).join('_'))
    } else if (movesCurrentLine![lastMove.index] === lastMove.move) {
        nextLastMove = {move: movesCurrentLine![lastMove.index + 1], index: lastMove.index + 1}
        currentPosition = positionsTree!.get(movesCurrentLine!.slice(0, nextLastMove.index + 1).join('_'))
    } else {
        console.error(analyze, action)
    }
    
    let towers = tur.updateTowersToBoard(currentPosition)
    towers = tur.updateTowersPosition(cellSize, towers, cellsMap, reversedBoard)
    const lastMoveSquares = splitMove((nextLastMove)!.move)
    yield put({
        type: BoardActions.UPDATE_BOARD_STATE,
        payload: {currentPosition, towers, lastMoveSquares}
    })
    yield put({
        type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, 
        payload: {
            ...analyze,
            lastMove: nextLastMove,
            pieceOrder: oppositColor(pieceOrder),
        }
    })
    if (nextIndex < movesMainLine!.length - 1 || nextIndex < movesCurrentLine!.length -1) {
        yield delay(AnimationDuration)
        yield put({type: GameAnalysisActions.PLAY_MOVES})
    }
}

function* workerStepBack(action: GameAnalysisTypes) {
    const {analyze, board: {positionsTree}} = yield select()
    const {
        movesCurrentLine,
        movesMainLine,
        lastMove,
        pieceOrder
    } = analyze as IAnalysisState
    let nextLastMove, currentPosition;
    if (lastMove.index < 0) return
    if (movesMainLine![lastMove.index] === lastMove.move && lastMove.index > 0) {
        nextLastMove = {move: movesMainLine![lastMove.index - 1], index: lastMove.index - 1}
        currentPosition = positionsTree!.get(movesMainLine!.slice(0, nextLastMove.index + 1).join('_'))
    } else if (movesCurrentLine![lastMove.index] === lastMove.move && lastMove.index > 0) {
        nextLastMove = {move: movesCurrentLine![lastMove.index - 1], index: lastMove.index - 1}
        currentPosition = positionsTree!.get(movesCurrentLine!.slice(0, nextLastMove.index + 1).join('_'))
    }
    const lastMoveSquares = splitMove((nextLastMove)!.move)
    yield put({
        type: BoardActions.UPDATE_BOARD_STATE,
        payload: {currentPosition, lastMoveSquares}
    })
    yield put({
        type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, 
        payload: {
            ...analyze,
            lastMove: nextLastMove,
            pieceOrder: oppositColor(pieceOrder),
        }
    })
}

function* workerSettingBoard(action: GameAnalysisTypes) {
    const {boardOptions:{boardSize}} = yield select(state => state)
    if (action.payload) {
        const board = createEmptyBoard(boardSize)
        yield put({
            type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, 
            payload: {...InitialGameAnalysisState, board, currentPosition: board }
        })
    }
}

function* workerGameAnalysis(action: GameAnalysisTypes) {
    const {analyze: {settingPosition}} = yield select(state => state)
    if (settingPosition && action.payload) {
        yield put({
            type: GameAnalysisActions.SETTING_BOARD, 
            payload: false
        })
    }
}

function* workerCurrentLine(action: GameAnalysisTypes) {
    const {
        analyze:{
            lastMove: {index},
            movesCurrentLine,
            pieceOrder,
        },
        board: {positionsTree}      
    } = yield select()
    const {moveToSave: {move, position}} = action.payload as IMoveProps
    let payload: Partial<IAnalysisState> = {}
    if (movesCurrentLine[index + 1] === move) {
        yield put({
            type: BoardActions.UPDATE_BOARD_STATE,
            payload: {currentPosition: position}
        })
        payload = {
            lastMove: {move, index: index + 1},
            pieceOrder: oppositColor(pieceOrder),
        }
    } else {
        const movesLine = [...movesCurrentLine.slice(0, index + 1), move]
        const _positionsTree = copyMap(positionsTree!)
        const newKey = movesLine.join('_')
        _positionsTree.set(newKey, position)
        yield put({
            type: BoardActions.UPDATE_BOARD_STATE, 
            payload: {positionsTree: _positionsTree, currentPositoin: position}
        })
        payload = { 
            lastMove: {move, index: index + 1},
            pieceOrder: oppositColor(pieceOrder),
            movesCurrentLine: movesLine,
        }
    }
    return payload
}

function* workerMainLine(action: GameAnalysisTypes) {
    const {
        analyze: {
            lastMove: {index},
            movesMainLine,
            pieceOrder,
        },
        board: {positionsTree}
    } = yield select()
    const {moveToSave: {move, position}} = action.payload as IMoveProps
    let payload: Partial<IAnalysisState> = {}
    yield put({
        type: BoardActions.UPDATE_BOARD_STATE,
        payload: {currentPosition: position}
    })
    if (!movesMainLine.length) {
        payload = {
            lastMove: {move, index: 0},
            pieceOrder: oppositColor(pieceOrder),
            movesMainLine: [move]
        }
        const _positionsTree = copyMap(positionsTree!)
        _positionsTree.set(move, position)
        yield put({
            type: BoardActions.UPDATE_BOARD_STATE,
            payload: {positionsTree: _positionsTree, history: [move], currentPosition: position}
        })
    } else if (movesMainLine[index + 1] === move) {
        payload = { 
            lastMove: {move, index: index + 1},
            pieceOrder: oppositColor(pieceOrder),
        }
    } else {
        const movesLine = movesMainLine.slice(0, index + 1).concat(move)
        const _positionTree = copyMap(positionsTree!)
        const newKey = movesLine.join('_')
        _positionTree.set(newKey, position)
        payload = {
            lastMove: {move, index: index + 1},
            pieceOrder: oppositColor(pieceOrder),
            movesMainLine: [...movesMainLine, move]
        }
        yield put({
            type: BoardActions.UPDATE_BOARD_STATE,
            payload: {positionsTree: _positionTree, currentPosition: position, history: movesLine}
        })
    }
    return payload
}

function* workerNewMove(action: GameAnalysisTypes) {
    const {
        lastMove: {move, index},
        movesCurrentLine,
    } = yield select((state: IRootState) => state.analyze)
    let payload: Partial<IAnalysisState> = {}
    if (movesCurrentLine.length && movesCurrentLine[index] === move) {
        payload = yield workerCurrentLine(action)
    } else {
        payload = yield workerMainLine(action)
    } 
    if (payload.lastMove) {
        yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload})
    }
}

function* workerStartPosition(action: GameAnalysisTypes) {
    const {
        boardOptions: {boardSize},
        board: {positionsTree}
    } = yield select((state: IRootState) => state)
    yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload: {startPosition: false}})
    const currentPosition = createStartBoard(boardSize)
    positionsTree.clear()
    positionsTree.set('sp', currentPosition)
    const towers = createDefaultTowers(boardSize)
    yield put ({type: BoardActions.UPDATE_BOARD_STATE, paylaod: {currentPosition, positionsTree, towers}})
    const payload: Partial<IAnalysisState> = {
        ...InitialGameAnalysisState,
        startPosition: true,
    }
    yield delay(100)
    yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload})
}

export default function* watcherAnalysis() {    
    yield takeLatest(GameAnalysisActions.STEP_BACK, workerStepBack)
    yield takeLatest(GameAnalysisActions.STEP_FORWARD, workerStepForward)
    yield takeLatest(GameAnalysisActions.GO_TO_POSITION, workerGoToPosition)
    yield takeLatest(GameAnalysisActions.UPDATE_POSITION, workerUpdatePosition)
    // yield takeLatest(GameAnalysisActions.DOWNLOAD_GAME, workerUploadGame)
    yield takeLatest(GameAnalysisActions.PLAY_MOVES, workerPlayMoves)
    yield takeLatest(GameAnalysisActions.SETTING_BOARD, workerSettingBoard)
    yield takeLatest(GameAnalysisActions.ANALYZE_LAST_GAME, workerGameAnalysis)
    yield takeLatest(GameAnalysisActions.MAKE_NEW_MOVE, workerNewMove)
    yield takeLatest(GameAnalysisActions.SET_START_POSITION, workerStartPosition)
}
 