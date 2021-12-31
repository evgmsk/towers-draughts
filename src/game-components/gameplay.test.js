import {GamePlay, GameClass} from '../pages/game/GameBoard'
import {InitialState} from '../store/rootState&Reducer'
import { PieceColor, TowerConstructor } from '../store/app-interface'
import {copyMap, updateTowerMapAfterMove, updateTowerMapAfterObligatedMoveStep} from '../game-engine/gameplay-helper-fuctions'
import { AnimationDuration, BaseTransform } from '../constants/gameConstants'

const gp = new GameClass(InitialState)

// test('animate opponent move', () => {
//     // console.log(gp.props, gp.state)
//     const {game: {board, history}, gameOptions: {player, opponent}} = gp.props
    
//     board['e5'].tower = board['d6'].tower
//     board['d6'].tower = null
//     board['d4'].tower = board['e3'].tower
//     board['c3'].tower = null
//     board['b4'].tower = board['a3'].tower
//     board['a3'].tower = null
//     console.log(board, gp.state.towers)
//     history.push('e5:c3:a5')
//     player.color = PieceColor.b
//     opponent.color = PieceColor.w
//     gp.animateObligatedMove(history)
//     console.log('after', gp.state.towers)
//     const blackTowers = copyMap(gp.state.towers.blackTowers)
//     const tower =  blackTowers.get('d6')
//     tower.tranform = BaseTransform
//     tower.onBoardPosition = 'a5'
//     blackTowers.set('a5', tower)
//     blackTowers.delete('d6')
//     setTimeout(() => console.log(gp.state.towers.blackTowers), AnimationDuration)
//     // expect(gp.state.towers.blackTowers.get('a5')).toMatchObject(tower)
//     console.log(gp.state.towers)
//     expect(gp.state.towers.blackTowers.values.length).toBe(blackTowers.values.length)
// })

test('update towers after move', () => {

})
 