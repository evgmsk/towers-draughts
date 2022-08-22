import {IBoardToGame, IMMRResult, IMoveProps, PieceColor} from "../store/models";


export interface IMove {
    move: string,
    baseValue: number,
    position: IBoardToGame,
    deepValue?: IDeepValue
}

export interface IValidationResult {
    key: string, branch: IBranch, validity: number
}

export interface IDeepValue {depth: number, value: number, movesLine?: string[]}

export interface IBranch {
    moves: IMove[],
    position: IBoardToGame,
    pieceOrder: PieceColor
    baseValue: number
    deepValue?: IDeepValue
}

export interface ISeekerProps extends IEvaluatingState{
    maxDepth?: number
    pieceOrder: PieceColor
    position: IBoardToGame
    game: boolean
    startDepth?: number
    movesHistory?: string[]
    lastMove: string
    rootKey: string
    rootKeyLength: number
}

export interface IEvaluatingState {
    evaluatingMove?: string
    valueDynamic?: ValueDynamic
    lastResult?: ILastResult
    parentPositionValue?: IDeepValue
    evaluatingLine?: string[]
}

export interface ILastResult {movesLine: string, value: number, depth?: number}

export enum ValueDynamic {
    und = 0,
    incr = 1,
    decr = -1,
}
