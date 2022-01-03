import { IBoardCell, IBoardToGame, ICheckerTower, IMMRResult, PieceColor, TowerType } from "../store/app-interface"
import { IBranch, ILastResult, ISeekerProps, IMove } from "./engine-interfaces"
import {oppositColor} from "./gameplay-helper-fuctions"
import mmr from './mandatory-move-resolver'

const FirstMoves: {[key:string]: string[]} = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5'],
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',],
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
}


export type BestMoveSeekerType = BestMoveSeeker

export class Evaluator {
    GV = mmr.GV
    mmr = mmr
    engineTowers = 0
    rivalTowers = 0
    engineKings = 0
    enginePieces = 0
    rivalKings = 0
    rivalPieces = 0
    engineMoves = 0
    rivalMoves = 0
    color = PieceColor.w

    setEvaluatingColor = (color: PieceColor) => {
        this.color = color
    }

    handlePieces = (tower: ICheckerTower) => {
        const {currentType, currentColor} = tower
        const {rivalKings, engineKings, rivalPieces, enginePieces} = this
        if (currentType === TowerType.m) {
            if (currentColor === this.color) {
                this.enginePieces = enginePieces + 1
            } else {
                this.rivalPieces = rivalPieces + 1
            }
        } else {
            if (currentColor === this.color) {
                this.engineKings = engineKings + 1
            } else {
                this.rivalKings = rivalKings + 1
            }
        }
    }

    bottomTowersValue = (tP: number, bP: number, king = false) => {
        if (!king) {
            return bP * (.4 / tP)
        } else {
            return bP * (.2 / tP)
        }
    }

    calcTowersFactor = () => {
        const {engineTowers, rivalTowers} = this
        return engineTowers - rivalTowers
    }

    handleTower = (tower: ICheckerTower) => {
        const {currentColor, currentType, wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
        if (this.color === PieceColor.w) {
            if (currentType === TowerType.m) {
                if (currentColor === PieceColor.w) {
                    this.engineTowers += wPiecesQuantity
                    this.rivalTowers += this.bottomTowersValue(wPiecesQuantity, bPiecesQuantity)
                } else {
                    this.rivalTowers += bPiecesQuantity
                    this.engineTowers += this.bottomTowersValue(bPiecesQuantity, wPiecesQuantity)
                }
            } else {
                if (currentColor === this.color) {
                    this.engineTowers += wPiecesQuantity + 1
                    this.rivalTowers += this.bottomTowersValue(wPiecesQuantity, bPiecesQuantity, true)
                } else {
                    this.rivalTowers += bPiecesQuantity + 1
                    this.engineTowers += this.bottomTowersValue(bPiecesQuantity, wPiecesQuantity, true)
                }
            }
        } else {
            if (currentType === TowerType.m) {
                if (currentColor === PieceColor.w) {
                    this.rivalTowers += wPiecesQuantity
                    this.engineTowers += this.bottomTowersValue(wPiecesQuantity, bPiecesQuantity)
                } else {
                    this.engineTowers += bPiecesQuantity
                    this.rivalTowers += this.bottomTowersValue(bPiecesQuantity, wPiecesQuantity)
                }
            } else {
                if (currentColor === PieceColor.w) {
                    this.rivalTowers += wPiecesQuantity
                    this.engineTowers += this.bottomTowersValue(wPiecesQuantity, bPiecesQuantity, true)
                } else {
                    this.engineTowers += bPiecesQuantity
                    this.rivalTowers += this.bottomTowersValue(bPiecesQuantity, wPiecesQuantity, true)
                }
            }
        }
    }

    setDefault = () => {
        this.engineTowers = 0
        this.rivalTowers = 0
        this.engineKings = 0
        this.enginePieces = 0
        this.rivalKings = 0
        this.rivalPieces = 0
        this.engineMoves = 0
        this.rivalMoves = 0
    }

    calcMoves = (key: string, board: IBoardToGame, color: PieceColor) => {
        const {engineMoves, rivalMoves} = this
        const movesNum = this.mmr.lookForTowerFreeMoves(key, board, color).length
        if (color === this.color) {
            this.engineMoves = engineMoves + movesNum
        } else {
            this.rivalMoves = rivalMoves + movesNum
        }
    }

    getBoardData = (board: IBoardToGame) => {
        Object.values(board).forEach((cell: IBoardCell) => {
            const {tower, boardKey} = cell
            if (tower) {
                this.calcMoves(boardKey, board, tower.currentColor!)
                if (this.GV === 'towers') {
                    let {wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
                    if (wPiecesQuantity + bPiecesQuantity === 1) {
                        this.handlePieces(tower as ICheckerTower)
                    } else {
                        this.handleTower(tower as ICheckerTower)
                    }
                } else {
                    this.handlePieces(tower as ICheckerTower)
                }
            }
        })
    }

    calcMovesNumber = (color: PieceColor, board: IBoardToGame) => {
        return this.mmr.lookForAllPosibleMoves(color, board).length
    }

    advantageInNumberOfMoves = () => {
        const {engineMoves: mM, rivalMoves: rM} = this
        return 2 * (mM - rM) / (mM + rM)
    }

    caclAdvantageInPieces = () => {
        const {enginePieces, rivalPieces} = this
        return (enginePieces - rivalPieces) * .9
    }

    caclAdvantageInKings = () => {
        const {engineKings: eK, rivalKings: rK} = this
        return  eK > rK ? eK/(rK + 1) * 2 : -rK/(eK + 1) * 2
    }

    checkIfkingsNumberChanged = (board: IBoardToGame) => {
        this.getBoardData(board)
        return this.caclAdvantageInKings()
    }

    evaluateCurrentPosition = (board: IBoardToGame) => {
        this.setDefault()
        this.getBoardData(board)
        const moveAdvantage = this.advantageInNumberOfMoves()
        const pieceNumberValue = this.caclAdvantageInPieces()
        const kingsNumberValue = this.caclAdvantageInKings()
        if (this.GV !== 'towers') {
            return moveAdvantage + pieceNumberValue + kingsNumberValue
        } else {
            const towersFactor = this.calcTowersFactor()
            return moveAdvantage + pieceNumberValue + kingsNumberValue + towersFactor
        }
    }
}

export const evaluator = new Evaluator()

export class BestMoveSeeker {
    maxDepth = 6
    bestMoveCB: Function = () => {}
    bestLinesCB: Function = () => {}
    evaluator = evaluator
    moveBranchesTree: Map<string, IBranch> = new Map()
    actualHistoryString = ''
    lastPlayerMove = ''
    historyLength = 0
    engineColor: PieceColor = PieceColor.w
    lastResult = {} as ILastResult
    fullPath = false
    evaluationStarted = true
    game = true
    resetProps = (props: ISeekerProps) => {
        this.bestMoveCB = props.bestMoveCB
        this.maxDepth = props.maxDepth
        this.engineColor = props.engineColor || PieceColor.w
        this.game = !!props.game 
        this.moveBranchesTree = new Map()
        if (props.engineColor) {
            this.evaluator.setEvaluatingColor(props.engineColor)
        }
        this.moveBranchesTree = new Map()
        this.actualHistoryString = ''
        this.historyLength = 0
        this.lastPlayerMove = ''
        this.lastResult = {} as ILastResult
        console.log('engine reseted', props)
    }

    startEvaluation = (start: boolean) => {
        this.evaluationStarted = start
    }

    setEngieneColor = (color: PieceColor) => {
        this.engineColor = color
        this.evaluator.setEvaluatingColor(color)
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
        this.bestMoveCB(moveToMake)
    }

    filterBranches = () => {
        const {moveBranchesTree, actualHistoryString, lastPlayerMove} = this
        const newTree = new Map()
        moveBranchesTree.forEach((v: Object, k: string) => {
            if (k.startsWith(actualHistoryString)) {
                const actualLength = actualHistoryString.length - lastPlayerMove.length
                const newKey = k.slice(actualLength)
                newTree.set(newKey, v)
            }
            this.moveBranchesTree = newTree
        })
    }

    getAvaliableMoves = (positionKey: string, board: IBoardToGame) => {
        let availableMoves = this.moveBranchesTree.get(positionKey)?.moves 
        if (!availableMoves) {
            availableMoves = mmr.lookForAllMoves(this.engineColor, board)
                .map((m: IMMRResult) => {
                    const {move, position} = m
                    return {move, branchValue: -100, position}
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
        this.historyLength = history.length
        if (history.length < 2 && this.game) {
            return this.debuteResolver(currentPosition)
        }
        this.lastPlayerMove = history.slice(-1)[0] || 'sp'
        let positionKey = this.lastPlayerMove
        this.actualHistoryString = this.historyLength > 1 ? history.join('_') : this.lastPlayerMove
        if (this.moveBranchesTree.size){
            this.filterBranches()
        }
        const {moveBranchesTree} = this
        const availableMoves = this.getAvaliableMoves(positionKey, currentPosition)
        let actualBranch = moveBranchesTree.get(positionKey)
        if (!availableMoves) {
            return this.bestMoveCB({move: '', position: {}})
        }
        const baseValue = this.evaluator.evaluateCurrentPosition(currentPosition) as number
        if (!actualBranch) {
            actualBranch = {
                moves: availableMoves,
                board: currentPosition,
                engineMoveLast: false,
                value: baseValue,
                baseValue,
            }
            this.moveBranchesTree.set(positionKey, actualBranch)
            console.log('new branch at', positionKey, moveBranchesTree.get(positionKey))
        } else {
            console.log('look forward')
            positionKey = this.lookForUnevaluatedForward(this.lastPlayerMove)
        } 
        if (positionKey) {
            this.stepForward(positionKey)
        } else {
            if (actualBranch.value! < -5) {
                this.bestMoveCB({move: 'surrender', position: {}})
            } else {
                const {move, position} = this.getBestForEngine(actualBranch.moves)
                this.bestMoveCB({move, position})
            }
        }
    }

    handleNoMovesBranch = (key1: string, branch1: IBranch, key2: string, branch2: IBranch) => {
        if (!this.evaluationStarted) {
            return
        }
        const value = branch1.engineMoveLast ? -50 : 50
        this.moveBranchesTree.set(key1, branch1)
        this.moveBranchesTree.set(key2, branch2)
        if (key1 !== this.lastPlayerMove) {
            this.updateParentBranches(key1.split('_'), value)
            this.lastResult = {movesBranch: key1, value}
            if (value > 0) {
                this.stepBackForUnevaluatedBranchPlayer(key1.split('_').slice(0, -1))
            } else {
                this.stepBackForUnevaluatedBranchEngine(key1.split('_').slice(0, -1))
            }
        } else {
            const engineMoveLast = branch1.engineMoveLast || (branch1.pieceOrder === this.engineColor)
            const {move, position} = this.getBestMove(branch1.moves, engineMoveLast)
            this.bestMoveCB({move, position})
        }
    }

    stepForward = (key: string) => {
        if (!this.evaluationStarted || !this.moveBranchesTree.get(key)) {
            return
        }
        let evaluatingPositon = this.moveBranchesTree.get(key)!
        if (!evaluatingPositon) console.error('no branch', key)
        const {moves, engineMoveLast} = evaluatingPositon!
        const color = engineMoveLast ? this.engineColor : oppositColor(this.engineColor)
        const unevaluatedMoves = moves.filter(m => Math.abs(m.branchValue) === 100)
        // if (!unevaluatedMoves.length) console.error('no moves in the branch', key, evaluatingPositon, this.moveBranchesTree)
        const {move, position} = unevaluatedMoves[0]
        const value = this.evaluator.evaluateCurrentPosition(position)
        const nextPositionKey = `${key}_${move}`
        const availableMoves = mmr.lookForAllMoves(color, position)
        const branchValue = engineMoveLast ? -100 : 100
        const nextPosition = {
            moves: availableMoves.map((move: IMMRResult) => (
                {move: move.move, branchValue, position: move.position}
            )),
            board: position,
            engineMoveLast: !engineMoveLast,
            value,
            baseValue: value,
        } as IBranch
        if (!availableMoves.length) {
            // console.log('branch game ended', color, evaluatingPositon, key)
            return this.handleNoMovesBranch(key, evaluatingPositon, nextPositionKey, nextPosition)
        }
        evaluatingPositon = {
            ...evaluatingPositon,
            moves: moves.map(m => {
                if (m.move === move) {
                    return {...m, branchValue: value}
                }
                return m
            }) as IMove[]
        }
        this.moveBranchesTree.set(key, evaluatingPositon)
        this.moveBranchesTree.set(nextPositionKey, nextPosition)
        if (!engineMoveLast) {
            const currentDeep = nextPositionKey.split('_').length 
            if (currentDeep >= this.maxDepth) {
                return this.lastLineEvaluation(nextPositionKey)
            } 
        } 
        this.stepForward(nextPositionKey)
    }

    lookForUnevaluatedForward = (key: string): string => {
        const branch = this.moveBranchesTree.get(key)
        if (!branch) {
            return ''
        }
        const {moves, engineMoveLast} = branch!
        const unevaluatedMoves = moves.filter(m => Math.abs(m.branchValue) === 100)
        if (unevaluatedMoves.length && !engineMoveLast) {
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
        if (!this.evaluationStarted || !this.moveBranchesTree.get(positionKey)) {
            return
        }
        let position = this.moveBranchesTree.get(positionKey)
        const {moves} = position!
        const unevaluatedMoves = moves.filter(m => Math.abs(m.branchValue) === 100) 
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
            console.error('something wrong with back step engine', key, evaluatingBranchLength, this.moveBranchesTree)
        }
    }

    handlePlayerBranchEvaluationEnd = (key: string[]) => {  
        const actualBranch = this.moveBranchesTree.get(this.lastPlayerMove)!
        if (!this.evaluationStarted || !actualBranch) {
            return
        } 
        const unevaluatedActualBranchMoves = actualBranch.moves.filter(m => Math.abs(m.branchValue) === 100) 
        if (!unevaluatedActualBranchMoves.length) {
            console.log('evaluation finished', actualBranch,)
            const {move, position} = this.getBestForEngine(actualBranch.moves)
            return  this.bestMoveCB({move, position})
        }
        setTimeout(() => this.stepForward(this.lastPlayerMove), 0)
    }

    stepBackForUnevaluatedBranchEngine = (key: string[]) => {
        const evaluatingBranchLength = key.length
        let positionKey = key.join('_')
        let position = this.moveBranchesTree.get(positionKey)!
        if (!this.evaluationStarted || !position) {
            return
        }
        const {moves} = position!
        const unevaluatedMoves = moves.filter(m => Math.abs(m.branchValue) === 100)
        if (evaluatingBranchLength === 1) {
            if (!unevaluatedMoves.length) {
                const {branchValue, ...bestMove} = this.getBestForEngine(position.moves)
                console.log('evaluation engine move finished', moves, this.moveBranchesTree)
                return this.bestMoveCB(bestMove)
            } 
            setTimeout(() => this.stepForward(positionKey), 0)
        } else if (evaluatingBranchLength > 1) {
            if (!unevaluatedMoves.length) {
                this.stepBackForUnevaluatedBranchEngine(key.slice(0, -2))
            } else if (evaluatingBranchLength - this.historyLength <= 3) {
                setTimeout(() => this.stepForward(positionKey), 0)
            } else {
                this.stepForward(positionKey)
            }
        } else {
            console.error('something wrong with back step engine')
        }
    }

    handleCaseValueChangedNotably = (key: string): boolean => {
        const position = this.moveBranchesTree.get(key)!
        if (!this.evaluationStarted || !position) {
            return false
        }
        if (key === this.lastPlayerMove) {
            return false
        }
        const keyArr = key.split('_')
        const parentPositionKey = keyArr.slice(0, -1).join('_')
        const parentPosition = this.moveBranchesTree.get(parentPositionKey)!
        if (Math.abs(position.value! - parentPosition.value!) < .5 && parentPositionKey.length > 3) {
            return this.handleCaseValueChangedNotably(parentPositionKey)
        }
        if (parentPositionKey === this.lastPlayerMove) {
            return false
        }
        const grandParentKey = keyArr.slice(0, -2).join('_')
        const {moves} = this.moveBranchesTree.get(grandParentKey)!
        const unevaluatedMoves = moves.filter(m => Math.abs(m.branchValue) === 100) 
        if (unevaluatedMoves.length) {
            this.stepForward(grandParentKey)
        } else if (grandParentKey.length > 3) {
            return this.handleCaseValueChangedNotably(grandParentKey)
        } else { 
            return false
        }
        return true
    }

    stepBackward = (key: string) => {
        const keyArr = key.split('_')
        const { lastResult: {value}, moveBranchesTree} = this
        const parentBranch = moveBranchesTree.get(keyArr.slice(0, -1).join('_'))
        const rootBranch = moveBranchesTree.get(this.lastPlayerMove)
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
        if (!this.evaluationStarted || !this.moveBranchesTree.get(branchKey)) {
            return
        }
        const branch = this.moveBranchesTree.get(branchKey) as IBranch
        const updatedBranch = this.updateMoves(branch, move, branchValue)
        this.moveBranchesTree.set(branchKey, updatedBranch)
        if (branchKey === this.lastPlayerMove) {
            return
        }
        const passingValue = branch.engineMoveLast 
            ? this.getBestForPlayer(updatedBranch.moves).branchValue 
            : this.getBestForEngine(updatedBranch.moves).branchValue
        return this.updateParentBranches(key.slice(0, -1), passingValue)
    }

    lastLineEvaluation = (branchKey: string) => {
        if (!this.evaluationStarted || !this.moveBranchesTree.get(branchKey)) {
            return
        }
        const lastBranch = this.moveBranchesTree.get(branchKey)!
        const moves = lastBranch.moves.map((m: IMove) => {
            const {position} = m
            const value = this.evaluator.evaluateCurrentPosition(position)
            const nextPositionKey = `${branchKey}_${m.move}`
            const availableMoves = mmr.lookForAllMoves(this.engineColor, position)
            const nextBranchMoves = availableMoves.map((mr: IMMRResult) => {
                    const {move, position} = mr
                    return {move, branchValue: 100, position}
                })
            const nextBranch: IBranch = {
                moves: nextBranchMoves,
                board: position,
                engineMoveLast: false,
                baseValue: value,
                value,
            }
            this.moveBranchesTree.set(nextPositionKey, nextBranch)
          
            return {...m, branchValue: value}
        })
        this.lastResult = {value: this.getBestForPlayer(moves).branchValue, movesBranch: branchKey}
        this.updateParentBranches(branchKey.split('_'), this.lastResult.value)
        const updatedBranch = {...lastBranch, moves}
        this.moveBranchesTree.set(branchKey, updatedBranch)
        this.stepBackward(branchKey)
    }

    getBestMove = (moves: IMove[], engineMoveLast: boolean) => {
        return engineMoveLast ? this.getBestForPlayer(moves) : this.getBestForEngine(moves)
    }

    getBestForPlayer = (arr: IMove[]) => arr.slice(1).reduce((acc: IMove, i: IMove) => {
        if (i.branchValue < acc.branchValue) {
            acc = i
        }
        return acc
    }, arr[0])

    getBestForEngine = (arr: IMove[]) => arr.slice(1).reduce((acc: IMove, i: IMove) => {
        if (i.branchValue > acc.branchValue) {
            acc = i
        }
        return acc
    }, arr[0])
}

const bms = new BestMoveSeeker()

export default bms
