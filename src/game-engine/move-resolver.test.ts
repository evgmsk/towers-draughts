// import {describe, expect, test} from '@jest/globals';
import {PieceColor, TowerConstructor, TowersMap, TowerType,} from '../store/models'
import mmr from './moves-resolver'
// import { getMiddlePieceKey, getMoveDirection, takeTower } from './common-fn-mandatory-moves-resolver'

describe('test move resolver methods', () => {
    test('man moves with king', () => {})

    it('man mandatory moves', () => {
        mmr.setProps({ GV: 'towers', size: 8 })
        const towers = {} as TowersMap
        towers.b2 = new TowerConstructor({
            currentColor: PieceColor.white,
            onBoardPosition: 'b2',
            currentType: TowerType.m,
        })
        towers.c3 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'c3',
        })
        towers.e5 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'e5',
        })
        towers.c5 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'c5',
        })
        // towers.g7 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'g7'})
        towers.g5 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'g5',
        })
        towers.e3 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'e3',
        })
        // const moves = mmr.lookForManMoves('b2', towers)
        // expect(moves.mandatory?.length).toBe(3)
        // console.log(moves.mandatory?.map((m) => m.move.join(':')))
    })
    test('king check small diagonal', () => {
        const towers = {} as TowersMap
        towers.b8 = new TowerConstructor({
            onBoardPosition: 'b8',
            currentColor: PieceColor.white,
            currentType: TowerType.k,
        })
        towers.e5 = new TowerConstructor({
            onBoardPosition: 'e5',
            currentColor: PieceColor.black,
            currentType: TowerType.m,
            bPiecesQuantity: 2,
        })
        const dir = 'rightDown'
        const diag = mmr.getDiagonal(dir, 'b8')
        const moves = mmr.checkFirstKingDiagonal(dir, diag, towers)
        const moves2 = mmr.lookForTotalMoves(towers, PieceColor.white)
        expect(moves.mandatory?.length).toBe(3)
        expect(moves2.mandatory?.length).toBe(3)
    })
    test('king check large diagonal', () => {
        const towers = {} as TowersMap
        towers.a1 = new TowerConstructor({
            onBoardPosition: 'a1',
            currentColor: PieceColor.white,
            currentType: TowerType.k,
        })
        towers.b2 = new TowerConstructor({
            onBoardPosition: 'b2',
            currentColor: PieceColor.black,
            currentType: TowerType.k,
            bPiecesQuantity: 2,
        })
        towers.c5 = new TowerConstructor({
            onBoardPosition: 'c5',
            currentColor: PieceColor.black,
            currentType: TowerType.m,
            bPiecesQuantity: 2,
        })
        towers.e5 = new TowerConstructor({
            onBoardPosition: 'e5',
            currentColor: PieceColor.black,
            currentType: TowerType.m,
            bPiecesQuantity: 2,
        })
        const dir = 'rightUp'
        const diag = mmr.getDiagonal(dir, 'a1')
        const moves = mmr.checkFirstKingDiagonal(dir, diag, towers)
        const moves2 = mmr.lookForTotalMoves(towers, PieceColor.white)
        expect(moves.mandatory?.length).toBe(8)
        expect(moves2.mandatory?.length).toBe(8)
    })
    it('king mandatory moves', () => {
        const towers = {} as TowersMap
        towers.b2 = new TowerConstructor({
            currentColor: PieceColor.white,
            onBoardPosition: 'b2',
            currentType: TowerType.k,
        })
        towers.c3 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'c3',
            bPiecesQuantity: 3,
        })
        // towers.e1 = new TowerConstructor({
        //     currentColor: PieceColor.white,
        //     onBoardPosition: 'e1',
        // })
        // towers.e5 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'e5'})
        towers.c5 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'c5',
        })
        towers.g7 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'g7',
        })
        towers.g5 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'g5',
        })
        towers.g3 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'g3',
        })
        towers.e3 = new TowerConstructor({
            currentColor: PieceColor.black,
            onBoardPosition: 'e3',
        })
        const moves = mmr.lookForKingMoves('b2', towers)
        // // const move = moves.totalMoves.mandatory![0]
        // // const _towers = mmr.makeDraughtMandatoryMove(moves.totalMoves.mandatory![2])
        console.log(
            moves.free?.map((m) => m.move.join('-')),
            moves.mandatory?.map(
                (m) =>
                    `${m.move.join(':')}/${m.minLength}/${
                        m.completed
                    }/${m.takenPieces.join('|')}`
            )
        )
        expect(moves.mandatory?.length).toBe(12)
        expect(moves.free?.length).toBe(3)
    })
})
