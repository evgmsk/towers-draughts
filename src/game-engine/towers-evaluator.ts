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
    Value
} from "../store/models"
import mmr from './moves-resolver'
import {copyObj, oppositeColor} from "./gameplay-helper-functions";

const DefaultPieces = {pieceNumber: 0, kingNumber: 0}

export class Evaluator {
    piecesData = {
        white: copyObj(DefaultPieces),
        black: copyObj(DefaultPieces)
    } as IPiecesData

    resetPieces() {
        this.piecesData = {
            white: copyObj(DefaultPieces),
            black: copyObj(DefaultPieces)
        } as IPiecesData
    }

    getPositionData(towers: TowersMap, parentBranchColor: PieceColor, totalParentMoves: number): IPositionData {
        this.resetPieces()
        const pieceOrder = oppositeColor(parentBranchColor)
        const towerKeys = Object.keys(towers)
        let mandatory = [] as FullMRResult[]
        let free = [] as FreeMRResult[]
        // console.log('get data', Object.keys(towers).map(m => towers[m].shortData()))
        // console.warn(parentBranchColor, pieceOrder, Object.keys(towers).map(m => towers[m].shortData()))
        for (let key of towerKeys) {
            this.savePieceData(towers[key])
            if (towers[key].currentColor !== pieceOrder) {
                continue
            }
            const {mandatory: mm = [], free: fm = []} = mmr.getTowerMove(towers, key)
            mandatory = mandatory.concat(mm)
            free = free.concat(fm)
        }
        const totalMovesNumber = mandatory.length + free.length
        return {
            moves: mmr.getMovesFromTotalMoves({mandatory, free}),
            totalMovesNumber,
            pieceOrder,
            deepValue: {
                depth: 0,
                value: this.getPositionValue(totalMovesNumber, totalParentMoves, parentBranchColor),
                move: ''
            },
            position: towers
        }
    }

    towersValue = (tP: number, bP: number, king = false) => {
        const bottomValue = !king ? bP * .7 / tP : bP * .2 / tP
        const topValue = tP * tP / 4
        return topValue - bottomValue
    }

    handleTower = (tower: TowerConstructor) => {
        const {currentColor, currentType, wPiecesQuantity = 0, bPiecesQuantity = 0} = tower
        const lineValue = tower.currentColor === PieceColor.w
            ? parseInt(tower.onBoardPosition.slice(1))
            : 9 - parseInt(tower.onBoardPosition.slice(1))
        const towerPositionValue = (lineValue * .5 + 8) / 8
        const king = currentType === TowerType.k
        this.piecesData[currentColor].pieceNumber += (currentColor === PieceColor.w
            ? this.towersValue(wPiecesQuantity, bPiecesQuantity, king) * (king ? 1 : towerPositionValue)
            : this.towersValue(bPiecesQuantity, wPiecesQuantity, king)) * (king ? 1 : towerPositionValue)
        if (king) {
            this.piecesData[currentColor].pieceNumber += 1
        }
    }

    handlePieces = (tower: ICheckerTower) => {
        const lineValue = tower.currentColor === PieceColor.w
            ? parseInt(tower.onBoardPosition.slice(1))
            : 9 - parseInt(tower.onBoardPosition.slice(1))
        const piecePositionValue = (8 + lineValue * .3) / 8
        const {currentType, currentColor} = tower
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
        if (mmr.GV === 'towers' && tower.wPiecesQuantity + tower.bPiecesQuantity > 1) {
            this.handleTower(tower)
        } else {
            this.handlePieces(tower)
        }
    }

    advantageInNumberOfMoves = (wM: number, bM: number) => {
        return 1 / (bM + .1) - 1 / (wM + .1)
    }

    advantageInTowers = (whitePieceNumber: number, blackPieceNumber: number) => {
        return whitePieceNumber - blackPieceNumber
    }

    advantageInKings = (whiteKingNumber: number, blackKingNumber: number) => {
        return (whiteKingNumber - blackKingNumber) * 1.7
    }

    getPositionValue(totalMovesNumber: number, TPMNumber: number, color: PieceColor): Value {
        const {white, black} = this.piecesData
        const [whiteMovesNumber, blackMovesNumber] = color !== PieceColor.w
            ? [totalMovesNumber, TPMNumber]
            : [TPMNumber, totalMovesNumber]
        const advInMoves = this.advantageInNumberOfMoves(whiteMovesNumber, blackMovesNumber)
        const advInKings = this.advantageInKings(white.kingNumber, black.kingNumber)
        const advInTowers = this.advantageInTowers(white.pieceNumber, black.pieceNumber)
        const value = parseFloat((advInKings + advInMoves + advInTowers).toFixed(3)) || .001
        return {white: value, black: -value}
    }
}

export default new Evaluator()
