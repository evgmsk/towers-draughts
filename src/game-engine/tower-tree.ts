import {
    Branch,
    Children,
    DeepValue,
    MMRResult,
    PieceColor,
    TowerConstructor,
    TowersMap,
    Value,
} from '../store/models'
import { isDev, oppositeColor } from './gameplay-helper-functions'
import evaluator from './towers-evaluator'
import mmr from './moves-resolver'
import { createDefaultTowers } from './prestart-help-function'
import { BaseBoardSize } from '../constants/gameConstants'

export interface ITree {
    [key: string]: any | { children: { [key: string]: any } }
}

export interface IPositionsTree {
    [key: string]: Branch | { children: Children }
}

export interface IMoveOfLine {
    pieceOrder: PieceColor
    value: Value
    childrenValues: { [key: string]: DeepValue }[]
    move: string
    depth: number
}

export class Tree implements ITree {
    tree: ITree

    protected constructor(props: ITree) {
        this.tree = props.tree
    }

    get getTree(): ITree {
        return this.tree
    }

    set setTree(tree: ITree) {
        this.tree = tree
    }
}

export class PositionsTree extends Tree {
    tree: IPositionsTree
    counter = 0

    constructor(props: IPositionsTree = {}) {
        super(props)
        this.tree = props
        if (!props.root) {
            // this.createDefaultRootBranch()
            // this.getDepthData(this.getRoot(), DefaultMinDepth)
        }
    }

    createBranchWithTowers(
        towers: TowersMap,
        pieceOrder = PieceColor.white
    ): Branch {
        const moves = mmr.getMovesFromTotalMoves(
            mmr.getPositionMoves(towers, pieceOrder)
        )
        const position = {} as TowersMap
        for (const key in towers) {
            const { positionInDOM, ...tower } = towers[key]
            position[key] = tower as TowerConstructor
        }
        return {
            moves,
            position,
            deepValue: { value: { black: 0, white: 0 }, depth: 0, move: '' },
            totalMovesNumber: moves.length,
            pieceOrder,
            children: {},
            rivalMove: '',
            leafsNumber: moves.length,
        }
    }

    createDefaultRootBranch(gameBoardSize = BaseBoardSize): Branch {
        const towers = createDefaultTowers(gameBoardSize)
        const position = {} as TowersMap
        for (const key in towers) {
            const { positionInDOM, ...tower } = towers[key]
            position[key] = tower as TowerConstructor
        }
        const moves = mmr
            .lookForTotalMoves(position, PieceColor.white)
            .free!.map((m) => ({
                move: m.move.join('-'),
                position: mmr.makeMove(m),
            }))
        const root = {
            moves,
            position,
            deepValue: { value: { black: 0, white: 0 }, depth: 0, move: '' },
            totalMovesNumber: moves.length,
            pieceOrder: PieceColor.white,
            children: {},
            rivalMove: '',
            leafsNumber: moves.length,
        }
        this.setRoot(root)
        return root
    }

    resetCounter() {
        this.counter = 0
    }

    getCounter() {
        return this.counter
    }

    getRoot() {
        return this.tree.root as Branch
    }

    determineBestMovesLine(): IMoveOfLine[] {
        const movesLine = [] as IMoveOfLine[]
        let branch = this.getRoot()
        branch.pieceOrder === PieceColor.black &&
            movesLine.push({ move: '...' } as IMoveOfLine)
        const {
            deepValue: { move, value, depth },
            children,
            pieceOrder,
        } = branch
        const moveOfLine: IMoveOfLine = {
            depth,
            move,
            value,
            pieceOrder,
            childrenValues: Object.keys(children).map((k) => ({
                [k]: children[k].deepValue,
            })),
        }
        movesLine.push(moveOfLine)
        while (Object.keys(branch.children).length) {
            branch = branch.children[branch.deepValue.move]
            const {
                deepValue: { move, value, depth },
                children,
                pieceOrder,
            } = branch
            const moveToLine: IMoveOfLine = {
                depth,
                move,
                value,
                pieceOrder,
                childrenValues: Object.keys(children).map((k) => ({
                    [k]: children[k].deepValue,
                })),
            }
            movesLine.push(moveToLine)
        }
        return movesLine
    }

    updateRoot(move: string): Branch {
        const children = this.tree.root.children as unknown as Children
        const newRoot = children[move]
        newRoot.parentBranch = null as unknown as Branch
        delete this.tree.root
        this.tree.root = newRoot
        return newRoot
    }

    setRoot(branch: Branch) {
        branch.parentBranch = null as unknown as Branch
        delete this.tree.root
        this.tree.root = branch
    }

    // getPathFromRoot(branch: Branch): string[] {
    //     let br = branch
    //     const path = [] as string[]
    //     while (br.parentBranch) {
    //         path.unshift(br.rivalMove)
    //         br = br.parentBranch
    //     }
    //     return path
    // }

    getFirstDepthData(branch: Branch): Branch {
        const { pieceOrder, totalMovesNumber, moves } = branch
        if (!moves.length) {
            return Object.assign({}, branch)
        }
        if (isDev()) {
            this.counter += 1
        }
        const childDeepValue = moves.reduce(
            (acc, m) => {
                const positionData = evaluator.getPositionData(
                    m.position,
                    pieceOrder,
                    totalMovesNumber
                )
                branch.children[m.move] = {
                    ...positionData,
                    parentBranch: branch,
                    children: {},
                    rivalMove: m.move,
                }
                if (
                    positionData.deepValue.value[pieceOrder] >
                    acc.value[pieceOrder]
                ) {
                    acc.value = positionData.deepValue.value
                    acc.move = m.move
                }
                acc.leafsNumber += positionData.moves.length
                return acc
            },
            {
                value: { white: -100, black: -100 },
                move: '',
                depth: 1,
                leafsNumber: 0,
            }
        )
        branch.leafsNumber = childDeepValue.leafsNumber
        branch.deepValue = Object.assign({}, childDeepValue)
        return branch
    }

    getNextDepthData(branch: Branch): Branch {
        const currentDepth = branch.deepValue.depth
        if (currentDepth < 1) {
            return this.getFirstDepthData(branch)
        }
        const childDeepValue = branch.moves.reduce(
            (acc, m) => {
                let child = branch.children[m.move]
                const color = oppositeColor(child.pieceOrder)
                child = child.deepValue.depth
                    ? this.getNextDepthData(child)
                    : this.getFirstDepthData(child)

                if (child.deepValue.value[color] > acc.value[color]) {
                    acc.value = child.deepValue.value
                    acc.move = this.determineMove(child, branch)
                }
                acc.leafsNumber += child.leafsNumber
                return acc
            },
            {
                value: { white: -100, black: -100 },
                move: '',
                depth: currentDepth + 1,
                leafsNumber: 0,
            }
        )
        branch.leafsNumber = childDeepValue.leafsNumber
        branch.deepValue = Object.assign({}, childDeepValue)
        return branch
    }

    determineMove(branch: Branch, grantParent: Branch): string {
        let parent = branch,
            path = [] as string[]
        while (parent) {
            path.unshift(parent.rivalMove)
            parent = parent.parentBranch as Branch
            if (parent.rivalMove === grantParent.rivalMove) {
                return path[0]
            }
        }
        return path[0] || ''
    }

    getRivalMoves(move: string): MMRResult[] {
        const moves = this.getRoot().children[move]
            ? this.getRoot().children[move].moves
            : this.getRoot().moves
        return moves.map((m) => ({
            ...m,
            move: m.move.split(m.takenPieces ? ':' : '-'),
            endPosition: m.position,
        }))
    }

    getDepthData(branch: Branch, depth = 1): Branch {
        let br = branch
        while (br.deepValue.depth < depth) {
            this.getNextDepthData(br)
        }

        return br
    }

    // getBranch(mL: string[], branch?: Branch): Branch {
    //     branch = branch || this.tree.root as Branch
    //     if (!branch || !branch.children) {return null as unknown as Branch}
    //     if (!mL[0]) { return branch }
    //     switch (mL.length) {
    //         case 0: return branch
    //         case 1: {
    //             return branch.children[mL[0]]
    //         }
    //         case 2: {
    //             return branch.children[mL[0]].children[mL[1]]
    //         }
    //         case 3: {
    //             return branch.children[mL[0]].children[mL[1]].children[mL[2]]
    //         }
    //         case 4: {
    //             return branch.children[mL[0]].children[mL[1]].children[mL[2]].children[mL[3]]
    //         }
    //         case 5: {
    //             return branch.children[mL[0]].children[mL[1]]
    //                 .children[mL[2]].children[mL[3]].children[mL[4]]
    //         }
    //         case 6: {
    //             return branch.children[mL[0]].children[mL[1]].children[mL[2]]
    //                 .children[mL[3]].children[mL[4]].children[mL[5]]
    //         }
    //         default: {
    //             const lastBranch = branch.children[mL[0]].children[mL[1]].children[mL[2]]
    //                 .children[mL[3]].children[mL[4]].children[mL[5]]
    //             return this.getBranch(mL.slice(6), lastBranch)
    //         }
    //     }
    // }
}

export default new PositionsTree()
