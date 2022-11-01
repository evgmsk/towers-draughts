import { put, takeLatest, select, delay } from 'redux-saga/effects';

import {TowersActionTypes, TowersActions as TA} from '../board-towers/types'
import {IBoard, IGameBoard, IGameState, IMoveProps, IMoveToMake, TowerConstructor, TowersMap} from '../models';
import {
    createBoardWithoutTowers,
    createOutBoardTowers,
    createDefaultTowers,
    createStartBoardToDraw,
    createAnalysisBoard,
    oppositeColor
} from '../../game-engine/prestart-help-function-constants';
import tur from '../../game-engine/update-towers-functions'
import { GameActions } from '../game/types';
import { IRootState } from '../rootState&Reducer';
import { copyObj, splitMove } from '../../game-engine/gameplay-helper-functions';
import { AnimationDuration } from '../../constants/gameConstants';
import {f} from "../../common/hooks/use-storage";
import movesTree from "../../game-engine/tower-tree";

function* workerCreateBoardToGame() {

}

function* workerCreateEmptyAnalysisBoard() {

}

function* workerCreateBoardToAnalysis() {

}

function* workerUpdateBoardSizeAndTowersPosition() {
    const {boardOptions} = yield select()

    // yield put({type: TA.UPDATE_BOARD_STATE, payload})
}

function* workerSetupBoard() {
    const {boardOptions} = yield select()

    // yield put({type: TA.UPDATE_BOARD_STATE, payload})
}

function* workerAnalysisBoard(action: TowersActionTypes) {
    const {boardOptions} = yield select()
    const payload = {
        ...createAnalysisBoard({boardOptions}),
    }
    yield put({type: TA.UPDATE_BOARD_STATE, payload})
}

function* animateFreeMove(move: IMoveToMake) {
    const {board, boardOptions: {reversedBoard}} = yield select()
    const {moveToMake} = move as IMoveToMake
    const [from, to] = moveToMake.move
    tur.relocateTower(from, to, board, reversedBoard)
    yield delay(AnimationDuration)
    const newState: IRootState = yield select()
    tur.finalizeSimpleMove(from, to, newState.board, reversedBoard)
}

function* animateMandatoryTowerStep(props: Partial<IMoveProps>, step = 0) {
    const {gameOptions: { reversedBoard}, board} = yield select()
    const {moveToSave: {move, position, takenPieces}} = props as IMoveProps
    const [from, to] = move.split(':').slice(step)
    const totalSteps = takenPieces!.length
    const capturedTowerKey = takenPieces![step]
    let tower = position[capturedTowerKey].tower as TowerConstructor
    tur.relocateTower(from, to, board, reversedBoard)
    yield delay(AnimationDuration / totalSteps / 2)
    let state: IRootState = yield select()
    let towers = copyObj(state.board.towers) as TowersMap
    if (tower) {
        tower =  new TowerConstructor(tower)
        tower.onBoardPosition = capturedTowerKey
        tower.positionInDOM = tur.calcTowerPosition(capturedTowerKey, board.cellsMap, board.cellSize, reversedBoard)
        towers[capturedTowerKey] = tower
    } else {
        delete towers[capturedTowerKey]
    }
    yield put({type: TA.UPDATE_BOARD_STATE, payload: {towers}})
    yield delay(AnimationDuration / totalSteps / 2)
    state = yield select()
    towers = tur.finalizeMandatoryMoveStep(from, to, state.board, reversedBoard) as TowersMap
    yield put({type: TA.UPDATE_BOARD_STATE, payload: {towers}})
}

function* animateMandatoryStep(props: Partial<IMoveProps>, step = 0) {
    const {gameOptions: {gameVariant, reversedBoard}, board} = yield select()
    if (gameVariant === 'towers') {
        yield animateMandatoryTowerStep(props, step)
    } else {
        const {moveToSave: {move, takenPieces}} = props as IMoveProps
        const [from, to] = move.split(':').slice(step)
        const totalSteps = takenPieces!.length
        const isLast = totalSteps === step + 1
        tur.relocateTower(from, to, board, reversedBoard)
        yield delay(AnimationDuration / totalSteps)
        let state: IRootState = yield select()
        const towers = tur.finalizeMandatoryMoveStep(from, to, state.board, reversedBoard, isLast)
        yield put({type: TA.UPDATE_BOARD_STATE, payload: {towers}})
        if (isLast) {
            state = yield select()
            const towers = copyObj(state.board.towers)
            takenPieces!.forEach(pKey => {
                delete towers[pKey]
            })
            yield put({type: TA.UPDATE_BOARD_STATE, payload: {towers}})
        }
    }
}

function* animateMandatoryMove(props: Partial<IMoveProps>, step = 0): any {
    const {moveToSave: {takenPieces}} = props as IMoveProps
    if (takenPieces?.length === 1 || takenPieces?.length === step + 1) {
        yield animateMandatoryStep(props, step)
    } else {
        yield animateMandatoryStep(props, step)
        yield animateMandatoryMove(props, step + 1)
    }
}

function* workerTurn(action: TowersActionTypes) {
    const payload = action.payload as IMoveToMake
    const {game: {history}, user: {name}, board} = yield select()
    const {moveToMake: {move, position, takenPieces}, moveOrder} = payload
    const moveForHistory = takenPieces?.length ? move : move
    const key = history.length ? `${history.join('_')}_${moveForHistory}` : moveForHistory
    const positionsTree = copyObj(board.positionsTree)
    positionsTree[key] = position
    let lastMoveSquares = board.lastMoveSquares
    if (moveOrder.playerTurn === name) {
        lastMoveSquares = move
        yield takenPieces?.length ? animateMandatoryMove(payload) :  animateFreeMove(payload)
    }
    const boardProps = {currentPosition: position, positionsTree, lastMoveSquares}
    yield put ({type: TA.UPDATE_BOARD_STATE, payload: boardProps})
    yield put({type: GameActions.MAKE_MOVE, payload})
}

function* workerUndo() {
    const {
        boardAndTowers: {positionsTree, cellSize, cellsMap},
        game: {history, moveOrder: {pieceOrder}, playerColor},
        user: {name},
        boardOptions: {reversedBoard}
    } = yield select()
    if (!history.length) return
    let gamePayload: Partial<IGameState>, boardPayload: Partial<IGameBoard>
    if (pieceOrder === playerColor) {
        gamePayload = {
            history: history.slice(0, -2)
        }
        const towers = positionsTree[gamePayload.history!.join('_')]
        boardPayload = {
            lastMoveSquares: splitMove(gamePayload.history?.slice(-1)[0] || ''),
            towers,
            animationStarted: false,
        }
    } else {
        gamePayload = {
            history: history.slice(0, -1),
            moveOrder: {pieceOrder: oppositeColor(pieceOrder), playerTurn: name}
        }
        const towers = positionsTree[gamePayload.history!.join('_')]
        boardPayload = {
            lastMoveSquares: splitMove(gamePayload.history?.slice(-1)[0] || ''),
            towers,
            animationStarted: false,
        }
    }
    yield put({type: GameActions.UPDATE_GAME_STATE, payload: gamePayload})
    yield put({type: TA.UPDATE_TOWERS, payload: boardPayload})
}
let branch = movesTree.createDefaultRootBranch()
// console.warn('saga1', copyObj(movesTree.tree))
// branch = movesTree.getNextDepthData(branch)
// console.warn('saga2', copyObj(movesTree.tree))
// branch = movesTree.getNextDepthData(branch)
// console.warn('saga3', copyObj(movesTree.tree))
// branch = movesTree.getNextDepthData(branch)
branch = movesTree.getDepthData(branch, 5)
const first = Date.now()
console.warn(1, first)
branch = movesTree.getNextDepthData(branch)
console.warn(2, Date.now(), Date.now() - first)
console.error('saga4', movesTree.tree, branch)
export default function* watcherTowers() {
    yield takeLatest(TA.DOM_BOARD_NEED_UPDATE, workerUpdateBoardSizeAndTowersPosition);
    yield takeLatest(TA.CREATE_GAME_TOWERS, workerCreateBoardToGame)
    yield takeLatest(TA.CREATE_ANALYSIS_TOWERS, workerCreateBoardToAnalysis)
    yield takeLatest(TA.CREATE_OUTBOARD_TOWERS, workerCreateEmptyAnalysisBoard)
    yield takeLatest(TA.TURN, workerTurn)
    yield takeLatest(TA.UNDO_LAST_MOVE, workerUndo)
}
