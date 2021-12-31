import { PieceColor } from '../store/app-interface'
import { IBranch, ILastResult, ISeekerProps } from './engine-interfaces'

class BestMovesLineSeekerState {
    maxDepth = 26
    startDepth = 6
    moveBranchesTree: Map<string, IBranch> = new Map()
    actualHistoryStr = ''
    lastMove = ''
    historyLength = 0
    engineColor: PieceColor = PieceColor.w
    lastResult = {} as ILastResult

    resetProps = (props: ISeekerProps) => {
        this.maxDepth = props.maxDepth
        this.startDepth = props.startDepth || 6
        this.engineColor = props.engineColor || PieceColor.w
        this.moveBranchesTree = new Map()
    }

    getBranchTree = () => {
        return this.moveBranchesTree
    }

    getBranch = (key: string): IBranch | null => {
        return this.moveBranchesTree.get(key) || null
    }

    setBranchTree = (tree: Map<string, IBranch>) => {
        this.moveBranchesTree = tree
    }

    updateBranchTree = (key: string, branch: IBranch) => {
        this.moveBranchesTree.set(key, branch)
    }

    filterTree = (key: string) => {
        this.moveBranchesTree.forEach((branch, bk) => {
            if(!bk.startsWith(key)) {
               this.moveBranchesTree.delete(bk)
            }
        })
    }
}

export default new BestMovesLineSeekerState()
