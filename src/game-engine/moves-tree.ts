import { IBranch } from "./engine-interfaces";


export class MovesTree {
    moveBranchesTree = new Map<string, IBranch>()

    get tree() {
        return this.moveBranchesTree
    }

    getBranch(key: string) {
        return this.moveBranchesTree.get(key)
    }

    addBranch(key: string, value: IBranch) {
        this.moveBranchesTree.set(key, value)
    }

    set tree(tree: any) {
        this.moveBranchesTree = tree
    }

    reset() {
        this.moveBranchesTree = new Map()
    }

    filter(movesHistory: string) {
        const { moveBranchesTree } = this
        const newTree = new Map<string, IBranch>()
        moveBranchesTree.forEach((v: IBranch, k: string) => {
            if (k.startsWith(movesHistory)) {
                newTree.set(k.slice(-5), v)
            }
        })
        this.moveBranchesTree = newTree
        return newTree
    }
}

const movesTree = new MovesTree()

export default movesTree
