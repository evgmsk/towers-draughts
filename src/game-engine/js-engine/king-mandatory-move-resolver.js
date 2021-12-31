import {MoveResolveCommons as MRC} from "./common-fn-moves-resolver" 


export class KingMandatoryMoveResolver extends MRC {

    checkKingMandatoryMoves(cell, board) {
        let moves = []
        moves = this.checkFirstKingDiagonals(cell, board)
        if (!moves.length) {
            return moves
        }
        return this.checkKingNextSteps(moves)
    }

    checkFirstKingDiagonals(cell, board) {
        let moves = []
        const diagonals = this.getDiagonals(cell.boardKey, board)
        Object.values(diagonals)
        .forEach((diag) => {
            const firstMove = {move: `${cell.boardKey}`, position: board, takenPieces: []}
            const _moves = this.checkDiagonalToMadatoryMove(diag, firstMove)
            if (_moves.length) {
                moves = [...moves, ..._moves]
            }
        }) 
        return moves
    }

    checkKingNextSteps(moves) {
        const nextStepResult = this.checkKingsNextMandatoryStep(moves)
        if (!nextStepResult.length) {
            return moves
        } else {
            return this.checkKingNextSteps(nextStepResult)
        }
    }

    checkKingsNextMandatoryStep(moves) {
        let resultMoves = []
        moves.forEach((m, i) => {
            const move = this.checkNextMoveStepDirections(m)
            if (move.length) {
                resultMoves = resultMoves.concat(move)
            }
        })
        return resultMoves
    }

    checkIfDiagonalNotFit(diag, color) {
        return diag.length < 3
            || !diag.filter((cell) => cell.tower?.currentColor !== color).length
            || diag[1].tower?.currentColor === color
            || diag[2].tower?.currentColor === color
    }

    checkDiagonalToMadatoryMove(diag, move) {
        const color = diag[0].tower.currentColor
        let resultMoves = []
        if (this.checkIfDiagonalNotFit(diag, color)) {
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
            const cP = nextCell.boardKey
            const notTaken = !move.takenPieces?.includes(takenPiece)
            if (tower && !nextCell.tower && tower.currentColor !== color && notTaken) {
                if (!resultMoves.length) {
                    const nMove = `${move.move}:${nextCell.boardKey}`
                    const position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), move.position)
                    const takenPieces = [...move.takenPieces, takenPiece]
                    resultMoves.push({ move: nMove, position, takenPieces})
                } else {
                    resultMoves = resultMoves.map((m) => {
                        const takenPieces = [...m.takenPieces, takenPiece]
                        const nMove = `${m.move}:${nextCell.boardKey}`
                        const position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), m.position)
                        return {move: nMove, position, takenPieces, cP}
                    })
                }
                i += 2 
            } else {
                if (!tower && resultMoves.length) {
                    const start = resultMoves[0].move.split(':').slice(0, -1).join(':')
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
            if (!resultMoves.filter((m) => m.move.includes(lastCell.boardKey)).length) {
                const start = resultMoves[0].move.split(':').slice(0, -1).join(':')
                const takenPieces = resultMoves[0].takenPieces
                const nMove = `${start}:${lastCell.boardKey}`
                const position = this.updateBoardOnMandatoryMoveStep(nMove.split(':'), move.position)
                resultMoves.push({move: nMove, position, takenPieces})
            }
        }
        return resultMoves
    }

    checkNextMoveStepDirections(move) {
        const moveArr = move.move.split(':').slice(-2)
        const cellKey = moveArr[1]
        const direction = this.getMoveDirection(moveArr)
        const board = move.position
        if (!board || !board[move.move.split(':').slice(-1)[0]].tower) {
            console.error('error in move', move)
        }
        const diagonals = this.getDiagonals(cellKey, board, direction)
        let result = []
        Object.values(diagonals).forEach((diag) => {
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
