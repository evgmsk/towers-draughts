// import {describe, expect, test} from '@jest/globals';
import {createBoardWithoutTowers, createCellsMap} from './prestart-help-function'
import {PieceColor, TowerConstructor, TowersMap, TowerType} from '../store/models'
import mmr from './moves-resolver'
import evaluator from './towers-evaluator'
// import { getMiddlePieceKey, getMoveDirection, takeTower } from './common-fn-mandatory-moves-resolver'
import {PositionsTree} from "./tower-tree";


// test('custom position', () => {
//     const movesTree = new PositionsTree()
//     const towers = {} as TowersMap
//     towers.a5 = new TowerConstructor({onBoardPosition: 'a5', currentColor: PieceColor.black, bPiecesQuantity: 5, currentType: TowerType.m})
//     towers.b4 = new TowerConstructor({onBoardPosition: 'b4', currentColor: PieceColor.white, wPiecesQuantity: 4, currentType: TowerType.m})
//     // towers.c7 = new TowerConstructor({onBoardPosition: 'c7', currentColor: PieceColor.black, bPiecesQuantity: 3, currentType: TowerType.m})
//     towers.a1 = new TowerConstructor({onBoardPosition: 'a1', currentColor: PieceColor.white, currentType: TowerType.k})
//     // towers.c7 = new TowerConstructor({onBoardPosition: 'c7', currentColor: PieceColor.black, bPiecesQuantity: 3, currentType: TowerType.m})
//     // towers.c7 = new TowerConstructor({onBoardPosition: 'c7', currentColor: PieceColor.black, bPiecesQuantity: 3, currentType: TowerType.m})
//     const branch = movesTree.createBranchWithTowers(towers, PieceColor.black)
//     const posData = evaluator.getPositionData(towers, PieceColor.white, 2)
//     const moves = mmr.getMovesFromTotalMoves(mmr.getPositionMoves(towers, PieceColor.black))
//     // movesTree.createDefaultRootBranch()
//     // movesTree.addRoot(branch)
//     const root = movesTree.getRoot()
//     // movesTree.getNextDepthData(root)
//     // const child = root.children['d6-e5']
//     // const problemPos = child.moves.filter(m => m.move === 'e1-f2')[0]
//     // const nextM = mmr.lookForTotalMoves(problemPos.position, oppositeColor(child.pieceOrder))
//     movesTree.getDepthData(root, 5)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // movesTree.getNextDepthData(root)
//     // const childrenKeys = Object.keys(movesTree.getDepthData(root).children)
//     console.warn( branch.deepValue, movesTree.determineBestMovesLine())
// })
describe("test towers-tree methods", () => {
    test('test getDepthData return valid deepValue depth', () => {
        const movesTree = new PositionsTree()
        const branch = movesTree.createDefaultRootBranch()
        movesTree.getDepthData(branch, 2)
        // const ccc = branch.children[branch.deepValue.move!]
        // console.warn(branch.deepValue,
        //     (branch).moves.map(m => ({move: m.move, deepVal: branch.children[m.move].deepValue}))
        // )
        // , branch.moves.map(m => ({1: branch.children[m.move].deepValue, 2: branch.children[m.move].pieceOrder})),
        // ccc.moves.map(m => ({3: ccc.children[m.move].deepValue, 4: ccc.children[m.move].pieceOrder})))
        expect(branch.deepValue.depth).toBe(2)
    })
})


// test('digging custom position', () => {
//     const position = {} as TowersMap
//     const movesTree = new PositionsTree()
//     // position['f6'] = new TowerConstructor({onBoardPosition: 'f6', currentColor: PieceColor.white, currentType: TowerType.k})
//     // position['f2'] = new TowerConstructor({onBoardPosition: 'f2', currentColor: PieceColor.black, currentType: TowerType.k})
//     // position['d2'] = new TowerConstructor({onBoardPosition: 'd2', currentColor: PieceColor.white, currentType: TowerType.m})
//     position['f4'] = new TowerConstructor({wPiecesQuantity: 4, onBoardPosition: 'f4', currentColor: PieceColor.white, currentType: TowerType.k})
//     position['f2'] = new TowerConstructor({onBoardPosition: 'f2', currentColor: PieceColor.white, currentType: TowerType.k})
//     position['e5'] = new TowerConstructor({onBoardPosition: 'e5', currentColor: PieceColor.black, currentType: TowerType.k})
//     const branch = movesTree.createBranchWithTowers(position, PieceColor.black)
//     const moves = mmr.getMovesFromTotalMoves(mmr.lookForTotalMoves(position, PieceColor.black))
//     const posData = evaluator.getPositionData(position, PieceColor.white, 2)
//     // movesTree.addRoot(branch)
//     // const branch: Branch = {
//     //     // moves,
//     //     position,
//     //     rivalMove: '',
//     //     children: {},
//     //     totalMovesNumber: moves.length,
//     //     deepValue: {value: {black: 0,  white: 0}, move: '', depth: 0},
//     //     pieceOrder: PieceColor.black
//     // }
//     // movesTree.addRoot(branch)
//     // movesTree.getFirstDepthData(branch)
//     // movesTree.getNextDepthData(branch)
//     // movesTree.getNextDepthData(branch)
//     // const nB = movesTree.getDepthData(branch, 3)
//     // const ccc = branch.children[branch.deepValue.move!]
//     // const mov = mmr.lookForKingMoves('a3', position).mandatory
//     // console.warn(branch.moves,branch.moves[0].position, moves.map(m => m.move))
//     // console.warn(branch.deepValue, branch.pieceOrder,
//     //     (branch).moves.map(m => ({move: m.move, deepVal: JSON.stringify(branch.children[m.move].deepValue)}))
//     // )
//     // , branch.moves.map(m => ({1: branch.children[m.move].deepValue, 2: branch.children[m.move].pieceOrder})),
//     // ccc.moves.map(m => ({3: ccc.children[m.move].deepValue, 4: ccc.children[m.move].pieceOrder})))
//     // expect(branch.deepValue.depth).toBe(2)
// })

// it('man mandatory moves', () => {
//     mmr.setProps({GV: 'towers', size: 8})
//     const towers = {} as TowersMap
//     towers.b2 = new TowerConstructor({currentColor: PieceColor.white, onBoardPosition: 'b2', currentType: TowerType.m})
//     towers.c3 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'c3'})
//     towers.e5 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'e5'})
//     towers.c5 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'c5'})
//     // towers.g7 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'g7'})
//     towers.g5 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'g5'})
//     towers.e3 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'e3'})
//     const moves = mmr.lookForManMoves('b2', towers)
//     console.log(moves.mandatory?.map(m => m.move.join(':')))
// })
// it('king mandatory moves', () => {
//     mmr.setProps({GV: 'towers', size: 8})
//     const board = createBoardWithoutTowers(8)
//     const diag = mmr.getDiagonal('rightUp', 'b2')
//     // console.warn(diag.length, diag)
//     const towers = {} as TowersMap
//     towers.b2 = new TowerConstructor({currentColor: PieceColor.white, onBoardPosition: 'b2', currentType: TowerType.k})
//     towers.c3 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'c3', bPiecesQuantity: 3})
//     towers.e1 = new TowerConstructor({currentColor: PieceColor.white, onBoardPosition: 'e1'})
//     // towers.e5 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'e5'})
//     towers.c5 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'c5'})
//     towers.g7 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'g7'})
//     // towers.g5 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'g5'})
//     towers.g3 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'g3'})
//     towers.e3 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'e3'})
//     const moves = mmr.lookForKingMoves('b2', towers)
//     // const move = moves.totalMoves.mandatory![0]
//     // const _towers = mmr.makeDraughtMandatoryMove(moves.totalMoves.mandatory![2])
//     console.log(moves.free?.map(m => m.move.join('-')),
//         moves.mandatory?.map(m => `${m.move.join(':')}/${m.minLength}/${m.completed}/${m.takenPieces.join('|')}`))
// })
// test('check create board', () => {
//     const board  = createBoardWithoutTowers()
//     // console.warn([1,2,3,4].at(-1))
//     // console.log('board ', board)
// })
//
// test('check create cells', () => {
//     const cells = createCellsMap(8)
//     // console.warn(cells)
// })

// test('test checking diagonal for mandatory moves', () => {
//     mmr.setProps({GV: 'towers', size: 8})
//     const board = createEmptyBoard(8)
//     board.a1.tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     board.b2.tower = newOnBoardTower(PieceColor.black, TowerType.m)
//     board.e5.tower = newOnBoardTower(PieceColor.black, TowerType.m)
//     const diagonal = mmr.getDiagonal(mmr.getMoveDirection(['a1', 'c2']),'a1')
//     const towers = {} as TowersMap
//     towers.a1 = new TowerConstructor({
//         currentColor: PieceColor.white,
//         onBoardPosition: 'a1',
//         currentType: TowerType.k
//     })
//     towers.b2 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'b2'})
//     towers.f6 = new TowerConstructor({currentColor: PieceColor.black, onBoardPosition: 'f6'})
//     const firstMove = {move: 'a1', endPosition: towers, takenPieces: []}
//     const moves = mmr.checkKingMandatoryMoves(board.a1, towers)
//     const moves2 = mmr2.lookForMandatoryMoves(PieceColor.white, board)
//     console.log(moves, moves2)
// })

// test('best move1 engine', () => {
//     const board = createEmptyBoard(8)
//     board['a3'].tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     board['c3'].tower = newOnBoardTower(PieceColor.white)
//     board['a5'].tower = newOnBoardTower(PieceColor.black)
//     const props = {
//         history: ['', ''],
//         cP: board,
//         pieceOrder: PieceColor.white,
//     }
//     // console.error(JSON.stringify(board))
//     const moves = bms.getAvailableMoves(board, PieceColor.white)
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
//     board['h8'].tower = newOnBoardTower(PieceColor.black, TowerType.k)
//     // board['g7'].tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     // board['d8'].tower = newOnBoardTower(PieceColor.black)
//     // board['d6'].tower = newOnBoardTower(PieceColor.black)
//     board['g1'].tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     const props = {
//         history: ['', ''],
//         cP: board,
//         pieceOrder: PieceColor.black,
//     }
//     // console.error(JSON.stringify(board))
//     const value = evaluator.evaluateCurrentPosition(board, props.pieceOrder)
//     const moves = bms.getAvailableMoves(board, PieceColor.white)
//     console.log(moves.map(m => ({move: m.move, val: m.baseValue})), moves.length, value)
//
//     // bms.updateAfterRivalMove(props)
//     // const res = await bms.updateAfterRivalMove(props)
//     // expect((res as any).move ).toBe('a3-b4')
//
// })
// test('ordinary rivalMove', () => {
//     const board = createEmptyBoard(8)
//     board['f2').tower = newOnBoardTower({color: PieceColor.white})
//     const expected = createEmptyBoard(8)
//     expected['g3').tower = newOnBoardTower({color: PieceColor.white})
//     expect(makeOrdinaryMove('f2-g3', board)).toMatchObject(expected)
// })

// test('take tower', () => {
//     const tower = newOnBoardTower(PieceColor.white)
//     const expected = null
//     expect(takeTower(tower)).toBe(expected)
// })

// test('getMiddlePieceKey', () => {
//     const board = createEmptyBoard(8)
//     board['a3'].tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     board['b4'].tower = newOnBoardTower(PieceColor.black)
//     board['d6'].tower = newOnBoardTower(PieceColor.black)

//     expect(getMiddlePieceKey('a3', 'e7', board)).toBe('b4')
// })

// test('king check diagonal', () => {
//     const board = createEmptyBoard(8)
//     board['a3'].tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     board['b4'].tower = newOnBoardTower(PieceColor.black)
//     board['d6'].tower = newOnBoardTower(PieceColor.black)
//     board['d6'].tower.bPiecesQuantity = 2
//     board['b6'].tower = newOnBoardTower(PieceColor.black)
//     board['g7'].tower = newOnBoardTower(PieceColor.black)
//     board['g5'].tower = newOnBoardTower(PieceColor.black)
//     const dir = getMoveDirection('a3:c5')
//     const diag = getDiagonal(dir, 'a3', board)
//     expect(checkDiagonalToMandatoryMove(diag)).toMatchObject(['a3:c5:e7', 'a3:c5:f8'])
//     expect(Object.keys(getDiagonals('c5', board, getMoveDirection('a3:c5'))).length).toBe(2)
//     const direction = getMoveDirection('a3:c5')
//     expect(direction).toBe('rightUp')
//     expect(crossDirections(direction)).toMatchObject({'rightDown': true, leftUp: true})
//     expect(Object.keys(getDiagonals('c5', board, direction))).toMatchObject(Object.keys(crossDirections(direction)).reverse())
//     // expect(getDiagonals('a3', board)).toMatchObject({rightUp:['a3:c5:e7']})
//     // expect((PieceColor.white, board)).toMatchObject(['a3:c5:e7', 'a3:c5:f8'])
//     // expect((PieceColor.white, board, 'towers')).toMatchObject(['a3:c5:f8:h6:f4:c7:a5'])
// })

// test('possible from obligated', () => {
//     const cellsMap = createCellsMap(8)
//     const board = createEmptyBoard(8)
//     board['f4'].tower = newOnBoardTower(PieceColor.white)
//     board['e5'].tower = newOnBoardTower(PieceColor.black)
//     const rivalMove = ['f4:d6']
//     // board['f4').tower = newOnBoardTower(PieceColor.white)
//     expect(possibleOutOfMandatory({mandatoryMoves: rivalMove, mandatoryMoveStep: 0, cellsMap}, rivalMove[0])).toMatchObject({"d6": {"x": 150, "y": 100}})
// })

// test('take tower', () => {
//    const tower: PartialTower = {
//        wPiecesQuantity: 1,
//        bPiecesQuantity: 3,
//        currentColor: PieceColor.white,
//        currentType: TowerType.o,
//        onBoardPosition: 'e3'
//    }
//     const updated: PartialTower = {...tower, wPiecesQuantity: 0, bPiecesQuantity: 3, currentColor: PieceColor.black}
//     // console.log(takeTower(tower, true))
//     expect(takeTower(tower, true)).toMatchObject(updated)
// })

// test('check rivalMove', () => {
//     const board = createEmptyBoard(8)
//     board['f4'].tower = newOnBoardTower(PieceColor.white)
//     board['e5'].tower = newOnBoardTower(PieceColor.black)
//     board['e7'].tower = newOnBoardTower(PieceColor.black)
//     board['g7'].tower = newOnBoardTower(PieceColor.black)

//     const resBoard = createEmptyBoard(8)

//     // resBoard['d6'].tower = newOnBoardTower(PieceColor.white)
//     // resBoard['d6'].tower.bPiecesQuantity = 1

//     // expect(checkMandatoryMoveNextStep({moves: ['f4:d6'], board: resBoard})).toMatchObject([])
//     resBoard['h6'].tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     resBoard['h6'].tower.bPiecesQuantity = 3
//     expect(lookForMandatoryMoves(PieceColor.white, board, 'towers')).toMatchObject(['f4:d6:f8:h6'])
//     expect(checkMove(PieceColor.white, board, 'f4:d6:f8:h6', 'towers')).toMatchObject(resBoard)
//     // console.log(checkMove(PieceColor.white, board, 'f4:d6:f8:h6', 'towers'))
//     const board2 = createEmptyBoard(8)
//     const res2 = createEmptyBoard(8)
//     res2['e3'].tower = newOnBoardTower( PieceColor.white)
//     board2['f2'].tower = newOnBoardTower( PieceColor.white)
//     expect(checkMove(PieceColor.white, board2, 'f2-e3', 'towers')).toMatchObject({board: res2, availibleMoves: 2})
//     const board3 = createStartBoard(8)
//     expect(lookForAllFreeMoves(PieceColor.white, board3)).toMatchObject([])
// })

// test('check possible rivalMove looking', () => {
//     const board = createEmptyBoard(8)
//     board['f6'].tower = newOnBoardTower(PieceColor.white)
//     const king = newOnBoardTower(PieceColor.white)
//     king.currentType = TowerType.k
//     board['b4'].tower = king
//     // console.log(lookForAllFreeMoves(PieceColor.black, board), board)
//     // board['e5').tower = newOnBoardTower({color: PieceColor.black})
//     // const expected = ["f4:d6"]
//     expect(lookForAllFreeMoves(PieceColor.white, board)).toMatchObject(['f6-e7', 'f6-g7'])
// })

// test('check new tower creation', () => {
//     const tower: ICheckerTower = {
//         wPiecesQuantity: 3,
//         bPiecesQuantity: 2,
//         onBoardPosition: 'a1',
//         currentColor: PieceColor.white,
//         currentType: TowerType.k
//     }
//     expect(new TowerConstructor(tower).wPiecesQuantity).toBe(3)
//     expect(new TowerConstructor(tower).bPiecesQuantity).toBe(2)
//     expect(new TowerConstructor(tower).currentType).toBe(TowerType.k)
// })

// test('check next obligated step', () => {
//     const board = createStartBoard(8)
//     board['f4').tower = newOnBoardTower({color: PieceColor.white})
//     board['e3').tower = null
//     board['e5').tower = newOnBoardTower({color: PieceColor.black})
//     board['d6').tower = null
//     // console.log(board)
//     const expected = ["f4:d6"]
//     expect(defineObligatedMoveNextStep({color: PieceColor.white, board, rivalMove: expected})).toMatchObject(expected)
// })

// test('check next obligated steps', () => {
//     const board = createEmptyBoard(8)
//     board['f4').tower = newOnBoardTower({color: PieceColor.white})
//     board['e5').tower = newOnBoardTower({color: PieceColor.black})
//     board['f2').tower = newOnBoardTower({color: PieceColor.white})
//     const expected = ["e5:g3:e1"]
//     expect(defineObligatedMoveNextSteps({color: PieceColor.black, board, rivalMove: expected})).toMatchObject(expected)
//     expect(defineObligatedMoveNextSteps({color: PieceColor.white, board, rivalMove: ['f4:d6']})).toMatchObject(['f4:d6'])
//     // const _board = createStartBoard(8)

// })



// test('make obligated rivalMove', () => {
//
//
//
//     // board['a5'].tower = newOnBoardTower(PieceColor.white, TowerType.k)
//     // board['c7'].tower = newOnBoardTower(PieceColor.black)
//     // board['e7'].tower = newOnBoardTower(PieceColor.black)
//     // board['a7'].tower = newOnBoardTower(PieceColor.black)
//     // board['e5'].tower = newOnBoardTower(PieceColor.black)
//     // // board['c5'].tower = newOnBoardTower(PieceColor.black)
//     // const expected = ["b6:d8:f6"]
//     // expect(mmr.lookForMandatoryMoves(PieceColor.black, board)).toMatchObject(expected)
// })

