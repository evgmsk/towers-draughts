import { IBranch } from "./engine-interfaces";


export class MovesMap {
    moveBranchesTree: Map<string, IBranch> = new Map()

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
        const newTree = new Map()
        moveBranchesTree.forEach((v: Object, k: string) => {
            if (k.startsWith(movesHistory)) {
                newTree.set(k, v)
            }
        })
        this.moveBranchesTree = newTree
        return newTree
    }
}

const movesTree = new MovesMap()

export default movesTree
