import {evaluator} from './position-evaluator';
import {
    IBoardToGame,
    IMMRResult,
    PieceColor,
    TowersMap,
    IBestMove,
    IBranch,
    IDeepValue,
    IMove,
    ISeekerProps
} from '../store/models';
import mmr from './mandatory-move-resolver';
import movesTree from './moves-tree';
import {copyObj, oppositeColor} from "./gameplay-helper-functions";

const FirstMoves: {[key:string]: string[]} = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5'],
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',],
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
}

const Advantage = 2

const debutStage = 2

export class BestMoveSeeker implements ISeekerProps {
    bestMoveCB: Function = () => {
    }
    bestLineCB: Function = () => {
    }
    maxDepth = 5
    startDepth = 5
    position = null as unknown as IBoardToGame
    towers = null as unknown as TowersMap
    movesHistory = [] as string[]
    pieceOrder = PieceColor.w
    game = false
    evaluatingLine: string[] = []
    valueIncreased?: boolean
    bestMove?: IMMRResult | null
    parentBranch = null as unknown as IBranch
    lastBranch?: IBranch

    setState = (props: ISeekerProps) => {
        this.maxDepth = props.maxDepth || props.game ? 5 : 3
        this.startDepth = props.startDepth || 3
        this.game = props.game
        this.movesHistory = props.movesHistory || []
        this.pieceOrder = props.pieceOrder || PieceColor.w
        this.parentBranch = props.parentBranch || {deepValue: {value: 0}} as IBranch
        console.warn('state', copyObj(this))
    }

    setBestMoveCB = (cb: Function) => {
        this.bestMoveCB = cb
    }
    setBestLineCB = (cb: Function) => {
        console.warn('line cb', copyObj(this), this.bestLineCB)
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
        const _moves = this.movesHistory.length < 1
            ? FirstMoves[mmr.GV]
            : mmr.lookForAllFreeMoves(this.pieceOrder, this.position, this.towers)
        const pieceOrder = oppositeColor(this.pieceOrder)
        const move = _moves[Math.floor(Math.random() * _moves.length)]
        const [from, to] = move.split('-')
        const moveToMake = {move, position: mmr.makeFreeMove(from, to, this.position)}
        const moves = this.getAvailableMoves(moveToMake.position, pieceOrder)
        const branch = this.defineNewBranch(move, moveToMake.position, pieceOrder, moves)
        this.finalizeMoveWithNewRoot(branch, moveToMake)
    }

    updateState = (props: {history: string[], cP: IBoardToGame, pieceOrder: PieceColor}) => {
        const {history, cP: position, pieceOrder} = props
        this.evaluatingLine.length = 0
        this.pieceOrder = pieceOrder
        this.movesHistory = history
        this.position = position
    }

    getActualBranch = (lastRivalMove: string[],
                    position = this.position,
                    pieceOrder = this.pieceOrder): IBranch => {
        let actualBranch = movesTree.getBranch(lastRivalMove) as IBranch
        if (!actualBranch){
            const moves = this.getAvailableMoves(position, pieceOrder)
            actualBranch = this.defineNewBranch(lastRivalMove[0], position, pieceOrder, moves)
        }
        return actualBranch
    }

    updateAfterRivalMove = (props: {history: string[], cP: IBoardToGame, pieceOrder: PieceColor}) => {
        const {history, cP, pieceOrder} = props
        this.movesHistory = history
        this.position = cP
        this.pieceOrder = pieceOrder
        const lastRivalMove = this.movesHistory.slice(-1)
        if (this.movesHistory.length < debutStage && this.game) {
            return this.debutResolver()
        }
        const actualBranch = this.getActualBranch(lastRivalMove)
        // console.warn('update state', copyObj(this), actualBranch)
        const availableMovesLength = actualBranch.moves.length
        this.parentBranch = movesTree.getRoot() as IBranch || this.parentBranch
        movesTree.addRoot(actualBranch)
        console.warn('update state', copyObj(movesTree.tree), this.parentBranch, actualBranch)
        if (!availableMovesLength) {
            return this.finalizeMove()
        }
        if (availableMovesLength === 1) {
            const {move, position} = actualBranch.moves[0]
            const branch = this.getActualBranch([move], position, oppositeColor(this.pieceOrder))
            return this.finalizeMoveWithNewRoot(branch, {move, position})
        }
        return setTimeout(this.startEvaluation)
    }

    startEvaluation = () => {
        console.log('start', copyObj((movesTree.getRoot() as IBranch).moves), this)
        const root = movesTree.getRoot() as IBranch
        const {move, position, pieceOrder} = this.lookUnevaluatedForward(root)
        if (!move || !position || !pieceOrder) {
            const move = this.getBestMove(root)
            return new Promise<IMove>(rs => {
                return rs(this.finalizeMove(move))
            })
        }
        const moves = this.getAvailableMoves(position, pieceOrder)
        const nextBranch = this.defineNewBranch(move, position, pieceOrder, moves)
        this.addBranch(nextBranch)
        if (this.evaluatingLine.length < this.maxDepth || nextBranch.pieceOrder === this.pieceOrder) {
            return this.resolveStepForwardForCurrentBranch(nextBranch)
        }
        return this.lookUnevaluatedBackward()
    }

    resolveStepForwardForCurrentBranch = (branch: IBranch): any => {
        if (!branch.moves.length) {
            return setTimeout(this.lookUnevaluatedBackward)
        }
        let unevalMove = this.lookUnevaluatedForward(branch)
        if (!unevalMove.move) {
            const root = movesTree.getRoot() as IBranch
            unevalMove = branch.parentBranch
                ? this.lookUnevaluatedForward(root)
                : unevalMove
            if (!unevalMove.move) {
                const move = this.getBestMove(root)
                return this.finalizeMove(move)
            }
        }
        const {move, position, pieceOrder} = unevalMove as IMove
        const moves = this.getAvailableMoves(position, pieceOrder!)
        const nextBranch = this.defineNewBranch(move, position, pieceOrder!, moves)
        this.addBranch(nextBranch)
        if ((this.evaluatingLine.length >= this.maxDepth
                && pieceOrder !== this.pieceOrder)
            || !moves.length) {
            this.lastBranch = movesTree.getBranch(this.evaluatingLine)
            // console.warn('max depth achieved or not moves', this, pieceOrder, movesTree.tree)
            return setTimeout(this.lookUnevaluatedBackward)
        } else {
            return this.resolveStepForwardForCurrentBranch(nextBranch)
        }
    }

    addBranch = (branch: IBranch) => {
        movesTree.addBranch(branch, this.evaluatingLine)
        this.evaluatingLine.push(branch.rivalMove)
    }

    lookUnevaluatedForward = (branch: IBranch): Partial<IMove> => {
        const {moves, pieceOrder} = branch

        const {move, position} = moves[moves.length - 1]
        let unEval = branch.children[move]
        const newPieceOrder = oppositeColor(pieceOrder)
        if (!unEval) {
            return { move, position, pieceOrder: newPieceOrder }
        }
        for (let i = 0; i < moves.length - 1; i++) {
            const nextBranch = branch.children[moves[i].move]
            if (!nextBranch) {
                const {move, position} = moves[i]
                return {move, position, pieceOrder: newPieceOrder}
            }
            unEval = nextBranch.deepValue.depth < unEval.deepValue.depth ? nextBranch : unEval
        }
        if ((this.pieceOrder !== unEval.pieceOrder && this.evaluatingLine.length >= this.maxDepth)
            || unEval.deepValue.value >= 50) {
            // console.error('no moves for forward', branch, movesTree.tree)
            return {}
        }
        this.evaluatingLine = this.evaluatingLine.length
            ? this.evaluatingLine.concat(unEval.rivalMove)
            : [unEval.rivalMove]
        return this.lookUnevaluatedForward(unEval)
    }

    determineBestMovesLine(move?: IMMRResult) {
        console.warn('moves line', move, this.evaluatingLine, copyObj(movesTree.tree))
        const line1 = [] as {move: string, value: number}[]
        // const line2 = [] as {move: string, value: number}[]
        // let i = 0
        if (!this.evaluatingLine.length && !move?.move) {
            console.warn('line ready no moves')
            const value = evaluator.evaluateCurrentPosition(this.position, this.pieceOrder)
            return this.bestLineCB([{
                move: 'not moves',
                value
            }])
        }
        let currentNode = movesTree.getRoot() as IBranch
        const value = currentNode.deepValue.value
        while(currentNode && currentNode.moves.length) {
            const bestMove = this.getBestMove(currentNode)
            currentNode = currentNode.children[bestMove.move]
            line1.push({move: bestMove.move, value})
        }
        console.warn('line ready', line1, copyObj(movesTree.tree))
        this.bestLineCB(line1)
    }

    finalizeMoveWithNewRoot = (branch: IBranch, moveProps: IMMRResult) => {
        movesTree.addRoot(branch)
        console.log('fin 1', copyObj(movesTree.getRoot().children), moveProps)
        return this.game
            ? this.bestMoveCB(moveProps)
            : this.determineBestMovesLine(moveProps)
    }

    finalizeMove = (moveProps?: IMMRResult) => {
        moveProps = moveProps || {move: '', position: {}}
        this.evaluatingLine.length = 0
        if (moveProps.move && this.game) {
            movesTree.updateRoot(moveProps.move)
        }
        console.log('fin 2', copyObj(movesTree.getRoot() || {}), moveProps, this.game)
        return this.game
            ? this.bestMoveCB(moveProps)
            : this.determineBestMovesLine(moveProps)

    }

    getBestMove = (props: IMove[] | IBranch): IBestMove => {
        if (Array.isArray(props)) {
            if (!props.length) {
                console.error('best move invalid props', props)
            }
            const bestMove = props.slice(0, -1).reduce((acc, move) => {
                return acc.baseValue > move.baseValue ? acc : move
            }, props[props!.length - 1])
            const deepValue = {depth: 0, value: bestMove?.baseValue}
            return {move: bestMove.move, position: bestMove.position, deepValue}
        }
        const {moves, children} = props
        const acc = children[moves.slice(-1)[0].move] as IBranch
        if (!acc) {
            return this.getBestMove(moves)
        }
        const bestMove = moves.slice(0, -1).reduce((acc: IBranch, move) => {
            const condition = children[move.move]
                && children[move.move].deepValue.depth >= acc.deepValue.depth
                    && children[move.move] && acc.deepValue.value < children[move.move].deepValue.value
            acc = condition ? children[move.move] : acc
            return acc
        }, acc)
        // console.warn('best m', bestMove, props, acc)
        return {
            move: bestMove.rivalMove,
            position: bestMove.position,
            deepValue: bestMove.deepValue
        }
    }

    getAvailableMoves = (pos: IBoardToGame, pieceOrder: PieceColor) => {
        return mmr.lookForAllMoves(pieceOrder, pos, this.towers).map((move: IMMRResult) => {
            const baseValue = evaluator.evaluateCurrentPosition(move.position, pieceOrder)
            return {
                move: move.move,
                position: move.position,
                baseValue
            }
        })
    }

    defineNewBranch = (rivalMove: string, pos: IBoardToGame, pieceOrder: PieceColor, moves: IMove[]) => {
        let deepValue: IDeepValue = { depth: this.maxDepth, value: -100 }
        if (moves.length) {
            const bestMove = this.getBestMove(moves)
            deepValue = {...bestMove.deepValue, value: bestMove.deepValue.value}
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

    resolveRootCheckNeeded(root: IBranch) {
        const bestRoot = movesTree.filterEqualOrGreaterThanDepth(1)
        if (this.lastBranch?.parentBranch &&
            ((bestRoot && bestRoot.pieceOrder === this.lastBranch?.pieceOrder
            && bestRoot.deepValue.value + Advantage < this.lastBranch!.deepValue.value)
            || (bestRoot && bestRoot.pieceOrder !== this.lastBranch?.pieceOrder
            && this.parentBranch!.deepValue.value > this.lastBranch!.deepValue.value + Advantage))
        ) {
            return this.finalizeMove(bestRoot)
        } else {
            const unevalMoves = movesTree.filterBelowOfDepth()
            if (unevalMoves.length) {
                return this.resolveStepForwardForCurrentBranch(root)
            } else {
                return this.finalizeMove(this.getBestMove(root))
            }
        }
    }

    lookUnevaluatedBackward = (): IMove | Promise<IMove> => {
        const branch = this.determineBackwardBranch()
        if (branch.rivalMove === 'check root') {
            const root = movesTree.getRoot() as IBranch
            console.warn('check root', copyObj(root.children), branch)
            return this.resolveRootCheckNeeded(root)
        }
        const unevalMoves = movesTree.filterBelowOfDepth(branch)
        this.lastBranch = branch
        if (!unevalMoves.length) {
            return this.lookUnevaluatedBackward()
        }
        return this.resolveStepForwardForCurrentBranch(branch)
    }

    determineValueOrderCase() {
        const sameOrder = this.lastBranch!.pieceOrder === this.pieceOrder
        if (this.lastBranch?.parentBranch
            && this.lastBranch?.rivalMove !== this.evaluatingLine[this.evaluatingLine.length - 1]) {
            console.error('evaluation line not match last branch', this)
        }
        const lastValue = this.lastBranch!.deepValue.value
        const root = movesTree.getRoot() as IBranch
        const valueIncreased = sameOrder
            ? lastValue > root.deepValue.value
            : lastValue > this.parentBranch!.deepValue.value
        console.warn('determine evolution ',
            sameOrder,
            valueIncreased,
           this.lastBranch?.rivalMove
        )
        if ((!sameOrder && !valueIncreased) || (sameOrder && !valueIncreased)) {return 1}
        if ((!sameOrder && valueIncreased) || (sameOrder && valueIncreased)) {return 2}
    }

    determineBackwardBranch = (): IBranch => {
        const valueOrder = this.determineValueOrderCase()
        console.warn('value, order', valueOrder)
        switch (valueOrder) {
            case 1: {
                this.evaluatingLine = this.evaluatingLine.slice(0, -2)
                const parentBranch = this.lastBranch?.parentBranch?.parentBranch
                return parentBranch ? parentBranch : {rivalMove: 'check root'} as IBranch
            }
            case 2: {
                this.evaluatingLine = this.evaluatingLine.slice(0, -1)
                return this.lastBranch?.parentBranch
                    ? this.lastBranch.parentBranch
                    : {rivalMove: 'check root'} as IBranch
            }
            default: {
                console.error('imposable case', this, movesTree.tree)
                return {rivalMove: 'check root'} as IBranch
            }
        }
    }
}

export type BestMoveSeekerType = BestMoveSeeker

export default new BestMoveSeeker()
