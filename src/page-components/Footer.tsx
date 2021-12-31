import React from 'react'
import {connect, ConnectedProps} from 'react-redux'


import git from '../assets/icons8-github.svg'
import { BaseBoardSize } from '../constants/gameConstants'
import { IRootState } from '../store/rootState&Reducer'
import {setPortrait, setWindowSize, close} from '../store/app/actions'

import './footer.scss'

const mapState = (state: IRootState) => ({
    token: state.user.token,
    windowSize: state.app.windowSize,
    portrait: state.app.portrait,
    game: state.game.gameMode === 'isPlaying'
})
const mapDispatch = {close, setWindowSize, setPortrait}

const connector = connect(mapState, mapDispatch)

class Footer extends React.Component<ConnectedProps<typeof connector>> {

    componentDidMount() {
        if (!window) return
        window.addEventListener("beforeunload", this.onClose)
        window.addEventListener('resize', this.handleResize) 
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onClose)
        window.removeEventListener("resize", this.handleResize)
    }

    handleResize = () => {
        if (!window) return
        const {windowSize, setPortrait, setWindowSize, portrait} = this.props
        const {width, height} = windowSize
        const {innerHeight, innerWidth} = window
        if ((Math.abs(width - innerWidth) > BaseBoardSize / 2 || Math.abs(height - innerHeight) > BaseBoardSize / 2)) {
            setWindowSize({width: innerWidth, height: innerHeight})
            if (portrait && innerWidth / innerHeight > 1.3) {
                setPortrait(false)
            } else if (!portrait && innerWidth / innerHeight <= 1.3) {
                setPortrait(true)
            }
        }
    }

    onClose = (e: any) => {
        e.preventDefault();
        const token = this.props.token
        if (token) this.props.close(token)
        
    }

    render() {
        return <footer>
                    <a href="https://github.com/evgmsk" target="blanc" referrerPolicy="no-referrer">
                        designed by evgmsk&nbsp;&nbsp;
                        <img height="10px" width="10px" src={git} alt="github"/>
                    </a>
                </footer>
    }
}

export default (connector(Footer))
