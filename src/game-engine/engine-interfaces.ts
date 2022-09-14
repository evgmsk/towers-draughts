import {IBoardToGame, PieceColor} from "../store/models";

export interface IDeepValue {
    depth: number,
    value: number,
    movesLine?: string[]
}

export interface IMove {
    move: string
    baseValue: number
    position: IBoardToGame
    pieceOrder?: PieceColor
}

export interface IChildren {[key: string]: IBranch}

export interface IBranch {
    moves: IMove[]
    parentBranch?: IBranch,
    position: IBoardToGame,
    pieceOrder: PieceColor,
    deepValue: IDeepValue,
    children: IChildren,
    rivalMove: string
}

export interface ISeekerProps extends IEvaluatingState{
    maxDepth?: number
    pieceOrder: PieceColor
    position: IBoardToGame
    game: boolean
    startDepth?: number
    movesHistory?: string[]
    parentBranch?: IBranch
}

export interface IEvaluatingState {
    valueIncreased?: boolean
    lastBranch?: IBranch
    evaluatingLine?: string[]
}
