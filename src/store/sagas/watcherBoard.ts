import { put, takeLatest, select, delay } from 'redux-saga/effects';

import {BoardActionTypes, BoardActions as BA, BoardActions} from '../board/types'
import {GameVariants, IGameBoard, IGameState, IMoveProps, TowerConstructor, TowersMap} from '../models';
import { 
    createEmptyBoardForCustomPosition,
    createStartBoardToDraw,
    createAnalysisBoard,
    oppositColor
} from '../../game-engine/prestart-help-function-constants';
import { GameOptionActions,  GameOptionActionTypes} from '../gameOptions/types';
import tur from '../../game-engine/update-towers-functions'
import { GameActions } from '../game/types';
import { IRootState } from '../rootState&Reducer';
import { copyObj, splitMove } from '../../game-engine/gameplay-helper-functions';
import { AnimationDuration } from '../../constants/gameConstants';
import mmr from "../../game-engine/mandatory-move-resolver";

 
function* workerGameBoard(action: BoardActionTypes) {
    const {boardOptions} = yield select()
    const payload = createStartBoardToDraw({boardOptions})
    yield put({type: BA.UPDATE_BOARD_STATE, payload})
}

function* workerSetupBoard() {
    const {boardOptions} = yield select()
    const payload = createEmptyBoardForCustomPosition({boardOptions})
    yield put({type: BA.UPDATE_BOARD_STATE, payload})
}

function* workerBoardSize(action: GameOptionActionTypes) {
    const {boardOptions} = yield select()
    const boardSize = action.payload as GameVariants === 'international' ? 10 : 8
    tur.setProps({GV: action.payload as GameVariants, size: boardSize})
    mmr.setProps({GV: action.payload as GameVariants, size: boardSize})
    if (boardOptions.boardSize !== boardSize) {
        yield put({type: BA.UPDATE_BOARD_SIZE, payload: boardSize})
    }
}

function* workerAnalysisBoard(action: BoardActionTypes) {
    const {boardOptions} = yield select()
    const payload = {
        ...createAnalysisBoard({boardOptions}),
    }
    yield put({type: BA.UPDATE_BOARD_STATE, payload})
}

function* animateFreeMove(move: IMoveProps) {
    const {board, boardOptions: {reversedBoard}} = yield select()
    const {moveToSave} = move as IMoveProps
    const [from, to] = moveToSave.move.split('-')
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
        yield put({type: BoardActions.UPDATE_BOARD_STATE, payload: {towers}})
        yield delay(AnimationDuration / totalSteps / 2)
        state = yield select()
        towers = tur.finalizeMandatoryMoveStep(from, to, state.board, reversedBoard) as TowersMap
        yield put({type: BoardActions.UPDATE_BOARD_STATE, payload: {towers}})
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
        yield put({type: BoardActions.UPDATE_BOARD_STATE, payload: {towers}})
        if (isLast) {
            state = yield select()
            const towers = copyObj(state.board.towers)
            takenPieces!.forEach(pKey => {
                delete towers[pKey]
            })
            yield put({type: BoardActions.UPDATE_BOARD_STATE, payload: {towers}})
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

function* workerTurn(action: BoardActionTypes) {
    const payload = action.payload as IMoveProps
    const {game: {history}, user: {name}, board} = yield select()
    const {moveToSave: {move, position}, moveOrder} = payload
    const key = history.length ? `${history.join('_')}_${move}` : move
    const positionsTree = copyObj(board.positionsTree)
    positionsTree[key] = position
    let lastMoveSquares = board.lastMoveSquares
    if (moveOrder.playerTurn === name) {
        if (move.includes(':')) {
            lastMoveSquares = move.split(':')
            yield animateMandatoryMove(payload)
        } else {
            lastMoveSquares = move.split('-')
            yield animateFreeMove(payload)
        }
    }
    const boardProps = {currentPosition: position, positionsTree, lastMoveSquares}
    yield put ({type: BoardActions.UPDATE_BOARD_STATE, payload: boardProps})
    yield put({type: GameActions.MAKE_MOVE, payload})
}

function* workerUndo() {
    const {
        board: {positionsTree, cellSize, cellsMap},
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
        const currentPosition = positionsTree.get(gamePayload.history!.join('_'))
        const _towers = tur.updateTowersToBoard(currentPosition)
        const towers = tur.updateTowersPosition(cellSize, _towers, cellsMap, reversedBoard)
        boardPayload = {
            lastMoveSquares: splitMove(gamePayload.history?.slice(-1)[0] || ''),
            currentPosition,
            towers,
            animationStarted: false,
        }
    } else {
        gamePayload = {
            history: history.slice(0, -1),
            moveOrder: {pieceOrder: oppositColor(pieceOrder), playerTurn: name}
        }
        const currentPosition = positionsTree.get(gamePayload.history!.join('_'))
        const _towers = tur.updateTowersToBoard(currentPosition)
        const towers = tur.updateTowersPosition(cellSize, _towers, cellsMap, reversedBoard)
        boardPayload = {
            lastMoveSquares: splitMove(gamePayload.history?.slice(-1)[0] || ''),
            currentPosition: positionsTree.get(gamePayload.history!.join('_')),
            towers,
            animationStarted: false,
        }
    }
    yield put({type: GameActions.UPDATE_GAME_STATE, payload: gamePayload})
    yield put({type: BoardActions.UPDATE_BOARD_STATE, payload: boardPayload})
}

export default function* watcherBoard() {
    yield takeLatest(BA.CREATE_SETUP_BOARD, workerSetupBoard);
    yield takeLatest(BA.CREATE_GAME_BOARD, workerGameBoard)
    yield takeLatest(BA.CREATE_ANALYSIS_BOARD, workerAnalysisBoard)
    yield takeLatest(GameOptionActions.SET_GAME_VARIANT, workerBoardSize)
    yield takeLatest(BoardActions.TURN, workerTurn)
    yield takeLatest(BoardActions.UNDO_LAST_MOVE, workerUndo)
}
