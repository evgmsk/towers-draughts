import { IBoardToGame, PieceColor } from "../store/app-interface";

export interface ILastResult {value: number, movesBranch: string}

export interface IMove {
    move: string,
    baseValue: number,
    position: IBoardToGame,
    deepValue?: number,
}


export interface IBranch {
    moves: IMove[],
    position: IBoardToGame,
    pieceOrder: PieceColor
    baseValue: number
    deepValue?: number
}

export interface ISeekerProps {
    maxDepth?: number
    pieceOrder: PieceColor
    position: IBoardToGame
    game: boolean
    startDepth?: number
    movesHistory?: string[]
    lastMove: string
    evaluationStarted: boolean
    positionBaseValue?: number
    lastResult?: ILastResult
    parentPositionValue?: { baseValue: number, deepValue: number }
}

export interface IValidity {deep: number, coverage: number}
