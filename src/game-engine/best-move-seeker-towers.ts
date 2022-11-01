import {Move, IMMRResult, PieceColor, TowersMap, SeekerProps, Branch} from '../store/models';
import mmr from './engine-on-towers';
import movesTree from './tower-tree';
import {copyObj} from "./gameplay-helper-functions";
import {createDefaultTowers} from "./prestart-help-function-constants";

const towers = createDefaultTowers(8)

const FirstMoves: {[key:string]: Move[]} = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5']
        .map(m => ({
                move: m,
                position: mmr.makeMove({move: m.split('-'), startPosition: towers})
        })),
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',]
        .map(m => ({
            move: m,
            position: mmr.makeMove({move: m.split('-'), startPosition: towers})
        })),
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
        .map(m => ({
            move: m,
            position: mmr.makeMove({move: m.split('-'), startPosition: towers})
        })),
}

// const Advantage = 2

const DebutStage = 2

export class BestMoveSeeker implements SeekerProps {
    bestMoveCB: Function = () => {
    }
    bestLineCB: Function = () => {
    }
    maxDepth = 8
    startDepth = 5
    towers = towers
    movesHistory = [] as string[]
    pieceOrder = PieceColor.w
    game = false
    evaluatingLine: string[] = []
    valueIncreased?: boolean
    bestMove?: IMMRResult | null
    parentBranch = null as unknown as Branch
    lastBranch?: Branch

    setState = (props: SeekerProps) => {
        this.maxDepth = props.maxDepth || props.game ? 8 : 5
        this.startDepth = props.startDepth || 5
        this.game = props.game
        this.movesHistory = props.movesHistory || []
        this.pieceOrder = props.pieceOrder || PieceColor.w
        this.parentBranch = props.parentBranch || {deepValue: {value: {black: 0, white: 0}}} as Branch
        console.warn('state', copyObj(this))
    }

    setBestMoveCB = (cb: Function) => {
        this.bestMoveCB = cb
    }

    setBestLineCB = (cb: Function) => {
        console.warn('line cb', copyObj(this), this.bestLineCB)
        this.bestLineCB = cb
    }

    getRandomSecondMove(moves: Move[], best: Move): Move {
        const _moves = Object.assign([], moves).concat([best, best])
        return _moves[Math.floor(Math.random() * _moves.length)]
    }

    debutResolver = () => {
        let move: Move,
            root;
        if (!this.movesHistory.length) {
            root = movesTree.createDefaultRootBranch(mmr.size)
            movesTree.getDepthData(root, this.startDepth)
            move = FirstMoves[mmr.GV][Math.floor(Math.random() * FirstMoves[mmr.GV].length)] as Move

        } else {
            movesTree.updateRoot(this.movesHistory.slice(-1)[0])
            root = movesTree.getRoot() as Branch
            root = movesTree.getDepthData(root, this.startDepth)
            const bestMove = {
                move: root.deepValue.move,
                position: root.children[root.deepValue.move!].position
            }
            move = this.getRandomSecondMove(root.moves, bestMove)
        }
        movesTree.updateRoot(move.move)
        this.finalizeMove(move)
    }

    updateState = (props: {history: string[], cP: TowersMap, pieceOrder: PieceColor}) => {
        const {history, cP, pieceOrder} = props
        this.evaluatingLine.length = 0
        this.pieceOrder = pieceOrder
        this.movesHistory = history
        this.towers = cP
    }

    // getActualBranch = (lastRivalMove: string[],
    //                    position = this.towers,
    //                    pieceOrder = this.pieceOrder): Branch => {
    //     let actualBranch = movesTree.getBranch(lastRivalMove) as Branch
    //     if (!actualBranch){
    //         const moves = this.getAvailableMoves(position, pieceOrder)
    //         actualBranch = this.defineNewBranch(lastRivalMove[0], position, pieceOrder, moves)
    //     }
    //     return actualBranch
    // }

    updateAfterRivalMove = (props: {history: string[], cP: TowersMap, pieceOrder: PieceColor}) => {
        const {history, cP, pieceOrder} = props
        this.movesHistory = history
        this.towers = cP
        this.pieceOrder = pieceOrder
        if (this.movesHistory.length < DebutStage && this.game) {
            return this.debutResolver()
        }
        const lastRivalMove = this.movesHistory.slice(-1)[0]
        movesTree.updateRoot(lastRivalMove)
        const root = movesTree.getRoot()
        // console.warn('update state', copyObj(this), actualBranch)
    }

    // startEvaluation = () => {
    //     console.log('start', copyObj((movesTree.getRoot() as Branch).moves), this)
    //     const root = movesTree.getRoot() as Branch
    //     const {move, position, pieceOrder} = this.lookUnevaluatedForward(root)
    //     if (!move || !position || !pieceOrder) {
    //         const move = this.getBestMove(root)
    //         return new Promise<IMove>(rs => {
    //             return rs(this.finalizeMove(move))
    //         })
    //     }
    //     const moves = this.getAvailableMoves(position, pieceOrder)
    //     const nextBranch = this.defineNewBranch(move, position, pieceOrder, moves)
    //     this.addBranch(nextBranch)
    //     if (this.evaluatingLine.length < this.maxDepth || nextBranch.pieceOrder === this.pieceOrder) {
    //         return this.resolveStepForwardForCurrentBranch(nextBranch)
    //     }
    //     return this.lookUnevaluatedBackward()
    // }
    //
    // resolveStepForwardForCurrentBranch = (branch: Branch): any => {
    //     if (!branch.moves.length) {
    //         return setTimeout(this.lookUnevaluatedBackward)
    //     }
    //     let unevalMove = this.lookUnevaluatedForward(branch)
    //     if (!unevalMove.move) {
    //         const root = movesTree.getRoot() as Branch
    //         unevalMove = branch.parentBranch
    //             ? this.lookUnevaluatedForward(root)
    //             : unevalMove
    //         if (!unevalMove.move) {
    //             const move = this.getBestMove(root)
    //             return this.finalizeMove(move)
    //         }
    //     }
    //     const {move, position, pieceOrder} = unevalMove as IMove
    //     const moves = this.getAvailableMoves(position, pieceOrder!)
    //     const nextBranch = this.defineNewBranch(move, position, pieceOrder!, moves)
    //     this.addBranch(nextBranch)
    //     if ((this.evaluatingLine.length >= this.maxDepth
    //             && pieceOrder !== this.pieceOrder)
    //         || !moves.length) {
    //         this.lastBranch = movesTree.getBranch(this.evaluatingLine)
    //         // console.warn('max depth achieved or not moves', this, pieceOrder, movesTree.tree)
    //         return setTimeout(this.lookUnevaluatedBackward)
    //     } else {
    //         return this.resolveStepForwardForCurrentBranch(nextBranch)
    //     }
    // }
    //
    // addBranch = (branch: Branch) => {
    //     movesTree.addBranch(branch, this.evaluatingLine)
    //     this.evaluatingLine.push(branch.rivalMove)
    // }
    //
    // lookUnevaluatedForward = (branch: Branch): Partial<IMove> => {
    //     const {moves, pieceOrder} = branch
    //
    //     const {move, position} = moves[moves.length - 1]
    //     let unEval = branch.children[move]
    //     const newPieceOrder = oppositeColor(pieceOrder)
    //     if (!unEval) {
    //         return { move, position, pieceOrder: newPieceOrder }
    //     }
    //     for (let i = 0; i < moves.length - 1; i++) {
    //         const nextBranch = branch.children[moves[i].move]
    //         if (!nextBranch) {
    //             const {move, position} = moves[i]
    //             return {move, position, pieceOrder: newPieceOrder}
    //         }
    //         unEval = nextBranch.deepValue.depth < unEval.deepValue.depth ? nextBranch : unEval
    //     }
    //     if ((this.pieceOrder !== unEval.pieceOrder && this.evaluatingLine.length >= this.maxDepth)
    //         || unEval.deepValue.value >= 50) {
    //         // console.error('no moves for forward', branch, movesTree.tree)
    //         return {}
    //     }
    //     this.evaluatingLine = this.evaluatingLine.length
    //         ? this.evaluatingLine.concat(unEval.rivalMove)
    //         : [unEval.rivalMove]
    //     return this.lookUnevaluatedForward(unEval)
    // }
    //
    determineBestMovesLine(move?: Move) {

    }
    //
    // finalizeMoveWithNewRoot = (branch: Branch, moveProps: MMRResult) => {
    //     movesTree.addRoot(branch)
    //     console.log('fin 1', copyObj(movesTree.getRoot().children), moveProps)
    //     return this.game
    //         ? this.bestMoveCB(moveProps)
    //         : this.determineBestMovesLine(moveProps)
    // }
    //
    finalizeMove = (moveProps?: Move) => {
        moveProps = moveProps || {move: '', position: {}}
        this.evaluatingLine.length = 0

        console.log('fin 2', copyObj(movesTree.getRoot() || {}), moveProps, this.game)
        return this.game
            ? this.bestMoveCB(moveProps)
            : this.determineBestMovesLine(moveProps)
    }
    //
    // getBestMove = (props: IMove[] | Branch): IBestMove => {
    //     if (Array.isArray(props)) {
    //         if (!props.length) {
    //             console.error('best move invalid props', props)
    //         }
    //         const bestMove = props.slice(0, -1).reduce((acc, move) => {
    //             return acc.baseValue > move.baseValue ? acc : move
    //         }, props[props!.length - 1])
    //         const deepValue = {depth: 0, value: bestMove?.baseValue}
    //         return {move: bestMove.move, position: bestMove.position, deepValue}
    //     }
    //     const {moves, children} = props
    //     const acc = children[moves.slice(-1)[0].move] as Branch
    //     if (!acc) {
    //         return this.getBestMove(moves)
    //     }
    //     const bestMove = moves.slice(0, -1).reduce((acc: Branch, move) => {
    //         const condition = children[move.move]
    //             && children[move.move].deepValue.depth >= acc.deepValue.depth
    //             && children[move.move] && acc.deepValue.value < children[move.move].deepValue.value
    //         acc = condition ? children[move.move] : acc
    //         return acc
    //     }, acc)
    //     // console.warn('best m', bestMove, props, acc)
    //     return {
    //         move: bestMove.rivalMove,
    //         position: bestMove.position,
    //         deepValue: bestMove.deepValue
    //     }
    // }
    //
    // getAvailableMoves = (pos: IBoardToGame, pieceOrder: PieceColor) => {
    //     return mmr.lookForAllMoves(pieceOrder, pos, this.towers).map((move: IMMRResult) => {
    //         const baseValue = evaluator.evaluateCurrentPosition(move.position, pieceOrder)
    //         return {
    //             move: move.move,
    //             position: move.position,
    //             baseValue
    //         }
    //     })
    // }
    //
    // defineNewBranch = (positionData: IPositionData, color: PieceColor, move: string): Branch => {
    //     const branch = {} as Branch
    //     return branch
    //
    // }
    //
    // resolveRootCheckNeeded(root: Branch) {
    //     const bestRoot = movesTree.filterEqualOrGreaterThanDepth(1)
    //     if (this.lastBranch?.parentBranch &&
    //         ((bestRoot && bestRoot.pieceOrder === this.lastBranch?.pieceOrder
    //                 && bestRoot.deepValue.value + Advantage < this.lastBranch!.deepValue.value)
    //             || (bestRoot && bestRoot.pieceOrder !== this.lastBranch?.pieceOrder
    //                 && this.parentBranch!.deepValue.value > this.lastBranch!.deepValue.value + Advantage))
    //     ) {
    //         return this.finalizeMove(bestRoot)
    //     } else {
    //         const unevalMoves = movesTree.filterBelowOfDepth()
    //         if (unevalMoves.length) {
    //             return this.resolveStepForwardForCurrentBranch(root)
    //         } else {
    //             return this.finalizeMove(this.getBestMove(root))
    //         }
    //     }
    // }
    //
    // lookUnevaluatedBackward = (): IMove | Promise<IMove> => {
    //     const branch = this.determineBackwardBranch()
    //     if (branch.rivalMove === 'check root') {
    //         const root = movesTree.getRoot() as Branch
    //         console.warn('check root', copyObj(root.children), branch)
    //         return this.resolveRootCheckNeeded(root)
    //     }
    //     const unevalMoves = movesTree.filterBelowOfDepth(branch)
    //     this.lastBranch = branch
    //     if (!unevalMoves.length) {
    //         return this.lookUnevaluatedBackward()
    //     }
    //     return this.resolveStepForwardForCurrentBranch(branch)
    // }
    //
    // determineValueOrderCase() {
    //     const sameOrder = this.lastBranch!.pieceOrder === this.pieceOrder
    //     if (this.lastBranch?.parentBranch
    //         && this.lastBranch?.rivalMove !== this.evaluatingLine[this.evaluatingLine.length - 1]) {
    //         console.error('evaluation line not match last branch', this)
    //     }
    //     const lastValue = this.lastBranch!.deepValue.value
    //     const root = movesTree.getRoot() as Branch
    //     const valueIncreased = sameOrder
    //         ? lastValue > root.deepValue.value
    //         : lastValue > this.parentBranch!.deepValue.value
    //     console.warn('determine evolution ',
    //         sameOrder,
    //         valueIncreased,
    //         this.lastBranch?.rivalMove
    //     )
    //     if ((!sameOrder && !valueIncreased) || (sameOrder && !valueIncreased)) {return 1}
    //     if ((!sameOrder && valueIncreased) || (sameOrder && valueIncreased)) {return 2}
    // }
    //
    // determineBackwardBranch = (): Branch => {
    //     const valueOrder = this.determineValueOrderCase()
    //     console.warn('value, order', valueOrder)
    //     switch (valueOrder) {
    //         case 1: {
    //             this.evaluatingLine = this.evaluatingLine.slice(0, -2)
    //             const parentBranch = this.lastBranch?.parentBranch?.parentBranch
    //             return parentBranch ? parentBranch : {rivalMove: 'check root'} as Branch
    //         }
    //         case 2: {
    //             this.evaluatingLine = this.evaluatingLine.slice(0, -1)
    //             return this.lastBranch?.parentBranch
    //                 ? this.lastBranch.parentBranch
    //                 : {rivalMove: 'check root'} as Branch
    //         }
    //         default: {
    //             console.error('imposable case', this, movesTree.tree)
    //             return {rivalMove: 'check root'} as Branch
    //         }
    //     }
    // }
}

export type BestMoveSeekerType = BestMoveSeeker

export default new BestMoveSeeker()
