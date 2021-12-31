import {PieceColor, IGameState, IMoveOrder, IMoveProps, IBoardToGame, IPlayer, IGameMode} from '../app-interface'
import { GameActions, GameActions as GM, GameActionTypes} from "./types";

export const InitialGameState: IGameState = {
    moveOrder: {pieceOrder: PieceColor.w, playerTurn: ''},
    gameConfirmed: false,
    gameStarted: false,
    history: [],
    playerColor: PieceColor.w,
    white: {} as IPlayer,
    black: {} as IPlayer,
    rivalOfferedDraw: false,
    ineffectiveMoves: 0,
    gameMode: 'isPreparing'
}

export function gameReducer(state: IGameState = InitialGameState, action: GameActionTypes): IGameState {
    switch(action.type) {
        case (GM.CLEAR_HISTORY): {
            return {...state, history: []}
        }
        case(GM.SET_GAME_STARTED):
            return {...state, gameStarted: action.payload as boolean}
        case(GM.UPDATE_GAME_STATE):
            return {...state, ...action.payload as IBoardToGame}  
        case(GM.SAVE_MOVE_TO_HISTORY):
            return {...state, history: state.history.concat(action.payload as unknown as string)}
        case(GM.SET_MOVE_ORDER):
            return {...state, moveOrder: action.payload as IMoveOrder}
        case(GM.MAKE_MOVE): {
            const {moveToSave, moveOrder} = action.payload as IMoveProps
            const history = state.history.concat(moveToSave.move)
            return {...state, moveOrder, history}
        }
        case(GameActions.CONFIRM_START_GAME):
            return {...state, gameConfirmed: action.payload as boolean}
        case(GM.SET_GAME):
            return {...state,...action.payload as Partial<IGameState>}
        case(GM.INEFFECTIVE_MOVE): {
            return {...state, ineffectiveMoves: action.payload as number}
        }
        case(GM.RIVAL_OFFER_DRAW):
            return {...state, rivalOfferedDraw: true}
        case(GM.DECLINE_DRAW):
            return {...state, rivalOfferedDraw: false}
        case(GM.SET_GAME_MODE):
            return {...state, gameMode: action.payload as IGameMode}
        default:
            return state 
    }
}
