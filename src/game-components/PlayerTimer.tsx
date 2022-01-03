import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { timeToString } from '../common/helpers/time-to-string'
import { IRootState } from '../store/rootState&Reducer'


export const PlayerTimer = (props: {timeOf: string}) => {
    const state = useSelector((state: IRootState) => ({
        clock: state.clock[`${props.timeOf}Clock` as 'whiteClock' | 'blackClock'],
        gameConfirmed: state.game.gameConfirmed,
        pcGame: state.gameOptions.rivalType === 'PC'
    }))
    const {clock: {timeToFirstMove, timeToGame}, gameConfirmed, pcGame} = state
    const [strTime, setStrTime] = useState({min: '', sec: ''})
    let className = `${props.timeOf}-time`
    useEffect(() => {
        const time = gameConfirmed ? timeToGame: timeToFirstMove as number
        setStrTime(timeToString(time))
    }, [gameConfirmed, timeToFirstMove, timeToGame])
    if (pcGame) {
        return null
    } 
    return (
        <div className="game-clock">
            <div className={className}>{`${strTime.min}: ${strTime.sec}`}</div>
        </div>
    
    )
}
