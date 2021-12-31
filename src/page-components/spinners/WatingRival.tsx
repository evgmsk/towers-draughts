import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {cancelRivalWaiting} from '../../store/gameOptions/actions'
import { IRootState } from '../../store/rootState&Reducer';
import './waiting-rival.scss';

// spinner
const spinnerDispatchMap = {cancelRivalWaiting}
const spinnerStateMap = (state: IRootState) => ({waitingRival: state.gameOptions.waitingRival})

const connector = connect(spinnerStateMap, spinnerDispatchMap)

const WaitingRival: React.FC<ConnectedProps<typeof connector>> = props => {
    
    if (!props.waitingRival) return null
    return (
        <> 
            <div className="waiting-rival-spinner" onClick={() => props.cancelRivalWaiting()}>
                <div title="cancel" className="logo"></div>
                <span className="material-icons">cancel</span>
            </div>
            <Timer />
            <div className="waiting-rival-back"></div>
        </>
       
    );
};

export default connector(WaitingRival);




class Timer extends React.Component<{}, {timer: number}> {
    interval: any
    constructor(props: {}) {
        super(props)
        this.state = {
            timer: 0
        }
    }
    componentDidMount() {
        this.interval = setInterval(() => this.setState((s: {timer: number}) => ({...s, timer: s.timer + 1})), 1000)
    }
    componentWillUnmount() {
        clearInterval(this.interval)
    }
    render() {
        return <div className="waiting-rival-timer">waiting time: {this.state.timer}</div>
    }
}
