import { IAnalysisState, IGameResult, PieceColor } from "../models"
import { GameAnalysisActions, GameAnalysisTypes } from "./types"

export const InitialGameAnalysisState: IAnalysisState = {
    gameResult: {} as IGameResult,
    analyzeLastGame: false,
    settingPosition: true,
    movesMainLine: [],
    pieceOrder: PieceColor.w,
    movesCurrentLine: [],
    lastMove: {} as {index: -1, move: ''},
    depth: 5,
    evaluate: false,
    removePiece: false,
    startPosition: false,
    bestMoveLine: [] as {move: string, value: number}[]
}

 export function analyzeReducer(state = InitialGameAnalysisState, action: GameAnalysisTypes): IAnalysisState {
    switch(action.type) {
        case GameAnalysisActions.REMOVE_PIECE: {
            return {...state, removePiece: action.payload as boolean}
        }
        case(GameAnalysisActions.SAVE_GAME_RESULT): {
            const payload =  action.payload as IGameResult
            return {...state, gameResult: payload, movesMainLine: payload.movesHistory || []}
        }
        case(GameAnalysisActions.SET_BEST_MOVE_LINE): {
            return {...state, bestMoveLine: action.payload as {move: string, value: number}[]}
        }
        case(GameAnalysisActions.SET_DEPTH): {        
            return {...state, depth: action.payload as number}
        }
        case(GameAnalysisActions.EVALUATE_POSITION): {        
            return {...state, evaluate: action.payload as boolean}
        }
        case(GameAnalysisActions.SETTING_BOARD): {        
            return {...state, settingPosition: action.payload as boolean}
        }
        case(GameAnalysisActions.ANALYZE_LAST_GAME): {
            if (action.payload) {
                return {...state, analyzeLastGame: action.payload as boolean, settingPosition: false}
            }    
            return {...state, analyzeLastGame: action.payload as boolean}
        }
        case(GameAnalysisActions.DOWNLOAD_GAME): {        
            return {...state, gameResult: action.payload as IGameResult}
        }
        case GameAnalysisActions.UPDATE_ANALYSIS_STATE: {
            return {...state, ...action.payload as Partial<IAnalysisState>}
        }
        default:
            return {...state}
    }
} 
