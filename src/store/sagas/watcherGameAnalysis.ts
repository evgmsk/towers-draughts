import {delay, put, select, takeLatest} from 'redux-saga/effects'

import {IAnalysisState, IMoveToMake, PositionsTree} from '../models'

import {copyObj, oppositeColor,} from '../../game-engine/gameplay-helper-functions'
import {GameAnalysisActions as GAA, GameAnalysisTypes,} from '../gameAnalysis/types'
import {
    createDefaultTowers,
    createOutBoardTowers,
    removeOutBoardTowers,
} from '../../game-engine/prestart-help-function'
import {IRootState} from '../rootState&Reducer'
import mmr from '../../game-engine/moves-resolver'
import tur from '../../game-engine/towers-updater'
// import { AnimationDuration } from '../../constants/gameConstants';
import bms from '../../game-engine/best-move-seeker-towers'
import {TowersActions} from '../board-towers/types'
import {BoardOptionActions} from '../boardOptions/types'
import movesTree from '../../game-engine/tower-tree'
import {DefaultMinDepth} from '../../constants/gameConstants'
import {GameOptionActions} from '../gameOptions/types'
import {setBestMoveLine} from '../gameAnalysis/actions'

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
    const {
        analyze,
        board: { positionsTree },
    } = yield select()
    const { movesCurrentLine, movesMainLine, pieceOrder } =
        analyze as IAnalysisState
    if (!movesMainLine?.length) {
        return
    }
    if (movesCurrentLine.length) {
    }
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
    // pieceOrder = index % 2 ? PieceColor.white : PieceColor.black
    // lastMove = action.payload
    // const payload = { lastMove, pieceOrder}
    // yield put({type: GAA.UPDATE_ANALYSIS_STATE, payload})
    // yield put({
    //     type: BoardActions.UPDATE_BOARD_STATE,
    //     payload: {currentPosition, towers}
    // })
    yield
}

function* workerPlayMoves() {}

function* workerStepBack() {
    const {
        analyze,
        board: { positionsTree },
    } = yield select()
    const { movesCurrentLine, movesMainLine, pieceOrder } =
        analyze as IAnalysisState
    if (!movesMainLine?.length) return
}

function* workerSettingBoard(action: GameAnalysisTypes) {
    const {
        boardOptions,
        boardAndTowers,
        analyze: { pieceOrder },
    } = (yield select((state) => state)) as IRootState
    let towers = copyObj(boardAndTowers.towers)
    if (action.payload) {
        towers = createOutBoardTowers(towers, boardOptions.boardSize)
        towers = tur.updateCellsAndTowersPosition(
            { ...boardAndTowers, towers },
            boardOptions
        ).towers
    } else {
        towers = removeOutBoardTowers(towers)
        const payload = mmr.getMovesResultFromTotalMoves(
            mmr.getPositionMoves(towers, pieceOrder)
        )
        yield put({ type: TowersActions.UPDATE_MOVES, payload })
    }
    yield put({ type: TowersActions.UPDATE_TOWERS, payload: towers })
}

function* workerCreateAnalyzeBoard(action: GameAnalysisTypes) {
    const {
        boardAndTowers,
        boardOptions,
        analyze: { analyzingPosition, gameResult },
        game: { gameMode },
    } = (yield select()) as IRootState
    bms.setBestLineCB(setBestMoveLine)
    const rect = document.querySelector('.board__body')?.getBoundingClientRect()
    if (!rect) return
    if ((analyzingPosition && gameResult.movesHistory, gameMode === 'isOver')) {
        yield put({ type: GameOptionActions.FINISH_GAME_SETUP, payload: false })
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: tur.updateCellsAndTowersPosition(
                boardAndTowers,
                boardOptions,
                rect
            ),
        })
        bms.startEvaluation()
    } else if (!analyzingPosition || !gameResult.movesHistory) {
        const towers = createOutBoardTowers({}, boardOptions.boardSize)
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: tur.updateCellsAndTowersPosition(
                { ...boardAndTowers, towers },
                boardOptions,
                rect
            ),
        })
    }
}

function* workerCurrentLine(action: GameAnalysisTypes) {
    const {
        analyze: {
            lastMove: { index },
            movesCurrentLine,
            pieceOrder,
        },
        boardAndTowers,
    } = yield select()
    const {
        moveToSave: { move, position },
    } = action.payload as IMoveToMake
    let payload: Partial<IAnalysisState>
    if (movesCurrentLine[index + 1] === move) {
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: { currentPosition: position },
        })
    } else {
        const movesLine = [...movesCurrentLine.slice(0, index + 1), move]
        const positionsTree = copyObj(
            boardAndTowers.positionsTree!
        ) as PositionsTree
        const newKey = movesLine.join('_')
        positionsTree[newKey] = position
        yield put({
            type: TowersActions.UPDATE_BOARD_STATE,
            payload: { positionsTree: positionsTree, towers: position },
        })
        payload = {
            pieceOrder: oppositeColor(pieceOrder),
            movesCurrentLine: movesLine,
        }
    }
}

function* workerMainLine(action: GameAnalysisTypes) {
    const {
        analyze: {
            lastMove: { index },
            movesMainLine,
            pieceOrder,
        },
        boardAndTowers,
    } = yield select()
}

function* workerNewMove(action: GameAnalysisTypes) {
    const {
        lastMove: { move, index },
        movesCurrentLine,
    } = yield select((state: IRootState) => state.analyze)
    let payload: Partial<IAnalysisState>
    if (movesCurrentLine.length && movesCurrentLine[index] === move) {
        payload = yield workerCurrentLine(action)
    } else {
        payload = yield workerMainLine(action)
    }
}

function* workerAnalyzePosition(action: GameAnalysisTypes) {
    const {
        boardAndTowers,
        analyze: { pieceOrder },
    }: IRootState = yield select()
    if (!action.payload) return
    const towers = tur.getOnboardTowers(boardAndTowers.towers)
    const startBranch = movesTree.createBranchWithTowers(towers, pieceOrder)
    movesTree.setRoot(startBranch)
    movesTree.getDepthData(movesTree.getRoot(), DefaultMinDepth)
    delay(20)
    bms.setState({ game: false })
    bms.startEvaluation()
}

function* workerReverseBoard() {
    const { boardAndTowers, boardOptions } = (yield select()) as IRootState
    const rect = document
        .querySelector('.board__body')
        ?.getBoundingClientRect() as DOMRect
    if (!rect) {
        return
    }
    yield delay(10)
    const payload = tur.updateCellsAndTowersPosition(
        boardAndTowers,
        boardOptions
    )
    yield put({
        type: TowersActions.UPDATE_BOARD_STATE,
        payload,
    })
}

function* workerStartPosition(action: GameAnalysisTypes) {
    const {
        boardOptions: { boardSize },
        boardAndTowers: { cellsMap, cellSize },
    } = (yield select((state: IRootState) => state)) as IRootState
    const towers = action.payload
        ? createDefaultTowers(boardSize)
        : createOutBoardTowers({}, boardSize)
    const payload = tur.updateTowersPosition(cellSize, towers, cellsMap)
    yield put({
        type: TowersActions.UPDATE_TOWERS,
        payload,
    })
}

function* workerSetBestLine() {
    const moves = movesTree.getRoot().moves.map((m) => ({
        move: m.move.split(m.takenPieces ? ':' : '-'),
        endPosition: m.position,
        takenPieces: m.takenPieces,
    }))
    yield put({ type: TowersActions.UPDATE_MOVES, payload: moves })
}

export default function* watcherAnalysis() {
    yield takeLatest(GAA.STEP_BACK, workerStepBack)
    yield takeLatest(GAA.STEP_FORWARD, workerStepForward)
    yield takeLatest(GAA.GO_TO_POSITION, workerGoToPosition)
    // yield takeLatest(GAA.UPDATE_POSITION, workerUpdatePosition)
    yield takeLatest(BoardOptionActions.REVERSE_BOARD, workerReverseBoard)
    yield takeLatest(GAA.ANALYZE_POSITION, workerAnalyzePosition)
    yield takeLatest(GAA.PLAY_MOVES, workerPlayMoves)
    yield takeLatest(GAA.SETTING_BOARD, workerSettingBoard)
    yield takeLatest(GAA.CREATE_ANALYZE_BOARD, workerCreateAnalyzeBoard)
    yield takeLatest(GAA.MAKE_NEW_MOVE, workerNewMove)
    yield takeLatest(GAA.SET_START_POSITION, workerStartPosition)
    yield takeLatest(GAA.SET_BEST_MOVE_LINE, workerSetBestLine)
}
