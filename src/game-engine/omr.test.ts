import {createBoardWithoutTowers, createEmptyBoard, newOnBoardTower} from './prestart-help-function-constants'
import {Directions, IBoardToGame, PieceColor, StepMProps, TowerConstructor, TowersMap, TowerType} from '../store/models'
import mmr from './engine-on-towers'

import mmr2 from './mandatory-move-resolver'
// import { getMiddlePieceKey, getMoveDirection, takeTower } from './common-fn-mandatory-moves-resolver'
import {checkIfNumberOfKingsChanged} from './gameplay-helper-functions'
import movesTree from "./tower-tree";
import {Board} from "../game-components/board/Board";
import {Branch} from "./engine-interfaces";


// test('movesMap', () => {
//     movesTree.addBranch('k', {} as IBranch)
//     const d = movesTree.getBranch('k')
//     console.error(d)
//     expect(d).toBe(d)
// })
test('moves tree get first depth data', () => {
    const branch = movesTree.createDefaultRootBranch()
    movesTree.getDepthData(branch, 2)
    // const ccc = branch.children[branch.deepValue.move!]
    console.warn(branch.deepValue,
        (branch).moves.map(m => ({move: m.move, deepVal: branch.children[m.move].deepValue}))
    )
        // , branch.moves.map(m => ({1: branch.children[m.move].deepValue, 2: branch.children[m.move].pieceOrder})),
        // ccc.moves.map(m => ({3: ccc.children[m.move].deepValue, 4: ccc.children[m.move].pieceOrder})))
    expect(branch.deepValue.depth).toBe(2)
})

// it('man mandatory moves', () => {
//     mmr.setProps({GV: 'towers', size: 8})
//     const towers = {} as TowersMap
//     towers.b2 = new TowerConstructor({currentColor: PieceColor.w, onBoardPosition: 'b2', currentType: TowerType.m})
//     towers.c3 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'c3'})
//     towers.e5 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'e5'})
//     towers.c5 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'c5'})
//     // towers.g7 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'g7'})
//     towers.g5 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'g5'})
//     towers.e3 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'e3'})
//     const moves = mmr.lookForManMoves('b2', towers)
//     console.log(moves.mandatory?.map(m => m.move.join(':')))
// })
// it('king mandatory moves', () => {
//     mmr.setProps({GV: 'towers', size: 8})
//     const board = createBoardWithoutTowers(8)
//     const diag = mmr.getDiagonal('rightUp', 'b2')
//     // console.warn(diag.length, diag)
//     const towers = {} as TowersMap
//     towers.b2 = new TowerConstructor({currentColor: PieceColor.w, onBoardPosition: 'b2', currentType: TowerType.k})
//     towers.c3 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'c3', bPiecesQuantity: 3})
//     towers.e1 = new TowerConstructor({currentColor: PieceColor.w, onBoardPosition: 'e1'})
//     // towers.e5 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'e5'})
//     towers.c5 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'c5'})
//     towers.g7 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'g7'})
//     towers.g5 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'g5'})
//     towers.g3 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'g3'})
//     towers.e3 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'e3'})
//     const moves = mmr.lookForKingMoves('b2', towers)
//     // const move = moves.totalMoves.mandatory![0]
//     // const _towers = mmr.makeDraughtMandatoryMove(moves.totalMoves.mandatory![2])
//     console.log(moves.free?.map(m => m.move.join('-')),
//         moves.mandatory?.map(m => `${m.move.join(':')}/${m.minLength}/${m.completed}/${m.takenPieces.join('|')}`))
// })
// test('king eval', () => {
//     const d: ICheckerTower = {currentColor: PieceColor.b, currentType: TowerType.k, bPiecesQuantity: 1, onBoardPosition: 'a1'}
//     evaluator.handlePieces(d)
//     console.error(evaluator)
//     expect(d).toBe(d)
// })

// test('test checking diagonal for mandatory moves', () => {
//     mmr.setProps({GV: 'towers', size: 8})
//     const board = createEmptyBoard(8)
//     board.a1.tower = newOnBoardTower(PieceColor.w, TowerType.k)
//     board.b2.tower = newOnBoardTower(PieceColor.b, TowerType.m)
//     board.e5.tower = newOnBoardTower(PieceColor.b, TowerType.m)
//     const diagonal = mmr.getDiagonal(mmr.getMoveDirection(['a1', 'c2']),'a1')
//     const towers = {} as TowersMap
//     towers.a1 = new TowerConstructor({
//         currentColor: PieceColor.w,
//         onBoardPosition: 'a1',
//         currentType: TowerType.k
//     })
//     towers.b2 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'b2'})
//     towers.f6 = new TowerConstructor({currentColor: PieceColor.b, onBoardPosition: 'f6'})
//     const firstMove = {move: 'a1', endPosition: towers, takenPieces: []}
//     const moves = mmr.checkKingMandatoryMoves(board.a1, towers)
//     const moves2 = mmr2.lookForMandatoryMoves(PieceColor.w, board)
//     console.log(moves, moves2)
// })

// test('best move1 engine', () => {
//     const board = createEmptyBoard(8)
//     board['a3'].tower = newOnBoardTower(PieceColor.w, TowerType.k)
//     board['c3'].tower = newOnBoardTower(PieceColor.w)
//     board['a5'].tower = newOnBoardTower(PieceColor.b)
//     const props = {
//         history: ['', ''],
//         cP: board,
//         pieceOrder: PieceColor.w,
//     }
//     // console.error(JSON.stringify(board))
//     const moves = bms.getAvailableMoves(board, PieceColor.w)
//     // console.log(moves.map(m => ({move: m.move, val: m.baseValue})), moves.length)
//     const bmc = (move: any) => {
//         expect(move.move).toBe('a3-b4')
//     }
//     bms.setBestMoveCB(bmc)
//     bms.updateAfterRivalMove(props)
// })
//
// test('best move2 engine', async () => {
//     movesTree.addRoot({} as IBranch)
//     const board = createEmptyBoard(8)
//     board['h8'].tower = newOnBoardTower(PieceColor.b, TowerType.k)
//     // board['g7'].tower = newOnBoardTower(PieceColor.w, TowerType.k)
//     // board['d8'].tower = newOnBoardTower(PieceColor.b)
//     // board['d6'].tower = newOnBoardTower(PieceColor.b)
//     board['g1'].tower = newOnBoardTower(PieceColor.w, TowerType.k)
//     const props = {
//         history: ['', ''],
//         cP: board,
//         pieceOrder: PieceColor.b,
//     }
//     // console.error(JSON.stringify(board))
//     const value = evaluator.evaluateCurrentPosition(board, props.pieceOrder)
//     const moves = bms.getAvailableMoves(board, PieceColor.w)
//     console.log(moves.map(m => ({move: m.move, val: m.baseValue})), moves.length, value)
//
//     // bms.updateAfterRivalMove(props)
//     // const res = await bms.updateAfterRivalMove(props)
//     // expect((res as any).move ).toBe('a3-b4')
//
// })
// test('ordinary rivalMove', () => {
//     const board = createEmptyBoard(8)
//     board['f2').tower = newOnBoardTower({color: PieceColor.w})
//     const expected = createEmptyBoard(8)
//     expected['g3').tower = newOnBoardTower({color: PieceColor.w})
//     expect(makeOrdinaryMove('f2-g3', board)).toMatchObject(expected)
// })

// test('take tower', () => {
//     const tower = newOnBoardTower(PieceColor.w)
//     const expected = null
//     expect(takeTower(tower)).toBe(expected)
// })

// test('getMiddlePieceKey', () => {
//     const board = createEmptyBoard(8)
//     board['a3'].tower = newOnBoardTower(PieceColor.w, TowerType.k)
//     board['b4'].tower = newOnBoardTower(PieceColor.b)
//     board['d6'].tower = newOnBoardTower(PieceColor.b)
    
//     expect(getMiddlePieceKey('a3', 'e7', board)).toBe('b4')
// })

// test('king check diagonal', () => {
//     const board = createEmptyBoard(8)
//     board['a3'].tower = newOnBoardTower(PieceColor.w, TowerType.k)
//     board['b4'].tower = newOnBoardTower(PieceColor.b)
//     board['d6'].tower = newOnBoardTower(PieceColor.b)
//     board['d6'].tower.bPiecesQuantity = 2
//     board['b6'].tower = newOnBoardTower(PieceColor.b)
//     board['g7'].tower = newOnBoardTower(PieceColor.b)
//     board['g5'].tower = newOnBoardTower(PieceColor.b)
//     const dir = getMoveDirection('a3:c5')
//     const diag = getDiagonal(dir, 'a3', board)
//     expect(checkDiagonalToMandatoryMove(diag)).toMatchObject(['a3:c5:e7', 'a3:c5:f8'])
//     expect(Object.keys(getDiagonals('c5', board, getMoveDirection('a3:c5'))).length).toBe(2)
//     const direction = getMoveDirection('a3:c5')
//     expect(direction).toBe('rightUp')
//     expect(crossDirections(direction)).toMatchObject({'rightDown': true, leftUp: true})
//     expect(Object.keys(getDiagonals('c5', board, direction))).toMatchObject(Object.keys(crossDirections(direction)).reverse())
//     // expect(getDiagonals('a3', board)).toMatchObject({rightUp:['a3:c5:e7']})
//     // expect((PieceColor.w, board)).toMatchObject(['a3:c5:e7', 'a3:c5:f8'])
//     // expect((PieceColor.w, board, 'towers')).toMatchObject(['a3:c5:f8:h6:f4:c7:a5'])
// })

// test('possible from obligated', () => {
//     const cellsMap = createCellsMap(8)
//     const board = createEmptyBoard(8)
//     board['f4'].tower = newOnBoardTower(PieceColor.w)
//     board['e5'].tower = newOnBoardTower(PieceColor.b)
//     const rivalMove = ['f4:d6']
//     // board['f4').tower = newOnBoardTower(PieceColor.w)
//     expect(possibleOutOfMandatory({mandatoryMoves: rivalMove, mandatoryMoveStep: 0, cellsMap}, rivalMove[0])).toMatchObject({"d6": {"x": 150, "y": 100}})
// })

// test('take tower', () => {
//    const tower: PartialTower = {
//        wPiecesQuantity: 1,
//        bPiecesQuantity: 3,
//        currentColor: PieceColor.w,
//        currentType: TowerType.o,
//        onBoardPosition: 'e3'
//    }
//     const updated: PartialTower = {...tower, wPiecesQuantity: 0, bPiecesQuantity: 3, currentColor: PieceColor.b}
//     // console.log(takeTower(tower, true))
//     expect(takeTower(tower, true)).toMatchObject(updated)
// })

// test('check rivalMove', () => {
//     const board = createEmptyBoard(8)
//     board['f4'].tower = newOnBoardTower(PieceColor.w)
//     board['e5'].tower = newOnBoardTower(PieceColor.b)
//     board['e7'].tower = newOnBoardTower(PieceColor.b)
//     board['g7'].tower = newOnBoardTower(PieceColor.b)
   
//     const resBoard = createEmptyBoard(8)
    
//     // resBoard['d6'].tower = newOnBoardTower(PieceColor.w)
//     // resBoard['d6'].tower.bPiecesQuantity = 1
    
//     // expect(checkMandatoryMoveNextStep({moves: ['f4:d6'], board: resBoard})).toMatchObject([])
//     resBoard['h6'].tower = newOnBoardTower(PieceColor.w, TowerType.k)
//     resBoard['h6'].tower.bPiecesQuantity = 3
//     expect(lookForMandatoryMoves(PieceColor.w, board, 'towers')).toMatchObject(['f4:d6:f8:h6'])
//     expect(checkMove(PieceColor.w, board, 'f4:d6:f8:h6', 'towers')).toMatchObject(resBoard) 
//     // console.log(checkMove(PieceColor.w, board, 'f4:d6:f8:h6', 'towers'))
//     const board2 = createEmptyBoard(8)
//     const res2 = createEmptyBoard(8)
//     res2['e3'].tower = newOnBoardTower( PieceColor.w)
//     board2['f2'].tower = newOnBoardTower( PieceColor.w)
//     expect(checkMove(PieceColor.w, board2, 'f2-e3', 'towers')).toMatchObject({board: res2, availibleMoves: 2}) 
//     const board3 = createStartBoard(8)
//     expect(lookForAllFreeMoves(PieceColor.w, board3)).toMatchObject([])
// }) 

// test('check possible rivalMove looking', () => {
//     const board = createEmptyBoard(8)
//     board['f6'].tower = newOnBoardTower(PieceColor.w)
//     const king = newOnBoardTower(PieceColor.w)
//     king.currentType = TowerType.k
//     board['b4'].tower = king
//     // console.log(lookForAllFreeMoves(PieceColor.b, board), board)
//     // board['e5').tower = newOnBoardTower({color: PieceColor.b})
//     // const expected = ["f4:d6"]
//     expect(lookForAllFreeMoves(PieceColor.w, board)).toMatchObject(['f6-e7', 'f6-g7'])
// })

// test('check new tower creation', () => {
//     const tower: ICheckerTower = {
//         wPiecesQuantity: 3,
//         bPiecesQuantity: 2,
//         onBoardPosition: 'a1',
//         currentColor: PieceColor.w,
//         currentType: TowerType.k
//     }
//     expect(new TowerConstructor(tower).wPiecesQuantity).toBe(3)
//     expect(new TowerConstructor(tower).bPiecesQuantity).toBe(2)
//     expect(new TowerConstructor(tower).currentType).toBe(TowerType.k)
// })

// test('check next obligated step', () => {
//     const board = createStartBoard(8)
//     board['f4').tower = newOnBoardTower({color: PieceColor.w})
//     board['e3').tower = null
//     board['e5').tower = newOnBoardTower({color: PieceColor.b})
//     board['d6').tower = null
//     // console.log(board)
//     const expected = ["f4:d6"]
//     expect(defineObligatedMoveNextStep({color: PieceColor.w, board, rivalMove: expected})).toMatchObject(expected)
// })

// test('check next obligated steps', () => {
//     const board = createEmptyBoard(8)
//     board['f4').tower = newOnBoardTower({color: PieceColor.w})
//     board['e5').tower = newOnBoardTower({color: PieceColor.b})
//     board['f2').tower = newOnBoardTower({color: PieceColor.w})
//     const expected = ["e5:g3:e1"]
//     expect(defineObligatedMoveNextSteps({color: PieceColor.b, board, rivalMove: expected})).toMatchObject(expected)
//     expect(defineObligatedMoveNextSteps({color: PieceColor.w, board, rivalMove: ['f4:d6']})).toMatchObject(['f4:d6'])
//     // const _board = createStartBoard(8)
    
// })
test('check kings num changed', () => {
    // const mmr = new MandatoryMovesResolver()
    // mmr.setProps({GV: 'towers', size: 8})
    const board1 = createEmptyBoard(8)
    const board2 = createEmptyBoard(8)
    // const board3 = createEmptyBoard(8)
    // board['c7'].tower = newOnBoardTower(PieceColor.b)
    board1['b6'].tower = newOnBoardTower(PieceColor.w)
    board1['b6'].tower.currentType = TowerType.k
    board2['d6'].tower = newOnBoardTower(PieceColor.w)
    // board2['d6'].tower.currentType = TowerType.k
    // board['f4'].tower = newOnBoardTower(PieceColor.w)
    // board['b4'].tower = newOnBoardTower(PieceColor.b)
    // board['d4'].tower.bPiecesQuantity = 1
    // board['d6'].tower = newOnBoardTower(PieceColor.w)
    // board['b6'].tower = newOnBoardTower(PieceColor.w)
    // board['f2'].tower = newOnBoardTower(PieceColor.w)
    // const expected = ["b6:d8:f6"]
    expect(checkIfNumberOfKingsChanged(board1, board2)).toBeTruthy()
    // expect(checkIfNumberOfKingsChanged(board1, board3)).toBeTruthy()
})


test('check obligated rivalMove', () => {
    mmr.setProps({GV: 'towers', size: 8})
    const board = createEmptyBoard(8)
    board['c7'].tower = newOnBoardTower(PieceColor.b)
    board['d6'].tower = newOnBoardTower(PieceColor.w)
    // board['e5'].tower = newOnBoardTower(PieceColor.w)
    board['f4'].tower = newOnBoardTower(PieceColor.w)
    board['f2'].tower = newOnBoardTower(PieceColor.w)
    board['d4'].tower = newOnBoardTower(PieceColor.w)
    // board['b4'].tower = newOnBoardTower(PieceColor.b)
    // board['d4'].tower.bPiecesQuantity = 1
    // board['d6'].tower = newOnBoardTower(PieceColor.w)
    // board['b6'].tower = newOnBoardTower(PieceColor.w)
    // board['f2'].tower = newOnBoardTower(PieceColor.w)
    const expected = ["b6:d8:f6"]
    // expect(mmr.lookForMandatoryMoves(PieceColor.b, board).map(r => r.rivalMove)).toMatchObject(expected)
})

test('make obligated rivalMove', () => {

    mmr2.setProps({GV: 'towers', size: 8})
    // const board = createEmptyBoard(8)
    const bs = {
        "a1": {
            "boardKey": "a1",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 1,
                "bPiecesQuantity": 0
            },
            "neighbors": {
                "rightUp": "b2"
            }
        },
        "a3": {
            "boardKey": "a3",
            "tower": null,
            "neighbors": {
                "rightUp": "b4",
                "rightDown": "b2"
            }
        },
        "a5": {
            "boardKey": "a5",
            "tower": null,
            "neighbors": {
                "rightUp": "b6",
                "rightDown": "b4"
            }
        },
        "a7": {
            "boardKey": "a7",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 0,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "rightUp": "b8",
                "rightDown": "b6"
            }
        },
        "b2": {
            "boardKey": "b2",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 1,
                "bPiecesQuantity": 0
            },
            "neighbors": {
                "leftUp": "a3",
                "leftDown": "a1",
                "rightUp": "c3",
                "rightDown": "c1"
            }
        },
        "b4": {
            "boardKey": "b4",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 1,
                "bPiecesQuantity": 0
            },
            "neighbors": {
                "leftUp": "a5",
                "leftDown": "a3",
                "rightUp": "c5",
                "rightDown": "c3"
            }
        },
        "b6": {
            "boardKey": "b6",
            "tower": null,
            "neighbors": {
                "leftUp": "a7",
                "leftDown": "a5",
                "rightUp": "c7",
                "rightDown": "c5"
            }
        },
        "b8": {
            "boardKey": "b8",
            "tower": null,
            "neighbors": {
                "leftDown": "a7",
                "rightDown": "c7"
            }
        },
        "c1": {
            "boardKey": "c1",
            "tower": null,
            "neighbors": {
                "leftUp": "b2",
                "rightUp": "d2"
            }
        },
        "c3": {
            "boardKey": "c3",
            "tower": null,
            "neighbors": {
                "leftUp": "b4",
                "leftDown": "b2",
                "rightUp": "d4",
                "rightDown": "d2"
            }
        },
        "c5": {
            "boardKey": "c5",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 0,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "leftUp": "b6",
                "leftDown": "b4",
                "rightUp": "d6",
                "rightDown": "d4"
            }
        },
        "c7": {
            "boardKey": "c7",
            "tower": null,
            "neighbors": {
                "leftUp": "b8",
                "leftDown": "b6",
                "rightUp": "d8",
                "rightDown": "d6"
            }
        },
        "d2": {
            "boardKey": "d2",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 1,
                "bPiecesQuantity": 0
            },
            "neighbors": {
                "leftUp": "c3",
                "leftDown": "c1",
                "rightUp": "e3",
                "rightDown": "e1"
            }
        },
        "d4": {
            "boardKey": "d4",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 2,
                "bPiecesQuantity": 0
            },
            "neighbors": {
                "leftUp": "c5",
                "leftDown": "c3",
                "rightUp": "e5",
                "rightDown": "e3"
            }
        },
        "d6": {
            "boardKey": "d6",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 1,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "leftUp": "c7",
                "leftDown": "c5",
                "rightUp": "e7",
                "rightDown": "e5"
            }
        },
        "d8": {
            "boardKey": "d8",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 0,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "leftDown": "c7",
                "rightDown": "e7"
            }
        },
        "e1": {
            "boardKey": "e1",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 1,
                "bPiecesQuantity": 0
            },
            "neighbors": {
                "leftUp": "d2",
                "rightUp": "f2"
            }
        },
        "e3": {
            "boardKey": "e3",
            "tower": null,
            "neighbors": {
                "leftUp": "d4",
                "leftDown": "d2",
                "rightUp": "f4",
                "rightDown": "f2"
            }
        },
        "e5": {
            "boardKey": "e5",
            "tower": null,
            "neighbors": {
                "leftUp": "d6",
                "leftDown": "d4",
                "rightUp": "f6",
                "rightDown": "f4"
            }
        },
        "e7": {
            "boardKey": "e7",
            "tower": null,
            "neighbors": {
                "leftUp": "d8",
                "leftDown": "d6",
                "rightUp": "f8",
                "rightDown": "f6"
            }
        },
        "f2": {
            "boardKey": "f2",
            "tower": null,
            "neighbors": {
                "leftUp": "e3",
                "leftDown": "e1",
                "rightUp": "g3",
                "rightDown": "g1"
            }
        },
        "f4": {
            "boardKey": "f4",
            "tower": null,
            "neighbors": {
                "leftUp": "e5",
                "leftDown": "e3",
                "rightUp": "g5",
                "rightDown": "g3"
            }
        },
        "f6": {
            "boardKey": "f6",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 0,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "leftUp": "e7",
                "leftDown": "e5",
                "rightUp": "g7",
                "rightDown": "g5"
            }
        },
        "f8": {
            "boardKey": "f8",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 0,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "leftDown": "e7",
                "rightDown": "g7"
            }
        },
        "g1": {
            "boardKey": "g1",
            "tower": {
                "currentColor": "white",
                "currentType": "ordinary",
                "wPiecesQuantity": 1,
                "bPiecesQuantity": 0
            },
            "neighbors": {
                "leftUp": "f2",
                "rightUp": "h2"
            }
        },
        "g3": {
            "boardKey": "g3",
            "tower": null,
            "neighbors": {
                "leftUp": "f4",
                "leftDown": "f2",
                "rightUp": "h4",
                "rightDown": "h2"
            }
        },
        "g5": {
            "boardKey": "g5",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 0,
                "bPiecesQuantity": 3
            },
            "neighbors": {
                "leftUp": "f6",
                "leftDown": "f4",
                "rightUp": "h6",
                "rightDown": "h4"
            }
        },
        "g7": {
            "boardKey": "g7",
            "tower": null,
            "neighbors": {
                "leftUp": "f8",
                "leftDown": "f6",
                "rightUp": "h8",
                "rightDown": "h6"
            }
        },
        "h2": {
            "boardKey": "h2",
            "tower": null,
            "neighbors": {
                "leftUp": "g3",
                "leftDown": "g1"
            }
        },
        "h4": {
            "boardKey": "h4",
            "tower": null,
            "neighbors": {
                "leftUp": "g5",
                "leftDown": "g3"
            }
        },
        "h6": {
            "boardKey": "h6",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 3,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "leftUp": "g7",
                "leftDown": "g5"
            }
        },
        "h8": {
            "boardKey": "h8",
            "tower": {
                "currentColor": "black",
                "currentType": "ordinary",
                "wPiecesQuantity": 0,
                "bPiecesQuantity": 1
            },
            "neighbors": {
                "leftDown": "g7"
            }
        }
    }
    const board = bs as IBoardToGame
    // board['a5'].tower = newOnBoardTower(PieceColor.w, TowerType.k)
    // board['c7'].tower = newOnBoardTower(PieceColor.b)
    // board['e7'].tower = newOnBoardTower(PieceColor.b)
    // board['a7'].tower = newOnBoardTower(PieceColor.b)
    // board['e5'].tower = newOnBoardTower(PieceColor.b)
    // // board['c5'].tower = newOnBoardTower(PieceColor.b)
    // const expected = ["b6:d8:f6"]
    // expect(mmr.lookForMandatoryMoves(PieceColor.b, board)).toMatchObject(expected)    
}) 

