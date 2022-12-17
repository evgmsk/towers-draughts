import {
    FreeMRResult,
    FullMRResult,
    ICheckerTower,
    IPiecesData,
    IPositionData,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerType,
    Value,
} from '../store/models'
import mmr from './moves-resolver'
import { oppositeColor } from './gameplay-helper-functions'

const DefaultPieces = { pieceNumber: 0, kingNumber: 0 }

export class Evaluator {
    piecesData = {
        white: Object.assign({}, DefaultPieces),
        black: Object.assign({}, DefaultPieces),
    } as IPiecesData

    resetPieces() {
        this.piecesData = {
            white: Object.assign({}, DefaultPieces),
            black: Object.assign({}, DefaultPieces),
        } as IPiecesData
    }

    getPositionData(
        towers: TowersMap,
        parentBranchColor: PieceColor,
        totalParentMoves: number
    ): IPositionData {
        this.resetPieces()
        const pieceOrder = oppositeColor(parentBranchColor)
        const towerKeys = Object.keys(towers)
        let mandatory = [] as FullMRResult[]
        let free = [] as FreeMRResult[]
        for (let key of towerKeys) {
            this.savePieceData(towers[key])
            if (towers[key].currentColor !== pieceOrder) {
                continue
            }
            const { mandatory: mm = [], free: fm = [] } = mmr.getTowerMove(
                towers,
                key
            )
            mandatory = mandatory.concat(mm)
            free = free.concat(fm)
        }
        const totalMovesNumber = mandatory.length + free.length
        return {
            moves: mmr.getMovesFromTotalMoves({ mandatory, free }),
            totalMovesNumber,
            pieceOrder,
            deepValue: {
                depth: 0,
                value: this.getPositionValue(
                    totalMovesNumber,
                    totalParentMoves,
                    parentBranchColor
                ),
                move: '',
            },
            position: towers,
            extraData: this.piecesData,
        }
    }

    towersValue = (tP: number, bP: number, king = false) => {
        const bottomValue = king
            ? Math.min((bP * 0.2) / tP, 1.5)
            : (bP * 0.7) / tP
        const topValue = 3 + (tP * tP) / 4
        return topValue - bottomValue
    }

    getTowerPositionValue = (key: string, order: PieceColor) => {
        const lineValue =
            order === PieceColor.white
                ? parseInt(key.slice(1)) / mmr.size
                : (mmr.size + 1 - parseInt(key.slice(1))) / mmr.size
        return (lineValue + mmr.size) / mmr.size
    }

    handleTower = (tower: TowerConstructor) => {
        const {
            currentColor,
            currentType,
            wPiecesQuantity = 0,
            bPiecesQuantity = 0,
        } = tower
        const king = currentType === TowerType.k
        const towerPositionValue = this.getTowerPositionValue(
            tower.onBoardPosition,
            tower.currentColor
        )
        this.piecesData[currentColor].pieceNumber +=
            (currentColor === PieceColor.white
                ? this.towersValue(wPiecesQuantity, bPiecesQuantity, king) *
                  (king ? 1 : towerPositionValue)
                : this.towersValue(bPiecesQuantity, wPiecesQuantity, king)) *
            (king ? 1 : towerPositionValue)
        if (king) {
            this.piecesData[currentColor].pieceNumber += 1
        }
    }

    handlePieces = (tower: ICheckerTower) => {
        const piecePositionValue = this.getTowerPositionValue(
            tower.onBoardPosition,
            tower.currentColor
        )
        const { currentType, currentColor } = tower
        const king = currentType === TowerType.k
        if (king) {
            this.piecesData[currentColor].kingNumber += 1
        } else {
            this.piecesData[currentColor].pieceNumber += piecePositionValue
        }
    }

    getData() {
        return this.piecesData
    }

    savePieceData(tower: TowerConstructor) {
        if (
            mmr.GV === 'towers' &&
            tower.wPiecesQuantity + tower.bPiecesQuantity > 1
        ) {
            this.handleTower(tower)
        } else {
            this.handlePieces(tower)
        }
    }

    advantageInNumberOfMoves = (wM: number, bM: number) => {
        return 1 / (bM + 0.1) - 1 / (wM + 0.1)
    }

    advantageInTowers = (
        whitePieceNumber: number,
        blackPieceNumber: number
    ) => {
        return whitePieceNumber - blackPieceNumber
    }

    advantageInKings = (whiteKingNumber: number, blackKingNumber: number) => {
        return (whiteKingNumber - blackKingNumber) * 2.2
    }

    getPositionValue(
        totalMovesNumber: number,
        TPMNumber: number,
        color: PieceColor
    ): Value {
        const { white, black } = this.piecesData
        const [whiteMovesNumber, blackMovesNumber] =
            color !== PieceColor.white
                ? [totalMovesNumber, TPMNumber]
                : [TPMNumber, totalMovesNumber]
        const advInMoves = this.advantageInNumberOfMoves(
            whiteMovesNumber,
            blackMovesNumber
        )
        const advInKings = this.advantageInKings(
            white.kingNumber,
            black.kingNumber
        )
        const advInTowers = this.advantageInTowers(
            white.pieceNumber,
            black.pieceNumber
        )
        const value =
            parseFloat((advInKings + advInMoves + advInTowers).toFixed(3)) ||
            0.001
        return { white: value, black: -value }
    }
}

export default new Evaluator()
