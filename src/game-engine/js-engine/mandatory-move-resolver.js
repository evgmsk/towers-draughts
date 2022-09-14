import { filterArrayByLength, copyObj, oppositColor, TowerType } from './gameplay-helper-fuctions'
import { KingMandatoryMoveResolver as KMMR} from './king-mandatory-move-resolver'
import { createStartBoard } from './prestart-help-function-constants'


export class MandatoryMovesResolver extends KMMR{

    makeMoves(moves, board = createStartBoard(this.size)) {
        let nBoard = copyObj(board)
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

    lookForAllMoves = (color, board) => {
        const mandatoryMoves = this.lookForMandatoryMoves(color, board)
        if (mandatoryMoves.length) {
            return mandatoryMoves
        } 
        return this.lookForAllPosibleMoves(color, board).map((m) => {
            const [from, to] = m.split('-')
            return {move: m, position: this.makeFreeMove(from, to, board)}
        })
    }

    checkMandatoryMoveNextStep = (move) => {
        const moveArray = move.move.split(':')
        const [from, to] = moveArray.slice(moveArray.length - 2)
        const board = move.position
        const cell = board[to]
        const neighbors = cell.neighbors
        const nextMoves = []
        const exludedDirection = this.getMoveDirection([to, from])
        Object.keys(neighbors).filter((dir) => (
                dir !== exludedDirection
        )).forEach((dir) => {
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

    checkManFristMandatoryStep(cell, board) {
        const moves = []
        Object.keys(cell.neighbors).forEach((dir) => {
            const startProps = {move: '', position: board, takenPieces: [], currentPosition: cell.boardKey}
            const move = this.checkManDirection(cell, dir, startProps)
            if (move) {
                moves.push(move)
            }
        })
        return moves
    }

    checkManMandatoryMoves(cell, board) {
        let result = []
        result = this.checkManFristMandatoryStep(cell, board)
        if (!result.length) {
            return result
        }
        return this.checkMandatoryMoveNextSteps(result)
    }

    checkManDirection(cell, dir, preMove) {
        if (!cell.tower) {
            console.error('cod invalid start cell', cell, preMove, dir)
        }
        const board = preMove.position
        const neighborCell = board[cell.neighbors[dir]]
        const takenPiece = neighborCell.boardKey
        if (this.GV !== 'towers' && preMove.move.length && preMove.takenPieces.includes(takenPiece)) {
            return null 
        } else if (neighborCell?.tower?.currentColor === oppositColor(cell.tower.currentColor)) {
            const nextCellKey = neighborCell.neighbors[dir]
            if(nextCellKey && !board[nextCellKey].tower) {
                const move = !preMove.move.length 
                    ? `${cell?.boardKey}:${nextCellKey}` 
                    : `${preMove.move}:${nextCellKey}`
                if (move.split(':').length < 2) {
                    console.error('rivalMove too short', move)
                }
                const position = this.updateBoardOnMandatoryMoveStep(move.split(':'), board)
                const takenPieces = [...preMove.takenPieces, takenPiece]
                return {move, takenPieces, position}
            }
        }
        return null
    }

    checkMandatoryMoveNextSteps = (moves, kM = []) => {
        let manMoves = [] 
        let kingMoves = kM
        moves.forEach((mr) => {
            const board = mr.position
            if (typeof mr.move !== 'string') {
                console.error(mr)
            }
            const currrentPosition = mr.move.split(':').slice(-1)[0]
            if (!board[currrentPosition].tower) {
                console.error('invalid props for the next step', mr)
            }
            let nextMoves
            if (board[currrentPosition].tower?.currentType === TowerType.k && this.GV !== 'international') {
                nextMoves = this.checkKingNextSteps([mr])
                if (nextMoves.length) {
                    kingMoves = kingMoves.concat(nextMoves)
                }
            } else {
                nextMoves = this.checkMandatoryMoveNextStep(mr)
                if (nextMoves.length) { 
                    manMoves = manMoves.concat(nextMoves)
                }
            }
        })
        if (!manMoves.length) {
            return  kingMoves.length ?  kingMoves : moves
        } else {
            return this.checkMandatoryMoveNextSteps(manMoves, kingMoves)
        }
    }

    requiredTocheck = (cell, board, color) => {
        const neighborsArray =  Object.entries(cell.neighbors)
        .filter(n => board[n[1]].tower?.currentColor === oppositColor(color))

        if (!neighborsArray.length) return null

        const neighbors = neighborsArray.reduce((acc, v) => {
            acc[v[0]] = v[1]
            return acc
        }, {})
        return {...cell, neighbors}
    }

    lookForMandatoryMoves = (color, board) => {
        let result = []
        for (let cell of Object.values(board)) {
            if (cell.tower?.currentColor !== color) continue
            if (cell.tower?.currentType === TowerType.k) {
                const moves = this.checkKingMandatoryMoves(cell, board)
                if (moves.length) {
                    result =  result.concat(moves)
                }
            } else {
                const moves = this.checkManMandatoryMoves(cell, board)
                if (moves.length) {
                    result = result.concat(moves.map((m) => m))
                }
            }
        }
        return this.GV ===  'international' ? filterArrayByLength(result) : result
    }
}

const mmr = new MandatoryMovesResolver()

export default mmr
