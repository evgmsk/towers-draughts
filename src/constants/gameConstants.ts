export const TopLegendValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm'];
export const SideLegendValues = new Array(12).fill(0).map((i: undefined, j: number): number => j + 1);
export const BoardDirections = ['leftUp', 'leftDown', 'rightUp', 'rightDown'];
export const BaseTransform = 'translate(-50%, -50%)';
export const DefaultTime = 300;
export const Storage = 'chekers';
export const BaseBoardSize = 8;
export const InternationalBoardSize = 10;
export const StandartTiming = [[1,0], [2,1], [3,0], [3,1], [5,0], [5,3], [10, 0], [10, 3], [15, 0]]
export const PrestartTimeLimit = 10
export const Interval = 1000
export const BaseCellSize = 50
export const AnimationDuration = 300
export const CellTowerRatio = .7


export const sampleLink = "https://ru.wikipedia.org/wiki/%D0%A8%D0%B0%D1%88%D0%BA%D0%B8#%D0%A1%D1%82%D0%BE%D0%BB%D0%B1%D0%BE%D0%B2%D1%8B%D0%B5"

export const RoutesPath = {
    home: '/',
    game: '/game',
    settings: '/settings',
    analysis: '/analysis',
    stats: '/stats',
    rules: '/rules',
    auth: '/auth',
    profile: '/profile',
}

export const RoutesTitle= {
    home: 'home',
    game: 'apps',
    analyze: 'zoom_in',
    rules: 'import_contacts',
    stats: 'insert_chart',
    settings: 'settings',
    profile: 'person',
    auth: 'login',
}

export const storageName = 'checkers'

export const defaultWhiteTowerCells8x8 = ['a1', 'a3', 'b2', 'c1', 'c3', 'd2', 'e1', 'e3', 'f2', 'g1', 'g3', 'h2',]
export const defaultBlackTowerCells8x8 = ['a7', 'b8', 'b6', 'c7', 'd8', 'd6', 'e7', 'f8', 'f6', 'g7', 'h8', 'h6']

export const board8x8EmptyCells = ['b4', 'd4', 'f4', 'h4', 'a5', 'c5', 'e5', 'g5']
export const boardEmptyCells = board8x8EmptyCells.concat(['k4', 'i5'])

// export const board8x8Cells = defaultBlackTowerCells8x8.concat(board8x8EmptyCells).concat(defaultWhiteTowerCells8x8)

export const defaultWhiteTowerCells = defaultWhiteTowerCells8x8
.concat(['i1', 'i3', 'k2', 'b4', 'd4', 'f4', 'h4', 'k4'])
export const defaultBlackTowerCells = defaultBlackTowerCells8x8
.filter((x: string) => !x.includes('6'))
.concat(['i7', 'k10', 'k8', 'i9', 'a9', 'c9', 'e9', 'g9', 'b10', 'd10', 'f10', 'h10'])

export const board10x10EmptyCells = board8x8EmptyCells.concat(['k4', 'i5'])

export const getDefaultBlackTowersCells = (boardSize: number): string[] => {
    return boardSize === 8 ? defaultBlackTowerCells8x8 : defaultBlackTowerCells
}

export const getDefaultWhiteTowersCells = (boardSize: number): string[] => {
    return boardSize === 8 ? defaultWhiteTowerCells8x8 : defaultWhiteTowerCells
}

export const board10x10Cells = defaultBlackTowerCells.concat(defaultWhiteTowerCells).concat(board10x10EmptyCells)
