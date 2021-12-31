import React from 'react'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import { IRootState } from '../../store/rootState&Reducer'
import {PieceColor} from '../../store/app-interface'

const PlayerInfo = (props: {color: PieceColor}) => {
    const {color} = props
    const {onlineStatus, name, rating} = useSelector((state: IRootState) => state.game[color])
    const rt = useSelector((state: IRootState) => state.gameOptions.rivalType) 
    const VSComputer = rt === 'PC'
    const Color = `${(color as string)[0].toUpperCase()}${(color as string).substring(1)}`
    return (
        <div className="player-info">
            <h3>{Color}</h3>
            {!VSComputer && <span className="player-status">{onlineStatus}</span>}
            <h4 className="player-name">{name}</h4>
            {!VSComputer && <span className="palyer-raiting">{rating}</span>}
        </div>
    )
}

const mapState = (state: IRootState) => ({
    gv: state.gameOptions.gameVariant,
    white: state.game.white,
    black: state.game.black,
    gt: state.gameOptions.gameType,
    ot: state.gameOptions.rivalType,
    ti: state.gameOptions.timing
})

const mapDispatch = {
    
}

const connector = connect(mapState, mapDispatch)

type GameInfoProps = ConnectedProps<typeof connector>

const GameInfo: React.FC<GameInfoProps> = (props) => {
    const {gv, gt, ot, ti} = props
    const VSCompouter = ot === 'PC'
    const gameType = VSCompouter ? 'casual' : gt
    const timing = !VSCompouter ? `${ti.timeToGame} / ${ti.adds}` : ''
    const gameVariant = `${gv[0].toUpperCase()}${gv.substring(1)}`
    return (
        <div className="game-info">
            <h2 className="game-info_header">{gameVariant}&nbsp; draughts</h2>
            <p className="game-info_type">{gameType}&nbsp;{timing}</p>
            <PlayerInfo color={PieceColor.w} />
            <PlayerInfo color={PieceColor.b} />
        </div>
    )
}

export default connector(GameInfo)
