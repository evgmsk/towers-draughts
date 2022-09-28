import {IBoardCell, IBoardToGame, IMMRResult, PieceColor, TowerType} from '../store/models'
import {copyObj, filterArrayByLength, oppositeColor} from './gameplay-helper-functions'
import {KingMandatoryMoveResolver as KMMR} from './king-mandatory-move-resolver'
import {createStartBoard} from './prestart-help-function-constants'
import {IMove} from "./engine-interfaces";

export interface IEvaluationData {
    wMoves: IMove[]
    bMoves: IMove[]
    bMandatory: IMove[]
    wMandatory: IMove[]
    wTowers: number
    bTowers: number
    bKings: number
    wKings: number
    value?: number
}

export class MandatoryMovesResolver extends KMMR {
    _data = {} as IEvaluationData
    setParentPositionData(data: IEvaluationData) {
        this.parentPositionData = data
    }

    get data() {
        return this._data
    }

    gameVariantMoveContinueRestriction() {
        if (this.GV === 'international') return false
        return true
    }

    makeMoves(moves: string[], board = createStartBoard(this.size)): IBoardToGame {
        let nBoard: IBoardToGame = copyObj(board)
        let step = 0
        while(step < moves.length) {
            const move = moves[step]
            if (move.includes('-')) {
                const [from, to] = move.split('-')
                nBoard[to].tower = board[from].tower
                nBoard[from].tower = null
            } else if (move.includes(':')) {
                nBoard = this.makeMandatoryMove(move.split(':'), board)
            }
            step += 1
        }
        return nBoard
    }

    lookForAllMoves = (color: PieceColor, board: IBoardToGame): IMMRResult[] => {
        const mandatoryMoves = this.lookForMandatoryMoves(color, board)
        if (mandatoryMoves.length) {
            return mandatoryMoves
        }
        const freeMoves = this.lookForAllFreeMoves(color, board).map((m: string) => {
            const [from, to] = m.split('-')
            return {move: m, position: this.makeFreeMove(from, to, board)}
        })
        return freeMoves.concat(mandatoryMoves) as IMove[]
    }

    checkMandatoryMoveNextStep = (move: IMMRResult): IMMRResult[] => {
        // console.log('rivalMove', rivalMove.rivalMove)
        const moveArray = move.move.split(':')
        const [from, to] = moveArray.slice(moveArray.length - 2)
        const board = move.position
        const cell = board[to]
        const neighbors = cell.neighbors
        const nextMoves: IMMRResult[] = []
        const exludedDirection = this.getMoveDirection([to, from])
        Object.keys(neighbors).filter((dir: string) => (
            dir !== exludedDirection
        )).forEach((dir: string) => {
            if (!cell.tower) {
                console.error('checkManMoveNextStep invalid start cell', move, board, cell, dir)
            }
            const nMove = this.checkManDirection(cell, dir, move)
            if (nMove) {
                nextMoves.push(nMove)
            }
        })
        return nextMoves
    }

    checkManFirstMandatoryStep(cell: IBoardCell, board: IBoardToGame): IMMRResult[] {
        const moves = [] as IMMRResult[]
        Object.keys(cell!.neighbors).forEach((dir: string) => {
            const startProps = {move: '', position: board, takenPieces: []}
            const move = this.checkManDirection(cell, dir, startProps)
            // console.warn('move', move, cell)
            if (move) {
                moves.push(move)
            }
        })
        // console.log('moves', moves)
        return moves
    }

    checkManMandatoryMoves(cell: IBoardCell, board: IBoardToGame): IMMRResult[] {
        let result = [] as IMMRResult[]
        result = this.checkManFirstMandatoryStep(cell, board)
        console.warn('man moves', cell, result, result.length)
        return !result.length ? result : this.checkMandatoryMoveNextSteps(result)
    }

    checkManDirection(cell: IBoardCell, dir: string, preMove: IMMRResult): IMMRResult {
        if (!cell.tower) {
            console.error('cod invalid start cell', cell, preMove, dir)
        }
        const board = preMove.position
        const neighborCell = board[cell!.neighbors[dir]]
        const takenPiece = neighborCell.boardKey
        if (this.GV !== 'towers' && preMove.move.length && preMove.takenPieces!.includes(takenPiece)) {
            return null as unknown as IMMRResult
        } else if (neighborCell?.tower?.currentColor === oppositeColor(cell!.tower!.currentColor!)) {
            const nextCellKey = neighborCell.neighbors[dir]
            if(nextCellKey && !board[nextCellKey].tower) {
                const move = !preMove.move.length
                    ? `${cell?.boardKey}:${nextCellKey}`
                    : `${preMove.move}:${nextCellKey}`
                if (move.split(':').length < 2) {
                    console.error('rivalMove too short', move)
                }
                const position = this.updateBoardOnMandatoryMoveStep(move.split(':'), board)
                const takenPieces = [...preMove.takenPieces!, takenPiece]
                // console.warn('next cell', cell, neighborCell, dir, nextCellKey, board, preMove,'res', move, takenPieces,position)
                return {move, takenPieces, position}
            }
        }
        return null as unknown as IMMRResult
    }

    checkMandatoryMoveNextSteps = (moves: IMMRResult[], cM = [] as IMMRResult[]): IMMRResult[] => {
        let completedMoves = cM as IMMRResult[]
        let movesToCheckContinue = [] as IMMRResult[]
        moves.forEach((move: IMMRResult) => {
            const board = move.position
            const currentSquare = move.move.split(':').slice(-1)[0]
            if (board[currentSquare].tower?.currentType === TowerType.k
                && this.gameVariantMoveContinueRestriction()) {
                const nextMoves = this.checkKingNextSteps([move])
                if (nextMoves.length) {
                    completedMoves = completedMoves.concat(nextMoves)
                } else {
                    completedMoves.push(move)
                }
            } else {
                const nextMoves = this.checkMandatoryMoveNextStep(move)
                if (nextMoves.length) {
                    movesToCheckContinue = movesToCheckContinue.concat(nextMoves)
                } else if (!completedMoves.filter(m => m.move.startsWith(move.move)).length) {
                    completedMoves.push(move)
                }
            }
        })
        if (!movesToCheckContinue.length) {
            return completedMoves
        } else {
            return this.checkMandatoryMoveNextSteps(movesToCheckContinue, completedMoves)
        }
    }

    removeTakenPieces = (move: IMMRResult) => {
        const {takenPieces} = move
        const position = copyObj(move.position)
        takenPieces!.forEach(key => {
            position[key].tower = null
        })
        return {...move, position}
    }

    lookForMandatoryMoves = (color: PieceColor, board: IBoardToGame): IMMRResult[] => {
        let result = [] as IMMRResult[]
        for (let key of Object.keys(board)) {
            const cell = board[key]
            if (cell.tower?.currentColor !== color) continue
            if (cell.tower?.currentType === TowerType.k) {
                const moves = this.checkKingMandatoryMoves(cell, board)
                if (moves.length) {
                    result =  result.concat(moves)
                }
            } else {
                const moves = this.checkManMandatoryMoves(cell, board)
                if (moves.length) {
                    result = result.concat(moves)
                }
                console.warn('before filter', cell, result, result.length)
            }
        }
        result = this.GV === 'towers'
            ? result
            : result.map((m: IMMRResult) => (this.removeTakenPieces(m)))
        return this.GV ===  'international' ? filterArrayByLength(result).cont : result
    }
}

const mmr = new MandatoryMovesResolver()

export default mmr
