import {evaluator} from './position-evaluator';
import {IBranch, IDeepValue, IMove, ISeekerProps} from './engine-interfaces';
import {IBoardToGame, IMMRResult, PieceColor} from '../store/models';
import mmr from './mandatory-move-resolver';
import movesTree from './moves-tree';
import {oppositeColor} from "./gameplay-helper-functions";

const FirstMoves: {[key:string]: string[]} = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5'],
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',],
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
}

const debutStage = 2

export class BestMoveSeeker implements ISeekerProps {
    bestMoveCB: Function = () => {
    }
    bestLineCB: Function = () => {
    }
    maxDepth = 5
    startDepth = 5
    position = null as unknown as IBoardToGame
    movesHistory = [] as string[]
    pieceOrder = PieceColor.w
    game = true
    evaluatingLine: string[] = []
    valueIncreased?: boolean
    bestMove?: IMMRResult | null
    parentBranch?:  IBranch
    lastBranch?: IBranch

    setState = (props: ISeekerProps) => {
        this.maxDepth = props.maxDepth || 6
        this.startDepth = props.startDepth || 3
        this.game = props.game || true
        this.movesHistory = props.movesHistory || []
        this.pieceOrder = PieceColor.w
    }

    setBestMoveCB = (cb: Function) => {
        this.bestMoveCB = cb
    }
    setBestLineCB = (cb: Function) => {
        this.bestLineCB = cb
    }

    makeMove = (move: string, board: IBoardToGame): IBoardToGame => {
        if (move.includes(':')) {
            return mmr.makeMandatoryMove(move.split(':'), board)
        }
        const [from, to] = move.split('-')
        return mmr.makeFreeMove(from, to, board)
    }

    debutResolver = () => {
        console.warn('debut resolver', this)
        const _moves = this.movesHistory.length < 1
            ? FirstMoves[mmr.GV]
            : mmr.lookForAllPossibleMoves(this.pieceOrder, this.position)
        const pieceOrder = oppositeColor(this.pieceOrder)
        const move = _moves[Math.floor(Math.random() * _moves.length)]
        const [from, to] = move.split('-')
        const moveToMake = {move, position: mmr.makeFreeMove(from, to, this.position)}
        const moves = this.getAvailableMoves(moveToMake.position, pieceOrder)
        const branch = this.defineNewBranch(move, moveToMake.position, pieceOrder, moves)
        movesTree.addRoot(branch)
        this.finalizeMove(moveToMake)
    }

    updateAfterRivalMove = (props: {history: string[], cP: IBoardToGame, pieceOrder: PieceColor}) => {
        const {history, cP: position, pieceOrder} = props
        this.evaluatingLine.length = 0
        this.pieceOrder = pieceOrder
        this.movesHistory = history
        this.position = position
        const hLength = history.length
        if (hLength < debutStage && this.game) {
            console.warn('first rivalMove', position)
            return this.debutResolver()
        }
        let actualBranch = movesTree.getBranch(history.slice(-1)) as IBranch
        if (!actualBranch){
            const moves = this.getAvailableMoves(position, pieceOrder)
            actualBranch = this.defineNewBranch(history.slice(-1)[0], position, pieceOrder, moves)
            console.warn('new branch', actualBranch, movesTree)
        }
        const availableMovesLength = actualBranch.moves.length
        if (!availableMovesLength) {
            return this.finalizeMove()
        }
        this.parentBranch = movesTree.getRoot() as IBranch
        movesTree.addRoot(actualBranch)
        console.warn('moves length ' , availableMovesLength, movesTree, this.parentBranch)
        if (availableMovesLength === 1) {
            const {move, position} = actualBranch.moves[0]
            return this.finalizeMove({move, position})
        }
        console.warn('step forward', this)
        this.startEvaluation()
    }

    startEvaluation() {
        const root = movesTree.getRoot() as IBranch
        const {move, position, pieceOrder} = this.lookUnevaluatedForward(root)
        if (!move || !position || !pieceOrder) {
            return this.finalizeMove(this.getBestMove(root))
        }
        const moves = this.getAvailableMoves(position, pieceOrder)
        const nextBranch = this.defineNewBranch(move, position, pieceOrder, moves)
        console.warn('evline at start ev', this.evaluatingLine)
        this.addBranch(nextBranch)
        if (this.evaluatingLine.length < this.maxDepth || nextBranch.pieceOrder === this.pieceOrder) {
            this.resolveStepForwardForCurrentBranch(nextBranch)
        } else if (this.pieceOrder !== nextBranch.pieceOrder) {
            this.resolveMaxDepthOrNoMoves()
        }
    }


    resolveStepForwardForCurrentBranch = (branch: IBranch) => {
        console.warn('forward', branch)
        let unevalMove = this.lookUnevaluatedForward(branch)
        if (!unevalMove.move) {
            const root = movesTree.getRoot() as IBranch
            unevalMove = branch.parentBranch
                ? this.lookUnevaluatedForward(root)
                : unevalMove
            if (!unevalMove.move) {
                return this.finalizeMove(this.getBestMove(root))
            }
        }
        const {move, position, pieceOrder} = unevalMove as IMove
        const moves = this.getAvailableMoves(position, pieceOrder!)
        const nextBranch = this.defineNewBranch(move, position, pieceOrder!, moves)
        console.warn('evline at forw', this.evaluatingLine)
        this.addBranch(nextBranch)
        if (!moves.length) {
            return this.resolveMaxDepthOrNoMoves()
        }
        if (this.evaluatingLine.length >= this.maxDepth && pieceOrder !== this.pieceOrder) {
            console.warn('max depth achieved', movesTree.getTree)
            this.lastBranch = nextBranch
            return setTimeout(this.resolveMaxDepthOrNoMoves)
        } else {
            this.resolveStepForwardForCurrentBranch(nextBranch)
        }
    }

    addBranch(branch: IBranch) {
        movesTree.addBranch(branch, this.evaluatingLine)
        this.evaluatingLine.push(branch.rivalMove)
    }

    lookUnevaluatedForward(branch: IBranch): Partial<IMove> {
        console.warn('look ineval 1', branch, this.evaluatingLine)
        const {moves, pieceOrder} = branch
        let unEval = branch.children[moves[moves.length - 1].move]
        const newPieceOrder = oppositeColor(pieceOrder)
        if (!unEval) {
            const {move, position} = moves[moves.length - 1]
            return {
                move,
                position,
                pieceOrder: newPieceOrder
            }
        }
        for (let i = 0; i < moves.length - 1; i++) {
            const nextBranch = branch.children[moves[i].move]
            if (!nextBranch) {
                const {move, position} = moves[i]
                return {move, position, pieceOrder: newPieceOrder}
            }
            unEval = nextBranch.deepValue.depth < unEval.deepValue.depth ? nextBranch : unEval
        }
        if (!unEval || (this.pieceOrder === unEval.pieceOrder
            && this.evaluatingLine.length >= this.maxDepth)) {
            return {}
        }
        this.evaluatingLine = this.evaluatingLine.length
            ? this.evaluatingLine.concat(unEval.rivalMove)
            : [unEval.rivalMove]
        console.warn('look ineval 2', branch, this.evaluatingLine)
        return this.lookUnevaluatedForward(unEval)
    }

    filterEqualOrGreaterThanDepth = (branch: IBranch, depth: number)  => {
        const {moves, children} = branch
        let best: IMove & {deepValue: IDeepValue}
        const filterMoves = moves.filter(m => {
            const included = children[m.move].deepValue && children[m.move].deepValue.depth >= depth
            if (included) {
                const deepValue = children[m.move].deepValue
                best = best || {...m, deepValue}
                best = best.deepValue.value > deepValue.value
                        ? best
                        : {...m, deepValue}
            }
            return included
        })
        return filterMoves.length ? filterMoves.concat(best!) : []
    }

    filterBelowOfDepth = (branch: IBranch, depth: number) => {
        const {moves, children} = branch
        return moves.filter(m =>
            !children[m.move] || children[m.move].deepValue!.depth < depth)
    }

    finalizeMove(moveProps?: IMMRResult) {
        moveProps = moveProps || {move: '', position: {}}
        this.evaluatingLine.length = 0
        if (moveProps.move && this.movesHistory.length >= debutStage) {
            movesTree.updateRoot(moveProps.move)
        }
        this.bestMoveCB(moveProps)
    }

    getBestMove(props: IMove[] | IBranch) {
        if (Array.isArray(props)) {
            const bestMove = props.slice(0, -1).reduce((acc, move) => {
                return acc.baseValue > move.baseValue ? acc : move
            }, props[props!.length - 1])
            const deepValue = {depth: 0, value: bestMove.baseValue}
            return {move: bestMove.move, position: bestMove.position, deepValue}
        }
        const {moves, children} = props
        const acc = children[moves.slice(-1)[0].move] as IBranch
        const bestMove = moves.slice(0, -1).reduce((acc: IBranch, move) => {
            const condition = children[move.move].deepValue.depth >= acc.deepValue.depth
                    && acc.deepValue.value < children[move.move].deepValue.value
            acc = condition ? children[move.move] : acc
            return acc
        }, acc)
        return {
            move: bestMove.rivalMove,
            position: bestMove.position,
            deepValue: bestMove.deepValue
        }
    }

    getAvailableMoves = (pos: IBoardToGame, pieceOrder: PieceColor) => {
        return mmr.lookForAllMoves(pieceOrder, pos).map((move: IMMRResult) => {
            const posValue = evaluator.evaluateCurrentPosition(move.position)
            return {
                move: move.move,
                position: move.position,
                baseValue: pieceOrder === PieceColor.w ? posValue : -posValue
            }
        })
    }

    defineNewBranch(rivalMove: string, pos: IBoardToGame, pieceOrder: PieceColor, moves: IMove[]) {
        let deepValue: IDeepValue
        if (moves.length) {
            const bestMove = this.getBestMove(moves)
            deepValue = { ...bestMove.deepValue, value: -bestMove.deepValue.value }
        } else {
            deepValue = { depth: this.maxDepth, value: 50 }
        }
        return {
            moves,
            position: pos,
            rivalMove,
            deepValue,
            pieceOrder,
            children: {}
        } as IBranch
    }

    lookAvailableBackward(branch: IBranch) {
        const unevalMoves = this.filterBelowOfDepth(branch, 0)
        if (unevalMoves.length) {
            setTimeout(() => this.resolveStepForwardForCurrentBranch(branch))
        } else {
            this.resolveMaxDepthOrNoMoves()
        }
    }

    resolveMaxDepthOrNoMoves() {
        const evaluatingLine = this.determineBackwardBranch() as string[]
        console.warn('evline', this.evaluatingLine, evaluatingLine)
        if (evaluatingLine[0] !== 'fin') {
            this.evaluatingLine = evaluatingLine
            const branch = movesTree.getBranch(evaluatingLine)
            return this.lookAvailableBackward(branch)
        }
        const rootMoves = this.filterEqualOrGreaterThanDepth(movesTree.getRoot() as IBranch, this.maxDepth)
        if (rootMoves.length) {
            return this.finalizeMove(rootMoves[rootMoves.length - 1])
        }
        console.error('not evaluated branches in the root', movesTree, this)
    }

    determineBackwardBranch(sameOrder = !(this.evaluatingLine.length % 2)) {
        const lastValue = this.lastBranch?.deepValue.value
        if (!lastValue) {console.error('comparison value not specified'); return}
        console.warn('determine evolution of value', sameOrder, this.parentBranch, movesTree)
        const root =
            movesTree.getRoot() as IBranch
        if ((sameOrder && lastValue > root.deepValue.value)
            || (!sameOrder && lastValue > this.parentBranch!.deepValue.value)) {
            return this.evaluatingLine.length >= 1
                ? this.evaluatingLine.slice(0, -1)
                : ['fin']
        } else if ((!sameOrder && lastValue < this.parentBranch!.deepValue.value)
            || (sameOrder && lastValue < root.deepValue.value)) {
            return this.evaluatingLine.length >= 2
                ? this.evaluatingLine.slice(0, -2)
                : ['fin']
        }
    }
}

export type BestMoveSeekerType = BestMoveSeeker

export default new BestMoveSeeker()
