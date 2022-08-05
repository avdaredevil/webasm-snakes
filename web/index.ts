import init from "snake_game"
import {GAME_CONFIG, scaleConfig} from "./config"
import {GameController} from "./gameController"

function gameTick(controller: GameController, tickSpeed: number, animationStepsPerGameTick: number, i = 0) {
  const isGameTick = i % animationStepsPerGameTick === 0
  window.apGame.tickThread = setTimeout(() => window.requestAnimationFrame(() => {
    controller.tick(isGameTick)
    gameTick(controller, tickSpeed, animationStepsPerGameTick, i > 1e6 ? 0 : i + 1)
  }), Math.max(tickSpeed / animationStepsPerGameTick, 1))
}

async function main() {
  await init()
  const minViewportSize = Math.min(window.innerWidth, window.innerHeight)
  const scale = minViewportSize / (GAME_CONFIG.cells.rows * GAME_CONFIG.cellSize + GAME_CONFIG.gameOffset * 2)
  console.log('Scaling game by', scale)
  const config = scaleConfig(GAME_CONFIG, scale)
  const controller = new GameController(config, scale)
  controller.drawWorld()
  controller.drawSnake()

  gameTick(controller, config.tickSpeed, config.animationStepsPerGameTick)
}

main().catch(e => console.error(e))