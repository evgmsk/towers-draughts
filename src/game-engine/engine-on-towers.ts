import {BaseBoardSize, CellTowerRatio} from "../constants/gameConstants";
import {
    BoardCell,
    CellsMap,
    Diagonals,
    GameVariants,
    IBoard,
    IBoardOptions,
    IGameState,
    IMoveOrder,
    IMoveToMake,
    ISortedMoves,
    ITotalMoves,
    ITowerPosition,
    StepMProps,
    FullMRResult,
    PieceColor,
    TowerConstructor,
    TowersMap,
    TowerTouched,
    TowerType, FreeMRResult
} from "../store/models"
import {copyObj, crossDirections, getCellSize, oppositeColor, oppositeDirection} from "./gameplay-helper-functions";
import {createBoardWithoutDraughts, updateCellsMap} from "./prestart-help-function-constants";


export class BaseMoveResolver {
    GV: GameVariants = 'towers'
    size: number = BaseBoardSize
    board = createBoardWithoutDraughts(this.size)
    setProps = (props: {GV: GameVariants, size: number}) => {
        this.GV = props.GV
        this.size = props.size
        this.board = createBoardWithoutDraughts(props.size)
    }

    checkTowerTypeChanging(to: string, boardSize: number, color: PieceColor, type: TowerType): TowerType {
        if ((parseInt(to.slice(1)) === boardSize && color === PieceColor.w)
            || (parseInt(to.slice(1)) === 1 && color === PieceColor.b)) {
            return TowerType.k
        }
        return type
    }

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

    getDiagonals(cell: string, preDirected = ''): Diagonals {
        const neighbors = this.board[cell]!.neighbors
        const diagonals = {} as Diagonals
        const availableDirections = (d: string) => (!!preDirected ? crossDirections(preDirected)[d] : true)
        Object.keys(neighbors).filter((d: string) => availableDirections(d)).forEach((dir: string) => {
            diagonals[dir] = this.getDiagonal(dir, cell)
        })
        return diagonals
    }

    captureTower = (tower: TowerConstructor): TowerConstructor | null => {
        if (this.GV !== 'towers') {
            return null as unknown as TowerConstructor
        }
        const {currentColor, bPiecesQuantity, wPiecesQuantity} = tower
        const white = currentColor === PieceColor.w
        const newTower = {
            ...tower,
            currentType: TowerType.m,
            wPiecesQuantity: white ? (wPiecesQuantity as number) - 1 : wPiecesQuantity,
            bPiecesQuantity: white ? bPiecesQuantity : (bPiecesQuantity as number) - 1,
        }
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

    noManMoveRestrictions(color: PieceColor, key: string, targetKey: string) {
        return color === PieceColor.w
            ? parseInt(key.slice(1)) < parseInt(targetKey.slice(1))
            : parseInt(key.slice(1)) > parseInt(targetKey.slice(1))
    }

    checkNeighborsIsEmpty(key: string, towers: TowersMap, color: PieceColor): string[] {
        return Object.keys(this.board[key].neighbors).reduce((acc: string[], nKey: string) => {
            const targetCellKey = this.board[key].neighbors[nKey]
            return !towers[targetCellKey] && this.noManMoveRestrictions(color, key, targetCellKey)
                ? acc.concat(`${key}-${targetCellKey}`)
                : acc
        }, [])
    }

    lookForTowerFreeMoves = (boardKey: string, towers: TowersMap, color: PieceColor): string[] => {
        const tower = towers[boardKey]
        if (tower!.currentType === TowerType.m) {
            return this.checkNeighborsIsEmpty(boardKey, towers, color)
        } else {
            return this.lookForKingFreeMoves(boardKey, towers)
        }
    }

    lookForAllFreeMoves = (color: PieceColor, towers: TowersMap): string[] => {
        let result: string[] = []
        for (let key of Object.keys(towers)) {
            const tower = towers[key]
            if (tower.currentColor !== color) {
                continue
            }
            const moves = this.lookForTowerFreeMoves(key, towers, color)
            if (moves.length) {
                result = result.concat(moves)
            }
        }
        return result
    }

    getNewOrder = (props: Partial<IGameState>): IMoveOrder => {
        const newPieceOrder = oppositeColor(props.moveOrder!.pieceOrder)
        return {
            pieceOrder:  newPieceOrder,
            playerTurn: props[newPieceOrder]!.name,
        }
    }

    getPropsToMakeFreeMove = (from: string, to: string, props: {[key: string]: any}): IMoveToMake => {
        const newPieceOrder = oppositeColor(props.moveOrder!.pieceOrder)
        const moveOrder = {
            pieceOrder:  newPieceOrder,
            playerTurn: props[newPieceOrder]!.name,
        }
        const position = this.makeFreeMove(from, to, props.currentPosition!)
        return {moveOrder, moveToMake: {move: `${from}-${to}`, position: position}}
    }

    makeFreeMove(from: string, to: string, _towers: TowersMap): TowersMap {
        const towers = copyObj(_towers)
        if (!towers[from]) {
            console.error('makeFreeMove invalid props', from, to, towers)
        }
        const tower = towers[from]
        const boardSize = this.GV === 'international' ? 10 : 8
        tower.currentType = this.checkTowerTypeChanging(to, boardSize, tower.currentColor, tower.currentType)
        towers[to] = tower
        delete towers[from]
        return towers
    }

    checkDiagonalForFreeKingMove(diag: BoardCell[], towers: TowersMap) {
        const startCellKey = diag[0].boardKey
        const moves = [] as string[]
        for (let cell of diag.slice(1)) {
            if (towers[cell.boardKey]) return moves
            moves.push(`${startCellKey}-${cell.boardKey}`)
        }
        return moves
    }

    // manTowerFreeMoves = (tower: TowerConstructor, towers: TowersMap, cellsMap: CellsMap) => {
    //     const key = tower.onBoardPosition
    //     const color = tower.currentColor
    //     const possibleMoves =  {} as CellsMap
    //     const cellNeighbors = this.board[key].neighbors
    //     Object.keys(cellNeighbors!).forEach((k: string) => {
    //         const targetKey = cellNeighbors[k]
    //         if (!towers[targetKey] && this.noManMoveRestrictions(color, key, targetKey)) {
    //             possibleMoves[targetKey] = cellsMap[targetKey] as ITowerPosition
    //         }
    //     })
    //     return possibleMoves
    // }

    checkLastLine(to: string, whiteMove: boolean): boolean {
        const currentLine = parseInt(to.slice(1))
        return (whiteMove && currentLine === this.size) || (!whiteMove && currentLine === 0)
    }

    lookForKingFreeMoves(cellKey: string, towers: TowersMap): string[] {
        const diagonals = this.getDiagonals(cellKey)
        let moves = [] as string[]
        Object.keys(diagonals).forEach((key: string) => {
            const diag = diagonals[key]
            moves = moves.concat(this.checkDiagonalForFreeKingMove(diag, towers))
        })
        return moves
    }

    kingTowerFreeMoves = (key: string, towers: TowersMap, cellsMap: CellsMap): CellsMap => {
        const moves = this.lookForKingFreeMoves(key, towers)
        const possibleMoves = {} as CellsMap
        moves.forEach((m: string) => {
            const moveSteps = m.split('-')
            const cellKey = moveSteps[moveSteps.length - 1]
            possibleMoves[cellKey] = cellsMap[cellKey] as ITowerPosition
        })
        return possibleMoves
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

    makeMandatoryMoveStep = (move: StepMProps, last=false): TowersMap => {
        if (this.GV !== 'towers') {
            return this.makeDraughtMandatoryMoveStep(move, last)
        }
        const _towers = copyObj(move.startPosition!)
        const [from, to] = [move.move[0], move.move[1]]
        // console.warn('make', move)
        const tower = copyObj(_towers[from]) as TowerConstructor
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
        tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
        _towers[to] = tower as TowerConstructor
        // console.warn('towers', _towers)
        return _towers
    }

    makeDraughtMandatoryMoveStep = (move: StepMProps, last=false): TowersMap => {
        const _towers = copyObj(move.startPosition!)
        const [from, to] = [move.move[0], move.move[1]]
        const tower = copyObj(_towers[from]) as TowerConstructor
        tower.onBoardPosition = to
        const takenPiece = move.takenPieces![0]
        delete _towers[from]
        delete _towers[takenPiece]
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
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
            console.warn('first moves', mandatory.map(m => m.move.join(':')))
            mandatory = this.lookForKingMandatoryMoves(mandatory)
        }
        return {mandatory, free}
    }

    lookForKingMandatoryMoves(props: FullMRResult[]): FullMRResult[] {
        // console.warn('move cont', props, props.map(m => m.move.join(':')))
        let result = new Set<FullMRResult>()
        for (let move of props) {
            if (move.completed) { continue }
            const moves = this.separateCompleted(this.lookForKingMandatoryDiagonals(move))
            // console.warn('move cont2', unsepMoves.map(m => m.move.join(':')))
            if (moves.completed.length) {
                moves.completed.forEach(m => result.add(m))
            }
            if (moves.toCheck.length) {
                this.lookForKingMandatoryMoves(moves.toCheck).forEach(m => result.add(m))
            }
        }
        if (this.separateCompleted([...result]).toCheck.length) {
            console.error('incorrect result')
        }
        return [...result]
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
                free.length = 0
                mandatory = mandatory.length
                    ? this.addKingMandatoryStepToResult(mandatory, nextCellKey, dir, cellKey)
                    : this.addFirstMandatoryStep(firstMoveProps, dir, cellKey, nextCellKey)
            }
            if (!prevTower && !nextTower) {
                if (i === 2) {
                    free.push({move: [startCellKey, cellKey], startPosition: towers})
                }
                if (!mandatory.length) {
                    free.push({move: [startCellKey, nextCellKey], startPosition: towers})
                } else {
                    mandatory = this.addKingMandatoryStepToResult(mandatory, nextCellKey, dir)
                }
            }
            i++
            cellKey = nextCellKey
        }
        return free.length ? {free} : {mandatory}
    }

    lookForKingMandatoryDiagonals(props: FullMRResult, excludeDirection = true): FullMRResult[] {
        let result = new Set<FullMRResult>()
        const {move, lastStepDirection} = props
        const cellKey = move[move.length - 1]
        const neighbors = this.board[cellKey].neighbors
        const neighborKeys = Object.keys(neighbors)
        // console.warn('look diagonals', props, cellKey, neighborKeys, JSON.stringify(result))
        for (let dir of neighborKeys) {
            if (dir === oppositeDirection(lastStepDirection!)
                || excludeDirection && dir === lastStepDirection) { continue }
            const diag = this.getDiagonal(dir, cellKey)
            const moves = this.checkKingDiagonal(diag, props, dir)
            if (!moves.length) { continue }
            const separated = this.separateCompleted(moves)
            separated.completed.forEach(m => result.add(m))
            this.lookForKingMandatoryMoves(separated.toCheck).forEach(m => result.add(m))
        }
        return result.size ? Array.from(new Set(result)) : this.checkIfMoveValidlyCompleted(props)
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
        // console.warn('check diagonal', diag, prevMove)
        const startCellKey = diag[0].boardKey
        const color = towers![startCellKey].currentColor
        let i = 2
        let secondCellKey = diag[1].boardKey
        while (i < diag.length) {
            const prevTower = towers![secondCellKey]
            const nextCelKey  = diag[i].boardKey
            const tower = towers![nextCelKey]
            if (prevTower?.currentColor === color || (prevTower && tower)) {
                return result.length ? result : this.checkIfMoveValidlyCompleted(prevMove)
            }
            const conditionForMove = prevTower
                && prevTower?.currentColor !== color
                && !tower
                && !takenPieces.includes(secondCellKey)
                && !takenPieces.includes(nextCelKey)
            if (conditionForMove) {
                result = result.length
                    ? this.addKingMandatoryStepToResult(result, nextCelKey, dir)
                    : this.addFirstMandatoryStep(prevMove, dir, secondCellKey, nextCelKey)
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
        const sortedMoves = this.sortMoves(moves)
        if (takenPiece) {
            result = this.addKingStepWithTaken(sortedMoves, nextStep, dir, takenPiece)
        } else {
            result = this.addKingStepWithoutTaken(sortedMoves, nextStep, dir)
        }
        return result
    }

    addKingStepWithoutTaken(sortedMoves: ISortedMoves, nextStep: string, direction: string): FullMRResult[] {
        let {maxLengthMoves, restMoves} = sortedMoves
        const maxLMove = Object.assign({}, maxLengthMoves[0])
        const move = maxLMove.move.slice(0, -1).concat(nextStep)
        restMoves = restMoves.concat(maxLengthMoves)
        const prevPos = maxLMove.move.slice(-1)[0]
        const endPosition = this.changeTowerPosition(prevPos, nextStep, maxLMove.endPosition!)
        restMoves.push(Object.assign(maxLMove ,{
            move,
            endPosition,
            lastStepDirection: direction
        }))
        return  restMoves
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
        // console.warn('add', maxLengthMoves, nextStep, takenPiece, restMoves)
        return  restMoves
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

export class MandatoryMovesResolver extends KingMandatoryMoveResolver {

    lookForTotalMoves(towers: TowersMap, color: PieceColor): ITotalMoves {
        const towerKeys = Object.keys(towers)
        let mandatory = [] as FullMRResult[]
        let free = [] as FreeMRResult[]
        for (let key of towerKeys) {
            const {currentType, currentColor} = towers[key]
            if (currentColor !== color) {
                continue
            }
            if (currentType === TowerType.k) {
                const moves = this.lookForKingMoves(key, towers)
                if (moves.mandatory?.length) {
                    mandatory = mandatory.concat(moves.mandatory)
                }
                if (moves.free?.length) {
                    free = free.concat(moves.free)
                }
            } else {
                const moves = this.lookForManMoves(key, towers)
                if (moves.mandatory?.length) {
                    mandatory = mandatory.concat(moves.mandatory)
                }
                if (moves.free?.length) {
                    free = free.concat(moves.free)
                }
            }
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

    lookForManMandatoryDirections(props: FullMRResult): FullMRResult[] {
        let mandatory = [] as FullMRResult[]
        const {move, endPosition: towers, lastStepDirection, takenPieces} = props
        const cellKey = move[move.length - 1]
        const tower = towers![cellKey]
        if (tower.currentType === TowerType.k) {
            return this.lookForKingMandatoryDiagonals({...props, minLength: props.move.length})
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
                        startPosition: copyObj(towers),
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
            const moves = this.lookForManMandatoryDirections(move)
            if (moves.length === 1 && moves[0].completed) {
                result = result.concat(moves)
            } else {
                result = result.concat(this.lookForManMandatoryNextStep([move]))
            }
        }
        return result
    }
}

export default new MandatoryMovesResolver()

export class TowersUpdateResolver extends BaseMoveResolver {
    callBack: Function = () => {}

    setCallBack = (cb: Function) => {
        this.callBack = cb
    }

    animateTowerRelocation(from: string, to: string, board: Partial<IBoard>, reversed: boolean) {
        const {cellSize, cellsMap} = board
        const towers = copyObj(board.towers!) as TowersMap
        const tower = towers[from] as TowerConstructor
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap!, cellSize!, reversed)
        towers[from] = tower
        this.callBack({towers})
    }

    finalizeSimpleMove(from: string, to: string, board: Partial<IBoard>, reversed = false) {
        const {cellSize, cellsMap} = board
        const towers = copyObj(board.towers!) as TowersMap
        const tower = towers[from] as TowerConstructor
        tower.onBoardPosition = to
        tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap!, cellSize!, reversed)
        towers[to] = tower
        delete towers[from]
        const towerTouched = null as unknown as TowerTouched
        const lastMoveSquares = [from, to]
        this.callBack({towers, towerTouched, lastMoveSquares, mouseDown: false, moveDone: true})
    }

    finalizeMandatoryMoveStep(from: string, to: string, board: Partial<IBoard>, reversed = false, last = false) {
        const towers = copyObj(board.towers!) as TowersMap
        const {cellSize, cellsMap} = board
        const tower = towers[from] as TowerConstructor
        tower.onBoardPosition = to
        if (this.GV === 'towers') {
            if (tower!.currentColor === PieceColor.w) {
                tower.bPiecesQuantity = (tower.bPiecesQuantity as number) + 1
            } else {
                tower.wPiecesQuantity = (tower.wPiecesQuantity as number) + 1
            }
        }
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
        }
        tower.positionInDOM = this.calcTowerPosition(to, cellsMap!, cellSize!, reversed)
        towers[to] = tower
        delete towers[from]
        // console.log(tower)
        return towers
    }

    updateTowersOnMandatoryMoveStep(from: string, to: string, state: IBoard, tP: string[], last=false) {
        const isTowers = this.GV === 'towers'
        const towers = this.updateTowersAfterMoveAnimation(from, to, state, isTowers, last)
        if (isTowers) {
            const middlePieceKey = tP[0]
            const middlePiece = towers[middlePieceKey] as TowerConstructor
            const takenTower = this.captureTower(middlePiece) as TowerConstructor
            if (!takenTower) {
                delete towers[middlePieceKey]
            } else {
                towers[middlePieceKey] = takenTower
            }
            return towers
        } else if (last) {
            tP.forEach((key: string) => {
                delete towers[key]
            })
            return towers
        }
        return towers
    }

    updateMiddleTowerOnOpponentMove(key: string, state: IBoard, _towers: TowersMap) {
        const towers = copyObj(state.towers) as TowersMap
        const takenTower = _towers[key] as TowerConstructor
        if (takenTower) {
            towers[key] = takenTower
        } else {
            delete towers[key]
        }
        // console.log('middle update', key, towers, board, takenTower)
        return towers
    }

    updateTowersAfterMoveAnimation(from: string, to: string, board: IBoard, wT= false, last= false): TowersMap {
        const {cellSize, cellsMap} = board
        const towers = copyObj(board.towers!) as TowersMap
        const tower = towers[from] as TowerConstructor
        if (wT) {
            if (tower!.currentColor === PieceColor.w) {
                tower.bPiecesQuantity = (tower.bPiecesQuantity as number) + 1
            } else {
                tower.wPiecesQuantity = (tower.wPiecesQuantity as number) + 1
            }
        }
        tower!.onBoardPosition = to
        tower!.positionInDOM = this.calcTowerPosition(to, cellsMap!, cellSize!)
        if (this.GV !== 'international' || last) {
            tower.currentType = this.checkTowerTypeChanging(to, this.size, tower.currentColor, tower.currentType)
        }
        towers[to] = tower
        delete towers[from]
        return towers
    }

    animateRivalTowerMove(from: string, to: string, state: IBoard) {
        const {cellsMap, cellSize} = state
        const towers = copyObj(state.towers)
        const opponentTower = towers.get(from) as TowerConstructor
        opponentTower.positionInDOM = this.calcTowerPosition(to, cellsMap, cellSize)
        return {...state, towers}
    }

    calcPositionOutboardTowers = (key: string, cellSize: number, reversed: boolean) => {
        const boardElem = document.querySelector('.board__body')
        const boardHeight = Math.round(boardElem!.getBoundingClientRect().height)
        const towerWidth = CellTowerRatio * cellSize
        const dY = Math.round(cellSize / 2 - towerWidth / 2)
        const bottom = Math.round(boardHeight - cellSize / 2 - towerWidth / 2)
        const x = Math.round(-5 - cellSize + dY)
        return (reversed && key.includes('oB')) || (!reversed && key.includes('oW'))
            ? {x, y: bottom}
            : {x, y: dY}
    }

    calcTowerPosition = (key: string, map: CellsMap, cellSize: number, reversed = false): ITowerPosition => {
        if (key.includes('oB') || key.includes('oW')) {
            return this.calcPositionOutboardTowers(key, cellSize, reversed) as ITowerPosition
        }
        const cellPosition = map[key] as ITowerPosition
        if (!cellPosition) return  {x: 0, y: 0}
        const {x, y} = cellPosition
        const towerElem = document.querySelector('.checker-tower')
        if (!towerElem) {
            console.error(towerElem)
        }
        const {width} = towerElem!.getBoundingClientRect()
        return {x: Math.round(x - width / 2 + cellSize / 2), y: Math.round(y - width / 2  + cellSize/2)}
    }

    cancelTowerTransition(props: IBoard & {reversed?: boolean}) {
        const {key} = props.towerTouched as TowerTouched
        const {cellSize, cellsMap, reversed = false} = props
        const towers = copyObj(props.towers) as TowersMap
        const tower = towers[key] as TowerConstructor
        tower.positionInDOM = this.calcTowerPosition(key, cellsMap, cellSize, reversed)
        towers[key] = tower
        this.callBack({...props, towers, towerTouched: null as unknown as TowerTouched, mouseDown: false})
    }

    updateTowersPosition = (cellSize: number, towers: TowersMap, map: CellsMap, reversed = false): TowersMap => {
        const _towers = copyObj(towers) as TowersMap
        Object.keys(towers).forEach((key: string) => {
            const _tower = Object.assign({}, towers[key])
            const positionInDOM = this.calcTowerPosition(key, map, cellSize, reversed)
            _towers[key] = Object.assign(_tower, positionInDOM)
        })
        return _towers
    }

    updateCellsPosition = (board: IBoard, boardOptions: IBoardOptions, boardRef: HTMLDivElement) => {
        const {cellsMap, cellSize, towers} = board
        const {reversedBoard, boardSize} = boardOptions
        const newCellSize = getCellSize(boardRef, boardSize);
        if (cellSize === newCellSize) return
        const newCellMap = updateCellsMap(cellsMap as CellsMap, newCellSize, reversedBoard)
        const newTowers = this.updateTowersPosition(newCellSize, towers, newCellMap, reversedBoard)
        // console.log(newTowers, towers)
        this.callBack({towers: newTowers, cellsMap: newCellMap, cellSize: newCellSize})
    }
}

export const tur = new TowersUpdateResolver()
