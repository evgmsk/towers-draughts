import { put, takeLatest, select, delay } from 'redux-saga/effects';

import {IAnalysisState, IMoveToMake, PositionsTree} from '../models';

import { copyObj, oppositeColor, splitMove } from '../../game-engine/gameplay-helper-functions';
import { GameAnalysisActions, GameAnalysisTypes } from '../gameAnalysis/types';
import {
    createDefaultTowers,
    createOutBoardTowers,
    removeOutBoardTowers
} from '../../game-engine/prestart-help-function';
import { IRootState } from '../rootState&Reducer';
import mmr from '../../game-engine/moves-resolver'
import tur from '../../game-engine/towers-updater'
// import { AnimationDuration } from '../../constants/gameConstants';
import bms from "../../game-engine/best-move-seeker-towers";
import {TowersActions} from "../board-towers/types";
import {BoardOptionActions} from "../boardOptions/types";
import movesTree from "../../game-engine/tower-tree";
import {DefaultMinDepth} from "../../constants/gameConstants";


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

function* workerStepForward() {
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
        payload: {...analyze, lastMove: nextLastMove, pieceOrder: oppositeColor(pieceOrder)}
    })
    yield put({
        type: TowersActions.UPDATE_BOARD_STATE,
        payload: {currentPosition}
    })
}

function* workerGoToPosition(action: GameAnalysisTypes) {
    console.log(action)
    // const {analyze, boardOptions, board: {positionsTree, cellsMap, cellSize}} = yield select()
    // const {
    //     movesCurrentLine,
    //     movesMainLine,
    // } = analyze as IAnalysisState
    // const {index, move} = action.payload as {index: number, move: string}
    // let currentPosition, lastMove, pieceOrder
    // if (index < 0) {
    //     currentPosition = createStartBoard(boardOptions.boardSize)
    // } else if (movesMainLine![index] === move) {
    //     currentPosition = positionsTree!.get(movesMainLine!.slice(0, index + 1).join('_'))
    //     console.log(positionsTree, movesMainLine!.slice(0, index + 1).join('_'), currentPosition)
    // } else if (movesCurrentLine![index] === move) {
    //     currentPosition = positionsTree!.get(movesCurrentLine!.slice(0, index + 1).join('_'))
    // }
    // let towers  = tur.updateTowersToBoard(currentPosition)
    // towers = tur.updateTowersPosition(cellSize, towers, cellsMap, boardOptions.reversedBoard)
    // pieceOrder = index % 2 ? PieceColor.w : PieceColor.b
    // lastMove = action.payload
    // const payload = { lastMove, pieceOrder}
    // yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload})
    // yield put({
    //     type: BoardActions.UPDATE_BOARD_STATE,
    //     payload: {currentPosition, towers}
    // })
    yield
}

function* workerPlayMoves() {

}

function* workerStepBack() {
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
        type: TowersActions.UPDATE_BOARD_STATE,
        payload: {currentPosition, lastMoveSquares}
    })
    yield put({
        type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, 
        payload: {
            ...analyze,
            lastMove: nextLastMove,
            pieceOrder: oppositeColor(pieceOrder),
        }
    })
}

function* workerSettingBoard(action: GameAnalysisTypes) {
    const {
        boardOptions,
        boardAndTowers,
        analyze: {pieceOrder}
    } = (yield select(state => state)) as IRootState
    let towers = copyObj(boardAndTowers.towers)
    if (action.payload) {
        towers = createOutBoardTowers(towers, boardOptions.boardSize)
        towers = tur.updateCellsAndTowersPosition({...boardAndTowers, towers}, boardOptions).towers
    } else {
        towers = removeOutBoardTowers(towers)
        const payload = mmr.getMovesResultFromTotalMoves(mmr.getPositionMoves(towers, pieceOrder))
        yield put({type: TowersActions.UPDATE_MOVES, payload})
    }
    yield put({type: TowersActions.UPDATE_TOWERS, payload: towers})
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
        boardAndTowers
    } = yield select()
    const {moveToSave: {move, position}} = action.payload as IMoveToMake
    let payload: Partial<IAnalysisState>
    if (movesCurrentLine[index + 1] === move) {
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: {currentPosition: position}
        })
        payload = {
            lastMove: {move, index: index + 1},
            pieceOrder: oppositeColor(pieceOrder),
        }
    } else {
        const movesLine = [...movesCurrentLine.slice(0, index + 1), move]
        const positionsTree = copyObj(boardAndTowers.positionsTree!) as PositionsTree
        const newKey = movesLine.join('_')
        positionsTree[newKey] = position
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: {positionsTree: positionsTree, towers: position}
        })
        payload = { 
            lastMove: {move, index: index + 1},
            pieceOrder: oppositeColor(pieceOrder),
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
        boardAndTowers
    } = yield select()
    const {moveToSave: {move, position}} = action.payload as IMoveToMake
    let payload: Partial<IAnalysisState>
    yield put({
        type: TowersActions.UPDATE_BOARD_STATE,
        payload: {towers: position}
    })
    const positionsTree = copyObj(boardAndTowers.positionsTree!) as PositionsTree
    if (!movesMainLine.length) {
        payload = {
            lastMove: {move, index: 0},
            pieceOrder: oppositeColor(pieceOrder),
            movesMainLine: [move]
        }

        positionsTree[move] = position
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: {positionsTree, history: [move], towers: position}
        })
    } else if (movesMainLine[index + 1] === move) {
        payload = { 
            lastMove: {move, index: index + 1},
            pieceOrder: oppositeColor(pieceOrder),
        }
    } else {
        const movesLine = movesMainLine.slice(0, index + 1).concat(move)
        const positionTree = copyObj(positionsTree!)
        const newKey = movesLine.join('_')
        positionTree[newKey] = position
        payload = {
            lastMove: {move, index: index + 1},
            pieceOrder: oppositeColor(pieceOrder),
            movesMainLine: [...movesMainLine, move]
        }
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: {positionsTree, towers: position, history: movesLine}
        })
    }
    return payload
}

function* workerNewMove(action: GameAnalysisTypes) {
    const {
        lastMove: {move, index},
        movesCurrentLine,
    } = yield select((state: IRootState) => state.analyze)
    let payload: Partial<IAnalysisState>
    if (movesCurrentLine.length && movesCurrentLine[index] === move) {
        payload = yield workerCurrentLine(action)
    } else {
        payload = yield workerMainLine(action)
    } 
    if (payload.lastMove) {
        yield put({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload})
    }
}

function* workerAnalyzePosition(action: GameAnalysisTypes) {
    if (!action.payload) {
        return
    }
    const {
        boardAndTowers: {towers},
        analyze: {pieceOrder},
    }: IRootState = yield select()
    const startBranch = movesTree.createBranchWithTowers(towers, pieceOrder)
    movesTree.addRoot(startBranch)
    movesTree.getDepthData(movesTree.getRoot(), DefaultMinDepth)
    delay(20)
    bms.setState({game: false})
    bms.updateAfterRivalMove({history: [''], pieceOrder, cP: towers})
}

function* workerReverseBoard() {
    const {
        game: {gameMode},
        boardAndTowers,
        boardOptions
    } = (yield select()) as IRootState
    const rect = document.querySelector('.board__body')
        ?.getBoundingClientRect() as DOMRect
    if (gameMode !== 'isAnalyzing' || !rect) {
        return
    }
    yield delay(10)
    const payload = tur.updateCellsAndTowersPosition(boardAndTowers, boardOptions)
    yield put ({
        type: TowersActions.UPDATE_BOARD_STATE,
        payload,
    })
}

function* workerStartPosition(action: GameAnalysisTypes) {
    const {
        boardOptions: {boardSize},
        boardAndTowers: {cellsMap, cellSize},
    } = (yield select((state: IRootState) => state)) as IRootState
    const towers = action.payload
        ? createDefaultTowers(boardSize)
        : createOutBoardTowers({}, boardSize)
    const payload = tur.updateTowersPosition(cellSize, towers, cellsMap)
    yield put ({
        type: TowersActions.UPDATE_TOWERS,
        payload,
    })
}

export default function* watcherAnalysis() {
    yield takeLatest(GameAnalysisActions.STEP_BACK, workerStepBack)
    yield takeLatest(GameAnalysisActions.STEP_FORWARD, workerStepForward)
    yield takeLatest(GameAnalysisActions.GO_TO_POSITION, workerGoToPosition)
    // yield takeLatest(GameAnalysisActions.UPDATE_POSITION, workerUpdatePosition)
    yield takeLatest(BoardOptionActions.REVERSE_BOARD, workerReverseBoard)
    yield takeLatest(GameAnalysisActions.EVALUATE_POSITION, workerAnalyzePosition)
    yield takeLatest(GameAnalysisActions.PLAY_MOVES, workerPlayMoves)
    yield takeLatest(GameAnalysisActions.SETTING_BOARD, workerSettingBoard)
    yield takeLatest(GameAnalysisActions.ANALYZE_LAST_GAME, workerGameAnalysis)
    yield takeLatest(GameAnalysisActions.MAKE_NEW_MOVE, workerNewMove)
    yield takeLatest(GameAnalysisActions.SET_START_POSITION, workerStartPosition)
}
