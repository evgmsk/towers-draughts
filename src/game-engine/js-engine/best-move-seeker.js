import {oppositColor, TowerType, PieceColor} from "./gameplay-helper-fuctions"
import mmr from './mandatory-move-resolver'

const FirstMoves = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5'],
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',],
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
}

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

    setEvaluatingColor = (color) => {
        this.color = color
    }

   

    handlePieces = (tower) => {
        const {currentType, currentColor} = tower
        const {rivalKings, engineKings, rivalPieces, enginePieces} = this
        if (currentType === TowerType.o) {
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

    bottomTowersValue = (tP, bP, king = false) => {
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

    handleTower = (tower) => {
        const {currentColor, currentType, wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
        if (this.color === PieceColor.w) {
            if (currentType === TowerType.o) {
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
            if (currentType === TowerType.o) {
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

    calcMoves = (key, board, color) => {
        const {engineMoves, rivalMoves} = this
        const movesNum = this.mmr.lookForTowerFreeMoves(key, board, color).length
        if (color === this.color) {
            this.engineMoves = engineMoves + movesNum
        } else {
            this.rivalMoves = rivalMoves + movesNum
        }
    }

    getBoardData = (board) => {
        Object.values(board).forEach((cell) => {
            const {tower, boardKey} = cell
            if (tower) {
                this.calcMoves(boardKey, board, tower.currentColor)
                if (this.GV === 'towers') {
                    let {wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
                    if (wPiecesQuantity + bPiecesQuantity === 1) {
                        this.handlePieces(tower)
                    } else {
                        this.handleTower(tower)
                    }
                } else {
                    this.handlePieces(tower)
                }
            }
        })
    }

    calcMovesNumber = (color, board) => {
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
        return  eK > rK ? (eK)/(rK + 1) * 2 : -(rK)/(eK + 1) * 2
    }

    checkIfkingsNumberChanged = (board) => {
        this.getBoardData(board)
        return this.caclAdvantageInKings()
    }

    evaluateCurrentPosition = (board) => {
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
    timeout = 100
    bestMoveCB = () => {}
    getProps = () => {}
    evaluator = evaluator
    moveBranchesTree = {}
    currentValue = 0
    actualHistoryString = ''
    lastPlayerMove = ''
    engineColor = PieceColor.w
    GV = mmr.GV
    mmr = mmr
    lastResult = {}
    fullPath = false
    evaluationStarted = true
    game = true

    setProps = (props) => {
        this.bestMoveCB = props.bestMoveCB
        this.getProps = props.getProps
        this.maxDepth = props.maxDepth || 6
        this.timeout = props.timeout || 100
        this.engineColor = props.engineColor
        this.game = props.game || true
        this.moveBranchesTree = {}
        this.engineColor = props.engineColor
        this.evaluator.setEvaluatingColor(props.engineColor)
        console.log('engine created', props)
        if (this.game && props.getProps().history.length < 2) {
            setTimeout(this.debuteResolver, this.timeout)
        }
    }

    setEngieneColor = (color) => {
        this.engineColor = color
        this.evaluator.setEvaluatingColor(color)
    }

    setDepth = (depth) => {
        this.maxDepth = depth
    }

    // startEvaluation = () => {
    //     if (this.game && this.getProps().movesHistory.length < 2) {
    //         setTimeout(this.debuteResolver, this.timeout)
    //     } else if (!this.game) {

    //     }
    // }

    makeMove = (move, board) => {
        if (move.includes(':')) {
            return this.mmr.makeMandatoryMove(move.split(':'), board)
        }
        const [from, to] = move.split('-')
        return this.mmr.makeFreeMove(from, to, board)
    }

    debuteResolver = () => {
        const {history, engineMove, currentPosition} = this.getProps()
        if (!engineMove) return
        let move
        if (!history.length) {
            const moves = FirstMoves[this.GV]
            move = moves[Math.floor(Math.random() * moves.length)]
        } else  {
            const availableMoves = this.mmr.lookForAllPosibleMoves(this.engineColor, currentPosition)
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        }
        const [from, to] = move.split('-')
        const moveToMake = {move, position: this.mmr.makeFreeMove(from, to, currentPosition)}
        this.bestMoveCB(moveToMake)
    }

    filterBranches = () => {
        const {moveBranchesTree, actualHistoryString, lastPlayerMove} = this
        const newTree = new Map()
        moveBranchesTree.forEach((v, k) => {
            if (k.startsWith(actualHistoryString)) {
                const actualLength = actualHistoryString.length - lastPlayerMove.length
                const newKey = k.slice(actualLength)
                newTree.set(newKey, v)
            }
            this.moveBranchesTree = newTree
        })
    }

    getAvailableMoves = (positionKey, board) => {
        let availableMoves = this.moveBranchesTree.get(positionKey)?.moves 
        if (!availableMoves) {
            availableMoves = this.mmr.lookForAllMoves(this.engineColor, board)
                .map((m) => {
                    const {move, position} = m
                    return {move, branchValue: -100, position: position}
                })
        } 
        if (!availableMoves.length) {
            console.log('no moves')
            this.bestMoveCB({move: '', position: {}})
            return null
        }
        return availableMoves        
    }

    setActualBranch = (board) => {

    }

    setActualMovesBranchAfterPlayerMove = () => {
        const {history, currentPosition, engineMove} = this.getProps()
        if (!engineMove) {return}
        if (history.length < 2) {
            return this.debuteResolver()
        }
        this.lastPlayerMove = history.slice(-1)[0]
        let positionKey = this.lastPlayerMove
        this.actualHistoryString = history.join('_')
        this.filterBranches()
        const {moveBranchesTree} = this
        const availableMoves = this.getAvailableMoves(positionKey, currentPosition)
        let actualBranch = moveBranchesTree.get(positionKey)
        if (!availableMoves) {
            return  console.log(history, moveBranchesTree.size, moveBranchesTree)
        }
        if (!actualBranch) {
            actualBranch = {
                moves: availableMoves,
                board: currentPosition,
                engineMoveLast: false,
                value: this.evaluator.evaluateCurrentPosition(currentPosition)
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
            if (actualBranch.value < -5) {
                this.bestMoveCB({move: 'surrender', position: {}})
            } else {
                const {move, position} = this.getBestForEngine(actualBranch.moves)
                this.bestMoveCB({move, position})
            }
        }
    }

    handleNoMovesBranch = (key1, branch1, key2, branch2) => {
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
            const {move, position} = this.getBestMove(branch1.moves, branch1.engineMoveLast)
            this.bestMoveCB({move, position})
        }
    }

    stepForward = (key) => {
        let evaluatingPositon = this.moveBranchesTree.get(key)
        if (!evaluatingPositon) console.error('no branch', key)
        const {moves, engineMoveLast} = evaluatingPositon
        const color = engineMoveLast ? this.engineColor : oppositColor(this.engineColor)
        const unevaluatedMoves = moves.filter(m => Math.abs(m.branchValue) === 100)
        if (!unevaluatedMoves.length) console.error('no moves in the branch', key, evaluatingPositon, this.moveBranchesTree)
        const {move, position} = unevaluatedMoves[0]
        if (!move) {
            console.error(unevaluatedMoves)
        }
        const value = this.evaluator.evaluateCurrentPosition(position)
        const nextPositionKey = `${key}_${move}`
        const availableMoves = this.mmr.lookForAllMoves(color, position)
        const branchValue = engineMoveLast ? -100 : 100
        const nextPosition = {
            moves: availableMoves.map((move) => ({move: move.move, branchValue, position: move.position})),
            board: position,
            engineMoveLast: !engineMoveLast,
            value 
        }
        if (!availableMoves.length) {
            console.log('branch game ended', color, evaluatingPositon, key)
            return this.handleNoMovesBranch(key, evaluatingPositon, nextPositionKey, nextPosition)
        }
        evaluatingPositon = {
            ...evaluatingPositon,
            moves: moves.map(m => {
                if (m.move === move) {
                    return {...m, branchValue: value}
                }
                return m
            })
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

    lookForUnevaluatedForward = (key) => {
        const branch = this.moveBranchesTree.get(key)
        if (!branch) {
            console.error('unevaluted position not found', )
            throw new Error('WAF')
        }
        const {moves, engineMoveLast} = branch
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

    stepBackForUnevaluatedBranchPlayer = (key) => {
        const evaluatingBranchLength = key.length
        let positionKey = key.join('_')
        let position = this.moveBranchesTree.get(positionKey)
        const {moves} = position
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

    handlePlayerBranchEvaluationEnd = (key) => {        
        const actualBranch = this.moveBranchesTree.get(this.lastPlayerMove)
        const unevaluatedActualBranchMoves = actualBranch.moves.filter(m => Math.abs(m.branchValue) === 100) 
        if (!unevaluatedActualBranchMoves.length) {
            console.log('evaluation finished', actualBranch,)// this.copyBranchesMap(JSON.stringify(Array.from(this.moveBranchesTree))))
            const {move, position} = this.getBestForEngine(actualBranch.moves)
            return  this.bestMoveCB({move, position})
        }
        setTimeout(() => this.stepForward(this.lastPlayerMove), 0)
    }

    copyBranchesMap = (map) => {
        const newMap = new Map()
        const old = [...JSON.parse(map).entries()]
        old.forEach(([key, value]) => {
            newMap.set(key, value)
        })
    }

    stepBackForUnevaluatedBranchEngine = (key) => {
        const actualBranchLength = this.getProps().history.length
        const evaluatingBranchLength = key.length
        let positionKey = key.join('_')
        let position = this.moveBranchesTree.get(positionKey)
        const {moves} = position
        const unevaluatedMoves = moves.filter(m => Math.abs(m.branchValue) === 100)
        if (evaluatingBranchLength === 1) {
            if (!unevaluatedMoves.length) {
                const {branchValue, ...bestMove} = this.getBestForEngine(position.moves)
                console.log('evaluation engine rivalMove finished', moves, this.moveBranchesTree)
                return this.bestMoveCB(bestMove)
            } 
            setTimeout(() => this.stepForward(positionKey), 0)
        } else if (evaluatingBranchLength > 1) {
            if (!unevaluatedMoves.length) {
                this.stepBackForUnevaluatedBranchEngine(key.slice(0, -2))
            } else if (evaluatingBranchLength - actualBranchLength <= 3) {
                setTimeout(() => this.stepForward(positionKey), 0)
            } else {
                this.stepForward(positionKey)
            }
        } else {
            console.error('something wrong with back step engine')
        }
    }

    handleCaseValueChangedNotably = (key) => {
        if (key === this.lastPlayerMove) {
            return false
        }
        const position = this.moveBranchesTree.get(key)
        const keyArr = key.split('_')
        const parentPositionKey = keyArr.slice(0, -1).join('_')
        const parentPosition = this.moveBranchesTree.get(parentPositionKey)
        if (Math.abs(position.value - parentPosition.value) < .5 && parentPositionKey.length > 3) {
            return this.handleCaseValueChangedNotably(parentPositionKey)
        }
        if (parentPositionKey === this.lastPlayerMove) {
            return false
        }
        const grandParentKey = keyArr.slice(0, -2).join('_')
        const {moves} = this.moveBranchesTree.get(grandParentKey)
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

    stepBackward = (key) => {
        const valueChanged = this.handleCaseValueChangedNotably(key)
        if (valueChanged) {
            return
        }
        if (this.fullPath) {
            return this.stepBackFullPath(key)
        }
        if (this.lastResult.value > 0) {
            this.stepBackForUnevaluatedBranchPlayer(key.split('_').slice(0, -2))
        } else {
            this.stepBackForUnevaluatedBranchEngine(key.split('_').slice(0, -1))
        }
    }

    stepBackFullPath = (key) => {
        const keyArr = key.split('_')
        const branch = this.moveBranchesTree.get(key)
        const availiableMoves = branch.moves.filter((m) => Math.abs(m.branchValue) === 100)
        if (availiableMoves.length) {
            if (branch.engineMoveLast) {
                const currentDeep = keyArr.length - this.getProps().history.length 
                if (currentDeep >= this.maxDepth) {
                    this.lastLineEvaluation(key)
                } 
            }
            this.stepForward(key)
        } else {
            console.log(key, availiableMoves.length, branch)
            if (key === this.lastPlayerMove) {
                console.log('finished', branch, this.copyBranchesMap(JSON.stringify(Array.from(this.moveBranchesTree))))
                const {move, position} = this.getBestForEngine(branch.moves)
                this.bestMoveCB({move, position})
            } else {
                const parentBranchKey = keyArr.slice(0, -1).join('_')
                const move = keyArr.slice(-1)[0]
                const bestBranch = this.getBestMove(branch.moves, branch.engineMoveLast)
                this.updateParentBranch(parentBranchKey, move, bestBranch.branchValue)
                if (keyArr.length < 3) {
                    console.log('almost finished', branch, this.moveBranchesTree.size)
                    setTimeout(() => this.stepBackFullPath(parentBranchKey), 0)
                } else {
                    console.log('step back', parentBranchKey)
                    this.stepBackFullPath(parentBranchKey)
                }
            }
        }
    }

    updateParentBranch = (key, move, value) => {
        const parentBranch = this.moveBranchesTree.get(key)
        const updatedParentBranch = this.updateMoves(parentBranch, move, value)
        this.moveBranchesTree.set(key, updatedParentBranch)
    }

    updateMoves = (branch, move, branchValue) => {
        const moves = branch.moves.map((m) => {
            if (m.move === move) {
                return {...m, branchValue}
            }
            return {...m}
        })
        return {...branch, moves}
    }

    updateParentBranches = (key, branchValue) => {
        const branchKey = key.slice(0, -1).join('_')
        const move = key.slice(-1)[0]
        const branch = this.moveBranchesTree.get(branchKey)
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

    lastLineEvaluation = (branchKey) => {
        const lastEngineBranch = this.moveBranchesTree.get(branchKey)
        if (!lastEngineBranch.engineMoveLast) {
            console.error('engine rivalMove not last', branchKey)
        }
        const moves = lastEngineBranch.moves.map((m) => {
            const {position} = m
            const value = this.evaluator.evaluateCurrentPosition(position)
            const nextPositionKey = `${branchKey}_${m.move}`
            const availableMoves = this.mmr.lookForAllMoves(this.engineColor, position)
            const nextBranch = {
                moves: availableMoves.map((mr) => {
                    const {move, position} = mr
                    return {move, branchValue: 100, position}
                }),
                board: position,
                engineMoveLast: false,
                value: this.evaluator.evaluateCurrentPosition(position)
            }
            this.moveBranchesTree.set(nextPositionKey, nextBranch)
            return {...m, branchValue: value}
        })
        this.lastResult = {value: this.getBestForPlayer(moves).branchValue, movesBranch: branchKey}
        if (!this.fullPath) {
            this.updateParentBranches(branchKey.split('_'), this.lastResult.value)
        }
        const updatedBranch = {...lastEngineBranch, moves}
        this.moveBranchesTree.set(branchKey, updatedBranch)
        this.stepBackward(branchKey)
    }

    getBestMove = (moves, engineMoveLast) => {
        return engineMoveLast ? this.getBestForPlayer(moves) : this.getBestForEngine(moves)
    }

    getBestForPlayer = (arr) => arr.slice(1).reduce((acc, i) => {
        if (i.branchValue < acc.branchValue) {
            acc = i
        }
        return acc
    }, arr[0])

    getBestForEngine = (arr) => arr.slice(1).reduce((acc, i) => {
        if (i.branchValue > acc.branchValue) {
            acc = i
        }
        return acc
    }, arr[0])
}

const bms = new BestMoveSeeker()

export default bms
