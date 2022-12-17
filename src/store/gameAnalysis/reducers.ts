import { IAnalysisState, IGameResult, PieceColor } from '../models'
import { GameAnalysisActions, GameAnalysisTypes } from './types'

export const InitialGameAnalysisState: IAnalysisState = {
    gameResult: {} as IGameResult,
    analyzingPosition: false,
    movesMainLine: [],
    pieceOrder: PieceColor.white,
    movesCurrentLine: [],
    depth: 5,
    currentMove: { move: '', index: -1 },
    removePiece: false,
    startPosition: false,
    bestMoveLine: [] as { move: string; value: number }[],
}

export function analyzeReducer(
    state = InitialGameAnalysisState,
    action: GameAnalysisTypes
): IAnalysisState {
    switch (action.type) {
        case GameAnalysisActions.REMOVE_PIECE: {
            return { ...state, removePiece: action.payload as boolean }
        }
        case GameAnalysisActions.UPDATE_ANALYSIS_STATE: {
            return { ...state, ...(action.payload as Partial<IAnalysisState>) }
        }
        case GameAnalysisActions.ANALYZE_POSITION: {
            return { ...state, analyzingPosition: action.payload as boolean }
        }
        case GameAnalysisActions.SAVE_GAME_RESULT: {
            const payload = action.payload as IGameResult
            return {
                ...state,
                gameResult: payload,
                movesMainLine: payload.movesHistory || [],
            }
        }
        case GameAnalysisActions.SET_BEST_MOVE_LINE: {
            return {
                ...state,
                bestMoveLine: action.payload as {
                    move: string
                    value: number
                }[],
            }
        }
        case GameAnalysisActions.SET_DEPTH: {
            return { ...state, depth: action.payload as number }
        }
        case GameAnalysisActions.SET_MOVE_ORDER: {
            return { ...state, pieceOrder: action.payload as PieceColor }
        }
        case GameAnalysisActions.UPLOAD_GAME: {
            return { ...state, gameResult: action.payload as IGameResult }
        }
        default:
            return { ...state }
    }
}
