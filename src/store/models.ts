// app state
export interface IApp {
    windowSize: { width: number; height: number }
    portrait: boolean
    theme?: string
    message?: { content: string; exposition?: string }
    commonChat: IMessage[]
    gameChat: IMessage[]
}

// export interface EventPosition {
//     clientX: number
//     clientY: number
// }

export interface IMessage {
    content: string
    from: string
    to: string
    date: Date
    emoji: number
}

// export interface IUserState extends IUser {
//     name: string | null
//     token: string | null
//     userId: string | null
//     rating: number
//     language: string
//     notifications: [{[key: string]: any}]
// }

// timer interfaces
export interface ITimer {
    min: string
    sec: string
}

export interface IClock {
    timeToGame: number
    adds?: number
    timeToFirstMove?: number
}

export interface Timing {
    timeToGame: number
    adds: number
}

export interface IError {
    message: string | null
}

// board to draw
export enum TowerType {
    m = 'man',
    k = 'king',
}

export enum PieceColor {
    black = 'black',
    white = 'white',
}

export enum BoardNotation {
    ch = 'chess',
    dr = 'draughts',
}

// export interface IPositionsTree {[key: string]: IBoardToGame}
export interface PositionsTree {
    [key: string]: TowersMap
}

export interface CellsMap {
    [key: string]: ITowerPosition
}

export interface IBoardProps {
    boardOptions: IBoardOptions
    possibleMoves?: CellsMap
    lastMove: string[]
}

export interface IBoardBase {
    cellsMap: CellsMap
    cellSize: number
    towers: TowersMap
}

export interface IBoardToDraw extends IBoardBase {
    lastMoveSquares?: string[]
    towerView: string
    towerTouched?: TowerTouched
}

// export interface IGameBoard extends IBoardToDraw {
//     mandatoryMoves?: IMMRResult[]
//     freeMoves?: IMMRResult
//     positionsTree?: IPositionsTree
//     currentPosition: IBoardToGame
//     mandatoryMoveStep: number
//     animationStarted: boolean;
//     moveDone: boolean;
// }

export interface IBoard extends IBoardToDraw {
    moves: MMRResult[]
    positionsTree: PositionsTree
    mandatoryMoveStep: number
    moveDone: boolean
}

// export interface IAnalysisBoard extends IBoardToDraw{
//     mandatoryMoves?: IMMRResult[]
//     freeMoves?: IMMRResult
//     positionsTree?: IPositionsTree
//     currentPosition: IBoardToGame
//     mandatoryMoveStep?: number;
//     moveDone?: boolean
// }

export interface ICell {
    type?: 'light' | 'dark'
    indexes?: string

    [propName: string]: any
}

// towers
export interface ITowerPosition {
    x: number
    y: number
}

export interface TowersMap {
    [key: string]: TowerConstructor
}

export interface IRef<T> {
    readonly current: T | null
}

export enum Directions {
    lu = 'leftUp',
    ld = 'leftDown',
    ru = 'rightUp',
    rd = 'rightDown',
}

export interface IAnalysisState {
    gameResult: IGameResult
    pieceOrder: PieceColor
    movesMainLine: string[]
    analyzingPosition: boolean
    movesCurrentLine: { move: string; indexInMainLine?: number }[]
    currentMove: { move: string; index: number }
    depth: number
    removePiece: boolean
    startPosition: boolean
    bestMoveLine: { move: string; value: number }[]
}

export interface ICheckerTower {
    currentType?: TowerType
    currentColor: PieceColor
    wPiecesQuantity?: number
    bPiecesQuantity?: number
    positionInDOM?: ITowerPosition
    onBoardPosition: string
    mandatory?: boolean
    view?: string
}

export interface INewGameProps {
    gameKey: string
    white: IPlayer
    black: IPlayer
    whiteClock: IClock
    blackClock: IClock
    moveOrder: IMoveOrder
}

export class TowerConstructor implements ICheckerTower {
    onBoardPosition: string
    currentColor: PieceColor
    wPiecesQuantity: number
    bPiecesQuantity: number
    positionInDOM: ITowerPosition
    currentType: TowerType
    view: string
    mandatory?: boolean

    constructor(props: ICheckerTower) {
        this.currentType = props.currentType || TowerType.m
        this.currentColor = props.currentColor
        this.wPiecesQuantity =
            props.wPiecesQuantity ||
            (props.currentColor === PieceColor.white ? 1 : 0)
        this.bPiecesQuantity =
            props.bPiecesQuantity ||
            (props.currentColor === PieceColor.black ? 1 : 0)
        this.positionInDOM = props.positionInDOM || {x: 0, y: 0}
        this.onBoardPosition = props.onBoardPosition
        this.view = props.view || 'face'
        this.mandatory = props.mandatory || false
    }
}

// game
export interface IMoveOrder {
    pieceOrder: PieceColor
    playerTurn: string
}

export interface ITotalMoves {
    mandatory?: FullMRResult[]
    free?: FreeMRResult[]
}

export interface Move {
    move: string
    position: TowersMap
    takenPieces?: string[]
}

export interface MoveWithRivalMoves extends Move {
    rivalMoves: MMRResult[]
}

export interface IMoveToMake {
    gameKey?: string
    moveToSave: MoveWithRivalMoves
    moveOrder: IMoveOrder
    rivalMoves?: Move[]
    receivedAt?: Date
    whiteClock?: IClock
    blackClock?: IClock
}

// export interface IMoveProps {
//     gameKey?: string,
//     moveToSave: IMMRResult,
//     moveOrder: IMoveOrder,
//     receivedAt?: Date,
//     whiteClock?: IClock,
//     blackClock?: IClock
// }

export type IGameMode = 'isPlaying' | 'isOver' | 'isPreparing'

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
    ineffectiveMoves: number
    portrait?: boolean
    gameMode: IGameMode
    rivalOfferedDraw: boolean
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

// export interface IBoardToGame {
//     [key: string]: IBoardCell
// }

export interface Board {
    [key: string]: BoardCell
}

export interface IBoardOptions {
    boardSize: number
    boardTheme?: string
    topLegend?: string[]
    sideLegend?: number[]
    withOutLegend?: boolean
    legendsInside?: boolean
    boardNotation: BoardNotation
    reversedBoard: boolean
}

export enum Online {
    online,
    offline,
    reconnecting,
}

export interface IPlayer {
    name: string
    onlineStatus?: Online
    userId?: string
    rating?: number
}

export type EndGameConditions =
    | 'surrender'
    | 'outOfTime'
    | 'noMoves'
    | 'drawByAgreement'
    | 'drawByRules'
    | 'abandonedByWhite'
    | 'abandonedByBlack'

export interface IGameResult {
    gameKey?: string
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

export interface BoardCell {
    pos?: ITowerPosition
    neighbors: INeighborCells
    boardKey: string
}

// export interface IBoardCell {
//     pos?: ITowerPosition;
//     tower: PartialTower | null
//     neighbors: INeighborCells;
//     boardKey: string
// }

export interface INeighborCells {
    [key: string]: string
}

// export interface IDiagonals {[key: string]: IBoardCell[]}
export interface Diagonals {
    [key: string]: BoardCell[]
}

export interface ISortedMoves {
    maxLength?: number
    maxLengthMoves: FullMRResult[]
    restMoves: FullMRResult[]
}

// export interface IMMRResult {
//     move: string
//     position: IBoardToGame
//     takenPieces?: string[]
// }

export interface MMRResult {
    move: string[]
    endPosition: TowersMap
    takenPieces?: string[]
}

export interface MResult {
    move: string[]
    startPosition: TowersMap
}

export interface FreeMRResult extends MResult {
    endPosition?: TowersMap
}

export interface FullMRResult extends MResult {
    endPosition: TowersMap
    takenPieces: string[]
    lastStepDirection: string
    minLength: number
    completed?: boolean
}

export interface StepMProps extends MResult {
    takenPieces: string[]
}

export type RivalType = 'player' | 'PC'

// user
export interface IUser {
    token: string
    userId: string
    name: string
    rating: number
    language: string
    gamesPlayed?: IGameResult
}

// evaluation

export interface DeepValue {
    depth: number
    value: Value
    move: string
}

// export interface IChildren {[key: string]: IBranch}
export interface Children {
    [key: string]: Branch
}

export interface IPositionData {
    moves: Move[]
    position: TowersMap
    pieceOrder: PieceColor
    totalMovesNumber: number
    deepValue: DeepValue
    extraData?: { [key: string]: any }
    leafsNumber: number
}

export interface Branch extends IPositionData {
    parentBranch?: Branch
    children: Children
    rivalMove: string
}

export interface IPieces {
    pieceNumber: number
    kingNumber: number
}

export interface IPiecesData {
    white: IPieces
    black: IPieces
}

// export interface IBranch {
//     moves: Move[]
//     parentBranch?: IBranch,
//     position: IBoardToGame,
//     pieceOrder: PieceColor,
//     deepValue: IDeepValue,
//     children: IChildren,
//     rivalMove: string,
// }

// export interface IBestMove {move: string, position: IBoardToGame, deepValue: IDeepValue}

// export interface ISeekerProps extends IEvaluatingState{
//     maxDepth?: number
//     pieceOrder?: PieceColor
//     towers?: TowersMap
//     position?: IBoardToGame
//     game: boolean
//     startDepth?: number
//     movesHistory?: string[]
//     parentBranch?: IBranch
// }

export interface SeekerProps {
    maxDepth?: number
    pieceOrder?: PieceColor
    towers?: TowersMap
    game: boolean
    startDepth?: number
    movesHistory?: string[]
    parentBranch?: Branch
    lastBranch?: Branch
    valueIncreased?: boolean
}

export interface Value {
    white: number
    black: number
}

// export interface IEvaluatingState {
//     valueIncreased?: boolean
//     lastBranch?: IBranch
//     evaluatingLine?: string[]
// }
