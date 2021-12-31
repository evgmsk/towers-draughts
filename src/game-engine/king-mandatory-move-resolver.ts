import { IBoardToGame, IBoardCell, IDaigonals, IMMRResult, PieceColor } from "../store/app-interface"
import {MoveResolveCommons as MRC} from "./common-fn-moves-resolver" 


export class KingMandatoryMoveResolver extends MRC {

    checkKingMandatoryMoves(cell: IBoardCell, board: IBoardToGame): IMMRResult[] {
        let moves = [] as IMMRResult[]
        moves = this.checkFirstKingDiagonals(cell, board)
        if (!moves.length) {
            return moves
        }
        return this.checkKingNextSteps(moves)
    }

    checkFirstKingDiagonals(cell: IBoardCell, board: IBoardToGame): IMMRResult[] {
        let moves = [] as IMMRResult[]
        const diagonals = this.getDiagonals(cell!.boardKey, board)
        Object.values(diagonals)
        .forEach((diag: IBoardCell[]) => {
            const firstMove = {move: `${cell.boardKey}`, position: board, takenPieces: []}
            const _moves = this.checkDiagonalToMadatoryMove(diag, firstMove)
            if (_moves.length) {
                moves = [...moves, ..._moves]
            }
        })
        return moves
    }

    checkKingNextSteps(moves: IMMRResult[], cM: IMMRResult[] = []): IMMRResult[] {
        let movesToCheckContinue: IMMRResult[] = []
        let compleatedMoves = cM
        moves.forEach((m: IMMRResult) => {
            const nextStepResult = this.checkNextMoveStepDirections(m)
            if (nextStepResult.length) {
                movesToCheckContinue = movesToCheckContinue.concat(nextStepResult)
            } else if (moves.filter(_m => _m.move.startsWith(m.move)).length === 1) {
                compleatedMoves = compleatedMoves.concat(m)
            }
        })
        // console.log(movesToCheckContinue)
        if (!movesToCheckContinue.length) {
            return compleatedMoves
        } else {
            return this.checkKingNextSteps(movesToCheckContinue, compleatedMoves)
        }
    }

    checkIfDiagonalNotFit(diag: IBoardCell[], color: PieceColor): boolean {
        return diag.length < 3
            || !diag.filter((cell: IBoardCell) => cell.tower?.currentColor !== color).length
            || diag[1].tower?.currentColor === color
            || diag[2].tower?.currentColor === color
    }

    checkDiagonalToMadatoryMove(diag: IBoardCell[], move: IMMRResult): IMMRResult[] {
        const color = diag[0].tower!.currentColor
        let resultMoves = [] as IMMRResult[]
        if (this.checkIfDiagonalNotFit(diag, color as PieceColor)) {
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
            if (tower && !nextCell.tower && tower.currentColor !== color && notTaken) {
                if (!resultMoves.length) {
                    const nMove = `${move.move}:${to}`
                    const position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), move.position)
                    const takenPieces = [...move.takenPieces!, takenPiece]
                    resultMoves.push({ move: nMove, position, takenPieces})
                } else {
                    const last = resultMoves.slice(-1)[0]
                    const takenPieces = [...last.takenPieces!, takenPiece]
                    const nMove = `${last.move}:${to}`
                    const position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), last.position)
                    resultMoves.push({move: nMove, position, takenPieces})
                }
                i += 2 
            } else {
                if (!tower && resultMoves.length) {
                    const start = resultMoves[0].move!.split(':').slice(0, -1).join(':')
                    const takenPieces = resultMoves[0].takenPieces
                    const nMove = `${start}:${diag[i].boardKey}`
                    const position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), move.position)
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
            console.error('error in move', move)
        }
        const diagonals = this.getDiagonals(cellKey, board, direction) as IDaigonals
        let result = [] as IMMRResult[]
        Object.values(diagonals).forEach((diag: IBoardCell[]) => {
            if (!diag[0].tower) {
                console.error('invalid diagonal', diag, move)
            }
            const moves = this.checkDiagonalToMadatoryMove(diag, move)
            if (moves.length) {
                result = [...result, ...moves]
            }
        })
        return result 
    }
}

const kmmr = new KingMandatoryMoveResolver()

export default kmmr
