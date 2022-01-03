import React, {Suspense, useState} from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { SideBar } from '../../page-components/Sidebar'
import {GameBoard} from './GameBoard'
import Spinner from '../../page-components/spinners/Spinner'
import { IRootState } from '../../store/rootState&Reducer'
import { PresetGame} from './presetGameForm/PresetGameForm'
import { PlayerTimer } from '../../game-components/PlayerTimer'
import WaitingRival from '../../page-components/spinners/WatingRival'
import GameEndPopup from './gameEndPopup/GameEndPopup'
import { 
    endGame,
    declineDraw,
} from '../../store/game/actions'
import { oppositColor } from '../../game-engine/gameplay-helper-fuctions'
import { PieceColor } from '../../store/app-interface'
import { MovesHistory } from '../../game-components/moves-history/MovesHistory'
import { GameMenu } from './PlayerGameMenu'
import GameInfo from './GameInfo'

import './game-page.scss'


// player bar
const PlayerGameBarMapState = (state: IRootState) => ({
    name: state.game.playerColor === PieceColor.b ? state.game.black.name : state.game.white.name
})

const PlayerGameBarMapDispatch = {endGame, declineDraw}

const PlayerGameBarConnector = connect(PlayerGameBarMapState, PlayerGameBarMapDispatch)

type PGBProps = ConnectedProps<typeof PlayerGameBarConnector>

const PlayerGameBar: React.FC<PGBProps> = ({children, ...props}) => {
    return <div className="player-game-bar">
                {children}
                <h2>{props.name}</h2>
                <GameMenu />
            </div>
}

export const PlayerGameBarComponent = PlayerGameBarConnector(PlayerGameBar)

// opponent bar
const barMapState = (state: IRootState) => ({
    name: state.game.playerColor !== PieceColor.b ? state.game.black.name : state.game.white.name
})

const barMapDispatch = {}

const RivalBarConnector = connect(barMapState, barMapDispatch)

type RivalBarProps = ConnectedProps<typeof RivalBarConnector>

const RivalGameBar: React.FC<RivalBarProps> = ({children, ...props}) => {
    const [name] = useState(props.name)
    return <div className="opponent-game-bar">
                {children}
                <h2>{name}</h2>
            </div>
}

const RivalGameBarComponent = RivalBarConnector(RivalGameBar)


const GPmapState = (state: IRootState) => ({
    playerColor: state.game.playerColor,
    gameSetupFinished: state.gameOptions.gameSetupFinished,
    portrait: state.app.portrait,

})

const GPConnector = connect(GPmapState, {})

type GPProps = ConnectedProps<typeof GPConnector>

class GamePage extends React.Component<GPProps, {}> {

    shouldComponentUpdate(prevProps: GPProps) {
        return JSON.stringify(prevProps) !== JSON.stringify(this.props)
    }
    render() {
        const {portrait, playerColor, gameSetupFinished} = this.props
        const GameBoardWithBars = portrait
        ? <>
            <main className="portrait">
                <RivalGameBarComponent>
                    <PlayerTimer timeOf={oppositColor(playerColor as PieceColor)} />
                </RivalGameBarComponent>
                <GameBoard />
                <PlayerGameBarComponent>
                    <PlayerTimer timeOf={playerColor} />
                </PlayerGameBarComponent>
            </main>
            <div className="bars-wrapper">
                <SideBar side="left">
                    <GameInfo />
                </SideBar>
                <SideBar side="right">
                    <MovesHistory />
                </SideBar>
            </div>
        </>
        : <>
            <SideBar side="left">
                <GameInfo />
            </SideBar>
            <main className="landscape">
                 <GameBoard />
            </main>
            <SideBar side="right">
                <RivalGameBarComponent>
                    <PlayerTimer timeOf={oppositColor(playerColor as PieceColor)} />
                </RivalGameBarComponent>
                <MovesHistory />
                <PlayerGameBarComponent>
                    <PlayerTimer timeOf={playerColor} />
                </PlayerGameBarComponent>
            </SideBar>
        </> 
          
        return (
            <Suspense fallback={<Spinner />}>
                <div className="game page noselect" >             
                    {
                        gameSetupFinished ? GameBoardWithBars : <PresetGame />
                    }
                    <WaitingRival />
                    <GameEndPopup />
                </div>
            </Suspense>
        )
    }
} 

export default GPConnector(GamePage)
