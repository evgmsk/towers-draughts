import {evaluator} from './position-evaluator';
import {IBranch, ILastResult, IMove, ISeekerProps} from './engine-interfaces';
import {IBoardToGame, IMMRResult, PieceColor} from '../store/app-interface';
import mmr from './mandatory-move-resolver';
import {oppositeColor} from './gameplay-helper-fuctions';
import movesTree from './movesMap';

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
    parentPositionValue = {baseValue: 0, calcValue: 0}
    game = true
    evaluationStarted = false

    setState = (props: ISeekerProps) => {
        this.maxDepth = props.maxDepth || 6
        this.startDepth = props.startDepth || 3
        this.game = props.game || true
        this.lastResult = {} as ILastResult
        this.movesHistory = props.movesHistory || []
        this.positionBaseValue = 0
        this.parentPositionValue = props.parentPositionValue || {baseValue: 0, calcValue: 0}
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
    setParentPositionValue(val: { baseValue: number, calcValue: number }) {
        this.parentPositionValue = val
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
        const availableMoves = mmr.lookForAllMoves(oppositeColor(this.pieceOrder), moveToMake.position)
        const branchValue = -100
        const positionToSave = {
            moves: availableMoves.map((move: IMMRResult) => (
                {move: move.move, baseValue: branchValue, position: move.position}
            )),
            position: moveToMake.position,
            deepValue: branchValue,
            baseValue: evaluator.evaluateCurrentPosition(currentPosition),
        } as IBranch
        movesTree.addBranch(positionKey, positionToSave)
        this.bestMoveCB(moveToMake)
    }

    filterBranches = () => {
       movesTree.filter(this.movesHistory.slice(-5).join('_'))
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

    setActualMovesBranchAfterMove = (props: {history: string[], cP: IBoardToGame, pieceOrder: PieceColor}) => {

        const {history, cP: currentPosition, pieceOrder} = props
        this.pieceOrder = pieceOrder
        if (history.length < 2 && this.game) {
            return this.debutResolver(currentPosition)
        }
        this.lastMove = history.slice(-1)[0] || 'sp'
        let positionKey = history.slice(-5).join('_')
        if (history.length > 3) {
            const parentPosition = 0
        } else {
            this.parentPositionValue = {baseValue: 0, calcValue: 0}
        }
        this.movesHistory = history
        if (movesTree.tree.size){
            this.filterBranches()
        }

        const availableMoves = this.getAvailableMoves(positionKey, currentPosition)
        console.error(this, movesTree, availableMoves)
        let actualBranch = movesTree.getBranch(positionKey)
        if (!availableMoves) {
            return this.bestMoveCB({move: '', position: {}})
        }
        const whiteValue = evaluator.evaluateCurrentPosition(currentPosition) as number
        const baseValue = this.pieceOrder === PieceColor.w ? whiteValue : -whiteValue
        if (!actualBranch) {
            actualBranch = {
                moves: availableMoves,
                position: currentPosition,
                pieceOrder,
                baseValue,
            }
            movesTree.addBranch(positionKey, actualBranch)
            console.log('new branch at', positionKey)
        } else {
            console.log('look forward')
            positionKey = this.lookForUnevaluatedForward(this.lastMove)
        }
        if (positionKey) {
            this.stepForward(positionKey)
        }
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
        if (!this.evaluationStarted || !movesTree.getBranch(key)) {
            return
        }
        console.error('forward', key)
        let evaluatingPosition = movesTree.getBranch(key)!
        if (!evaluatingPosition) console.error('no branch', key)
        const {moves} = evaluatingPosition!
        const unevaluatedMoves = moves.filter(m => Math.abs(m.baseValue) === 100)
        // if (!unevaluatedMoves.length) console.error('no moves in the branch', key, evaluatingPosition, this.moveBranchesTree)
        const {move, position} = unevaluatedMoves[0]
        const whiteValue = evaluator.evaluateCurrentPosition(position)
        const baseValue = this.pieceOrder === PieceColor.w ? whiteValue : -whiteValue
        const nextPositionKey = `${key}_${move}`
        const availableMoves = mmr.lookForAllMoves(this.pieceOrder, position)
        const branchValue = -100
        const nextPosition = {
            moves: availableMoves.map((move: IMMRResult) => (
                {move: move.move, baseValue: branchValue, position: move.position}
            )),
            position: position,
            deepValue: baseValue,
            baseValue,
        } as IBranch
        if (!availableMoves.length) {
            // console.log('branch game ended', color, evaluatingPosition, key)
            return this.handleNoMovesBranch(key, evaluatingPosition, nextPositionKey, nextPosition)
        }
        evaluatingPosition = {
            ...evaluatingPosition,
            moves: moves.map(m => {
                if (m.move === move) {
                    return {...m, baseValue: baseValue}
                }
                return m
            }) as IMove[]
        }
        movesTree.addBranch(key, evaluatingPosition)
        movesTree.addBranch(nextPositionKey, nextPosition)
        this.stepForward(nextPositionKey)
    }

    lookForUnevaluatedForward = (key: string): string => {
        const branch = movesTree.getBranch(key)
        if (!branch || branch.pieceOrder !== this.pieceOrder) {
            return ''
        }
        const {moves} = branch!
        const unevaluatedMoves = moves.filter(m => m.baseValue === 100)
        if (unevaluatedMoves.length) {
            console.log('unevaluated position found', branch)
            return key
        }
        if (moves.length) {
            return this.lookForUnevaluatedForward(`${key}_${moves[0].move}`)
        } else {
            return ''
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

    updateMoves = (branch: IBranch, move: string, branchValue: number): IBranch => {

        const moves = branch.moves.map((m: IMove) => {
            if (m.move === move) {
                return {...m, branchValue}
            }
            return {...m}
        })
        return {...branch, moves} as IBranch
    }

    updateParentBranches = (key: string[], branchValue: number): void => {
        const branchKey = key.slice(0, -1).join('_')
        const move = key.slice(-1)[0]
        if (!this.evaluationStarted || !movesTree.getBranch(branchKey)) {
            return
        }
        const branch = movesTree.getBranch(branchKey) as IBranch
        const updatedBranch = this.updateMoves(branch, move, branchValue)
        movesTree.addBranch(branchKey, updatedBranch)
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
