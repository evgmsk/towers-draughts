// import {describe, expect, test} from '@jest/globals';
import {
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerType,
} from '../store/models'
import mmr from './moves-resolver'
// import { getMiddlePieceKey, getMoveDirection, takeTower } from './common-fn-mandatory-moves-resolver'
import { createBoardWithoutTowers } from './prestart-help-function'

describe('test move resolver methods', () => {
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
        const moves = mmr.lookForManMoves('b2', towers)
        expect(moves.mandatory?.length).toBe(3)
        // console.log(moves.mandatory?.map(m => m.move.join(':')))
    })
    test('king check diagonal', () => {
        const board = createBoardWithoutTowers(8)
        const towers = {} as TowersMap
        towers['b8'] = new TowerConstructor({
            onBoardPosition: 'b8',
            currentColor: PieceColor.white,
            currentType: TowerType.k,
        })
        towers['e5'] = new TowerConstructor({
            onBoardPosition: 'e5',
            currentColor: PieceColor.black,
            currentType: TowerType.m,
            bPiecesQuantity: 2,
        })
        const dir = 'rightDown'
        const diag = mmr.getDiagonal(dir, 'b8')
        const moves = mmr.checkFirstKingDiagonal(dir, diag, towers)
        const moves2 = mmr.lookForTotalMoves(towers, PieceColor.white)
        console.warn(moves.mandatory, moves2.mandatory)
        // expect(moves.mandatory?.length).toBe(3)
        // expect(moves2.mandatory?.length).toBe(3)
    })
    // test('man move resolve', () => {
    //     const t = {
    //         // f8: {
    //         //     onBoardPosition: 'f8',
    //         //     currentColor: 'black',
    //         //     wPiecesQuantity: 0,
    //         //     bPiecesQuantity: 1,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         // h8: {
    //         //     onBoardPosition: 'h8',
    //         //     currentColor: 'black',
    //         //     wPiecesQuantity: 0,
    //         //     bPiecesQuantity: 1,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         // e1: {
    //         //     onBoardPosition: 'e1',
    //         //     currentColor: 'white',
    //         //     wPiecesQuantity: 1,
    //         //     bPiecesQuantity: 0,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         // g1: {
    //         //     onBoardPosition: 'g1',
    //         //     currentColor: 'white',
    //         //     wPiecesQuantity: 1,
    //         //     bPiecesQuantity: 0,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         // h2: {
    //         //     onBoardPosition: 'h2',
    //         //     currentColor: 'white',
    //         //     wPiecesQuantity: 1,
    //         //     bPiecesQuantity: 0,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         e3: {
    //             onBoardPosition: 'e3',
    //             currentColor: 'black',
    //             wPiecesQuantity: 0,
    //             bPiecesQuantity: 4,
    //             positionInDOM: {
    //                 x: 0,
    //                 y: 0,
    //             },
    //             currentType: 'man',
    //             view: 'face',
    //             mandatory: false,
    //         },
    //         // g3: {
    //         //     onBoardPosition: 'g3',
    //         //     currentColor: 'white',
    //         //     wPiecesQuantity: 2,
    //         //     bPiecesQuantity: 0,
    //         //     positionInDOM: {
    //         //         x: 561,
    //         //         y: 470,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         e5: {
    //             onBoardPosition: 'e5',
    //             currentColor: 'black',
    //             wPiecesQuantity: 0,
    //             bPiecesQuantity: 1,
    //             positionInDOM: {
    //                 x: 0,
    //                 y: 0,
    //             },
    //             currentType: 'man',
    //             view: 'face',
    //             mandatory: false,
    //         },
    //         // f4: {
    //         //     onBoardPosition: 'f4',
    //         //     currentColor: 'black',
    //         //     wPiecesQuantity: 2,
    //         //     bPiecesQuantity: 1,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         // a3: {
    //         //     onBoardPosition: 'a3',
    //         //     currentColor: 'white',
    //         //     wPiecesQuantity: 1,
    //         //     bPiecesQuantity: 0,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //         d4: {
    //             onBoardPosition: 'd4',
    //             currentColor: 'white',
    //             wPiecesQuantity: 1,
    //             bPiecesQuantity: 3,
    //             positionInDOM: {
    //                 x: 0,
    //                 y: 0,
    //             },
    //             currentType: 'man',
    //             view: 'face',
    //             mandatory: false,
    //         },
    //         // h4: {
    //         //     onBoardPosition: 'h4',
    //         //     currentColor: 'black',
    //         //     wPiecesQuantity: 3,
    //         //     bPiecesQuantity: 1,
    //         //     positionInDOM: {
    //         //         x: 0,
    //         //         y: 0,
    //         //     },
    //         //     currentType: 'man',
    //         //     view: 'face',
    //         //     mandatory: false,
    //         // },
    //     } as unknown as TowersMap
    //     const data = evaluator.getPositionData(t, PieceColor.black, 8)
    //     console.warn(data.moves)
    // })
    // test('man move resolve 2', () => {
    //     const towers = {} as TowersMap
    //     towers.e3 = new TowerConstructor({
    //         currentColor: PieceColor.black,
    //         onBoardPosition: 'e3',
    //         bPiecesQuantity: 1,
    //     })
    //     towers.e5 = new TowerConstructor({
    //         currentColor: PieceColor.black,
    //         onBoardPosition: 'e5',
    //         bPiecesQuantity: 1,
    //     })
    //     towers.d4 = new TowerConstructor({
    //         currentColor: PieceColor.white,
    //         onBoardPosition: 'd4',
    //         wPiecesQuantity: 3,
    //     })
    //     // const data = evaluator.getPositionData(towers, PieceColor.black, 8)
    //     const moves = mmr.lookForManMoves('d4', towers)
    //     console.warn(moves)
    // })
    test('king move resolve', () => {
        const towers = {
            // h8: {
            //     onBoardPosition: 'h8',
            //     currentColor: 'black',
            //     wPiecesQuantity: 0,
            //     bPiecesQuantity: 1,
            //     currentType: 'man',
            //     view: 'face',
            //     mandatory: false,
            // },
            // a1: {
            //     onBoardPosition: 'a1',
            //     currentColor: 'white',
            //     wPiecesQuantity: 1,
            //     bPiecesQuantity: 0,
            //     currentType: 'man',
            //     view: 'face',
            //     mandatory: false,
            // },
            // a3: {
            //     onBoardPosition: 'a3',
            //     currentColor: 'white',
            //     wPiecesQuantity: 1,
            //     bPiecesQuantity: 0,
            //     currentType: 'man',
            //     view: 'face',
            //     mandatory: false,
            // },
            // g1: {
            //     onBoardPosition: 'g1',
            //     currentColor: 'white',
            //     wPiecesQuantity: 1,
            //     bPiecesQuantity: 0,
            //     currentType: 'man',
            //     view: 'face',
            //     mandatory: false,
            // },
            // h2: {
            //     onBoardPosition: 'h2',
            //     currentColor: 'white',
            //     wPiecesQuantity: 1,
            //     bPiecesQuantity: 0,
            //     currentType: 'man',
            //     view: 'face',
            //     mandatory: false,
            // },
            // g5: {
            //     onBoardPosition: 'g5',
            //     currentColor: 'black',
            //     wPiecesQuantity: 0,
            //     bPiecesQuantity: 2,
            //     currentType: 'man',
            //     view: 'face',
            //     mandatory: false,
            // },
            // c1: {
            //     onBoardPosition: 'c1',
            //     currentColor: 'black',
            //     wPiecesQuantity: 1,
            //     bPiecesQuantity: 1,
            //     currentType: 'king',
            //     view: 'face',
            //     mandatory: false,
            // },
            d4: {
                onBoardPosition: 'd4',
                currentColor: 'black',
                wPiecesQuantity: 1,
                bPiecesQuantity: 2,
                currentType: 'man',
                view: 'face',
                mandatory: false,
            },
            c7: {
                onBoardPosition: 'c7',
                currentColor: 'black',
                wPiecesQuantity: 0,
                bPiecesQuantity: 1,
                currentType: 'man',
                view: 'face',
                mandatory: false,
            },
            // b6: {
            //     onBoardPosition: 'b6',
            //     currentColor: 'black',
            //     wPiecesQuantity: 4,
            //     bPiecesQuantity: 1,
            //     currentType: 'man',
            //     view: 'face',
            //     mandatory: false,
            // },
            b8: {
                onBoardPosition: 'b8',
                currentColor: 'white',
                wPiecesQuantity: 1,
                bPiecesQuantity: 3,
                currentType: 'king',
                view: 'face',
                mandatory: false,
            },
            f4: {
                onBoardPosition: 'f4',
                currentColor: 'black',
                wPiecesQuantity: 1,
                bPiecesQuantity: 1,
                currentType: 'man',
                view: 'face',
                mandatory: false,
            },
        } as unknown as TowersMap
        const moves = mmr.lookForKingMoves('b8', towers)
        console.warn(
            moves.mandatory?.map((m) => m.move.join(':')),
            moves.free?.map((m) => m.move.join('-'))
        )
        expect(moves.mandatory?.length).toBe(5)
    })
    it('king mandatory moves', () => {
        // mmr.setProps({ GV: 'towers', size: 8 })
        // const board = createBoardWithoutTowers(8)
        // const diag = mmr.getDiagonal('rightUp', 'b2')
        // console.warn(diag.length, diag)
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
        // towers.g3 = new TowerConstructor({
        //     currentColor: PieceColor.black,
        //     onBoardPosition: 'g3',
        // })
        // towers.e3 = new TowerConstructor({
        //     currentColor: PieceColor.black,
        //     onBoardPosition: 'e3',
        // })
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
    })
})
