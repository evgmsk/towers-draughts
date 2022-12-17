import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { IRootState } from '../../store/rootState&Reducer'
import {
    analyzePosition,
    removePiece,
    setDepth,
    setMoveOrderAction,
    setStartPosition,
    uploadGame,
} from '../../store/gameAnalysis/actions'
import { setGameVariant } from '../../store/gameOptions/actions'
import { reverseBoard } from '../../store/boardOptions/actions'

import './analysis-page-menu.scss'
import { PieceColor } from '../../store/models'
import { oppositeColor } from '../../game-engine/gameplay-helper-functions'

const stateMap = (state: IRootState) => ({
    analysis: state.analyze,
    towerTouched: state.boardAndTowers.towerTouched,
    reversedBoard: state.boardOptions.reversedBoard,
    history: state.analyze.gameResult.movesHistory || [],
    GV: state.gameOptions.gameVariant,
})

const dispatchMap = {
    uploadGame,
    reverseBoard,
    setGameVariant,
    setDepth,
    setMoveOrderAction,
    analyzePosition,
    removePiece,
    setStartPosition,
}

const analysisMenuConnector = connect(stateMap, dispatchMap)

type AnalysisMenuProps = ConnectedProps<typeof analysisMenuConnector>

export const AnalyzeGameMenu: React.FC<AnalysisMenuProps> = (
    props: AnalysisMenuProps
) => {
    const {
        setGameVariant,
        reverseBoard,
        reversedBoard,
        analysis: { pieceOrder, analyzingPosition, removePiece },
        setMoveOrderAction,
        analyzePosition,
        removePiece: remPiece,
        GV,
        setStartPosition,
        towerTouched,
    } = props
    const [startPos, setStartPos] = useState(true)
    const whiteMove = pieceOrder === PieceColor.white
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
                return remPiece(!removePiece)
            }
            case 'analyze': {
                return analyzePosition(!analyzingPosition)
            }
            case 'upload': {
                return
            }
            case 'startPosition': {
                setStartPos(!startPos)
                return setStartPosition(startPos)
            }
            case 'reverse': {
                return reverseBoard(!reversedBoard)
            }
            case 'move-order': {
                return setMoveOrderAction(oppositeColor(pieceOrder))
            }
            default:
                break
        }
    }

    return (
        <ul className="game-analyze-menu">
            <li
                className="game-analyze-menu_item"
                title={removePiece ? 'delete piece' : 'drag piece'}
            >
                <button type="button" onClick={() => handleClick('remove')}>
                    <span className="material-icons">
                        {!removePiece ? 'pan_tool' : 'delete'}
                    </span>
                </button>
            </li>
            <li className="game-analyze-menu_item" title="setup start board">
                <button
                    type="button"
                    onClick={() => handleClick('startPosition')}
                >
                    {!startPos ? 'clear board' : 'start pos'}
                </button>
            </li>
            <li className="game-analyze-menu_item" title="reverse board">
                <button
                    type="button"
                    name="reverse-board"
                    onClick={() => handleClick('reverse')}
                >
                    <span className="material-icons">change_circle</span>
                </button>
            </li>
            <li className="game-analyze-menu_item" title="upload game">
                <div title="upload game">
                    <input type="file" onInput={() => handleClick('upload')} />
                    <span className="material-icons">file_upload</span>
                </div>
            </li>
            <li
                className="game-analyze-menu_item"
                title={
                    analyzingPosition ? 'setup position' : 'analyze position'
                }
            >
                <button
                    type="button"
                    name="game"
                    onClick={() => handleClick('analyze')}
                >
                    <span className="material-icons">
                        {analyzingPosition ? 'grid_on' : 'calculate'}
                    </span>
                </button>
            </li>
            <li
                className="game-analyze-menu_item gv"
                title="Choose game variant. International: I Russian: R Towers: T"
            >
                <select
                    className="gv"
                    name="gv"
                    defaultValue={GV}
                    onChange={handleGameVariantSelect}
                    disabled={analyzingPosition}
                >
                    <option value="international">I</option>
                    <option value="russian">R</option>
                    <option value="towers">T</option>
                </select>
            </li>
            <li
                className="game-analyze-menu_item"
                title={!whiteMove ? 'black move' : 'white move'}
            >
                <button
                    type="button"
                    name="piece-order"
                    onClick={() => handleClick('move-order')}
                >
                    <span
                        className={
                            whiteMove
                                ? 'material-icons white-move'
                                : 'material-icons black-move'
                        }
                    >
                        circle
                    </span>
                </button>
            </li>
        </ul>
    )
}

export default analysisMenuConnector(AnalyzeGameMenu)

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
