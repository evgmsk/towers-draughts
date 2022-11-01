import {Branch, Children, DeepValue, Move} from "../store/models";
import {copyObj} from "./gameplay-helper-functions";
import evaluator from "./towers-evaluator";
import mmr from './engine-on-towers'
import {PieceColor} from "../store/models";
import {createDefaultTowers} from "./prestart-help-function-constants";
import {BaseBoardSize} from "../constants/gameConstants";

export interface ITree {[key: string]: any | {children: {[key: string]: any}}}

export interface IPositionsTree {[key: string]: Branch | {children: Children}}

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
    constructor(props: IPositionsTree = {}) {
        super(props)
        this.tree = props
        if (!props.root) {
            this.createDefaultRootBranch()
        }
    }

    createDefaultRootBranch(gameBoardSize = BaseBoardSize): Branch {
        const position = createDefaultTowers(8)
        const moves = mmr.lookForTotalMoves(position, PieceColor.w).free!.map(m => ({
                move: m.move.join('-'),
                position: mmr.makeMove(m)
            }))
        const root = {
            moves,
            position,
            deepValue: {value: {black: 0, white: 0}, depth: 0, move: ''},
            totalMovesNumber: moves.length,
            pieceOrder: PieceColor.w,
            children: {},
            rivalMove: ''
        }
        this.addRoot(root)
        return root
    }

    getRoot() {
        return this.tree.root
    }

    filterBelowOfDepth = (branch = this.getRoot() as Branch, depth = 0) => {
        const {moves, children} = branch
        return moves.filter(m =>
            !children[m.move] || children[m.move].deepValue!.depth < depth)
    }

    filterEqualOrGreaterThanDepth = (depth = 1, branch = this.getRoot() as Branch)  => {
        const {moves, children, pieceOrder} = branch
        let best: Move & {deepValue: DeepValue}
        const filterMoves = moves.filter(m => {
            const deepValue = children[m.move] && children[m.move].deepValue
            if (!deepValue) return null
            const included = deepValue.depth >= depth
                && (deepValue.value[pieceOrder] > 0
                    || deepValue.value > (this.getRoot() as Branch).deepValue.value)
            if (included) {
                const deepValue = children[m.move].deepValue
                best = best || {...m, deepValue}
                best = best.deepValue.value[pieceOrder] > deepValue.value[pieceOrder]
                    ? best
                    : {...m, deepValue}
            }
            return included
        })
        return filterMoves.length ? best! : null
    }

    updateRoot(move: string): Branch {
        const children = this.tree.root.children as unknown as Children
        const newRoot = children[move]
        console.warn('root update', newRoot, move, children)
        this.tree.root = newRoot
        return newRoot
    }

    addRoot(branch: Branch) {
        branch.parentBranch = null as unknown as Branch
        this.tree.root = branch
        // console.warn('root added', this.tree.root)
    }

    getPathFromRoot(branch: Branch): string[] {
        let br = branch
        const path = [] as string[]
        while (br.parentBranch) {
            path.unshift(br.rivalMove)
            br = br.parentBranch
        }
        return path
    }

    getFirstDepthData(branch: Branch): Branch {
        const {pieceOrder, totalMovesNumber} = branch
        const childDeepValue = branch.moves.reduce((acc, m) => {
            const positionData = evaluator.getPositionData(m.position, pieceOrder, totalMovesNumber)
            const newBranch = {...positionData, parentBranch: branch, children: {}, rivalMove: m.move}
            branch.children[m.move] = newBranch
            if (positionData.deepValue.value[pieceOrder] > acc.value[pieceOrder]) {
                acc.value = positionData.deepValue.value
                acc.move = m.move
            }
            return acc
        }, {value: {white: -100, black: -100}, move: '', depth: 1})
        branch.deepValue = Object.assign({}, childDeepValue)
        // console.warn('first', branch.children, branch.moves)
        return branch
    }

    determineMove(branch: Branch, grantParent: Branch): string {
        let parent = branch, path = [] as string[]
        while(parent) {
            path.unshift(parent.rivalMove)
            parent = parent.parentBranch as Branch
            if (parent.rivalMove === grantParent.rivalMove) {
                return path[0]
            }
        }
        return path[0] || ''
    }

    getNextDepthData(branch: Branch): Branch {
        const currentDepth = branch.deepValue.depth
        if (currentDepth < 1) {
            return this.getFirstDepthData(branch)
        }
        const childDeepValue = branch.moves.reduce((acc, m) => {
            let child = branch.children[m.move]
            child = !child.deepValue.depth
                ? this.getFirstDepthData(child)
                : this.getNextDepthData(child)
            if (child.deepValue.value[child.pieceOrder] > acc.value[child.pieceOrder]) {
                acc.value = child.deepValue.value
                acc.move = this.determineMove(child, branch)
            }
            return acc
        }, {value: {white: - 100, black: -100}, move: '', depth: currentDepth + 1})
        branch.deepValue = Object.assign({}, childDeepValue)
        return branch
    }

    getDepthData(branch: Branch, depth = 1): Branch {
        let br = branch
        // console.warn(copyObj(br.deepValue), depth)
        while (br.deepValue.depth < depth) {
            br = this.getNextDepthData(br)
        }
        // console.warn(2, copyObj(br.deepValue), depth, br.children)
        return br
    }

    getBranch(mL: string[], branch?: Branch): Branch {
        branch = branch || this.tree.root as Branch
        if (!branch || !branch.children) {return null as unknown as Branch}
        if (!mL[0]) { return branch }
        switch (mL.length) {
            case 0: return branch as Branch
            case 1: {
                return branch.children[mL[0]]
            }
            case 2: {
                return branch.children[mL[0]].children[mL[1]]
            }
            case 3: {
                return branch.children[mL[0]].children[mL[1]].children[mL[2]]
            }
            case 4: {
                return branch.children[mL[0]].children[mL[1]].children[mL[2]].children[mL[3]]
            }
            case 5: {
                return branch.children[mL[0]].children[mL[1]]
                    .children[mL[2]].children[mL[3]].children[mL[4]]
            }
            case 6: {
                return branch.children[mL[0]].children[mL[1]].children[mL[2]]
                    .children[mL[3]].children[mL[4]].children[mL[5]]
            }
            default: {
                const lastBranch = branch.children[mL[0]].children[mL[1]].children[mL[2]]
                    .children[mL[3]].children[mL[4]].children[mL[5]] as Branch
                return this.getBranch(mL.slice(6), lastBranch)
            }
        }
    }
}

export default new PositionsTree()
