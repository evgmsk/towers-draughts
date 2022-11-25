import {
    Branch,
    Move,
    MoveWithRivalMoves,
    PieceColor,
    SeekerProps,
    TowersMap,
} from '../store/models'
import mmr from './moves-resolver'
import movesTree from './tower-tree'
import { copyObj } from './gameplay-helper-functions'
import { createDefaultTowers } from './prestart-help-function'
import {
    DebutStage,
    DefaultMaxDepth,
    DefaultMinDepth,
} from '../constants/gameConstants'

const towers8 = createDefaultTowers(8)
const towers10 = createDefaultTowers(10)

const FirstMoves: { [key: string]: Move[] } = {
    international: [
        'd4-e5',
        'd4-e5',
        'd4-e5',
        'd4-c5',
        'd4-c5',
        'h4-g5',
        'h4-i5',
    ].map((m) => ({
        move: m,
        position: mmr.makeMove({ move: m.split('-'), startPosition: towers10 }),
    })),
    russian: [
        'c3-d4',
        'c3-d4',
        'c3-d4',
        'c3-b4',
        'c3-b4',
        'e3-f4',
        'a3-b4',
    ].map((m) => ({
        move: m,
        position: mmr.makeMove({ move: m.split('-'), startPosition: towers8 }),
    })),
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4'].map(
        (m) => ({
            move: m,
            position: mmr.makeMove({
                move: m.split('-'),
                startPosition: towers8,
            }),
        })
    ),
}

export class BestMoveSeeker implements SeekerProps {
    maxDepth = DefaultMaxDepth
    startDepth = DefaultMinDepth
    towers = towers8
    movesHistory = [] as string[]
    pieceOrder = PieceColor.white
    game = false
    evaluatingLine: string[] = []
    valueIncreased?: boolean
    parentBranch = null as unknown as Branch
    lastBranch?: Branch

    bestMoveCB: Function = () => {}

    bestLineCB: Function = () => {}

    setState = (props: SeekerProps) => {
        this.maxDepth =
            props.maxDepth || (props.game ? DefaultMaxDepth : DefaultMinDepth)
        this.startDepth = props.startDepth || DefaultMinDepth
        this.game = props.game
        this.movesHistory = props.movesHistory || []
        this.pieceOrder = props.pieceOrder || PieceColor.white
        this.parentBranch =
            props.parentBranch ||
            ({ deepValue: { value: { black: 0, white: 0 } } } as Branch)
        console.warn('engine state', props, copyObj(this))
    }

    setBestMoveCB = (cb: Function) => {
        this.bestMoveCB = cb
    }

    setBestLineCB = (cb: Function) => {
        this.bestLineCB = cb
    }

    getRandomSecondMove(moves: Move[], best: Move): Move {
        const _moves = Object.assign([], moves).concat([best, best])
        return _moves[Math.floor(Math.random() * _moves.length)]
    }

    debutResolver = () => {
        let move: Move, root
        if (!this.movesHistory.length) {
            move = FirstMoves[mmr.GV][
                Math.floor(Math.random() * FirstMoves[mmr.GV].length)
            ] as Move
        } else {
            movesTree.updateRoot(
                this.movesHistory[this.movesHistory.length - 1]
            )
            root = movesTree.getRoot()
            root = movesTree.getDepthData(root, this.startDepth)
            const bestMove = {
                move: root.deepValue.move,
                position: root.children[root.deepValue.move!].position,
            }
            move = this.getRandomSecondMove(root.moves, bestMove)
        }
        const moveToMake = Object.assign(Object.assign({}, move), {
            rivalMoves: movesTree.getRivalMoves(move.move),
        })
        this.finalizeMove(moveToMake)
    }

    updateState = (props: {
        history: string[]
        cP: TowersMap
        pieceOrder: PieceColor
    }) => {
        const { history, cP, pieceOrder } = props
        this.evaluatingLine.length = 0
        this.pieceOrder = pieceOrder
        this.movesHistory = history
        this.towers = cP
    }

    sortMovesByValue(branch: Branch): Move[] {
        const { moves, pieceOrder, children } = branch
        branch.moves = moves.sort(
            (a, b) =>
                children[b.move].deepValue.value[pieceOrder] -
                children[a.move].deepValue.value[pieceOrder]
        )
        return branch.moves
    }

    diggingToMaxDepth(depth = this.maxDepth) {
        const root = movesTree.getRoot()
        const { pieceOrder, children, deepValue } = root
        const sortedRootMoves = this.sortMovesByValue(root)
        if (sortedRootMoves[0].move !== root.deepValue.move) {
            console.error('invalid root deep value')
        }
        let nextBestBranch = children[sortedRootMoves[0].move],
            extraDepth = 0,
            currentMove = 0
        while (true) {
            movesTree.getNextDepthData(nextBestBranch)
            nextBestBranch =
                nextBestBranch.children[nextBestBranch.deepValue.move]
            movesTree.getNextDepthData(nextBestBranch)
            nextBestBranch =
                nextBestBranch.children[nextBestBranch.deepValue.move]
            extraDepth += 2
            if (extraDepth === depth - deepValue.depth) {
                if (
                    deepValue.value[pieceOrder] <
                    nextBestBranch.deepValue.value[pieceOrder]
                ) {
                    break
                } else if (currentMove < sortedRootMoves.length) {
                    nextBestBranch = children[sortedRootMoves[currentMove].move]
                    currentMove += 1
                }
            }
        }
    }

    getMoveFromRootMoves(): Move {
        const root = movesTree.getRoot()
        const moves = root.moves
        for (let m of moves) {
            if (m.move === root.deepValue.move) {
                return m
            }
        }
        console.error('move did not find', movesTree.getRoot())
        return {} as Move
    }

    startPositionEvaluating() {
        const root = movesTree.getRoot()
        if (!root) {
            console.error('position did not save', root)
            return
        }
        movesTree.getDepthData(root, this.startDepth)
        const line = movesTree.determineBestMovesLine()
        this.bestLineCB(line)
    }

    startEvaluation() {
        const root = movesTree.getRoot()
        if (!root) {
            console.error('root did nit find', movesTree.getTree)
            return
        }
        movesTree.getDepthData(root, this.startDepth)
        this.bestLineCB(movesTree.determineBestMovesLine())
    }

    updateAfterRivalMove = (props: {
        history: string[]
        cP: TowersMap
        pieceOrder: PieceColor
    }) => {
        const { history, cP, pieceOrder } = props
        this.movesHistory = history
        this.towers = cP
        this.pieceOrder = pieceOrder
        if (this.movesHistory.length < DebutStage && this.game) {
            return this.debutResolver()
        }
        const lastRivalMove = this.movesHistory[this.movesHistory.length - 1]
        console.warn('old root', copyObj(movesTree.getRoot()), props)
        movesTree.updateRoot(lastRivalMove)
        const root = movesTree.getRoot()
        if (!root.moves.length) {
            return this.finalizeMove()
        }
        movesTree.getDepthData(movesTree.getRoot(), this.startDepth)
        if (root.moves.length === 1) {
            const move = root.moves[0]
            const moveToMake = {
                ...move,
                rivalMoves: movesTree.getRivalMoves(move.move),
            }
            return this.finalizeMove(moveToMake)
        }
        console.warn('updated tree', movesTree.getRoot())
        if (root.deepValue.depth < this.maxDepth) {
            console.warn('digging')
            this.diggingToMaxDepth(this.maxDepth)
        } else {
            const move = this.getMoveFromRootMoves() as MoveWithRivalMoves
            // console.warn('move', move)
            move.rivalMoves = movesTree.getRivalMoves(move.move)
            this.game && this.finalizeMove(move)
            !this.game && this.determineBestMovesLine()
        }
    }

    determineBestMovesLine() {
        this.bestLineCB(movesTree.determineBestMovesLine())
    }

    finalizeMove = (move?: MoveWithRivalMoves) => {
        move = move || { move: '', position: {}, rivalMoves: [] }
        this.evaluatingLine.length = 0
        console.error('line before move', movesTree.determineBestMovesLine())
        !!move.move &&
            movesTree.updateRoot(move.move) &&
            movesTree.getNextDepthData(movesTree.getRoot())
        console.error('line after move', movesTree.determineBestMovesLine())
        this.bestMoveCB(move)
    }
}

export type BestMoveSeekerType = BestMoveSeeker

export default new BestMoveSeeker()
