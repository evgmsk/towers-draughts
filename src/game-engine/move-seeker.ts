import { FirstMoves } from '../constants/debutes/debutes'
import { PieceColor, IBoardToGame, IMMRResult } from '../store/app-interface'
import bmlsState from './best-move-line-seeker-state'
import { IBranch, ILastResult, ISeekerProps, IMove } from './engine-interfaces'
import mmr from './mandatory-move-resolver'
import {evaluator} from './position-evaluator'
import { oppositColor } from './prestart-help-function-constants'

export class BestMoveSeeker {
    maxDepth = 6
    startDepth = 6
    bestMoveCB: Function = () => {}
    bestLinesCB: Function = () => {}

    startValue: number
    actualHistoryString = ''
    lastMove = ''
    historyLength = 0
    engineColor: PieceColor 
    lastResult = {} as ILastResult
    evaluationStarted = true
    game = true
   
    constructor(props:  Partial<ISeekerProps>) {
        this.engineColor = props.engineColor || PieceColor.w
        this.startValue = props.engineColor === PieceColor.w ? -100 : 100
        this.game = !!props.game
        this.bestMoveCB = props.bestMoveCB || (() => {})
        this.bestLinesCB = props.bestLinesCB || (() => {})
    }

    resetProps = (props: Partial<ISeekerProps>) => {
        this.engineColor = props.engineColor || PieceColor.w
        this.startValue = props.engineColor === PieceColor.w ? -100 : 100
        this.game = !!props.game
        this.maxDepth = props.maxDepth || this.maxDepth
        this.bestMoveCB = props.bestMoveCB || this.bestMoveCB
        this.bestLinesCB = props.bestLinesCB || this.bestLinesCB
    }

    startEvaluation = (start: boolean) => {
        this.evaluationStarted = start
    }

    setDepth = (depth: number) => {
        this.maxDepth = depth
    }

    makeMove = (move: string, board: IBoardToGame) => {
        if (!this.evaluationStarted) return
        if (move.includes(':')) {
            return mmr.makeMandatoryMove(move.split(':'), board)
        }
        const [from, to] = move.split('-')
        return mmr.makeFreeMove(from, to, board)
    }

    debuteResolver = (currentPosition: IBoardToGame) => {
        let move: string
        if (!this.historyLength) {
            const moves = FirstMoves[mmr.GV]
            move = moves[Math.floor(Math.random() * moves.length)]
        } else  {
            const availableMoves = mmr.lookForAllPosibleMoves(this.engineColor, currentPosition)
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        }
        const [from, to] = move!.split('-')
        const moveToMake = {move, position: mmr.makeFreeMove(from, to, currentPosition)}
        this.evaluationStarted = false
        this.bestMoveCB(moveToMake)
    }

    getAvaliableMoves = (positionKey: string, board: IBoardToGame) => {
        let availableMoves = bmlsState.getBranch(positionKey)?.moves 
        if (!availableMoves) {
            availableMoves = mmr.lookForAllMoves(this.engineColor, board)
                .map((m: IMMRResult) => {
                    const {move, position} = m
                    return {move, branchValue: this.startValue, position}
                }) as IMove[]
        }
        if (!availableMoves.length) {
            return null
        }
        return availableMoves        
    }

    setActualMovesBranchAfterMove = (props: {history: string[], cP: IBoardToGame}) => {
        const {history, cP: currentPosition} = props
        console.log(props)
        this.evaluationStarted = true
        this.historyLength = history.length
        if (history.length < 2 && this.game) {
            return this.debuteResolver(currentPosition)
        }
        this.lastMove = history.slice(-1)[0] || 'sp'
        let positionKey = this.lastMove
        this.actualHistoryString = this.historyLength > 1 ? history.join('_') : this.lastMove
        if (bmlsState.getBranchTree().size){
            bmlsState.filterTree(positionKey)
        }
        const availableMoves = this.getAvaliableMoves(positionKey, currentPosition)
        let actualBranch = bmlsState.getBranch(positionKey)
        if (!availableMoves) {
            this.evaluationStarted = false
            return this.bestMoveCB({move: '', position: {}})
        }
        if (!actualBranch) {
            actualBranch = {
                moves: availableMoves,
                board: currentPosition,
                pieceOrder: this.engineColor,
                baseValue: evaluator.evaluateCurrentPosition(currentPosition) as number,
                validity: {deep: 0, coverage: 0}
            }
            bmlsState.updateBranchTree(positionKey, actualBranch)
            console.log('new branch at', positionKey, bmlsState.getBranch(positionKey))
            this.stepForward(positionKey, actualBranch, actualBranch.moves[0])
        } else {
            console.log('look forward')
            this.lookForUnevaluatedAndStepForward(this.lastMove)
        }
    }

    stepForward = (parentKey: string, parentBranch: IBranch, m: IMove) => {
        console.log(m, parentKey, parentBranch)
        const {position, move} = m
        const pieceOrder = oppositColor(parentBranch.pieceOrder!)
        const availableMoves = mmr.lookForAllMoves(pieceOrder, position)
        if (!availableMoves.length) {
            console.log(m, parentKey, availableMoves)
        }        
        const baseValue = evaluator.evaluateCurrentPosition(position)
        const branchValue = pieceOrder === PieceColor.w ? -this.startValue : this.startValue
        const branchKey = `${parentKey}_${move}`
        const branchKeyLength = branchKey.split('_').length
        const branch = {
            moves: availableMoves.map((move: IMMRResult) => (
                {move: move.move, branchValue, position: move.position}
            )),
            board: position,
            pieceOrder,
            baseValue,
        } as IBranch
        const updatedParentBranch = this.updateParentMoves(parentBranch, move, baseValue)
        bmlsState.updateBranchTree(parentKey, updatedParentBranch)
        bmlsState.updateBranchTree(branchKey, branch)
        if (!availableMoves.length) {
            return this.lookForUnevaluatedAndStepForward(parentKey, false)
        }
        if (pieceOrder === this.engineColor) {          
            if (branchKeyLength >= this.maxDepth) {
                return this.lastLineEvaluation(branchKey, branch)
            } 
        }
        if (!branch.moves[0]) {
            console.log('opps', branch)
        }
        this.stepForward(branchKey, branch, branch.moves[0])
    }
 
    lookForUnevaluatedAndStepForward = (key: string, afterMove = true): void => {
        console.log(key)
        const branch = bmlsState.getBranch(key)
        if (!this.evaluationStarted) return
        if (!branch || !branch?.moves?.length || (!afterMove && key.split('_').length === 3)) {
            const rootBranch = bmlsState.getBranch(this.lastMove)!
            if (afterMove
                    && ((rootBranch.baseValue! < -5 && this.engineColor === PieceColor.w)
                    || (rootBranch.baseValue! > 5 && this.engineColor === PieceColor.b))) {
                this.evaluationStarted = false
                return this.bestMoveCB({move: 'surrender', position: {}})
            }
            const {move, position} = this.getBestMove(rootBranch.moves, rootBranch.pieceOrder!)
            this.evaluationStarted = false
            return this.bestMoveCB({move, position})       
        }
        const {moves, pieceOrder} = branch
        for (let m of moves) {
            if ((m.branchValue === 100 || m.branchValue === -100)
                && ((afterMove && pieceOrder === this.engineColor) 
                || (!afterMove && key.split('_').length < this.startDepth))) {
                    console.log('unevaluated position found', branch)
                    return this.stepForward(key, branch, m)
            }
            this.lookForUnevaluatedAndStepForward(`${key}_${m.move}`, afterMove)
        }
    }

    detectChangesDirection = (key: string): boolean => {
        const lastBranch = bmlsState.getBranch(key)
        const rootBranch = bmlsState.getBranch(this.lastMove)
        return rootBranch!.baseValue! - lastBranch!.baseValue! < 0
    }

    stepBackward = (key: string) => {
        if (!this.evaluationStarted) {
            return
        }
        const increased = this.detectChangesDirection(key)
        const splittedKey = key.split('_')
        if (increased) {
            if (this.engineColor === PieceColor.w) {
                this.stepBackwardRivalStep(splittedKey.slice(0, -2))
            } else {
                this.stepBackwardEngineStep(splittedKey.slice(0, -1))
            }
        } else {
            if (this.engineColor === PieceColor.w) {
                this.stepBackwardEngineStep(splittedKey.slice(0, -1))
            } else {
                this.stepBackwardRivalStep(splittedKey.slice(0, -2))
            }
        }
    }

    stepBackwardRivalStep = (key: string[]) => {
        const branchKey = key.join('_')
        const keyLength = key.length
        const branch = bmlsState.getBranch(branchKey)
        if (!this.evaluationStarted || !branch) {
            return
        }
        const {moves} = branch!
        const unevaluatedMoves = moves.filter(m => m.branchValue === 100 || m.branchValue === -100)
        if (keyLength === 2 && !unevaluatedMoves.length) {
           setTimeout(() => this.lookForUnevaluatedAndStepForward(this.lastMove, false), 0)
        } else if (keyLength > 3 && !unevaluatedMoves.length) {
            this.stepBackwardRivalStep(key.slice(0, -2))
        } else {
            console.log('step back', unevaluatedMoves)
            setTimeout(() => this.stepForward(branchKey, branch, unevaluatedMoves[0]), 0)
        }
    }

    stepBackwardEngineStep = (key: string[]) => {
        const evaluatingBranchLength = key.length
        let branchKey = key.join('_')
        let branch = bmlsState.getBranch(branchKey)
        if (!this.evaluationStarted || !branch) {
            return
        }
        const {moves} = branch
        const unevaluatedMoves = moves.filter(m => m.branchValue === 100 || m.branchValue === -100)
        if (evaluatingBranchLength === 1 && !unevaluatedMoves.length) {
            this.lookForUnevaluatedAndStepForward(branchKey)
                // console.log('evaluation engine move finished', moves)
        } else if (evaluatingBranchLength > 2 && !unevaluatedMoves.length) {
            this.stepBackwardEngineStep(key.slice(0, -2))
        } else {
            console.log('step back', unevaluatedMoves)
            setTimeout(() => this.stepForward(branchKey, branch!, unevaluatedMoves[0]), 0)
        }
    }

    updateParentMoves = (branch: IBranch, move: string, branchValue: number): IBranch => {
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
        const branch = bmlsState.getBranch(branchKey) as IBranch
        if (!this.evaluationStarted || !branch) {
            return
        }
        const updatedBranch = this.updateParentMoves(branch, move, branchValue)
        bmlsState.updateBranchTree(branchKey, updatedBranch)
        if (branchKey === this.lastMove) {
            return
        }
        const passingValue = this.getBestMove(branch.moves, branch.pieceOrder!).branchValue
        return this.updateParentBranches(key.slice(0, -1), passingValue)
    }

    lastLineEvaluation = (branchKey: string, parentBranch: IBranch) => {
        if (!this.evaluationStarted || !bmlsState.getBranch(branchKey)) {
            return
        }
        const moves = parentBranch.moves.map((m: IMove) => {
            const {position} = m
            const baseValue = evaluator.evaluateCurrentPosition(position)
            const nextPositionKey = `${branchKey}_${m.move}`
            const availableMoves = mmr.lookForAllMoves(this.engineColor, position)
            const pieceOrder = oppositColor(parentBranch.pieceOrder!)
            const nextBranchMoves = availableMoves.map((mr: IMMRResult) => {
                    const branchValue = pieceOrder === this.engineColor ? -this.startValue : this.startValue
                    const {move, position} = mr
                    return {move, branchValue, position}
                })
            const nextBranch: IBranch = {
                moves: nextBranchMoves,
                board: position,
                pieceOrder,
                baseValue, 
            }
            bmlsState.updateBranchTree(nextPositionKey, nextBranch)
            // const validity = 
            return {...m, branchValue: baseValue}
        })
        this.lastResult = {value: this.getBestForBlack(moves).branchValue, movesBranch: branchKey}
        this.updateParentBranches(branchKey.split('_'), this.lastResult.value)
        const updatedBranch = {...parentBranch, moves}
        bmlsState.updateBranchTree(branchKey, updatedBranch)
        this.stepBackward(branchKey)
    }

    getBestMove = (moves: IMove[], pieceOrder: PieceColor) => {
        return pieceOrder === PieceColor.b ? this.getBestForBlack(moves) : this.getBestForWhite(moves)
    }

    getBestForBlack = (arr: IMove[]) => arr.slice(1).reduce((acc: IMove, i: IMove) => {
        if (i.branchValue < acc.branchValue) {
            acc = i
        }
        return acc
    }, arr[0])

    getBestForWhite = (arr: IMove[]) => arr.slice(1).reduce((acc: IMove, i: IMove) => {
        if (i.branchValue > acc.branchValue) {
            acc = i
        }
        return acc
    }, arr[0])
}

export const bms = new BestMoveSeeker({})
