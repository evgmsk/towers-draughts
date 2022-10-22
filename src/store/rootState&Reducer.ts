import {IAnalysisState, IApp, IBoardOptions, IGameBoard, IGameOptionState, IGameState, IUser} from './models';
import {InitialGameState, gameReducer} from './game/reducers'
import {InitialGameOptionsState, gameOptionsReducer} from './gameOptions/reducers'
import {InitialUserState, userReducer} from './user/reducer'
import {GameActionTypes} from './game/types'
import {UserActionTypes} from './user/types'
import {GameOptionActionTypes} from './gameOptions/types'
import {appReducer, AppDefaultState} from './app/reducers'
import { AppActionTypes } from './app/types';
import { InitialClockState, clockReducer, IClockState } from './clock/reducers';
import {ClockActionTypes} from './clock/types'
import { analyzeReducer, InitialGameAnalysisState } from './gameAnalysis/reducers';
import { GameAnalysisTypes } from './gameAnalysis/types';
import { boardReducer, InitialBoardState } from './board/reducers';
import { BoardActionTypes } from './board/types';
import { boardOptionsReducer, InitialBoardOptionsState } from './boardOptions/reducers';
import { BoardOptionActionTypes } from './boardOptions/types';

export const InitialState: IRootState = {
  user: InitialUserState,
  game: InitialGameState,
  gameOptions: InitialGameOptionsState,
  app: AppDefaultState,
  clock: InitialClockState,
  analyze: InitialGameAnalysisState,
  board: InitialBoardState,
  boardOptions: InitialBoardOptionsState
};

export interface IRootState {
  app: IApp
  user: IUser
  game: IGameState
  gameOptions: IGameOptionState
  clock: IClockState
  analyze: IAnalysisState
  board: IGameBoard
  boardOptions: IBoardOptions
}

export const AppReducers = {
  game: gameReducer,
  gameOptions: gameOptionsReducer,
  user: userReducer,
  app: appReducer,
  clock: clockReducer,
  analyze: analyzeReducer,
  board: boardReducer,
  boardOptions: boardOptionsReducer
}; 

export type AppActions = GameActionTypes 
  | GameOptionActionTypes 
  | UserActionTypes 
  | AppActionTypes 
  | ClockActionTypes
  | GameAnalysisTypes
  | BoardActionTypes
  | BoardOptionActionTypes

export const getUser = (state: IRootState) => state.user

export const getGameOptions = (state: IRootState) => state.gameOptions

export const getGame = (state: IRootState) => state.game
