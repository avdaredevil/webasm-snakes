export const GAME_CONFIG = {
  page: {
    title: "AP-Snakes",
    htmlTitle: "Snakes by AP"
  },
  cells: { rows: 100, cols: 50 },
  cellSize: 40,
  gameOffset: 30,
  colors: {
    snake: "#4caf50",
    border: "#484848",
    largeBorder: "#009688",
    deathBorder: '#f44336',
    snakeEye: "#222323",
    food: '#ffeb3b',
    gridLabel: '#009688',
  },
  tickSpeed: 50,
  largeGameTilesThreshold: 1500,
};
export type GameConfig = typeof GAME_CONFIG;

export function scaleConfig(config: GameConfig, scale: number): GameConfig {
  return {
    ...config,
    cellSize: config.cellSize * scale,
    gameOffset: config.gameOffset * scale,
  };
}
