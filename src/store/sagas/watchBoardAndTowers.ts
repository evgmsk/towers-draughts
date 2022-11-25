import {delay, put, select, takeLatest} from 'redux-saga/effects'

import {TowersActions as TA, TowersActionTypes} from '../board-towers/types'
import {IBoard, IGameState, IMoveToMake, PieceColor, TowerTouched, TowerType,} from '../models'

import tur from '../../game-engine/towers-updater'
import {GameActions as GM} from '../game/types'
import {IRootState} from '../rootState&Reducer'
import {
    checkIfNumberOfKingsChanged,
    copyObj,
    oppositeColor,
    possibleOutOfMoves,
    splitMove,
} from '../../game-engine/gameplay-helper-functions'
import {AnimationDuration} from '../../constants/gameConstants'

// function* workerCreateBoardToGame() {
//
// }
//
// function* workerCreateEmptyAnalysisBoard() {
//
// }
//
// function* workerCreateBoardToAnalysis() {
//
// }

function* workerUpdateBoardSizeAndTowersPosition(action: TowersActionTypes) {
    const { boardOptions, boardAndTowers } = (yield select()) as IRootState
    const rect = action.payload as DOMRect
    const payload = tur.updateCellsAndTowersPosition(
        boardAndTowers,
        boardOptions,
        rect
    )
    yield put({ type: TA.UPDATE_BOARD_STATE, payload })
}

function* workerCancelTowerTransition() {
    const { boardAndTowers } = (yield select()) as IRootState
    const towers = tur.cancelTowerTransition(boardAndTowers)
    const payload: Partial<IBoard> = {
        towerTouched: null as unknown as TowerTouched,
        towers,
    }
    yield put({ type: TA.UPDATE_BOARD_STATE, payload })
}

function* animateFreeMove(_move: IMoveToMake) {
    const {
        boardAndTowers,
        boardAndTowers: { cellsMap, cellSize },
    } = (yield select()) as IRootState
    const {
        moveToSave: { move, position },
    } = _move as IMoveToMake
    const [from, to] = move.split('-')
    let towers = copyObj(boardAndTowers.towers)
    let tower = towers[from]
    tower.positionInDOM = tur.calcTowerPosition(to, cellsMap, cellSize)
    yield put({ type: TA.UPDATE_TOWERS, payload: towers })
    yield delay(AnimationDuration)
    const state = (yield select()) as IRootState
    towers = copyObj(state.boardAndTowers.towers)
    tower = towers[from]
    tower.onBoardPosition = to
    tower.currentType = position[to].currentType
    towers[to] = tower
    delete towers[from]
    yield put({ type: TA.UPDATE_TOWERS, payload: towers })
}

function* startMandatoryStepAnimation(props: Partial<IMoveToMake>, step = 0) {
    const {
        moveToSave: { move },
    } = props as IMoveToMake
    const {
        boardAndTowers: { cellSize, cellsMap },
        boardAndTowers,
    } = (yield select()) as IRootState

    const [from, to] = move.split(':').slice(step, step + 2)
    let towers = copyObj(boardAndTowers.towers)
    let tower = towers[from]
    tower.positionInDOM = tur.calcTowerPosition(to, cellsMap, cellSize)
    yield put({ type: TA.UPDATE_TOWERS, payload: towers })
}

function* animateMandatoryStep(
    props: Partial<IMoveToMake>,
    step = 0,
    last = false
) {
    yield startMandatoryStepAnimation(props, step)
    const {
        moveToSave: { takenPieces = [], position, move },
    } = props as IMoveToMake
    const {
        boardAndTowers,
        boardAndTowers: { cellsMap, cellSize },
        gameOptions: { gameVariant },
    } = (yield select()) as IRootState
    let towers = copyObj(boardAndTowers.towers)
    const isTowers = gameVariant === 'towers'
    yield delay(isTowers ? AnimationDuration / 2 : AnimationDuration)
    if (isTowers) {
        const tower = towers[move.split(':')[step]],
            takenTowerKey = takenPieces[step],
            takenWhite = towers[takenTowerKey].currentColor === PieceColor.white
        tower[takenWhite ? 'wPiecesQuantity' : 'bPiecesQuantity'] += 1
        const takenTower = position[takenTowerKey]
        if (takenTower) {
            takenTower.positionInDOM = tur.calcTowerPosition(
                takenTowerKey,
                cellsMap,
                cellSize
            )
            towers[takenTowerKey] = takenTower
        }
        !takenTower && delete towers[takenTowerKey]
        yield delay(AnimationDuration / 2)
    }
    yield put({ type: TA.UPDATE_TOWERS, payload: towers })
    yield finalizeMandatoryStep(props, step, last)
}

function* finalizeMandatoryStep(
    props: Partial<IMoveToMake>,
    step = 0,
    last = false
) {
    const {
        moveToSave: { move, takenPieces = [] },
    } = props as IMoveToMake
    const {
        boardAndTowers,
        gameOptions: { gameVariant },
    } = (yield select()) as IRootState
    const [from, to] = move.split(':').slice(step, step + 2)
    let towers = copyObj(boardAndTowers.towers)
    const tower = towers[from]
    tower.onBoardPosition = to
    if (last && gameVariant !== 'towers') {
        towers = tur.takeDraughts(takenPieces, towers)
    }
    tower.currentType = tur.checkTowerTypeChanging(
        to,
        tower.currentColor,
        tower.currentType
    )
    towers[to] = tower
    delete towers[from]
    yield put({ type: TA.UPDATE_TOWERS, payload: towers })
}

function* animateMandatoryMove(props: Partial<IMoveToMake>, step = 0): any {
    const {
        moveToSave: { takenPieces },
    } = props as IMoveToMake
    const last = takenPieces?.length === 1 || takenPieces?.length === step + 1
    if (last) {
        yield animateMandatoryStep(props, step, last)
    } else {
        yield animateMandatoryStep(props, step)
        yield animateMandatoryMove(props, step + 1)
    }
}

function* workerTurn(action: TowersActionTypes) {
    const payload = action.payload as IMoveToMake
    const {
        game: { history, playerColor, ineffectiveMoves },
        boardAndTowers,
    } = (yield select()) as IRootState
    const {
        moveOrder,
        moveToSave: { position, takenPieces, move, rivalMoves },
    } = payload
    if (
        takenPieces ||
        checkIfNumberOfKingsChanged(
            boardAndTowers.towers,
            position,
            move.split('-')
        )
    ) {
        yield put({ type: GM.INEFFECTIVE_MOVE, payload: 0 })
    } else {
        yield put({
            type: GM.INEFFECTIVE_MOVE,
            payload: (ineffectiveMoves || 0) + 1,
        })
    }
    const key = history.length ? `${history.join('_')}_${move}` : move
    const positionsTree = copyObj(boardAndTowers.positionsTree)
    positionsTree[key] = position
    const lastMoveSquares = move.split(takenPieces?.length ? ':' : '-')
    if (moveOrder.pieceOrder === playerColor) {
        yield takenPieces?.length
            ? animateMandatoryMove(payload)
            : animateFreeMove(payload)
    }
    const boardPayload = { positionsTree, lastMoveSquares, moves: rivalMoves }
    yield put({ type: TA.UPDATE_BOARD_STATE, payload: boardPayload })
    yield delay(AnimationDuration)
    yield put({ type: GM.MAKE_MOVE, payload })
}

function* workerUndo() {
    const {
        boardAndTowers,
        game: {
            history,
            moveOrder: { pieceOrder },
            playerColor,
        },
        user: { name },
        boardOptions,
    } = yield select()
    if (!history.length) return
    let gamePayload: Partial<IGameState>, boardPayload: Partial<IBoard>
    if (pieceOrder === playerColor) {
        gamePayload = {
            history: history.slice(0, -2),
        }
        const towers =
            boardAndTowers.positionsTree[gamePayload.history!.join('_')]
        boardPayload = {
            lastMoveSquares: splitMove(gamePayload.history?.slice(-1)[0] || ''),
            towers: tur.updateCellsAndTowersPosition(
                { ...boardAndTowers, towers },
                boardOptions
            ).towers,
        }
    } else {
        gamePayload = {
            history: history.slice(0, -1),
            moveOrder: {
                pieceOrder: oppositeColor(pieceOrder),
                playerTurn: name,
            },
        }
        const towers =
            boardAndTowers.positionsTree[gamePayload.history!.join('_')]
        boardPayload = {
            lastMoveSquares: splitMove(
                gamePayload.history![gamePayload.history!.length - 1] || ''
            ),
            towers: tur.updateCellsAndTowersPosition(
                { ...boardAndTowers, towers },
                boardOptions
            ).towers,
        }
    }
    yield put({ type: GM.UPDATE_GAME_STATE, payload: gamePayload })
    yield put({ type: TA.UPDATE_BOARD_STATE, payload: boardPayload })
}

function* workerSetTouchedTower(action: TowersActionTypes) {
    const { key, clientX, clientY } = action.payload as {
        key: string
        clientX: number
        clientY: number
    }
    const {
        game: { gameMode },
        analyze: { analyzingPosition },
        boardAndTowers: { cellsMap, towers },
        boardAndTowers,
    } = (yield select()) as IRootState
    const tower = towers[key]
    const setPos = gameMode !== 'isPlaying' && !analyzingPosition
    const possibleMoves = setPos
        ? cellsMap
        : possibleOutOfMoves(boardAndTowers, key)
    if (!Object.keys(possibleMoves).length) {
        // todo sound
        return
    }
    const towerTouched: TowerTouched = {
        key,
        possibleMoves,
        startCursorPosition: { x: clientX, y: clientY },
        startTowerPosition: tower.positionInDOM!,
        towerColor: tower.currentColor,
        towerType: tower.currentType as TowerType,
    }
    const payload = towerTouched
    yield put({ type: TA.UPDATE_TOUCHED_TOWER, payload })
}

export default function* watcherTowers() {
    console.log('saga towers')
    yield takeLatest(
        TA.DOM_BOARD_NEED_UPDATE,
        workerUpdateBoardSizeAndTowersPosition
    )
    yield takeLatest(TA.CANCEL_TOWER_TRANSITION, workerCancelTowerTransition)
    yield takeLatest(TA.SET_TOUCHED_TOWER, workerSetTouchedTower)
    yield takeLatest(TA.TURN, workerTurn)
    yield takeLatest(TA.UNDO_LAST_MOVE, workerUndo)
}
