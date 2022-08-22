import {IBoardCell, IBoardToGame, ICheckerTower, PieceColor, TowerType} from "../store/models"
import mmr from './mandatory-move-resolver'

export class Evaluator {
    GV = mmr.GV
    mmr = mmr
    wTowers = 0
    bTowers = 0
    wKings = 0
    wPieces = 0
    bKings = 0
    bPieces = 0
    wMoves = 0
    bMoves = 0

    handlePieces = (tower: ICheckerTower) => {
        const {currentType, currentColor} = tower
        const {bKings, wKings, bPieces, wPieces} = this
        if (currentType === TowerType.m) {
            if (currentColor === PieceColor.w) {
                this.wPieces = wPieces + 1
            } else {
                this.bPieces = bPieces + 1
            }
        } else {

            if (currentColor === PieceColor.w) {
                this.wKings = wKings + 1
            } else {
                this.bKings = bKings + 1
            }
        }
    }

    bottomTowersValue = (tP: number, bP: number, king = false) => {
        if (!king) {
            return bP * (.6 / tP)
        } else {
            return bP * (.2 / tP)
        }
    }

    calcTowersFactor = () => {
        const { wTowers, bTowers } = this
        return wTowers - bTowers
    }

    handleTower = (tower: ICheckerTower) => {
        const {currentColor, currentType, wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
        const king = currentType === TowerType.k
        if (currentColor === PieceColor.w) {
            this.wTowers += wPiecesQuantity
            this.wKings = king ? this.wKings + 1 : this.wKings
            this.bTowers += this.bottomTowersValue(wPiecesQuantity, bPiecesQuantity, king)
        } else {
            this.bTowers += bPiecesQuantity
            this.bKings = king ? this.bKings + 1 : this.bKings
            this.wTowers += this.bottomTowersValue(bPiecesQuantity, wPiecesQuantity, king)
        }
    }

    setDefault = () => {
        this.wTowers = 0
        this.bTowers = 0
        this.wKings = 0
        this.wPieces = 0
        this.bKings = 0
        this.bPieces = 0
        this.wMoves = 0
        this.bMoves = 0
    }

    calcMoves = (key: string, board: IBoardToGame) => {
        const {wMoves, bMoves} = this
        const color = board[key].tower?.currentColor
        if (color === PieceColor.w) {
            this.wMoves = wMoves + this.mmr.lookForTowerFreeMoves(key, board, PieceColor.w).length
        } else if (color === PieceColor.b) {
            this.bMoves = bMoves + this.mmr.lookForTowerFreeMoves(key, board, PieceColor.b).length
        }
    }

    getBoardData = (board: IBoardToGame) => {
        Object.values(board).forEach((cell: IBoardCell) => {
            const {tower, boardKey} = cell
            if (!tower) { return }
            let {wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
            this.calcMoves(boardKey, board)
            if (this.GV === 'towers' && wPiecesQuantity + bPiecesQuantity > 1) {
                this.handleTower(tower as ICheckerTower)
            } else {
                this.handlePieces(tower as ICheckerTower)
            }
        })
    }

    advantageInNumberOfMoves = () => {
        const {wMoves: wM, bMoves: bM} = this
        return 2 * (wM - bM) / (wM + bM)
    }

    advantageInPieces = () => {
        const {wPieces, bPieces} = this
        return (wPieces - bPieces) * .9
    }

    advantageInKings = () => {
        const {wKings: wK, bKings: bK} = this
        return  wK/(bK + 1) * 2
    }

    evaluateCurrentPosition = (board: IBoardToGame) => {
        this.setDefault()
        this.getBoardData(board)
        const moveAdvantage = this.advantageInNumberOfMoves()
        const pieceNumberValue = this.advantageInPieces()
        const kingsNumberValue = this.advantageInKings()
        if (this.GV !== 'towers') {
            return moveAdvantage + pieceNumberValue + kingsNumberValue
        } else {
            const towersFactor = this.calcTowersFactor()
            return moveAdvantage + kingsNumberValue + towersFactor
        }
    }
}

export const evaluator = new Evaluator()
