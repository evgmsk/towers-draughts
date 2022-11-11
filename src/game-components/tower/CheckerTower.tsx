import React from 'react'

import { CellTowerRatio } from '../../constants/gameConstants';

import { PieceColor, TowerConstructor, TowerType } from '../../store/models';

import './checker-tower.scss';

interface FaceProps {w: number, b: number, colorW: boolean, king: boolean, isTowers: boolean}

export const TowerFace: React.FC<FaceProps> = (props) => {
  const {w, b, colorW, king, isTowers} = props
  if (!isTowers) {
    const className = `${colorW ? 'white-checker' : 'black-checker'}${king ? ' king' : ''}`
    return <div className={className}>{king && <span className="king-mark">K</span>}</div>
  }
  const BlackPieces = new Array(b).fill(0)
  const WhitePieces = new Array(w).fill(1)
  const towerPiecesArray = colorW? WhitePieces.concat(BlackPieces) : BlackPieces.concat(WhitePieces)
  const middle = Math.floor(towerPiecesArray.length / 2)
  const Numbers = colorW 
    ? <p className="numbers-on-hover"><span className="white-top">{w}</span><span className="black-down">{b}</span></p>  
    : <p className="numbers-on-hover"><span className="black-top">{b}</span><span className="white-down">{w}</span></p>
  const Tower = towerPiecesArray.map((pn: number, i: number) => {
    const pos = Math.abs(i - middle)
    const BlackOrWhite = pn ? "white-piece" : "black-piece"
    const UpOrDown = i <= middle ? `up${pos}` : `down${pos}`
    const KingAndTop = king && !i ? ' king' : ''
    const pieceClass = `${BlackOrWhite} ${UpOrDown}${KingAndTop}`
    return <div key={i} className={pieceClass}><span className="king-mark">{king && !i ? 'K' : null}</span></div>
  })

  return (
    <div className="tower-wrapper">
      {Tower}
      {Numbers}
    </div>
  )
}

export const NumsPresentation:React.FC<{w: number, b: number, colorW: boolean, king: boolean}> = (props) => {
  const {w, b, colorW, king} = props
  const firstNum = colorW ? w : b
  const secondNum = colorW ? b : w
  const Class = `checker-tower__quantity${king ? ' with-crown' : ''}`
  return <div className={Class}>
            <span>{firstNum}</span>&nbsp;/&nbsp;<span>{secondNum}</span>
          </div>
}

type TCProps = TowerConstructor & {isTowers: boolean, bs: number}

export class TowerComponent extends React.Component<TCProps> {

  shouldComponentUpdate(prevProps: TCProps) {
    const {
      positionInDOM: {x, y},
      onBoardPosition,
      currentType,
      currentColor,
      view,
      wPiecesQuantity,
      bPiecesQuantity,
      mandatory,
      bs,
      isTowers,
    } = this.props
    return x !== prevProps.positionInDOM.x
        || y !== prevProps.positionInDOM.y
        || onBoardPosition !== prevProps.onBoardPosition
        || currentType !== prevProps.currentType
        || currentColor !== prevProps.currentColor
        || view !== prevProps.view
        || wPiecesQuantity !== prevProps.wPiecesQuantity
        || bPiecesQuantity !== prevProps.bPiecesQuantity
        || mandatory !== prevProps.mandatory
        || bs !== prevProps.bs
        || isTowers !== prevProps.isTowers
  }

  render() {
    const {
      positionInDOM,
      currentColor,
      currentType,
      view,
      wPiecesQuantity,
      bPiecesQuantity,
      onBoardPosition,
    } = this.props as TowerConstructor
    const mt = this.props.mandatory
    const boardSize = this.props.bs
    const {isTowers} = this.props
    const {x, y} = positionInDOM!
    const className = `checker-tower ${currentType} ${currentColor} ${view} board-${boardSize}${mt? ' mandatory-tower': ''}${isTowers ? ' towers' : ' classic'} ratio-${CellTowerRatio*10}`
    const style = {top: `${y}px`, left: `${x}px`} //  {transform: `translate(${x}px, ${y}px)`}//

    const colorW = currentColor === PieceColor.w 
    const towerView = (wPiecesQuantity + bPiecesQuantity > 1) && view !== 'face'
    const props={
      w: wPiecesQuantity, 
      b: bPiecesQuantity, 
      colorW, 
      king: currentType === TowerType.k, 
      isTowers,
    }
    return <div className={className} data-indexes={onBoardPosition} style={style}>
              {towerView ? <NumsPresentation {...props} /> : <TowerFace {...props}/>}
            </div>
  }
}
