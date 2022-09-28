import React from 'react'
import { connect, ConnectedProps} from 'react-redux' 

import { IRootState } from "../../store/rootState&Reducer"
import {
    downloadGame,
    settingBoard,
    setDepth,
    evaluatePosition,
    analyzeLastGame,
    removePiece,
    setStartPosition,
} from '../../store/gameAnalysis/actions'
import {setGameVariant} from '../../store/gameOptions/actions'
import {reverseBoard} from '../../store/boardOptions/actions'

import './analysis-page-menu.scss'


const stateMap = (state: IRootState) => ({
    analysis: state.analyze,
    towerTouched: state.board.towerTouched,
    reversedBoard: state.boardOptions.reversedBoard,
    history: state.analyze.gameResult.movesHistory || [],
    GV: state.gameOptions.gameVariant
})

const dispatchMap = {
    downloadGame,
    settingBoard,
    reverseBoard,
    setGameVariant,
    setDepth,
    evaluatePosition,
    analyzeLastGame,
    removePiece,
    setStartPosition,
}

const analysisMenuConnector = connect(stateMap, dispatchMap)

type AnalysisMenuProps = ConnectedProps<typeof analysisMenuConnector>

export const AnalizeGameMenu: React.FC<AnalysisMenuProps> = (props: AnalysisMenuProps) => {
    const { 
        // downloadGame, 
        setGameVariant, 
        settingBoard, 
        reverseBoard, 
        reversedBoard, 
        evaluatePosition,
        analysis,
        history,
        analyzeLastGame,
        removePiece,
        GV,
        setStartPosition,
        towerTouched
    } = props
    const {settingPosition, analyzeLastGame: ALG} = analysis

    const handleGameVariantSelect = (e: any) => {
        const value = e.target.value
        
        setGameVariant(value)
    }

    const handleClick = (et: string) => {
        if (towerTouched) {
            return
        }
        switch (et) {
            case 'remove': {
                return removePiece(!analysis.removePiece)
            }
            case 'setup': {
                return settingBoard(!settingPosition)
            }
            case 'download': {
                console.log('upload')
                return
            }
            case 'startPosition': {
                return setStartPosition
            }
            case 'analyze': {
                return analyzeLastGame(true)
            }
            case 'reverse': {
                return reverseBoard(!reversedBoard)
            }
            case 'eval': {
                return evaluatePosition(true)
            }
            default:
                break
        }
    }
  
    return (
        <ul className="game-analyze-menu">
            { history.length 
                ?   <li className="game-analyze-menu_item" title="analyze last game">
                        <button type="button" onClick={() => handleClick('analyze')}>
                            <span className='material-icons'>zoom_in</span>
                        </button>
                    </li>
                :   null
            }
            <li className="game-analyze-menu_item" title={analysis.removePiece ? 'delete' : 'drag pieces'}>
                <button type="button" onClick={() => handleClick('remove')}>
                    <span className='material-icons'>{analysis.removePiece ? 'pan_tool' : 'delete'}</span>
                </button>
            </li>
            <li className="game-analyze-menu_item" title="setup-start-board">
                <button type="button" onClick={() => handleClick('startPosition')}>
                    sb{/* <span className='material-icons'>sb</span> */}
                </button>
            </li>
            <li className="game-analyze-menu_item" title="reverse board">
                <button type="button" name="reverse-board" onClick={() => handleClick('reverse')}>
                    <span className='material-icons'>change_circle</span>
                </button>
            </li>
            <li className="game-analyze-menu_item" title="download game result" >
                <div title='upload game'>
                    <input type="file" onInput={() => handleClick('download')} />
                    <span className='material-icons'>file_upload</span>
                </div>
            </li>
            <li className="game-analyze-menu_item" title={!settingPosition ? 'setup position' : 'analyze position'} >
                <button type="button" name="game" onClick={() => handleClick('setup')}>
                    <span className='material-icons'>{!settingPosition ? 'grid_on' : 'construction'}</span>
                </button>
            </li>
            <li className="game-analyze-menu_item" title="evaluate position" >
                <button type="button" name="evaluate" onClick={() => handleClick('eval')}>
                    <span className='material-icons'>calculate</span>
                </button>
            </li>
          
            <li 
                className="game-analyze-menu_item gv"
                title='Choose game variant. International: I Russian: R Towers: T'
            >
                <select 
                    className="gv" 
                    name="gv" 
                    defaultValue={GV} 
                    onChange={handleGameVariantSelect}
                    disabled={ALG}
                >
                    <option value="international">I</option>
                    <option value="russian">R</option>
                    <option value="towers">T</option>
                </select>
            </li>
        </ul>
    )
}

export default analysisMenuConnector(AnalizeGameMenu)

  /* <li className="game-analyze-menu_item depth-range_container" title="set evaluation depth" >
    <label className="label-for-depth-range">
        Depth
    </label>
    <span className="depth-value">{depth}</span>
    <input 
        className="depth-range" 
        type="range" 
        step="1" 
        max="20" 
        min="10" 
        defaultValue="15" 
        onChange={handleDepthChange} 
    />
</li> */
