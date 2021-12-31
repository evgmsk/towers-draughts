import React, {createContext, useState, useEffect} from 'react'

import {ITimer}  from '../store/app-interface'


interface ITimerContext {
    opponentName: string,
    playerName: string,
    playerTimer: ITimer;
    opponentTimer: ITimer;
    gameStarted: boolean;
    moveOrder: boolean;
    winner: string;
    changeMoveOrder(): void;
    startGame(): void;
    stopGame(): void;
    setTimeLimitPlayer(props: number): void;
    setTimeLimitOpponent(props: number): void;
    changePlayerName(name: string): void;
    changeOpponentName(name: string): void;
}

const gameContextDefaultValues: ITimerContext = {
    playerTimer: {min: '', sec: ''},
    opponentTimer: {min: '', sec: ''},
    opponentName: 'Nemo',
    playerName: 'Nemo2',
    winner: '',
    changeMoveOrder: () => {},
    stopGame: () => {},
    startGame: () => {},
    setTimeLimitOpponent: (pr: number) => {},
    setTimeLimitPlayer: (pr: number) => {},
    gameStarted: false,
    moveOrder: true,
} as ITimerContext

export const ClocksContext = createContext<ITimerContext>(
    gameContextDefaultValues
)

export const ClocksProvider = ({children}: {children?: React.ReactNode}) => {
    const [playerTimer, setPlayerTimer] = useState({} as ITimer)
    const [opponentTimer, setOpponentTimer] = useState({} as ITimer)
    const [playerTime, setPlayerTime] = useState(30)
    const [opponentTime, setOpponentTime] = useState(30)
    const [winner, setWinner] = useState('')
    const [gameStarted, setGameStarted] = useState(false)
    const [moveOrder, setMoveOrder] = useState(true)
    const [playerName, setPlayerName] = useState('Nemo')
    const [opponentName, setOpponentName] = useState('Nemo')
    const interval = 1000;
    
    const changeOpponentName = (name: string) => {
        setOpponentName(name)
    }
    const changePlayerName = (name: string) => {
        setPlayerName(name)
    }
    const setTimeLimitPlayer = (props: number) => {
        setPlayerTime(props)
    }
    const setTimeLimitOpponent = (props: number) => {
        setOpponentTime(props)
    }
    const stopGame = () => {
        setGameStarted(false)
    }
    const startGame = () => {
        setGameStarted(true)
    }
    const changeMoveOrder = () => {
        setMoveOrder(!moveOrder)
    }
 
    const timeToString = (time: number) => {
        let min = Math.floor(time / 60).toString()
        let sec = (time % 60).toString()
        sec = sec.length < 2 ? `0${sec}` : sec
        min = min.length < 2 ? `0${min}` : min
        return {min, sec}
    }
    useEffect(() => {
        const int: ReturnType<typeof setInterval>[] = []
        setPlayerTimer(timeToString(playerTime))
        setOpponentTimer(timeToString(opponentTime))
        console.log(gameStarted, playerTime)
        const decrementor = () => {
            if (moveOrder) {
                const newTime = playerTime - 1
                console.log(newTime, newTime <= 0)
                setPlayerTime(newTime)
                setPlayerTimer(timeToString(newTime))
                if (newTime <= 0) {
                    console.log(newTime, 'newTime <= 0')
                    stopGame()
                    setWinner('opponent')
                }
            } else {
                const newTime = opponentTime - 1
                setOpponentTime(newTime)
                setOpponentTimer(timeToString(newTime))
                if (newTime <= 0) {
                    setWinner('player')
                    stopGame()
                }
            }
        }
        if (gameStarted && !int.length) {
            int[int.length] = setInterval(decrementor, interval)
            console.log('strated', int, gameStarted)
        } else if (int) {
            console.log('game stoped', int)
            int.forEach(i => window.clearInterval(i))
        }
        return () => {
            console.log('end', int)
            int.forEach(i => {
                console.log('int', i)
                window.clearInterval(i)})
        }
    }, [gameStarted, moveOrder, opponentTime, playerTime])
    return (
        <ClocksContext.Provider value={{ 
            playerTimer,
            opponentTimer,
            changeOpponentName,
            changePlayerName,
            playerName,
            opponentName,
            gameStarted,
            moveOrder,
            winner,
            changeMoveOrder,
            startGame,
            stopGame,
            setTimeLimitPlayer,
            setTimeLimitOpponent,
        }} 
        >
            {children}
        </ClocksContext.Provider>
    )
}