import init from "snake_game"
import {GAME_CONFIG, scaleConfig} from "./config"
import {GameController} from "./gameController"

const animationStepsPerTick = 7

function gameTick(controller: GameController, tickSpeed: number, i = 0) {
  const isGameTick = i % animationStepsPerTick === 0
  window.apGame.tickThread = setTimeout(() => window.requestAnimationFrame(() => {
    controller.tick(isGameTick)
    gameTick(controller, tickSpeed, i > 1e6 ? 0 : i + 1)
  }), Math.max(tickSpeed / animationStepsPerTick, 1))
}

async function main() {
  await init()
  const minViewportSize = Math.min(window.innerWidth, window.innerHeight)
  const scale = minViewportSize / (GAME_CONFIG.cells.rows * GAME_CONFIG.cellSize + GAME_CONFIG.gameOffset * 2)
  console.log('Scaling game by', scale)
  const config = scaleConfig(GAME_CONFIG, scale)
  const controller = new GameController(config)
  controller.drawWorld()
  controller.drawSnake()

  gameTick(controller, config.tickSpeed)
}

main().catch(e => console.error(e))