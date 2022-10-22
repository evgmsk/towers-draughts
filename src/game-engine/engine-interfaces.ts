import {IBoardToGame, PieceColor, TowersMap} from "../store/models";

export interface IDeepValue {
    depth: number,
    value: number,
    movesLine?: string[]
}

export interface Move {
    move: string
    baseValue: number
    position: TowersMap
}

export interface IMove {
    move: string
    baseValue: number
    position: IBoardToGame
    pieceOrder?: PieceColor
}

export interface IChildren {[key: string]: IBranch}
export interface Children {[key: string]: Branch}

export interface Branch {
    moves: IMove[],
    totalMoves: number,
    parentBranch?: Branch,
    position: TowersMap,
    pieceOrder: PieceColor,
    deepValue: IDeepValue,
    children: Children,
    rivalMove: string,
}

export interface IBranch {
    moves: IMove[]
    parentBranch?: IBranch,
    position: IBoardToGame,
    pieceOrder: PieceColor,
    deepValue: IDeepValue,
    children: IChildren,
    rivalMove: string,
}

export interface IBestMove {move: string, position: IBoardToGame, deepValue: IDeepValue}

export interface ISeekerProps extends IEvaluatingState{
    maxDepth?: number
    pieceOrder?: PieceColor
    position?: IBoardToGame
    towers?: TowersMap
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
