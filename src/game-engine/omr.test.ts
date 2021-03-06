

import { createEmptyBoard} from './prestart-help-function-constants'
import { newOnBoardTower} from './prestart-help-function-constants'
import { IBoardToGame, PieceColor, TowerType } from '../store/app-interface'
// import { checkDiagonalToMadatoryMove} from './king-mandatory-move-resolver'
// import { getMiddlePieceKey, getMoveDirection, takeTower } from './common-fn-mandatory-moves-resolver'
import { MandatoryMovesResolver } from './mandatory-move-resolver'
import { checkIfNumberOfKingsChanged } from './gameplay-helper-fuctions'

 
// test('copyObj', () => {
//     const o = {s: {w:9, i:8}}
//     const q = copyObj(o)
//     o.s.w = 11
//     expect(q.s.w).toBe(9)
// })

// test('copyMap', () => {
//     const o = new Map()
//     o.set('s', {w:9, i:8})
//     const q = copyMap(o)
//     o.get('s').w = 11
//     expect(q.get('s').w).toBe(9)
// })

// test('ordinary move', () => {
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
//     expect(checkDiagonalToMadatoryMove(diag)).toMatchObject(['a3:c5:e7', 'a3:c5:f8'])
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
//     const move = ['f4:d6']
//     // board['f4').tower = newOnBoardTower(PieceColor.w)
//     expect(possibleOutOfMandatory({mandatoryMoves: move, mandatoryMoveStep: 0, cellsMap}, move[0])).toMatchObject({"d6": {"x": 150, "y": 100}})
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

// test('check move', () => {
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
//     expect(lookForAllPossibleMoves(PieceColor.w, board3)).toMatchObject([]) 
// }) 

// test('check possible move looking', () => {
//     const board = createEmptyBoard(8)
//     board['f6'].tower = newOnBoardTower(PieceColor.w)
//     const king = newOnBoardTower(PieceColor.w)
//     king.currentType = TowerType.k
//     board['b4'].tower = king
//     // console.log(lookForAllPossibleMoves(PieceColor.b, board), board)
//     // board['e5').tower = newOnBoardTower({color: PieceColor.b})
//     // const expected = ["f4:d6"]
//     expect(lookForAllPossibleMoves(PieceColor.w, board)).toMatchObject(['f6-e7', 'f6-g7'])
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
//     expect(defineObligatedMoveNextStep({color: PieceColor.w, board, move: expected})).toMatchObject(expected)
// })

// test('check next obligated steps', () => {
//     const board = createEmptyBoard(8)
//     board['f4').tower = newOnBoardTower({color: PieceColor.w})
//     board['e5').tower = newOnBoardTower({color: PieceColor.b})
//     board['f2').tower = newOnBoardTower({color: PieceColor.w})
//     const expected = ["e5:g3:e1"]
//     expect(defineObligatedMoveNextSteps({color: PieceColor.b, board, move: expected})).toMatchObject(expected)
//     expect(defineObligatedMoveNextSteps({color: PieceColor.w, board, move: ['f4:d6']})).toMatchObject(['f4:d6'])
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


test('check obligated move', () => {
    const mmr = new MandatoryMovesResolver()
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
    // expect(mmr.lookForMandatoryMoves(PieceColor.b, board).map(r => r.move)).toMatchObject(expected)    
})

test('make obligated move', () => {
    const mmr = new MandatoryMovesResolver()
    mmr.setProps({GV: 'towers', size: 8})
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

