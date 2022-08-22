import {evaluator} from './position-evaluator';
import {
    IBranch,
    IDeepValue,
    ILastResult,
    IMove,
    ISeekerProps,
    IValidationResult,
    ValueDynamic
} from './engine-interfaces';
import {IBoardToGame, IMMRResult, PieceColor} from '../store/models';
import mmr from './mandatory-move-resolver';
import movesTree from './moves-tree';
import {oppositeColor} from "./gameplay-helper-fuctions";

const FirstMoves: {[key:string]: string[]} = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5'],
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',],
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
}

export class BestMoveSeeker implements ISeekerProps {
    bestMoveCB: Function = () => {
    }
    bestLineCB: Function = () => {
    }
    maxDepth = 6
    startDepth = 4
    position = null as unknown as IBoardToGame
    movesHistory = [] as string[]
    lastMove = ''
    pieceOrder = PieceColor.w
    game = true
    evaluatingMove = ''
    rootKey = 'sp'
    evaluatingLine: string[] = []
    valueDynamic?: ValueDynamic
    bestMove?: IMMRResult | null
    lastResult?: ILastResult
    parentPositionValue?:  IDeepValue = {value: 0, depth: 0}
    rootKeyLength = 0

    setState = (props: ISeekerProps) => {
        this.maxDepth = props.maxDepth || 6
        this.startDepth = props.startDepth || 3
        this.game = props.game || true
        this.movesHistory = props.movesHistory || []
        this.pieceOrder = PieceColor.w
        this.rootKey = props.movesHistory?.length ? props.movesHistory.slice(-5).join('_') : 'sp'
        this.rootKeyLength = (props.movesHistory && props.movesHistory.slice(-5).length) || 0
        this.evaluatingMove = props.evaluatingMove || ''
        this.valueDynamic = props.valueDynamic || ValueDynamic.und
        this.lastResult = props.lastResult || null as unknown as ILastResult
        this.parentPositionValue = props.parentPositionValue || this.parentPositionValue

    }
    setEvaluatingMove(move: string) {
        this.evaluatingMove = move
    }
    // setMaxDepth(depth: number) {
    //     this.maxDepth = depth
    // }

    setBestMoveCB = (cb: Function) => {
        this.bestMoveCB = cb
    }
    setBestLineCB = (cb: Function) => {
        this.bestLineCB = cb
    }

    makeMove = (move: string, board: IBoardToGame) => {
        if (!this.evaluatingMove) return
        if (move.includes(':')) {
            return mmr.makeMandatoryMove(move.split(':'), board)
        }
        const [from, to] = move.split('-')
        return mmr.makeFreeMove(from, to, board)
    }

    debutResolver = (currentPosition: IBoardToGame) => {
        let move
        if (this.movesHistory.length < 1) {
            const moves = FirstMoves[mmr.GV]
            move = moves[Math.floor(Math.random() * moves.length)]
        } else  {
            const availableMoves = mmr.lookForAllPossibleMoves(this.pieceOrder, currentPosition)
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        }
        const positionKey = this.movesHistory.length ? `${this.movesHistory}_${move}` : move
        const [from, to] = move.split('-')
        const moveToMake = {move, position: mmr.makeFreeMove(from, to, currentPosition)}
        this.addPositionToTree(positionKey, moveToMake.position, this.pieceOrder)
        this.prepareMove(moveToMake)
    }

    getAvailableMoves = (positionKey: string, board: IBoardToGame): IMove[] => {
        let availableMoves = movesTree.getBranch(positionKey)?.moves
        if (!availableMoves) {
            availableMoves = mmr.lookForAllMoves(this.pieceOrder, board)
                .map((m: IMMRResult) => {
                    const {move, position} = m
                    return {move, baseValue: 0, position}
                }) as IMove[]
        }
        return availableMoves
    }

    setActualMovesBranchAfterMove = (props: {history: string[], cP: IBoardToGame, pieceOrder: PieceColor}) => {
        const {history, cP: position, pieceOrder} = props
        this.pieceOrder = pieceOrder
        this.movesHistory = history
        this.position = position
        if (history.length < 1 && this.game) {
            return this.debutResolver(position)
        }
        this.evaluatingLine = history.slice(-5)
        this.lastMove = history.slice(-1)[0]
        const filterKey = `${this.rootKey}_${this.lastMove}`
        this.rootKey = history.slice(-5).join('_')
        this.rootKeyLength = history.slice(-5).length
        if (movesTree.tree.size){
            movesTree.filter(filterKey)
        }

        const availableMoves = this.getAvailableMoves(this.rootKey, position)
        if (!availableMoves.length) {
            return this.prepareMove()
        }
        let actualBranch = movesTree.getBranch(this.rootKey)
        if (!actualBranch) {
            this.addPositionToTree(this.rootKey, position, pieceOrder)
            console.warn('add branch', movesTree)
        }
        if (availableMoves.length === 1) {
            const {move, position} = availableMoves[0]
            return this.prepareMove({move, position})
        }
        console.warn('step forward', this)
        return this.resolveStepForward(this.rootKey, null as unknown as IBranch)
    }

    resolveStepForward = (key: string, branch?: IBranch, depth = 1) => {
        branch = branch || movesTree.getBranch(key)!
        console.warn('forward', key, branch)
        if (!branch || !branch.moves.length) {
            console.error('invalid key in step forward', key)
            return
        }
        const {unevalMoves, unevalBranch} = this.lookUnevaluatedForward(key.split('_'), branch, depth)
        const {move, position} = unevalMoves[0]
        if (this.evaluatingLine!.join('_') === this.rootKey) {
            this.evaluatingMove = move
        }
        const nextPositionKey = this.evaluatingLine?.join('_')
        const color = oppositeColor(unevalBranch.pieceOrder)
        const maxDeep = nextPositionKey.split('_').length - this.movesHistory.slice(-5).length === this.maxDepth
            && color === this.pieceOrder
        this.addPositionToTree(nextPositionKey, position, color)
        if (maxDeep) {
            console.warn('max depth achieved', this.rootKey, 'key: ', nextPositionKey, movesTree.tree)
            this.lastResult = {
                movesLine: nextPositionKey,
                value: movesTree.getBranch(nextPositionKey)!.baseValue,
                depth
            }
            return setTimeout(() => this.resolveMaxDeep(nextPositionKey))
        }
        this.resolveStepForward(nextPositionKey)
    }

    lookUnevaluatedForward(key: string[], branch: IBranch, depth = 1)
        : {unevalMoves: IMove[], unevalBranch: IBranch} {
        const {moves} = branch || {}
        if (!moves.length) {
            console.error('not moves for evaluation', branch)
        }
        const unevalMoves = this.filterWithDepth(moves, depth)
        if (unevalMoves.length) {
            this.evaluatingLine = key.concat(unevalMoves[0].move)
            return {unevalMoves, unevalBranch: branch}
        } else {
            this.evaluatingLine = key.concat(moves.slice(-1)[0].move)
            const nextBranchKey = this.evaluatingLine.join('_')
            const nextBranch = movesTree.getBranch(nextBranchKey)
            return this.lookUnevaluatedForward(this.evaluatingLine, nextBranch!)
        }
    }

    maxBranchDepth(key = this.evaluatingLine): number {
        return Math.abs(key.length - this.maxDepth - this.rootKeyLength)
    }

    filterWithDepth = (moves: IMove[], depth: number) => moves.filter(m =>
        m.deepValue === undefined || m.deepValue === null || m.deepValue.depth < depth)

    validateEvaluationResult(movesLine?: string[], sameOrder = true): IValidationResult | null {
        if (!this.lastResult) { console.error(this); return null }
        console.warn('validation of result')
        movesLine = movesLine || this.lastResult!.movesLine.split('_')
        const moveLineLength = movesLine!.length
        const valueIncreased = this.valueDynamic === ValueDynamic.incr
        const conditionToCheckDeepValue = (i: number) => {
            return sameOrder
                ? (valueIncreased && i % 2 === (moveLineLength - 1) % 2 && i > this.rootKeyLength - 1)
                    || (!valueIncreased && i % 2 === moveLineLength % 2)
                : (valueIncreased && i % 2 === moveLineLength % 2)
                    || (!valueIncreased && i % 2 === (moveLineLength - 1) % 2)
        }
        for (let i = moveLineLength - 1; i >= this.rootKeyLength; i--) {
            const key = movesLine!.slice(0, i + 1).join('_')

            const branch = movesTree.getBranch(key)!
            const validity = this.checkValidity(branch)
            console.warn('validation key', key, 'branch ', branch, 'valid ', validity)
            if (validity > 1) {
                this.updateBranchDeepValue(branch, movesLine.slice(0, i + 1), validity)
            }
            if (conditionToCheckDeepValue(i)) {
                this.evaluatingLine = key.split('_')
                return {key, branch, validity}
            }
        }
        console.error('validation failed')
        return null
    }

    updateBranchDeepValue(branch: IBranch, movesLine: string[], depth: number) {
        const move = this.getBestMove(branch.moves, depth)
        const value = -move.deepValue!
        console.warn('VVALUE', value)
        branch!.deepValue = {
            depth,
            movesLine: movesLine.concat(move.move),
            value
        }
        const parentKey = movesLine!.slice(0, -1).join('_')
        this.updateParentBranchMoves(parentKey, move.move, value, depth)
    }

    prepareMove(moveProps?: IMMRResult) {
        this.evaluatingMove = ''
        moveProps = moveProps || {move: '', position: {}}
        this.defineParentPositionValue()
        this.lastResult = null as unknown as ILastResult
        this.bestMoveCB(moveProps)
    }

    resolveMaxDeep(movesLine?: string) {
        this.defineValueDynamic()
        const validationResult = this.validateEvaluationResult(movesLine?.split('_'), true)
        if (!validationResult?.branch) {
            console.error('ha ha ha', movesLine, validationResult )
        } else if (validationResult.validity === this.maxDepth) {
            const rootBranch = movesTree.getBranch(this.rootKey)
            const {move, position} = this.getBestMove(rootBranch!.moves, this.maxDepth)
            this.prepareMove({move, position})
        } else {
            console.warn('validation', validationResult)
            const {key, branch, validity} = validationResult
            setTimeout(() => this.resolveStepForward(key, branch, validity))
        }
    }

    defineParentPositionValue() {
        if (this.rootKey === 'sp') {
            this.parentPositionValue = {
                movesLine: ['sp'],
                value: 0,
                depth: this.maxDepth
            }
        }
        const branch = movesTree.getBranch(this.rootKey)!

        const {maxDepth, movesHistory} = this
        if (this.filterWithDepth(branch.moves, maxDepth).length
            && this.valueDynamic === ValueDynamic.decr) {
            console.error('root branch evaluation does not complete', branch)
        }
        const bestMove = this.getBestMove(branch.moves, this.maxDepth)
        this.parentPositionValue = {
            movesLine: movesHistory.slice(-5).concat(bestMove.move),
            value: bestMove.deepValue?.value!,
            depth: maxDepth
        }
    }

    getBestMove(moves: IMove[], deep?: number) {
        return moves.slice(0, -1).reduce((acc, move) => {
            const condition = (deep && move.deepValue && acc.deepValue!.value < move.deepValue.value)
                                || (!deep && move.baseValue > acc.baseValue)
            acc = condition ? move : acc
            return acc
        }, moves.slice(-1)[0])
    }

    addPositionToTree(key: string, pos: IBoardToGame, pieceOrder: PieceColor, moves?: IMove[]) {
        moves = (moves || mmr.lookForAllMoves(pieceOrder, pos)).map((move: IMMRResult) => {
            const posValue = evaluator.evaluateCurrentPosition(move.position)
            return {
                move: move.move,
                position: move.position,
                baseValue: pieceOrder === PieceColor.w ? posValue : -posValue
            }
        })
        const splittedKey = key.split('_')
        const move = splittedKey.slice(-1)[0]

        const baseValue = !moves.length
            ? 50
            : -this.getBestMove(moves).baseValue
        const positionToSave: IBranch = {
            moves,
            position: pos,
            baseValue,
            pieceOrder: pieceOrder
        }
        if (this.movesHistory.length) {
            const parentKey = splittedKey.slice(0, -1).join('_')
            this.updateParentBranchMoves(parentKey, move, baseValue)
            if (!moves.length) {
                const grantKey = splittedKey.slice(0, -2).join('_')
                const grandMove = this.evaluatingLine!.slice(-2)[0]
                this.updateParentBranchMoves(grantKey, grandMove, -baseValue, this.maxDepth)
            }
        }
        movesTree.addBranch(key, positionToSave)
        return !moves.length
            ? this.handleNoMovesBranch(splittedKey, pieceOrder === this.pieceOrder)
            : baseValue
    }

    updateParentBranchMoves(key: string, move: string, value: number, depth = 1) {
        const parentBranch = movesTree.getBranch(key)
        if (!parentBranch) { return }
        parentBranch.moves = parentBranch.moves.map(m => {
            if (m.move === move) {
                m.deepValue = m.deepValue ? {...m.deepValue, depth, value} : {depth, value}
            }
            return m
        })
    }

    checkValidity(branch: IBranch, startDepth = 1) {
        const { moves } = branch
        for (let j = startDepth; j <= this.maxDepth; j++) {
            for (let i = 0; i < moves.length; i++) {
                const deepValue = moves[i].deepValue
                if (deepValue === undefined || deepValue === null || deepValue.depth < j) {
                    return j
                }
            }
        }
        return this.maxDepth - 1
    }

    handleNoMovesBranch = (key: string[], sameOrder: boolean) => {
        if (!this.evaluatingMove) {
            return
        }
        if (key.length < 2 && sameOrder) {
            return this.prepareMove()
        }
        const {unevalBranch} = this.lookAvailableBackward(key.slice(0, -2))
        if (!unevalBranch && sameOrder) {
            return this.prepareMove()
        }
        this.resolveStepForward(this.evaluatingLine!.join('_'), unevalBranch)
    }

    lookAvailableBackward(key: string[])
        : {unevalMoves: IMove[], unevalBranch: IBranch} {
        const depth = this.maxBranchDepth(key)
        const branch = movesTree.getBranch(key.join('_'))!
        const unevalMoves = this.filterWithDepth(branch.moves, depth)
        if (unevalMoves.length) {
            return {unevalMoves, unevalBranch: branch}
        } else if (key.length > 2) {
            return this.lookAvailableBackward(key.slice(0, -2))
        }
        return {} as {unevalMoves: IMove[], unevalBranch: IBranch}
    }

    defineValueDynamic(newValue = this.lastResult?.value) {
        if (!this.parentPositionValue) { console.error('no parent value', this, movesTree, newValue) }
        this.valueDynamic = (newValue || 0) > (this.parentPositionValue?.value || 0)
            ? ValueDynamic.incr
            : ValueDynamic.decr
    }
}

const bms = new BestMoveSeeker()

export type BestMoveSeekerType = BestMoveSeeker

export default bms
