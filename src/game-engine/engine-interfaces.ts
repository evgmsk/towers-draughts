import { IBoardToGame, PieceColor } from "../store/app-interface";

export interface ILastResult {value: number, movesBranch: string}

export interface IMove {
    move: string, 
    branchValue: number, 
    position: IBoardToGame, 
    validity?: {deep: number, coverage: number}
}

export interface IBranch {
    moves: IMove[],
    board: IBoardToGame,
    evaluationResult?: {value: number, move: string, deep?: number}
    engineMoveLast?: boolean
    pieceOrder?: PieceColor
    validity?: IValidity
    value?: number
    baseValue?: number
}

export interface ISeekerProps {
    bestLinesCB?: Function
    bestMoveCB: Function
    maxDepth: number
    engineColor?: PieceColor
    game?: boolean
    startDepth?: number
    evaluationStarted: boolean
}

export interface IValidity {deep: number, coverage: number}
