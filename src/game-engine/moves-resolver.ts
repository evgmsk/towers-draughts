import {BaseBoardSize} from "../constants/gameConstants";
import {
    Board,
    BoardCell, CellsMap,
    FreeMRResult,
    FullMRResult,
    GameVariants,
    IBoard,
    IGameState,
    IMoveOrder,
    ISortedMoves,
    ITotalMoves,
    MMRResult,
    Move,
    PieceColor,
    StepMProps,
    TowerConstructor,
    TowersMap,
    TowerType
} from "../store/models"
import {copyObj, oppositeColor, oppositeDirection} from "./gameplay-helper-functions";
import {createBoardWithoutTowers, determineCellPosition} from "./prestart-help-function";


export class KingDiagsRes {
    preMove: FullMRResult
    minMoveLength: number
    _result = [] as FullMRResult[]
    constructor(move?: FullMRResult) {
        this.minMoveLength = move?.move?.length || 2
        this.preMove = move || null as unknown as FullMRResult
    }

    size() {
        return this._result.length
    }

    add(moves: FullMRResult[]) {
        if (this._result.length && moves[0].move.length === this.minMoveLength) {
            return
        }
        if (this._result.length
            && this._result[0].move.length === this.minMoveLength
            && moves[0].move.length > this.minMoveLength) {
            this._result.shift()
        }
        this._result = this._result.concat(moves)
    }

    get(): FullMRResult[] {
        return this._result
    }
}

export class BaseMoveResolver {
    GV: GameVariants = 'towers'
    size: number = BaseBoardSize
    board = createBoardWithoutTowers(BaseBoardSize) as Board
    setProps = (props: {GV: GameVariants, size: number}) => {
        this.GV = props.GV
        this.size = props.size
        this.board = createBoardWithoutTowers(props.size)
    }

    updateCellsMap = (cellsMap: CellsMap, cellSize: number, reversed = false) => {
        const newMap = {} as CellsMap
        Object.keys(cellsMap).forEach((key: string) => {
            newMap[key] = determineCellPosition(key, cellSize, reversed, this.size)
        })
        return newMap
    }

    checkTowerTypeChanging(to: string, color: PieceColor, type: TowerType): TowerType {
        if ((parseInt(to.slice(1)) === this.size && color === PieceColor.w)
            || (parseInt(to.slice(1)) === 1 && color === PieceColor.b)) {
            return TowerType.k
        }
        return type
    }

    captureTower = (tower: TowerConstructor): TowerConstructor | null => {
        if (this.GV !== 'towers') {
            return null as unknown as TowerConstructor
        }
        const {currentColor, bPiecesQuantity, wPiecesQuantity} = tower
        const white = currentColor === PieceColor.w
        const newTower = Object.assign(Object.assign({}, tower), {
            currentType: TowerType.m,
            wPiecesQuantity: white ? (wPiecesQuantity as number) - 1 : wPiecesQuantity,
            bPiecesQuantity: white ? bPiecesQuantity : (bPiecesQuantity as number) - 1,
        })
        if (!newTower.bPiecesQuantity && !newTower.wPiecesQuantity) {
            return null as unknown as TowerConstructor
        } else {
            if (white && !newTower.wPiecesQuantity) {
                newTower.currentColor = PieceColor.b
            } else if (!white && !newTower.bPiecesQuantity) {
                newTower.currentColor = PieceColor.w
            }
        }
        return newTower
    }
}

export class MoveResolveCommons extends BaseMoveResolver {

    getDiagonal(direction: string, startCellKey: string): BoardCell[] {
        let cell = this.board[startCellKey]
        const diagonal = [cell]
        while (cell) {
            const nextCellKey = cell.neighbors[direction]
            if (nextCellKey) {
                const nextCell = this.board[nextCellKey]
                diagonal.push(nextCell)
                cell = nextCell
            } else {
                return diagonal
            }
        }
        return diagonal;
    }

    noManMoveRestrictions(color: PieceColor, key: string, targetKey: string) {
        return color === PieceColor.w
            ? parseInt(key.slice(1)) < parseInt(targetKey.slice(1))
            : parseInt(key.slice(1)) > parseInt(targetKey.slice(1))
    }

    getNewOrder = (props: Partial<IGameState>): IMoveOrder => {
        const newPieceOrder = oppositeColor(props.moveOrder!.pieceOrder)
        return {
            pieceOrder:  newPieceOrder,
            playerTurn: props[newPieceOrder]!.name,
        }
    }

    makeFreeMove(from: string, to: string, _towers: TowersMap): TowersMap {
        const towers = copyObj(_towers)
        if (!towers[from]) {
            console.error('makeFreeMove invalid props', from, to, towers)
        }
        const tower = copyObj(towers[from])
        tower.currentType = this.checkTowerTypeChanging(to, tower.currentColor, tower.currentType)
        tower.onBoardPosition = to
        towers[to] = tower
        delete towers[from]
        return towers
    }


    checkLastLine(to: string, whiteMove: boolean): boolean {
        const currentLine = parseInt(to.slice(1))
        return (whiteMove && currentLine === this.size) || (!whiteMove && currentLine === 0)
    }

    makeDraughtMandatoryMove = (move: StepMProps): TowersMap => {
        if (move.move.length === 2) {
            return this.makeDraughtMandatoryMoveStep(move, true)
        }
        const firstStepProps = {...move, move: move.move.slice(0, 2)}
        const nextMoveProps = {
            ...move,
            move: move.move.slice(1),
            startPosition: this.makeDraughtMandatoryMoveStep(firstStepProps, true),
            takenPieces: move.takenPieces?.slice(1)
        }
        return this.makeDraughtMandatoryMove(nextMoveProps)
    }

    makeMandatoryMove = (move: StepMProps): TowersMap => {
        if (move.move.length === 2) {
            return this.makeMandatoryMoveStep(move, true)
        }
        const firstStepProps = {...move, move: move.move.slice(0, 2)}
        const nextMoveProps = {
            ...move,
            move: move.move.slice(1),
            startPosition: this.makeMandatoryMoveStep(firstStepProps, true),
            takenPieces: move.takenPieces?.slice(1)
        }
        return this.makeMandatoryMove(nextMoveProps)
    }

    makeMandatoryMoveStep = (move: StepMProps, last= false): TowersMap => {
        if (this.GV !== 'towers') {
            return this.makeDraughtMandatoryMoveStep(move, last)
        }
        const _towers = copyObj(move.startPosition!)
        const [from, to] = [move.move[0], move.move[1]]
        const tower = _towers[from]
        tower.onBoardPosition = to
        const takenPiece = move.takenPieces![0]
        const newMiddleTower = this.captureTower(_towers[takenPiece])
        if (this.GV === 'towers') {
            if (tower.currentColor === PieceColor.w) {
                tower.bPiecesQuantity! += 1
            } else {
                tower.wPiecesQuantity! += 1
            }
        }
        delete _towers[from]
        if (!newMiddleTower) {
            delete _towers[takenPiece]
        } else {
            _towers[takenPiece] = newMiddleTower
        }
        tower.currentType = this.checkTowerTypeChanging(to, tower.currentColor, tower.currentType)
        _towers[to] = tower as TowerConstructor
        return _towers
    }

    makeDraughtMandatoryMoveStep = (move: StepMProps, last= false): TowersMap => {
        const _towers = copyObj(move.startPosition!)
        const [from, to] = move.move
        const tower = copyObj(_towers[from]) as TowerConstructor
        tower.onBoardPosition = to
        const takenPiece = move.takenPieces![0]
        delete _towers[from]
        delete _towers[takenPiece]
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, tower.currentColor, tower.currentType)
        }
        _towers[to] = tower
        return _towers
    }
}

export class KingMandatoryMoveResolver extends MoveResolveCommons {

    lookForKingMoves(key: string, towers: TowersMap): ITotalMoves {
        let mandatory = [] as FullMRResult[]
        let free = [] as FreeMRResult[]
        const cell = this.board[key]
        const neighborKeys = Object.keys(cell.neighbors)
        for (let dir of neighborKeys) {
            const diagonal = this.getDiagonal(dir, key)
            if (diagonal.length < 3 || (diagonal.length === 3 && towers[diagonal[2].boardKey])) {
                if (diagonal.length === 2 && !towers[diagonal[1].boardKey]) {
                    const move = [diagonal[0].boardKey, diagonal[1].boardKey]
                    free.push({move, startPosition: towers})
                }
                continue
            }
            const moves = this.checkFirstKingDiagonal(dir, diagonal, towers)
            if (moves.free?.length) {
                free = free.concat(moves.free)
            }
            if (moves.mandatory?.length) {
                mandatory = mandatory.concat(moves.mandatory)
            }
        }
        if (mandatory.length) {
            mandatory = this.lookForKingMandatoryMoves(mandatory)
        }
        return {mandatory, free}
    }

    lookForKingMandatoryMoves(props: FullMRResult[]): FullMRResult[] {
        let completed = [] as FullMRResult[]
        const minLength = props.slice(-1)[0].move.length
        let extraMove = false
        for (let move of props) {
            if (move.completed) { continue }
            const moves = this.separateCompleted(this.lookForKingMandatoryDiagonals(move))
            completed = completed.concat(moves.completed)
            if (moves.toCheck.length) {
                extraMove = true
                completed = completed.concat(this.lookForKingMandatoryMoves(moves.toCheck))
            }
        }
        if (this.separateCompleted(completed).toCheck.length) {
            console.error('incorrect result')
        }
        return !extraMove
            ? completed
            : completed.filter(m => m.move.length >= minLength + 1)
    }

    checkFirstKingDiagonal(dir: string, diag: BoardCell[], towers: TowersMap): ITotalMoves {
        const startCellKey = diag[0].boardKey
        const color = towers[startCellKey].currentColor
        const firstMoveProps: FullMRResult = {
            move: [startCellKey],
            startPosition: towers,
            lastStepDirection: dir,
            endPosition: towers,
            takenPieces: [],
            minLength: 1
        }
        let mandatory = [] as FullMRResult[], free = [] as FreeMRResult[],  i = 2
        let cellKey = diag[1].boardKey
        while (i < diag.length) {
            const prevTower = towers[cellKey]
            const nextCellKey  = diag[i].boardKey
            const nextTower = towers[nextCellKey]
            if (prevTower?.currentColor === color || (prevTower && nextTower)) {
                return {free, mandatory}
            }
            if (prevTower && (prevTower?.currentColor !== color) && !nextTower) {
                mandatory = mandatory.length
                    ? this.addKingMandatoryStepToResult(mandatory, nextCellKey, dir, cellKey)
                    : this.addFirstMandatoryStep(firstMoveProps, dir, cellKey, nextCellKey)
            }
            if (i === 2 && !prevTower) {
                free.push({move: [startCellKey, cellKey], startPosition: towers})
            }
            if (!prevTower && !nextTower) {
                if (!mandatory.length ) {
                    free.push({move: [startCellKey, nextCellKey], startPosition: towers})
                } else {
                    mandatory = this.addKingMandatoryStepToResult(mandatory, nextCellKey, dir)
                }
            }
            i++
            cellKey = nextCellKey
        }
        return {free, mandatory}
    }

    looKForNewBornKingMoves(props: FullMRResult) {
        let result = new KingDiagsRes(props)
        const {move, lastStepDirection} = props
        const cellKey = move.slice(-1)[0]
        const neighbors = this.board[cellKey].neighbors
        const dir = Object.keys(neighbors).filter(k => k !== oppositeDirection(lastStepDirection))[0]
        const diag = this.getDiagonal(dir, cellKey)
        const moves = this.separateCompleted(this.checkKingDiagonal(diag, props, dir))
        result.add(moves.completed)
        if (moves.toCheck.length) {
            result.add(this.lookForKingMandatoryMoves(moves.toCheck))
        }
        return result.get()
    }

    lookForKingMandatoryDiagonals(props: FullMRResult, excludeDirection = true): FullMRResult[] {
        let result = new KingDiagsRes(props)
        const {move, lastStepDirection} = props
        const cellKey = move[move.length - 1]
        const neighbors = this.board[cellKey].neighbors
        const neighborKeys = Object.keys(neighbors)
        if (neighborKeys.length === 1) {
            result.add(this.checkIfMoveValidlyCompleted(props))
        }
        for (let dir of neighborKeys) {
            if (dir === oppositeDirection(lastStepDirection!)
                || (excludeDirection && dir === lastStepDirection)) { continue }
            const diag = this.getDiagonal(dir, cellKey)
            const moves = this.checkKingDiagonal(diag, props, dir)
            if (!moves.length) { continue }
            result.add(moves)
        }
        return result.get()
    }

    changeTowerPosition(from: string, to: string, towers: TowersMap): TowersMap {
        const _towers = copyObj(towers)
        const tower = _towers[from]
        tower.onBoardPosition = to
        _towers[to] = tower
        delete _towers[from]
        return _towers
    }

    separateCompleted(moves: FullMRResult[]): {completed: FullMRResult[], toCheck: FullMRResult[]} {
        return moves.reduce((acc, m) => {
            if (m.move) {
                if (m.completed) {
                    acc.completed.push(m)
                } else {
                    acc.toCheck.push(m)
                }
            }
            return acc
        }, {completed: [], toCheck: []} as {completed: FullMRResult[], toCheck: FullMRResult[]})
    }

    checkIfMoveValidlyCompleted(move: FullMRResult): FullMRResult[] {
        if (!move.minLength) {console.error('no min length'); return [] as FullMRResult[]}
        if (move.move.length >= move.minLength) {
            move.completed = true
            return [move]
        }
        return [] as FullMRResult[]
    }

    checkKingDiagonal(diag: BoardCell[], prevMove: FullMRResult, dir: string): FullMRResult[] {
        if (diag.length < 3) {
            return this.checkIfMoveValidlyCompleted(prevMove)
        }
        let result = [] as FullMRResult[]
        const {endPosition: towers, takenPieces} = prevMove
        const startCellKey = diag[0].boardKey
        const color = towers![startCellKey].currentColor
        let i = 2
        let secondCellKey = diag[1].boardKey
        while (i < diag.length) {
            const prevTower = towers![secondCellKey]
            const nextCelKey  = diag[i].boardKey
            const tower = towers![nextCelKey]
            if (prevTower?.currentColor === color
                || (prevTower && tower)
                || takenPieces.includes(secondCellKey)
                || takenPieces.includes(nextCelKey)) {
                return result.length ? result : this.checkIfMoveValidlyCompleted(prevMove)
            }
            if (prevTower && prevTower?.currentColor !== color && !tower) {
                result = result.length
                    ? this.addKingMandatoryStepToResult(result, nextCelKey, dir, secondCellKey)
                    : this.addFirstMandatoryStep(prevMove, dir, secondCellKey, nextCelKey)
            } else if (result.length && !prevTower && !tower) {
                result = this.addKingMandatoryStepToResult(result, nextCelKey, dir)
            }
            i++
            secondCellKey = nextCelKey
        }
        return result.length ? result : this.checkIfMoveValidlyCompleted(prevMove)
    }

    addFirstMandatoryStep(prevMove: FullMRResult, dir: string, taken: string, to: string) {
        const {move, endPosition, startPosition, takenPieces} = prevMove
        const _move = move.concat(to)
        const stepPositionProps: StepMProps = {
            move: _move.slice(-2),
            startPosition: endPosition,
            takenPieces: [taken]
        }
        return [{
            move: _move,
            takenPieces: takenPieces.concat(taken),
            endPosition: this.makeMandatoryMoveStep(stepPositionProps),
            lastStepDirection: dir,
            minLength: _move.length,
            startPosition: startPosition
        }]
    }

    addKingMandatoryStepToResult(moves: FullMRResult[], nextStep: string, dir: string, takenPiece?: string): FullMRResult[] {
        let result: FullMRResult[]
        if (takenPiece) {
            result = this.addKingStepWithTaken(this.sortMoves(moves), nextStep, dir, takenPiece)
        } else {
            result = this.addKingStepWithoutTaken(this.softSortMoves(moves), nextStep, dir)
        }
        return result
    }

    addKingStepWithoutTaken(sortedMoves: FullMRResult[], nextStep: string, direction: string): FullMRResult[] {
        const maxLMove = Object.assign({}, sortedMoves[0])
        const move = maxLMove.move.slice(0, -1).concat(nextStep)
        const prevPos = maxLMove.move.slice(-1)[0]
        const endPosition = this.changeTowerPosition(prevPos, nextStep, maxLMove.endPosition!)
        sortedMoves.push(Object.assign(maxLMove ,{
            move,
            endPosition,
            lastStepDirection: direction
        }))
        return  sortedMoves
    }

    addKingStepWithTaken(sortedMoves: ISortedMoves, nextStep: string, dir: string, takenPiece: string): FullMRResult[] {
        const {maxLengthMoves, restMoves} = sortedMoves
        maxLengthMoves.forEach(m => {
            const move = m.move.concat(nextStep)
            const propsToNextPosition = {
                move: move.slice(-2),
                startPosition: m.endPosition,
                takenPieces: [takenPiece]
            }
            restMoves.push({
                move: m.move,
                endPosition: m.endPosition,
                takenPieces: m.takenPieces,
                minLength: m.move.length + 1,
                lastStepDirection: dir,
                startPosition: m.startPosition
            })
            restMoves.push({
                move,
                endPosition: this.makeMandatoryMoveStep(propsToNextPosition, true),
                takenPieces: m.takenPieces?.concat(takenPiece),
                minLength: move.length,
                lastStepDirection: dir,
                startPosition: m.startPosition
            })
        })
        return  restMoves
    }

    softSortMoves(props: FullMRResult[]): FullMRResult[] {
        return props.reduceRight((acc , move) => {
            const maxMoveLength = (acc[0] && acc[0].move.length) || 2
            if (move.move.length >= maxMoveLength) {
                acc.unshift(move)
            } else {
                acc.push(move)
            }
            return acc
        }, [] as FullMRResult[])
    }

    sortMoves(props: FullMRResult[]): ISortedMoves {
       return props.reduceRight((acc , move) => {
            const moveLength = move.move.length
            if (moveLength < acc.maxLength!) {
                acc.restMoves.push(move)
            } else if (moveLength === acc.maxLength!) {
                acc.maxLengthMoves.push(move)
            } else {
                acc.restMoves = acc.restMoves.concat(acc.maxLengthMoves)
                acc.maxLengthMoves.length = 0
                acc.maxLengthMoves.push(move)
                acc.maxLength = moveLength
            }
            return acc
        }, {maxLength: 2, maxLengthMoves: [], restMoves: []} as ISortedMoves)
    }
}

export class MovesResolver extends KingMandatoryMoveResolver {

    getTowerMove(towers: TowersMap, key: string): ITotalMoves {
        return towers[key].currentType === TowerType.k
            ? this.lookForKingMoves(key, towers)
            : this.lookForManMoves(key, towers)
    }

    getMovesResultFromTotalMoves(props: ITotalMoves): MMRResult[] {
        const {mandatory = [], free = []} = props
            return mandatory.length
            ? mandatory.map(m => ({
                move: m.move,
                endPosition: m.endPosition,
                takenPieces: m.takenPieces
            }))
            : free.map(m => ({
                move: m.move,
                endPosition: this.makeMove(m)
            }))
    }

    getPositionMoves(towers: TowersMap, pieceOrder: PieceColor): ITotalMoves {
        let mandatory = [] as FullMRResult[], free = [] as FreeMRResult[]
        const towerKeys = Object.keys(towers)
        for (let key of towerKeys) {
            if (towers[key].currentColor !== pieceOrder) {
                continue
            }
            const {mandatory: mm = [], free: fm = []} = this.getTowerMove(towers, key)
            mandatory = mandatory.concat(mm)
            free = free.concat(fm)
        }
        return {free, mandatory}
    }

    getPositionDataWithoutValue(towers: TowersMap, pieceOrder: PieceColor): Partial<IBoard> {
        return {
            moves: this.getMovesResultFromTotalMoves(this.getPositionMoves(towers, pieceOrder)),
            towers
        }
    }

    getMovesFromTotalMoves(props: ITotalMoves): Move[] {
        return props.mandatory?.length
            ? props.mandatory.map(m => ({
                move: m.move.join(':'),
                position: m.endPosition,
                takenPieces: m.takenPieces
            }))
            : props.free!.map(m => ({
                move: m.move.join('-'),
                position: this.makeMove(m)
            }))
    }

    lookForTotalMoves(towers: TowersMap, color: PieceColor): ITotalMoves {
        let mandatory = [] as FullMRResult[], free = [] as FreeMRResult[], moves = {} as ITotalMoves
        const towerKeys = Object.keys(towers)
        for (let key of towerKeys) {
            if (towers[key].currentColor !== color) {
                continue
            }
            if (towers[key].currentType === TowerType.k) {
                moves = this.lookForKingMoves(key, towers)
            } else {
                moves = this.lookForManMoves(key, towers)
            }
            mandatory = moves.mandatory?.length ? mandatory.concat(moves.mandatory) : mandatory
            free = moves.free?.length ? free.concat(moves.free) : free
        }
        return {mandatory, free}
    }

    lookForManMoves(key: string, towers: TowersMap): ITotalMoves {
        let mandatory = [] as FullMRResult[]
        const free = [] as FreeMRResult[]
        const color = towers[key].currentColor
        const cell = this.board[key]
        const directions = Object.keys(cell.neighbors)
        for (let dir of directions) {
            const neighborCellKey = cell.neighbors[dir]
            const neighborTower = towers[neighborCellKey]
            if (!neighborTower && this.noManMoveRestrictions(color, key, neighborCellKey)) {
                free.push({move: [key, neighborCellKey], startPosition: towers})
            }
            if (neighborTower && neighborTower.currentColor !== color) {
                const nextCellKey = this.board[neighborCellKey].neighbors[dir]
                if (nextCellKey && !towers[nextCellKey]) {
                    const propsToNextPosition = {
                        move: [key, nextCellKey],
                        startPosition: towers,
                        takenPieces: [neighborCellKey]
                    }
                    const _towers = this.makeMandatoryMoveStep(propsToNextPosition)
                    const props: FullMRResult = {
                        move: [key, nextCellKey],
                        endPosition: _towers,
                        startPosition: towers,
                        lastStepDirection: dir,
                        takenPieces: [neighborCellKey],
                        minLength: 2
                    }
                    const moves = this.lookForManMandatoryDirections(props)
                    free.length = 0
                    mandatory = mandatory.concat(moves)
                    break
                }
            }
        }
        return mandatory.length ? {mandatory} : {free}
    }

    makeMove(props: FullMRResult | FreeMRResult) {
        const {takenPieces, move, startPosition} = props as FullMRResult
        return !takenPieces
            ? this.makeFreeMove(move[0], move[1], startPosition)
            : this.makeMandatoryMove({move, startPosition, takenPieces})
    }

    lookForManMandatoryDirections(props: FullMRResult): FullMRResult[] {
        let mandatory = [] as FullMRResult[]
        const {move, endPosition: towers, lastStepDirection, takenPieces} = props
        const cellKey = move[move.length - 1]
        const tower = towers![cellKey]
        if (tower.currentType === TowerType.k) {
            return this.looKForNewBornKingMoves({...props, minLength: props.move.length})
        }
        const color = tower.currentColor
        const cell = this.board[cellKey]
        const neighborKeys = Object.keys(cell.neighbors)
        for (let dir of neighborKeys) {
            if (dir === oppositeDirection(lastStepDirection!)) { continue }
            const neighborCellKey = cell.neighbors[dir]
            const nextTower = towers![neighborCellKey]
            if (nextTower && nextTower.currentColor !== color && !takenPieces?.includes(neighborCellKey)) {
                const nextCellKey = this.board[neighborCellKey].neighbors[dir]
                if (nextCellKey && !towers![nextCellKey]) {
                    const _move = move.concat(nextCellKey)
                    const propsToNewPosition = {
                        move: _move.slice(-2),
                        startPosition: towers,
                        takenPieces: [neighborCellKey]
                    }
                    const nextStep = {
                        move: _move,
                        endPosition: this.makeMandatoryMoveStep(propsToNewPosition, true),
                        lastStepDirection: dir,
                        takenPieces: takenPieces.concat(neighborCellKey),
                        startPosition: props.startPosition,
                        minLength: _move.length
                    }
                    mandatory = mandatory.concat(nextStep)
                }
            }
        }
        return !mandatory.length
            ? [Object.assign(Object.assign({}, props), {completed: true})]
            : this.lookForManMandatoryNextStep(mandatory)
    }

    lookForManMandatoryNextStep(props: FullMRResult[]): FullMRResult[] {
        let result = [] as FullMRResult[]
        for (let move of props) {
            if (move.completed) {
                result.push(move)
                continue
            }
            // console.warn('pros2', move)
            const moves = this.separateCompleted(this.lookForManMandatoryDirections(move))
            result = result.concat(moves.completed)
            if (moves.toCheck.length) {
                result = result.concat(this.lookForManMandatoryNextStep([move]))
            }
        }
        return result
    }
}

export default new MovesResolver()
