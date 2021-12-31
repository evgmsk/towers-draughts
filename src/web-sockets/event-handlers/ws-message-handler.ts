import { Store } from "../../store";
import { IAnalysisState, IGameState, IMoveOrder } from "../../store/app-interface";
// import { BoardActions } from "../../store/board/types";
// import { ClockActions } from "../../store/clock/types";
import { GameActions } from "../../store/game/types";
import { GameAnalysisActions } from "../../store/gameAnalysis/types";
// import { GameOptionActions } from "../../store/gameOptions/types";


export function messageHandler(data: string, store: Store) {
    const {message, payload} = JSON.parse(data)
    console.log(message)
    switch (message) {
        case 'game move': {
            store.dispatch({type: GameActions.MAKE_MOVE, payload})
            break
        }
        case 'new game': {
            store.dispatch({type: GameActions.NEW_GAME_VS_PLAYER, payload})
            break
        }
        case 'game draw declined': {
            // store.dispatch({type: GameActions.DECLINE_DRAW, payload})
            break
        }
        case 'game draw offered': {
            store.dispatch({type: GameActions.RIVAL_OFFER_DRAW, payload: true})
            break
        }
        case 'game canceled': {
            store.dispatch({type: GameActions.SET_GAME_STARTED, payload: false})
            store.dispatch({type: GameActions.SET_GAME_MODE, payload: 'isOver'})
            break
        }
        case 'game ended': {
            console.log(payload)
            const history = payload.history as string[]
            store.dispatch({type: GameAnalysisActions.SAVE_GAME_RESULT, payload})
            const updatePayload = {
                movesMainLine: history,
                lastMove: {index: history.length - 1, move: history.slice(-1)[0]}
            } as Partial<IAnalysisState>
            store.dispatch({type: GameAnalysisActions.UPDATE_ANALYSIS_STATE, payload: updatePayload})
            const game = {
                gameMode: 'isOver',
                gameStarted: false,
                gameConfirmed: false,
                moveOrder: {} as IMoveOrder
            } as Partial<IGameState>
            store.dispatch({type: GameActions.SET_GAME, payload: game})
            break
        }
        default: {
            break
        }
    }
}
