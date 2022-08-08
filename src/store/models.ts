// app state
export interface IApp {
    windowSize: {width: number, height: number}
    portrait: boolean
    theme?: string
    message?: {content: string, exposition?: string}
    commonChat: IMessage[]
    gameChat: IMessage[]
}

export interface IMessage {content: string, from: string, to: string, date: Date, emoji: number, }

export interface IUserState extends IUser{
    name: string | null
    token: string | null
    userId: string | null
    rating: number
    language: string
    notifications: [{[key: string]: any}]
}

// timer interfaces
export interface ITimer {
    min: string;
    sec: string;
}

export interface IClock {
    timeToGame: number
    adds?: number 
    timeToFirstMove?: number
}

export interface Timing {
    timeToGame: number,
    adds: number
}

export interface IError {
    message: string | null
};

// boardtodraw
export enum TowerType {
    m = 'man',
    k = 'king'
}

export enum PieceColor {
    b = 'black',
    w = 'white'
}

export enum BoardNotation {
    r = 'chess',
    i = 'international'
}

export interface IBoardAndTowers extends IBoardToDraw {
    lastMoveSquares: string[]
    towerView: string,
    currentPosition: IBoardToGame
    mandatoryMoveStep: number
    animationStarted: boolean
    moveDone: boolean
}

export interface IAnalysisState {
    gameResult: IGameResult
    settingPosition: boolean
    pieceOrder: PieceColor
    movesMainLine?: string[]
    analyzeLastGame: boolean
    movesCurrentLine: string[]
    lastMove: {index: number, move: string}
    depth: number
    evaluate: boolean
    removePiece: boolean
    startPosition: boolean,
}

export type CellsMap = Map<string, ITowerPosition>

export interface IBoardProps {boardOptions: IBoardOptions, possibleMoves?: CellsMap, lastMove: string[]}

export interface IBoardToDraw {
    cellsMap: CellsMap
    cellSize: number
    towerTouched?: TowerTouched
    possibleMoves?: CellsMap
    towers: TowersMap
    mouseDown: boolean
    mandatoryMoves?: IMMRResult[]
    positionsTree?: Map<string, IBoardToGame>
    lastMoveSquares: string[]
    currentPosition: IBoardToGame
}

export interface IGameBoard extends IBoardToDraw{
    mandatoryMoveStep?: number;
    mandatoryMovesChecked?: boolean;
    animationStarted?: boolean;
    moveDone?: boolean;
    currentPosition: IBoardToGame,
}

export interface IAnalysisBoard extends IBoardToDraw{
    mandatoryMoveStep?: number;
    moveDone?: boolean    
}

export interface ICell {
    type?: 'light' | 'dark';
    indexes?: string;
    [propName: string]: any;  
}

// towers
export interface ITowerPosition {
    x: number;
    y: number;
}

export type TowersMap = Map<string, TowerConstructor>

export interface IRef<T> {
    readonly current: T | null
}

export type NeighborsKeys = 'leftUp' | 'leftDown' | 'rightUp' | 'rightDown'

export interface ICheckerTower  {
    currentType?: TowerType;
    currentColor: PieceColor;
    wPiecesQuantity?: number;
    bPiecesQuantity?: number;
    positionInDOM?: ITowerPosition;
    onBoardPosition: string;
    [key: string]: any;
}


export interface INewGameProps {
    gameKey: string
    white: IPlayer,
    black: IPlayer,
    whiteClock: IClock,
    blackClock: IClock,
    moveOrder: IMoveOrder
}

export class TowerConstructor implements ICheckerTower {
    onBoardPosition: string;
    currentColor: PieceColor;
    wPiecesQuantity: number;
    bPiecesQuantity: number;
    positionInDOM?: ITowerPosition;
    currentType: TowerType;
    veiw?: string;
    mandatoryMove?: boolean;
    constructor(props: ICheckerTower ) {
        this.currentType = props.currentType || TowerType.m;
        this.currentColor = props.currentColor;
        this.wPiecesQuantity = props.wPiecesQuantity || (props.currentColor === PieceColor.w ? 1 : 0);
        this.bPiecesQuantity = props.bPiecesQuantity || (props.currentColor === PieceColor.b ? 1 : 0);
        this.positionInDOM = props.positionInDOM || {x: 0, y: 0};
        this.onBoardPosition = props.onBoardPosition
        this.veiw = props.veiw || 'face'
        this.mandatoryMove = props.mandatoryMove || false
    }
}

export type PartialTower = Partial<TowerConstructor>

// game
export interface IMoveOrder {
    pieceOrder: PieceColor
    playerTurn: string
}

export interface IMoveProps {
    gameKey?: string,
    moveToSave: IMMRResult,
    moveOrder: IMoveOrder,
    recievedAt?: Date,
    whiteClock?: IClock,
    blackClock?: IClock
}

export type IGameMode = 'isPlaying' | 'isOver' | 'isAnalyzing' | 'isPreparing'

export interface IGameState {
    gameKey?: string
    moveOrder: IMoveOrder
    gameStarted: boolean
    gameConfirmed: boolean
    history: string[]
    playerColor: PieceColor
    white: IPlayer
    black: IPlayer
    lastGameResult?: IGameResult | null
    ineffectiveMoves?: number
    portrait?: boolean
    gameMode: IGameMode
    rivalOfferedDraw: boolean,
    // [key: string]: any
}

export type GameType = 'ranked' | 'casual' | 'tournament'

export interface IGameOptionState {
    timing: Timing
    gameType: GameType
    playerColor: PieceColor | 'random'
    rivalType: RivalType
    rivalLevel: number
    gameVariant: GameVariants
    gameSetupFinished: boolean
    waitingRival: boolean
}

export interface TowerTouched {
    key: string
    possibleMoves: CellsMap
    startCursorPosition: ITowerPosition
    startTowerPosition: ITowerPosition
    towerColor: PieceColor
    towerType: TowerType
}

export type GameVariants = 'towers' | 'russian' | 'international'
export type BoardToGame = Map<string, IBoardCell>

export interface IBoardToGame {
    [key: string]: IBoardCell
}

export interface IBoardOptions {
    boardSize: number,
    boardTheme?: string,
    topLegend?: string[],
    sideLegend?: number[],
    withOutLegend?: boolean,
    legendsInside?: boolean,
    boardNotation: BoardNotation,
    reversedBoard: boolean
}

export enum Online {
    online,
    offline,
    reconnecting
}

export interface IPlayer {
    name: string
    onlineStatus?: Online
    userId?: string
    rating?: number
}

export type EndGameConditions = 'surrender' 
    | 'outOfTime'
    | 'noMoves'
    | 'drawByAgreement' 
    | 'drawByRules'
    | 'abandonedByWhite'
    | 'abandonedByBlack'

export interface IGameResult {
    gameKey?: string,
    winner: PieceColor | 'draw'
    reason: EndGameConditions
    white: IPlayer
    black: IPlayer
    playerColor?: PieceColor
    movesHistory: string[]
    gameVariant: GameVariants
    timing: string
    boardSize?: number
    date: Date
}

export interface IBoardCell {
    pos?: ITowerPosition;
    tower: PartialTower | null
    neighbors: INeighborCells;
    boardKey: string
}

export interface INeighborCells {
    [key: string]: string
}

export interface IDiagonals {[key: string]: IBoardCell[]}

export interface IMMRResult {
    move: string
    position: IBoardToGame
    takenPieces?: string[]
}

export interface IBoardDiagonal {
    direction: NeighborsKeys;
    values: IBoardDiagonalCell[];
}
 
export interface IBoardDiagonalCell {
    cellIndex: string;
    towerColor: PieceColor | null
}

export type RivalType = 'player' | 'PC' 

// user
export interface IUser {
    token: string | null,
    userId: string | null,
    name: string | null,
    rating: number | null
    language: string
}
