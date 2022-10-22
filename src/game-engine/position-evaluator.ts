import {IBoardToGame, ICheckerTower, PieceColor, TowerType} from "../store/models"
import mmr from './mandatory-move-resolver'


export class Evaluator {
    GV = mmr.GV
    wTowers = 0
    bTowers = 0
    wKings = 0
    wPieces = 0
    bKings = 0
    bPieces = 0
    wMoves = 0
    bMoves = 0
    pieceOrder = PieceColor.w

    handlePieces = (tower: ICheckerTower, key: string) => {
        const lineValue = tower.currentColor === PieceColor.w
            ? parseInt(key.slice(1))
            : 9 - parseInt(key.slice(1))
        const pieceValue = (8 + lineValue * .5) / 8
        const {currentType, currentColor} = tower
        const {bKings, wKings, bPieces, wPieces} = this
        if (currentType === TowerType.m) {
            if (currentColor === PieceColor.w) {
                this.wPieces = wPieces + pieceValue
            } else {
                this.bPieces = bPieces + pieceValue
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

    calcAllTowerMoves(key: string, board: IBoardToGame) {
        // const towerCell = board[key]
        // const {currentColor} = towerCell.tower!
        // if (towerCell.tower?.currentType === TowerType.k) {
        //     const freeMoves = mmr.lookForKingFreeMoves(key, board)
        //     return freeMoves.length < 8
        //         ? mmr.checkKingMandatoryMoves(towerCell, board).length + freeMoves.length
        //         : freeMoves.length
        // }
        // const freeMoves = mmr.checkNeighborsIsEmpty(key, board, currentColor!)
        // return freeMoves.length > 1
        //     ? freeMoves.length
        //     : mmr.checkManMandatoryMoves(towerCell, board).length + freeMoves.length
        return 0
    }

    calcMoves = (key: string, board: IBoardToGame) => {
        const {wMoves, bMoves} = this
        const {currentColor, currentType} = board[key].tower!
        if (currentType === TowerType.k) {

        }
        if (currentColor === PieceColor.w) {
            this.wMoves = wMoves + this.calcAllTowerMoves(key, board)
        } else if (currentColor === PieceColor.b) {
            this.bMoves = bMoves + this.calcAllTowerMoves(key, board)
        }
    }

    getBoardData = (board: IBoardToGame) => {
        this.setDefault()
        Object.keys(board).forEach((key: string) => {
            const {tower, boardKey} = board[key]
            if (!tower) { return }
            let {wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
            this.calcMoves(boardKey, board)
            if (this.GV === 'towers' && wPiecesQuantity + bPiecesQuantity > 1) {
                this.handleTower(tower as ICheckerTower)
            } else {
                this.handlePieces(tower as ICheckerTower, key)
            }
        })
        // console.warn('k', this)
    }

    advantageInNumberOfMoves = () => {
        const {wMoves: wM, bMoves: bM} = this
        return 8/(bM + .1) - 8/(wM + .1)
    }

    advantageInTowers = () => {
        const {wPieces, bPieces, bTowers, wTowers} = this
        return (wPieces + wTowers - bPieces - bTowers) * 0.9
    }

    advantageInPieces = () => {
        const {wPieces, bPieces} = this
        return (wPieces - bPieces) * .91
    }

    advantageInKings = () => {
        const {wKings: wK, bKings: bK} = this
        return wK/(bK + .4)
    }

    evaluateCurrentPosition = (board: IBoardToGame, pieceOrder: PieceColor) => {
        this.pieceOrder = pieceOrder
        this.setDefault()
        this.getBoardData(board)
        const moveAdvantage = this.advantageInNumberOfMoves()
        const pieceNumberValue = this.GV !== 'towers'
            ? this.advantageInPieces()
            : this.advantageInTowers()
        const kingsNumberValue = this.advantageInKings()

        const value = moveAdvantage + pieceNumberValue + kingsNumberValue
        console.warn('eval', this, value, moveAdvantage, pieceNumberValue, kingsNumberValue, pieceOrder, board)
        return pieceOrder === PieceColor.w ? value : - value
    }
}

export const evaluator = new Evaluator()
