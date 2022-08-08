import { IBranch } from "./engine-interfaces";


export class MovesMap {
    moveBranchesTree: {[key: string]: IBranch} = {}

    get tree() {
        return this.moveBranchesTree
    }

    getBranch(key: string) {
        return this.moveBranchesTree[key]
    }

    addBranch(key: string, value: IBranch) {
        this.moveBranchesTree[key] =  value
    }

    set tree(tree: any) {
        this.moveBranchesTree = tree
    }

    reset() {
        this.moveBranchesTree = {}
    }

    filter(movesHistory: string) {
        const { moveBranchesTree } = this
        const newTree: {[key: string]: IBranch} = {}
        Object.keys(moveBranchesTree).forEach((k: string) => {
            if (k.startsWith(movesHistory)) {
                newTree[k] = moveBranchesTree[k]
            }
        })
        this.moveBranchesTree = newTree
        return newTree
    }
}

const movesTree = new MovesMap()

export default movesTree
