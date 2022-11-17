import {
  Board,
  CellsMap,
  INeighborCells,
  PieceColor,
  TowerConstructor,
  TowersMap,
} from "../store/models";
import {
  BaseCellSize,
  getDefaultBlackTowersCells,
  getDefaultWhiteTowersCells,
  SideLegendValues,
  TopLegendValues,
} from "../constants/gameConstants";

export const createBoardWithoutTowers = (size: number = 8): Board => {
  const GameBoard: Board = {};
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if ((i + j + 1) % 2) {
        const key = `${TopLegendValues[i]}${SideLegendValues[j]}`;
        GameBoard[key] = {
          boardKey: key,
          neighbors: defineNeighborCells(i, j, size),
        };
      }
    }
  }
  return GameBoard;
};

export function determineCellPosition(
  key: string,
  cellSize: number,
  reversed = false,
  boardSize = 8
) {
  const topInd = reversed
    ? TopLegendValues.slice(0, boardSize).reverse()
    : TopLegendValues.slice(0, boardSize);
  const sideInd = reversed
    ? SideLegendValues.slice(0, boardSize)
    : SideLegendValues.slice(0, boardSize).reverse();
  const y = sideInd.indexOf(parseInt(key.slice(1))) * cellSize;
  const x = topInd.indexOf(key[0]) * cellSize;
  return { x, y };
}

export function createCellsMap(
  boardSize: number,
  cellSize = BaseCellSize,
  reversed = false
) {
  const map = {} as CellsMap;
  Object.keys(createBoardWithoutTowers(boardSize)).forEach((key: string) => {
    map[key] = determineCellPosition(key, cellSize, reversed, boardSize);
  });
  return map;
}

export function defineNeighborCells(
  i: number,
  j: number,
  size: number
): INeighborCells {
  const topLegend = TopLegendValues.slice(0, size);
  const sideLegend = SideLegendValues.slice(0, size);
  const neighbors: INeighborCells = {};
  if (i) {
    if (j < size - 1) {
      neighbors.leftUp = `${topLegend[i - 1]}${sideLegend[j + 1]}`;
    }
    if (j) {
      neighbors.leftDown = `${topLegend[i - 1]}${sideLegend[j - 1]}`;
    }
  }
  if (i < size - 1) {
    if (j < size - 1) {
      neighbors.rightUp = `${topLegend[i + 1]}${sideLegend[j + 1]}`;
    }
    if (j) {
      neighbors.rightDown = `${topLegend[i + 1]}${sideLegend[j - 1]}`;
    }
  }
  return neighbors;
}

export const createDefaultTowers = (boardSize: number): TowersMap => {
  const towers = {} as TowersMap;
  getDefaultBlackTowersCells(boardSize).forEach((key: string) => {
    towers[key] = new TowerConstructor({
      onBoardPosition: key,
      currentColor: PieceColor.b,
    });
  });
  getDefaultWhiteTowersCells(boardSize).forEach((key: string) => {
    towers[key] = new TowerConstructor({
      onBoardPosition: key,
      currentColor: PieceColor.w,
    });
  });
  return towers;
};

export function removeOutBoardTowers(towers: TowersMap): TowersMap {
  return Object.keys(towers).reduce((acc, key) => {
    if (key.length < 4) {
      acc[key] = towers[key];
    }
    return acc;
  }, {} as TowersMap);
}

export function createOutBoardTowers(
  towers = {} as TowersMap,
  bs = 8
): TowersMap {
  const { usedBlack, usedWhite } = Object.keys(towers).reduce(
    (acc, key) => {
      const { wPiecesQuantity = 0, bPiecesQuantity = 0 } =
        towers[key] || ({} as TowerConstructor);
      acc.usedWhite += wPiecesQuantity;
      acc.usedBlack += bPiecesQuantity;
      return acc;
    },
    { usedBlack: 0, usedWhite: 0 }
  );
  const totalPieces = bs === 10 ? 20 : 12;
  const [unusedBlack, unusedWhite] = [
    totalPieces - usedBlack,
    totalPieces - usedWhite,
  ];
  for (let i = 0; i < unusedBlack; i++) {
    const oBKey = `oB b${i}`;
    towers[oBKey] = new TowerConstructor({
      onBoardPosition: oBKey,
      currentColor: PieceColor.b,
    });
  }
  for (let i = 0; i < unusedWhite; i++) {
    const oBKey = `oW w${i}`;
    towers[oBKey] = new TowerConstructor({
      onBoardPosition: oBKey,
      currentColor: PieceColor.w,
    });
  }
  return towers;
}
