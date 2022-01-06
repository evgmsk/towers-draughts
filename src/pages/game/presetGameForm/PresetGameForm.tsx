import React from 'react'
import {connect, ConnectedProps} from 'react-redux'

import { IRootState } from '../../../store/rootState&Reducer'
import {
    setTiming, 
    setPlayerColor, 
    setOpponentType, 
    setGameVariant,
    findRival,
    setGameType,
    setRivalLevel,
} from '../../../store/gameOptions/actions'
import { I18n } from '../../../assets/i18n'

import { RivalType, PieceColor, GameVariants, GameType } from '../../../store/app-interface'
import { StandartTiming } from '../../../constants/gameConstants'


import './presetGameForm.scss'


const gameMapState = (state: IRootState) => ({
    language: state.user.language,
    gameType: state.gameOptions.gameType
})

const gameMapDispatch = {
    setGameType
}
 
const gameTypeConnector = connect(gameMapState, gameMapDispatch)

const RivalVariant:React.FC<ConnectedProps<typeof gameTypeConnector>> = (props) => {
    const {setGameType, gameType} = props
    // const i18n = I18n[language.slice(0, 2)]
    const handleSelectOpponentVariant = (e: React.MouseEvent) => {
        e.preventDefault()
        const target = e.target as HTMLButtonElement
        setGameType(target.value as GameType)
    }
    const buttonClass = (value: GameType) => (`opponent-variant__b ${gameType === value ? 'actual' : ''}`)
    const buttonTitle = (value: GameType) => {
        switch(value) {
            case('ranked'): 
                return 'ranked game'
            case('casual'): {
                return 'casual game'
            }
            case ('tournament'): {
                return 'Service is not available for now'
            }
            default:
                return ''
        }
    }
 return (
    <div className="opponent-variant" onClick={handleSelectOpponentVariant}>
        <button
            title={buttonTitle('ranked')}
            className={buttonClass('ranked')}
            type="button"
            value="ranked"
        >
            Ranked
        </button>
        <button
            title={buttonTitle('tournament')}
            className={buttonClass('tournament')}
            type="button"
            value="tournament"
        >
            Tournament
        </button>
        <button
            title={buttonTitle('casual')}
            className={buttonClass('casual')}
            type="button"
            value="casual"
        >
            Casual
        </button>
    </div>
    )
}

export const RivalVariantComponent = gameTypeConnector(RivalVariant)

// timing component
const timingMapState = (state: IRootState) => ({
    timing: state.gameOptions.timing
})

const timingMapDispatch = {
    setTiming
}
 
const timingConnector = connect(timingMapState, timingMapDispatch)

const Timing = (props: ConnectedProps<typeof timingConnector>) => {
    const {timing: {timeToGame, adds}, setTiming} = props
    const handleSelectTime = (e: React.MouseEvent) => {
        e.preventDefault()
        const values = (e.target as HTMLButtonElement).value.split(':').map(i => parseInt(i))
        setTiming({timeToGame: values[0], adds: values[1]})
    }

    return (
        <div className="timing-wrapper" onClick={handleSelectTime}>
            {StandartTiming.map((t: number[], i: number) => {
                const Class = t[0] === timeToGame && t[1] === adds ? 'timing-menu-item actual' : 'timing-menu-item'
                return <button 
                            title={"time limit: minuts / add per move: seconds"} 
                            key={i} 
                            className={Class}
                            type="button"
                            value={t.join(':')}
                        >
                            {`${t[0]} / ${t[1]}`}
                        </button>
            })}
        </div>
    )
}

export const TimingComponent = timingConnector(Timing)


// pc level component
const levelMapState = (state: IRootState) => ({
    level: state.gameOptions.rivalLevel
})

const levelMapDispatch = {
    setRivalLevel
}
 
const levelConnector = connect(levelMapState, levelMapDispatch)

const Level = (props: ConnectedProps<typeof levelConnector>) => {
    const {level, setRivalLevel} = props

    return (
        <div className="level-wrapper" >
            {[1,2,3,4,5,6,7,8,9].map((i: number) => {
                const Class = level === i ? 'level-menu-item actual' : 'level-menu-item'
                return (
                    <button 
                    onClick={() => setRivalLevel(i)}
                        title={"Choose engine level"} 
                        key={i} 
                        className={Class}
                        type="button"
                        value={i}
                    >
                        {i}
                    </button>
                )
            })}
        </div>
    )
}

export const LevelComponent = levelConnector(Level)


const gameVariantMapState = (state: IRootState) => ({
    gv: state.gameOptions.gameVariant
})

const gameVariantMapDispatch = {
    setGameVariant
}
 
const gameVariantConnector = connect(gameVariantMapState, gameVariantMapDispatch)

const GameVariant = (props: ConnectedProps<typeof gameVariantConnector>) => {
    const {gv, setGameVariant} = props

    const handleSelect = (e: any) => {
        e.preventDefault()
        const target = e.target as HTMLSelectElement
        setGameVariant(target.value as GameVariants)
    }

    return (
        <select 
            title={"select game"}
            className="game-variant"
            name="gameVariant"
            defaultValue={gv}
            onChange={handleSelect}
        >
            <option value="towers">{'Play Towers'}</option>
            <option value="international">{'Play Internstional'}</option>
            <option value="russian">{'Play Russian'}</option>
        </select>
    )
}

export const GameVariantComponent = gameVariantConnector(GameVariant)

// color presets 
const colorMapState = (state: IRootState) => ({
    color: state.gameOptions.playerColor
})

const colorMapDispatch = {
    setPlayerColor
}

const colorConnector = connect(colorMapState, colorMapDispatch)

const PlayerColorPreset = (props: ConnectedProps<typeof colorConnector>) => {
    const { color, setPlayerColor } = props
    const handleSelectColor = (e: React.MouseEvent) => {
        e.preventDefault()
        const target = e.target as HTMLButtonElement
        if (!target.classList.contains('select-color')) {
            return
        }        
        setPlayerColor(target.value as PieceColor | 'random')
    }

    return (
        <div className="select-color-wrapper" onClick={handleSelectColor}>
            <button
                title="play white pieces"
                className={`select-color${color === PieceColor.w ? ' active' : ''}`}
                type="button" value={PieceColor.w}
            ></button>
            <button
                title="play random color pieces"
                className={`select-color${color === 'random' ? ' active' : ''}`}
                type="button" 
                value="random"
            ></button>
            <button
                title="play black pieces"
                className={`select-color${color === PieceColor.b ? ' active' : ''}`}
                type="button"
                value={PieceColor.b}
            ></button>
        </div>
    )
}

// opponent type component
const rivalTypeMapState = (state: IRootState) => ({
    rivalType: state.gameOptions.rivalType,
    gameType: state.gameOptions.gameType
})

const rivalTypeMapDispatch = {
    setOpponentType,
    setGameType
}
 
const rivalTypeConnector = connect(rivalTypeMapState, rivalTypeMapDispatch)

const RivalTypeSelector = (props: ConnectedProps<typeof rivalTypeConnector>) => {
    const {rivalType, setOpponentType, gameType, setGameType} = props

    const handleSelect = (e: any) => {
        e.preventDefault()
        const target = e.target as HTMLSelectElement
        setOpponentType(target.value as RivalType)
        if (target.value === 'PC' && gameType === 'ranked') {
            setGameType('casual')
        }
    }

    return (
        <select 
            title={"select opponent type"}
            className="rival-type"
            name="rivalType"
            defaultValue={rivalType}
            onChange={handleSelect}
        >
            <option value="player">{'VS Player'}</option>
            <option value="PC">{'VS Computer'}</option>
        </select>
    )
}

const OpponentTypeSelectorC = rivalTypeConnector(RivalTypeSelector)

// custom timing presets
const customTimingMapState = (state: IRootState) => ({
    timeToGame: state.gameOptions.timing.timeToGame,
    adds: state.gameOptions.timing.adds
})

const customTimingMapDispatch = {
    setTiming
}

const customTimingConnector = connect(customTimingMapState, customTimingMapDispatch)

type CTP = ConnectedProps<typeof customTimingConnector>

export class CustomTimingPreset extends React.Component<CTP, {limit: number, adds: number, open: boolean}> {
    constructor(props: CTP) {
        super(props)
        this.state = {
            limit: props.timeToGame,
            adds: props.adds,
            open: false
        }
    }
    componentDidUpdate(prev: CTP) {
        const {timeToGame, adds} = this.props
        const ST = StandartTiming.map(t => t.join('/')).includes(`${timeToGame}/${adds}`)
        if (timeToGame !== prev.timeToGame || adds !== prev.adds) {
            if (!this.state.open && !ST) {
                this.setState({open: true})
            } else if (this.state.open && ST) {
                this.setState({open: false})
            }
            this.setState({limit: timeToGame, adds})
        }
    }

    handleClick:  React.MouseEventHandler<HTMLDivElement> = (e: React.MouseEvent) => {
        e.preventDefault()
        const target = e.target as Element
        if (target.classList.contains('time-range')) {
            return
        }
        if (target.classList.contains('custom-timing__values') && this.state.open) {
            this.setState({open: false})
        }
        if (target.classList.contains('custom-timing')) {
            this.setState({open: !this.state.open})
        }
    }

    handleChange = (e: React.ChangeEvent) => {
        e.preventDefault()
        const target = e.target as HTMLInputElement
        console.log(target.value)
        if (target.name === 'lim') {
            this.setState((state) => ({...state, limit: parseInt(target.value)}))
        }
        if (target.name === 'adds') {
            this.setState({adds: parseInt(target.value)})
        }
    }

    handleBlur = (e: React.FocusEvent) => {
        const {limit, adds} = this.state
        e.preventDefault()
        this.props.setTiming({timeToGame: limit, adds})
    }

    render() {
        const {open, limit, adds} = this.state
        return (
            <div className={`custom-timing ${open ? 'open' : 'close'}`} onClick={this.handleClick}>
                <p className="custom-preset-label">
                    <span>Custom Timing</span>
                </p>
                <div className="custom-timing__menu">
                    <input
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        className="time-range"
                        name="lim"
                        type="range" min="0"
                        step="1"
                        max="60"
                        value={limit}
                    ></input>
                    <div className="custom-timing__values">{` ${limit} / ${adds} `}</div>
                     <input
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        className="time-range"
                        name="adds"
                        type="range" min="0"
                        step="1"
                        max="60"
                        value={adds}
                    ></input>
                </div>
            </div>
        )
    }
    
}

export const ColorPreset = colorConnector(PlayerColorPreset)

export const CustomTiming = customTimingConnector(CustomTimingPreset)


const mapState = (state: IRootState) => ({
    waitingRival: state.gameOptions.waitingRival,
    language: state.user.language,
    rivalType: state.gameOptions.rivalType
})

const mapDispatch = {
    setTiming, setPlayerColor, findRival
}
 
const presetGameConnector = connect(mapState, mapDispatch)

const PresetGameForm = (props: ConnectedProps<typeof presetGameConnector>) => {
    const {waitingRival, findRival, language, rivalType} = props
    const i18n = I18n[language.slice(0, 2)]
    const className = `preset-game${waitingRival ? ' hidden' : ''}`
    return (
        <div className={className}>
            <button className="new-game" type="button" value="new_game" onClick={findRival}>{i18n.newGame}</button>
            {/* <RivalVariantComponent /> */}
            <div className="game-type-wrapper">
                <GameVariantComponent />
                <OpponentTypeSelectorC />
            </div>
            {rivalType !== 'PC' ? <TimingComponent /> : <LevelComponent />}
            <CustomTiming />
            <ColorPreset />
        </div>
    )
}

export const PresetGame = presetGameConnector(PresetGameForm)
