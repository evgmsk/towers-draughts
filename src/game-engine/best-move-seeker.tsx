import {evaluator} from './position-evaluator';
import {IBranch, ILastResult, IMove, ISeekerProps} from './engine-interfaces';
import {IBoardToGame, IMMRResult, PieceColor} from '../store/app-interface';
import mmr from './mandatory-move-resolver';
import movesTree from './movesMap';
import {oppositeColor} from "./gameplay-helper-fuctions";

const FirstMoves: {[key:string]: string[]} = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5'],
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',],
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
}

export class BestMoveSeeker implements ISeekerProps {
    bestMoveCB: Function = () => {}
    bestLineCB: Function = () => {}
    maxDepth = 6
    startDepth = 3
    position = null as unknown as IBoardToGame
    movesHistory = [] as string[]
    lastMove = ''
    lastResult = {} as ILastResult
    pieceOrder = PieceColor.w
    positionBaseValue = 0
    parentPositionValue = {baseValue: 0, deepValue: 0}
    game = true
    evaluationStarted = false

    setState = (props: ISeekerProps) => {
        this.maxDepth = props.maxDepth || 6
        this.startDepth = props.startDepth || 3
        this.game = props.game || true
        this.lastResult = {} as ILastResult
        this.movesHistory = props.movesHistory || []
        this.positionBaseValue = 0
        this.parentPositionValue = props.parentPositionValue || { baseValue: 0, deepValue: 0 }
        this.pieceOrder = PieceColor.w
        this.evaluationStarted = props.evaluationStarted || false
    }

    setMaxDepth(depth: number) {
        this.maxDepth = depth
    }
    setStartDepth(depth: number) {
        this.startDepth = depth
    }
    setLastMove(move: string) {
        this.lastMove = move
    }
    setPieceOrder() {
        return this.pieceOrder
    }
    setPositionBaseValue(val: number) {
        this.positionBaseValue = val
    }
    setParentPositionValue(val: { baseValue: number, deepValue: number }) {
        this.parentPositionValue = val
    }
    defineParentPositionValue() {
        const history = this.movesHistory
        let parentPositionKey
        if (history.length > 2 && history.length < 5) {
            parentPositionKey = history.slice(0, -2).join('_')
        } else if (history.length > 4) {
            parentPositionKey = history.slice(history.length - 5, -2).join('_')
        }
        if (parentPositionKey) {
            const parentPosition = movesTree.getBranch(parentPositionKey)
            this.parentPositionValue = {
                baseValue: parentPosition?.baseValue || 0,
                deepValue: parentPosition?.deepValue || 0
            }
        } else {
            this.parentPositionValue = {
                baseValue: 0,
                deepValue: 0
            }
        }
    }

    setEvaluationStatus(status: boolean) {
        this.evaluationStarted = status
    }
    getEvaluationStatus() {
        return this.evaluationStarted
    }


    setBestMoveCB = (cb: Function) => {
        this.bestMoveCB = cb
    }
    setBestLineCB = (cb: Function) => {
        this.bestLineCB = cb
    }

    makeMove = (move: string, board: IBoardToGame) => {
        if (!this.evaluationStarted) return
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
        const positionKey = `${this.movesHistory}_${move}`
        const [from, to] = move.split('-')
        const moveToMake = {move, position: mmr.makeFreeMove(from, to, currentPosition)}
        this.savePositionInTree(positionKey, moveToMake.position, this.pieceOrder)
        this.bestMoveCB(moveToMake)
    }

    getAvailableMoves = (positionKey: string, board: IBoardToGame) => {
        let availableMoves = movesTree.getBranch(positionKey)?.moves
        if (!availableMoves) {
            availableMoves = mmr.lookForAllMoves(this.pieceOrder, board)
                .map((m: IMMRResult) => {
                    const {move, position} = m
                    return {move, baseValue: -100, position}
                }) as IMove[]
        }
        if (!availableMoves.length) {
            return null
        }
        return availableMoves
    }

    setActualMovesBranchAfterMove(props: {history: string[], cP: IBoardToGame, pieceOrder: PieceColor}) {
        const {history, cP: position, pieceOrder} = props
        this.pieceOrder = pieceOrder
        this.movesHistory = history
        this.defineParentPositionValue()
        if (history.length < 2 && this.game) {
            return this.debutResolver(position)
        }
        this.lastMove = history.slice(-1)[0] || 'sp'
        let posKey = history.slice(-5).join('_')
        if (movesTree.tree.size){
            movesTree.filter(this.movesHistory.slice(-5).join('_'))
        }
        const availableMoves = this.getAvailableMoves(posKey, position)
        let actualBranch = movesTree.getBranch(posKey)
        if (!availableMoves) {
            return this.bestMoveCB({move: '', position: {}})
        } else if (availableMoves.length === 1) {
            this.bestMoveCB({move: availableMoves[0].move, position: availableMoves[0].position})
            return actualBranch
                ? null
                : this.savePositionInTree(posKey, position, pieceOrder, availableMoves)
        }
        if (!actualBranch) {
            this.savePositionInTree(posKey, position, pieceOrder, availableMoves)
        } else {
            console.log('look forward')
            posKey = this.lookForUnevaluatedForward(this.lastMove)
        }
        if (posKey) {
            this.stepForward(posKey)
        }
    }

    savePositionInTree(key: string, pos: IBoardToGame, pieceOrder: PieceColor, moves?: any[]) {
        const availableMoves = mmr.lookForAllMoves(pieceOrder, pos)
        moves = moves || availableMoves.map((move: IMMRResult) => {
            const posValue = evaluator.evaluateCurrentPosition(move.position)
            return {
                move: move.move,
                position: move.position,
                baseValue: oppositeColor(pieceOrder) === PieceColor.w ? posValue : -posValue
            }
        })
        const baseValue = moves.slice(0, -1).reduce((acc, move) => {
            acc = acc.positionValue > move.positionValue ? acc : move
            return acc
        }, moves.slice(-1)[0]).positionValue
        const positionToSave: IBranch = {
            moves,
            position: pos,
            deepValue: -100,
            baseValue,
            pieceOrder: pieceOrder
        }
        movesTree.addBranch(key, positionToSave)
        this.updateMoves(key, baseValue)
        return baseValue
    }

    handleNoMovesBranch = (key1: string, branch1: IBranch, key2: string, branch2: IBranch) => {
        if (!this.evaluationStarted) {
            return
        }
        const value = -50
        movesTree.addBranch(key1, branch1)
        movesTree.addBranch(key2, branch2)
        if (key1 !== this.lastMove) {
            this.updateParentBranches(key1.split('_'), value)
            this.lastResult = {movesBranch: key1, value}
            if (value > 0) {
                this.stepBackForUnevaluatedBranchPlayer(key1.split('_').slice(0, -1))
            } else {
                this.stepBackForUnevaluatedBranchEngine(key1.split('_').slice(0, -1))
            }
        } else {
            const {move, position} = this.getBestMove(branch1.moves)
            this.bestMoveCB({move, position})
        }
    }

    stepForward = (key: string) => {
        const evaluatingPosition = movesTree.getBranch(key)
        if (!this.evaluationStarted
            || !evaluatingPosition
            || evaluatingPosition.deepValue === -100
            || !evaluatingPosition.moves.length
        ) {
            console.error('invalid key in step forward', key)
            return
        }
        console.warn('forward', key)
        const { moves, pieceOrder } = evaluatingPosition!
        const unevaluatedMoves = moves.filter(m => !m.deepValue)
        if (!unevaluatedMoves.length) {
            console.error('forward: all moves have been started', key)
        }
        const {move, position} = unevaluatedMoves[0]
        const nextPositionKey = `${key}_${move}`
        const color = oppositeColor(pieceOrder)
        this.savePositionInTree(nextPositionKey, position, color)
        this.stepForward(nextPositionKey)
    }

    lookForUnevaluatedForward = (key: string): string => {
        const branch = movesTree.getBranch(key)
        if (!branch) {
            return ''
        }
        const {moves} = branch!
        if (branch.pieceOrder !== this.pieceOrder || branch.deepValue !== -100) {
            return this.lookForUnevaluatedForward(`${key}_${moves.slice(-1)[0].move}`)
        } else {
            console.log('unevaluated position found', branch, key)
            return key
        }
    }

    stepBackForUnevaluatedBranchPlayer = (key: string[]) => {
        const evaluatingBranchLength = key.length
        let positionKey = key.join('_')
        if (!this.evaluationStarted || !movesTree.getBranch(positionKey)) {
            return
        }
        let position = movesTree.getBranch(positionKey)
        const {moves} = position!
        const unevaluatedMoves = moves.filter(m => Math.abs(m.baseValue) === 100)
        if (evaluatingBranchLength === 2) {
            if (!unevaluatedMoves.length) {
                this.handlePlayerBranchEvaluationEnd(key)
            } else {
                setTimeout(() => this.stepForward(positionKey), 0)
            }
        } else if (evaluatingBranchLength > 2) {
            if (!unevaluatedMoves.length) {
                this.stepBackForUnevaluatedBranchPlayer(key.slice(0, -2))
            } else if (evaluatingBranchLength <= 4) {
                setTimeout(() => this.stepForward(positionKey),0)
            } else {
                this.stepForward(positionKey)
            }
        } else {
            // console.error('something wrong with back step engine', key, evaluatingBranchLength, this.moveBranchesTree)
        }
    }

    handlePlayerBranchEvaluationEnd = (key: string[]) => {
        console.log('end')
        const actualBranch = movesTree.getBranch(this.movesHistory.slice(-5).join('_'))!
        if (!this.evaluationStarted || !actualBranch) {
            return
        }
        const unevaluatedActualBranchMoves = actualBranch.moves.filter(m => Math.abs(m.baseValue) === 100)
        if (!unevaluatedActualBranchMoves.length) {
            console.log('evaluation finished', actualBranch,)
            const {move, position} = this.getBestForEngine(actualBranch.moves)
            console.log('cb')
            return  this.bestMoveCB({move, position})
        }
        setTimeout(() => this.stepForward(this.lastMove), 0)
    }

    stepBackForUnevaluatedBranchEngine = (key: string[]) => {
        const evaluatingBranchLength = key.length
        let positionKey = key.join('_')
        let position = movesTree.getBranch(positionKey)!
        if (!this.evaluationStarted || !position) {
            return
        }
        const {moves} = position!
        const unevaluatedMoves = moves.filter(m => Math.abs(m.baseValue) === 100)
        if (evaluatingBranchLength === 1) {
            if (!unevaluatedMoves.length) {
                const {baseValue, ...bestMove} = this.getBestForEngine(position.moves)
                // console.log('evaluation engine move finished', moves, this.moveBranchesTree)
                return this.bestMoveCB(bestMove)
            }
            setTimeout(() => this.stepForward(positionKey), 0)
        } else if (evaluatingBranchLength > 1) {
            if (!unevaluatedMoves.length) {
                this.stepBackForUnevaluatedBranchEngine(key.slice(0, -2))
            } else {
                this.stepForward(positionKey)
            }
        } else {
            console.error('something wrong with back step engine')
        }
    }

    stepBackward = (key: string) => {
        const keyArr = key.split('_')
        console.log('back')
        const { lastResult: {value}} = this
        const parentBranch = movesTree.getBranch(keyArr.slice(0, -2).join('_'))
        const rootBranch = movesTree.getBranch(this.movesHistory.slice(-5).join('_'))
        if (!this.evaluationStarted || !parentBranch || !rootBranch) {
            return
        }
        if (rootBranch.baseValue! <= value) {
            if (value > parentBranch.baseValue!) {
                this.stepBackForUnevaluatedBranchPlayer(keyArr.slice(0, -2))
            } else {
                this.stepBackForUnevaluatedBranchEngine(keyArr.slice(0, -1))
            }
        } else {
            if (value <= parentBranch.baseValue!) {
                this.stepBackForUnevaluatedBranchEngine(keyArr.slice(0, -1))
            } else {
                this.stepBackForUnevaluatedBranchEngine(keyArr.slice(0, -1))
            }
        }
    }

    updateMoves(key: string, baseValue: number) {
        const keyArr = key.split('_')
        const parentKey = keyArr.slice(0, -1).join('_')
        const parentPos = movesTree.getBranch(parentKey)
        if (!parentPos) {
            console.error('parent pos not found')
            return baseValue
        }
        parentPos.moves = parentPos.moves.map(m => {
            if (m.move === keyArr.slice(-1)[0]) {
                m.deepValue = baseValue
                return m
            }
            return m
        })
    }

    updateParentBranches = (key: string[], branchValue: number): void => {
        const branchKey = key.slice(0, -1).join('_')
        const move = key.slice(-1)[0]
        if (!this.evaluationStarted || !movesTree.getBranch(branchKey)) {
            return
        }
        const branch = movesTree.getBranch(branchKey) as IBranch
        // const updatedBranch = this.updateMoves(branch, move, branchValue)
        // movesTree.addBranch(branchKey, updatedBranch)
        if (branchKey === this.lastMove) {
            return
        }
    }

    lastLineEvaluation = (branchKey: string) => {
        if (!this.evaluationStarted || !movesTree.getBranch(branchKey)) {
            return
        }
        const lastBranch = movesTree.getBranch(branchKey)!
        const moves = lastBranch.moves.map((m: IMove) => {
            const {position} = m
            const baseValue = evaluator.evaluateCurrentPosition(position)
            const nextPositionKey = `${branchKey}_${m.move}`
            const availableMoves = mmr.lookForAllMoves(this.pieceOrder, position)
            const nextBranchMoves = availableMoves.map((mr: IMMRResult) => {
                const {move, position} = mr
                return {move, baseValue: 100, position}
            })
            const nextBranch: IBranch = {
                moves: nextBranchMoves,
                position: position,
                baseValue,
                pieceOrder: this.pieceOrder,
                deepValue: baseValue
            }
            movesTree.addBranch(nextPositionKey, nextBranch)

            return {...m, branchValue: baseValue}
        })
        this.lastResult = {value: this.getBestForPlayer(moves).baseValue, movesBranch: branchKey}
        this.updateParentBranches(branchKey.split('_'), this.lastResult.value)
        const updatedBranch = {...lastBranch, moves}
        movesTree.addBranch(branchKey, updatedBranch)
        this.stepBackward(branchKey)
    }

    getBestMove = (arr: IMove[]) => arr.slice(1).reduce((acc: IMove, i: IMove) => {
        if (i.baseValue < acc.baseValue) {
            acc = i
        }
        return acc
    }, arr[0])

    getBestForPlayer = (arr: IMove[]) => arr.slice(1).reduce((acc: IMove, i: IMove) => {
        if (i.baseValue < acc.baseValue) {
            acc = i
        }
        return acc
    }, arr[0])

    getBestForEngine = (arr: IMove[]) => arr.slice(1).reduce((acc: IMove, i: IMove) => {
        if (i.baseValue > acc.baseValue) {
            acc = i
        }
        return acc
    }, arr[0])
}

const bms = new BestMoveSeeker()

export type BestMoveSeekerType = BestMoveSeeker

export default bms
