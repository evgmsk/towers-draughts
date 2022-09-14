import {IBranch, IChildren, IDeepValue} from "./engine-interfaces";

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

    updateRoot(move: string): IBranch {
        const children = this.tree.root.children as unknown as IChildren
        const newRoot = children[move]
        console.warn('root update', newRoot, move, children)
        newRoot.parentBranch = null as unknown as IBranch
        this.tree.root = newRoot
        return newRoot
    }

    determineBranchDepth(branch: IBranch, depth = 0): number {
        const {parentBranch} = branch
        if (!parentBranch) {
            return depth
        }
        return this.determineBranchDepth(parentBranch, depth + 1)
    }

    checkParentBranchUpdate(branch: IBranch, depth: number) {
        console.warn('check branch update', branch)
        const {moves, children} = branch
        let bestChild = children[moves[0].move]
        if (!bestChild) { return false }
        for (let i = 0; i < moves.length; i++) {
            const node = children[moves[i].move]
            if (!node || node.deepValue.depth < depth) {
                return false
            }
            bestChild = bestChild.deepValue.depth <= node.deepValue.depth
                && bestChild.deepValue.value < node.deepValue.value
                ? node
                : bestChild
        }
        return bestChild.deepValue
    }

    addRoot(branch: IBranch) {
        branch.parentBranch = null as unknown as IBranch
        this.tree.root = branch
        console.warn('root added', branch, this.tree)
    }

    addBranch(branch: IBranch, movesLineFromRoot: string[]): void {
        let parentBranch = this.getBranch(movesLineFromRoot)
        console.warn('add branch', this.tree, branch, movesLineFromRoot)
        if (!parentBranch && movesLineFromRoot.length) {
            console.error('parentBranch not found')
            return
        }
        branch.parentBranch = parentBranch as IBranch
        parentBranch.children[branch.rivalMove] = branch
        const branchMaxDepth = this.determineBranchDepth(parentBranch) - 1
        const newDeepValue = this.checkParentBranchUpdate(parentBranch as IBranch, branchMaxDepth)
        if (newDeepValue) {
            this.updateBranch(parentBranch, {...newDeepValue}, branchMaxDepth + 1)
        }
        console.warn('new branch added', branch, this.tree)
    }

    updateBranch(branch: IBranch, deepValue: IDeepValue, depth: number) {
        deepValue.value = -deepValue.value
        branch.deepValue = deepValue
        const parentBranch = branch.parentBranch
        console.warn('after update', branch)
        if (!parentBranch) { return }
        const newDeepValue = this.checkParentBranchUpdate(parentBranch, depth + 1)
        if (newDeepValue) {
            this.updateBranch(parentBranch, newDeepValue, depth + 1)
        }
    }

    getBranch(mL: string[], branch?: IBranch): IBranch {
        branch = branch || this.tree.root as IBranch
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
