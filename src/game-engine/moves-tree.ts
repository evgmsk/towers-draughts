import {IBranch, IChildren, IDeepValue, IMove} from "./engine-interfaces";

export interface ITree {[key: string]: any | {children: {[key: string]: any}}}

export interface IMovesTree {[key: string]: IBranch | {children: IChildren}}

export class Tree implements ITree {
    tree: ITree
    protected constructor(props: ITree) {
        this.tree = props.tree
    }
    get getTree(): ITree {
        return this
    }

    set setTree(tree: ITree) {
        this.tree = tree
    }
}

export class MovesTree extends Tree {
    tree: IMovesTree
    constructor(props: IMovesTree) {
        super(props)
        this.tree = props || {}
    }

    getRoot() {
        return this.tree.root
    }

    filterBelowOfDepth = (branch = this.getRoot() as IBranch, depth = 0) => {
        const {moves, children} = branch
        return moves.filter(m =>
            !children[m.move] || children[m.move].deepValue!.depth < depth)
    }

    filterEqualOrGreaterThanDepth = (depth = 1, branch = this.getRoot() as IBranch)  => {
        const {moves, children} = branch
        let best: IMove & {deepValue: IDeepValue}
        const filterMoves = moves.filter(m => {
            const included = children[m.move] && children[m.move].deepValue.depth >= depth
            if (included) {
                const deepValue = children[m.move].deepValue
                best = best || {...m, deepValue}
                best = best.deepValue.value > deepValue.value
                    ? best
                    : {...m, deepValue}
            }
            return included
        })
        return filterMoves.length ? best! : null
    }

    updateRoot(move: string): IBranch {
        const children = this.tree.root.children as unknown as IChildren
        const newRoot = children[move]
        console.warn('root update', newRoot, move, children)
        this.tree.root = newRoot
        return newRoot
    }

    addRoot(branch: IBranch) {
        branch.parentBranch = null as unknown as IBranch
        this.tree.root = branch
        // console.warn('root added', this.tree.root)
    }

    addBranch(branch: IBranch, movesLineFromRoot: string[]): void {
        // console.warn('add branch', this.tree, branch, movesLineFromRoot)
        let parentBranch = this.getBranch(movesLineFromRoot)
        if (!parentBranch && movesLineFromRoot.length) {
            console.error('parentBranch not found')
            return
        }
        branch.parentBranch = parentBranch as IBranch
        parentBranch.children[branch.rivalMove] = branch
        // console.warn('new branch added', branch, this.tree)
        this.updateTreeDeepValue(parentBranch)
    }

    updateTreeDeepValue(branch: IBranch) {
        const newDeepValue = this.checkParentBranchUpdate(branch as IBranch)
        if (newDeepValue) {
            const deepValue = {...newDeepValue, value: -newDeepValue.value, depth: newDeepValue.depth + 1}
            this.updateBranch(branch, deepValue)
        }
    }

    checkParentBranchUpdate(branch: IBranch) {
        // console.warn('check branch update', branch, this.tree)
        const {moves, children, deepValue: {depth}} = branch
        if (!moves || !moves.length) {
            return console.error('no moves', JSON.stringify(branch), this.tree)
        }
        let bestChild = children[moves[0].move]
        if (!bestChild || (bestChild.deepValue.depth < depth && moves.length === 1)) { return }
        for (let i = 1; i < moves.length; i++) {
            const node = children[moves[i].move]
            if (!node || node.deepValue.depth < depth) {
                return
            }
            bestChild = bestChild.deepValue.depth <= node.deepValue.depth
            && bestChild.deepValue.value < node.deepValue.value
                ? node
                : bestChild
        }
        return bestChild.deepValue
    }

    updateBranch(branch: IBranch, deepValue: IDeepValue) {
        branch.deepValue = deepValue
        const parentBranch = branch.parentBranch
        // console.warn('after update', branch)
        if (!parentBranch) { return }
        this.updateTreeDeepValue(parentBranch)
    }

    getBranch(mL: string[], branch?: IBranch): IBranch {
        branch = branch || this.tree.root as IBranch
        if (!branch || !branch.children) {return null as unknown as IBranch}
        if (!mL[0]) { return branch }
        switch (mL.length) {
            case 0: return branch as IBranch
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
                    .children[mL[3]].children[mL[4]].children[mL[5]] as IBranch
                return this.getBranch(mL.slice(6), lastBranch)
            }
        }
    }
}

export default new MovesTree({})
