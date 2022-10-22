import { IBoardToGame, IBoardCell, IDiagonals, IMMRResult, PieceColor } from "../store/models"
import {MoveResolveCommons as MRC} from "./common-fn-moves-resolver" 


export class KingMandatoryMoveResolver extends MRC {

    checkKingMandatoryMoves(cell: IBoardCell, board: IBoardToGame): IMMRResult[] {
        const moves = this.checkFirstKingDiagonals(cell, board)
        return !moves.length ? moves : this.checkKingNextSteps(moves)
    }

    checkFirstKingDiagonals(cell: IBoardCell, board: IBoardToGame): IMMRResult[] {
        let moves = [] as IMMRResult[]
        const diagonals = this.getDiagonals(cell!.boardKey, board)
        Object.keys(diagonals).forEach((key: string) => {
            const diag = diagonals[key]
            const firstMove = {move: `${cell.boardKey}`, position: board, takenPieces: []}
            const _moves = this.checkDiagonalToMandatoryMove(diag, firstMove)
            if (_moves.length) {
                moves = [...moves, ..._moves]
            }
        })
        return moves
    }

    checkKingNextSteps(moves: IMMRResult[], cM: IMMRResult[] = []): IMMRResult[] {
        let movesToCheckContinue: IMMRResult[] = []
        let completedMoves = cM
        moves.forEach((m: IMMRResult) => {
            const nextStepResult = this.checkNextMoveStepDirections(m)
            if (nextStepResult.length) {
                movesToCheckContinue = movesToCheckContinue.concat(nextStepResult)
            } else if (moves.filter(_m => _m.move.startsWith(m.move)).length === 1) {
                completedMoves = completedMoves.concat(m)
            }
        })
        if (!movesToCheckContinue.length) {
            return completedMoves
        } else {
            return this.checkKingNextSteps(movesToCheckContinue, completedMoves)
        }
    }

    checkIfDiagonalIsSuitableToMandatoryMove(diag: IBoardCell[], color: PieceColor): boolean {
        return diag.length < 3
            || !diag.filter((cell: IBoardCell) => cell.tower?.currentColor !== color).length
            || diag[1].tower?.currentColor === color
            || diag[2].tower?.currentColor === color
    }

    checkDiagonalToMandatoryMove(diag: IBoardCell[], move: IMMRResult): IMMRResult[] {
        const color = diag[0].tower!.currentColor
        let resultMoves = [] as IMMRResult[]
        if (this.checkIfDiagonalIsSuitableToMandatoryMove(diag, color as PieceColor)) {
            return resultMoves
        }
        let i = 1
        while (i <  diag.length - 1) {
            const tower = diag[i].tower
            const nextCell = diag[i+1]
            if (tower?.currentColor === color || (tower && nextCell.tower)) {
                break
            } 
            const takenPiece = diag[i].boardKey
            const to = nextCell.boardKey
            const notTaken = !move.takenPieces?.includes(takenPiece)
            let nMove, position, takenPieces
            if (tower && !nextCell.tower && tower.currentColor !== color && notTaken) {
                if (!resultMoves.length) {
                    nMove = `${move.move}:${to}`
                    const moveArr = move.move.split(':').concat(to)
                    position = this.updateBoardOnMandatoryMoveStep(moveArr, move.position)
                    takenPieces = move.takenPieces!.concat(takenPiece)
                } else {
                    const last = resultMoves.slice(-1)[0]
                    takenPieces = last.takenPieces!.concat(takenPiece)
                    nMove = `${last.move}:${to}`
                    const moveArr = last.move.split(':').concat(to)
                    position = this.updateBoardOnMandatoryMoveStep(moveArr, last.position)
                }
                i += 2
                resultMoves.push({move: nMove, position, takenPieces})
            } else {
                if (!tower && resultMoves.length) {
                    const start = resultMoves[0].move!.split(':').slice(0, -1).join(':')
                    takenPieces = resultMoves[0].takenPieces
                    nMove = `${start}:${diag[i].boardKey}`
                    position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), move.position)
                    resultMoves.push({move: nMove, position, takenPieces})
                }
                i += 1
            }
        }
        const lastCell = diag[i]
        if (i === diag.length - 1 && !lastCell.tower && resultMoves.length) {
            if (!resultMoves.filter((m: IMMRResult) => m.move.includes(lastCell.boardKey)).length) {
                const start = resultMoves[0].move!.split(':').slice(0, -1).join(':')
                const takenPieces = resultMoves[0].takenPieces
                const nMove = `${start}:${lastCell.boardKey}`
                const position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), move.position)
                resultMoves.push({move: nMove, position, takenPieces})
            }
        }
        return resultMoves
    }

    checkNextMoveStepDirections(move: IMMRResult): IMMRResult[] {
        const moveArr = move.move.split(':').slice(-2)
        const cellKey = moveArr[1]
        const direction = this.getMoveDirection(moveArr)
        const board = move.position
        if (!board || !board[move.move.split(':').slice(-1)[0]].tower) {
            console.error('error in rivalMove', move)
        }
        const diagonals = this.getDiagonals(cellKey, board, direction) as IDiagonals
        let result = [] as IMMRResult[]
        Object.keys(diagonals).forEach((key: string) => {
            const diag = diagonals[key]
            if (!diag[0].tower) {
                console.error('invalid diagonal', diag, move)
            }
            const moves = this.checkDiagonalToMandatoryMove(diag, move)
            if (moves.length) {
                result = [...result, ...moves]
            }
        })
        return result 
    }
}

export default new KingMandatoryMoveResolver()
