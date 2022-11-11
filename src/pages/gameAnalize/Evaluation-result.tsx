import React from "react";
import {connect, ConnectedProps} from "react-redux";
import {IRootState} from "../../store/rootState&Reducer";
import {setDepth} from "../../store/gameAnalysis/actions";

import './eval-result.scss'

const mapState = (state: IRootState) => ({
    bestMoveLine: state.analyze.bestMoveLine
})

const mapDispatch = {
    setDepth
}
const evaluationResultConnector = connect(mapState, mapDispatch)
type EvaluationResultProps = ConnectedProps<typeof evaluationResultConnector>

export const EvaluationResult: React.FC<EvaluationResultProps> = (props: EvaluationResultProps) => {
    const {setDepth, bestMoveLine}= props
    if (!bestMoveLine.length) {return <div>Evaluation ...</div>}
    const value = bestMoveLine[0].value
    const line = bestMoveLine.map((m, i) => {
        return !(i % 2)
            ? <span key={i}>{`${i || '...'}. ${m.move}, `}</span>
            : <span key={i}>{m.move}&nbsp;</span>
    })
    return  <div className="evaluation-result">
                <input type="number" value={value} onChange={() => setDepth(value)} />
                {line}
            </div>
}

export default evaluationResultConnector(EvaluationResult)
