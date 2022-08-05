import {World} from "snake_game"
import {GameConfig} from "./config"
import pageHtml, {linkFunctionality, updateScore} from "./pageHtml"
import {Animation, DeathCellAnimation} from "./animation"

declare global {
  interface Window {
    apGame: {
      tickThread?: NodeJS.Timer
      world: World
      canvas: HTMLCanvasElement
    }
  }
}

export interface Snake {
  body: [number, number][],
}

export class GameController {
  canvas: HTMLCanvasElement
  world: World
  ctx: CanvasRenderingContext2D
  animations: Animation[] = []
  isDead = false

  constructor(readonly config: GameConfig) {
    const {canvas, world} = GameController.initWorld(config)
    this.canvas = canvas
    this.world = world
    this.ctx = canvas.getContext("2d")!
    this.setupKeyboard()
  }
  setupKeyboard() {
    document.addEventListener("keydown", (e) => {
      const isDead = this.world.is_dead()
      switch (e.key) {
        case "ArrowUp":
          return isDead || this.world.set_direction("up")
        case "ArrowDown":
          return isDead || this.world.set_direction("down")
        case "ArrowLeft":
          return isDead || this.world.set_direction("left")
        case "ArrowRight":
          return isDead || this.world.set_direction("right")
        case "Enter":
          if (!isDead) return
          this.canvas.classList.remove("dead")
          this.isDead = false
          updateScore(0, true)
          this.animations = []
          this.world = World.new(this.config.cells.rows, this.config.cells.cols)
      }
    })
  }
  static initWorld(config: GameConfig): typeof window.apGame {
    if (window.apGame) return window.apGame

    // Create a canvas element with correct dimensions
    document.querySelector("html")!.innerHTML = pageHtml(config.page)
    linkFunctionality()
    const canvas = document.querySelector("canvas")
    if (!canvas) throw new Error("No canvas found")
    canvas.width = config.cells.cols * config.cellSize + config.gameOffset * 2
    canvas.height = config.cells.rows * config.cellSize + config.gameOffset * 2

    // Create a world and attach it to the canvas
    ;(window as any).setScore = updateScore
    const world = World.new(config.cells.rows, config.cells.cols)
    return (window.apGame = {canvas, world})
  }
  drawWorld(isDead = false) {
    const {world, canvas, ctx, config} = this
    const {gameOffset, cellSize, colors, cells, largeGameTilesThreshold} = config
    const isLargeGame = cells.rows * cells.cols > largeGameTilesThreshold
    ctx.strokeStyle = isDead ? colors.deathBorder : colors.border
    ctx.beginPath()
    if (isLargeGame) {
      ctx.strokeStyle = isDead ? colors.deathBorder : colors.largeBorder
      ctx.lineWidth = 3
      ctx.rect(gameOffset, gameOffset, canvas.width - gameOffset * 2, canvas.height - gameOffset * 2)
      ctx.stroke()

      if (!isDead) {
        ctx.beginPath()
        ctx.globalAlpha = 0.3
        const label = `${world.rows}x${world.cols}`
        const {width, actualBoundingBoxAscent} = ctx.measureText(label)
        ctx.fillStyle = colors.gridLabel
        const fontSize = Math.max(canvas.height / 50, 10)
        ctx.font = `${fontSize}px monospace`
        ctx.fillText(label, canvas.width - fontSize / 2 - gameOffset - width, gameOffset + actualBoundingBoxAscent + fontSize / 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      return
    }
    const dashScale = cellSize / 20
    ctx.setLineDash([3.5 * dashScale, 2 * dashScale])
    for (let row = 0; row <= world.rows; row++) {
      ctx.moveTo(0 + gameOffset, row * cellSize + gameOffset)
      ctx.lineTo(canvas.width - gameOffset, row * cellSize + gameOffset)
    }

    for (let col = 0; col <= world.cols; col++) {
      ctx.moveTo(gameOffset + col * cellSize, 0 + gameOffset)
      ctx.lineTo(gameOffset + col * cellSize, canvas.height - gameOffset)
    }
    ctx.stroke()
  }
  getCoordFromIndex(index: number): {row: number; col: number} {
    const {world} = this
    return {
      col: index % world.cols,
      row: ~~(index / world.cols),
    }
  }
  drawSnake() {
    const {world, ctx, config} = this
    const {gameOffset, cellSize, colors} = config
    ctx.fillStyle = colors.snake
    ctx.beginPath()
    for (const [idx, dir] of (world.snake() as Snake).body) {
      const {row, col} = this.getCoordFromIndex(idx)
      ctx.fillRect(
        gameOffset + col * cellSize,
        gameOffset + row * cellSize,
        cellSize,
        cellSize,
      )
    }
    ctx.stroke()

    // Draw the head
    // console.log({snakeHead: world.snake_head(), snake: world.snake().body})
    const {row, col} = this.getCoordFromIndex(world.snake_head())
    const eyeSize = {width: cellSize / 4, height: cellSize / 8}
    const eyeOffsetX = cellSize / 3.5
    const eyeOffsetY = cellSize / 7
    ctx.fillStyle = colors.snakeEye
    ctx.beginPath()
    ctx.fillRect(
      gameOffset + col * cellSize + eyeOffsetX - eyeSize.width / 2,
      gameOffset + row * cellSize + eyeOffsetY,
      eyeSize.width,
      eyeSize.height
    )
    ctx.fillRect(
      gameOffset + col * cellSize + cellSize - eyeOffsetX - eyeSize.width / 2,
      gameOffset + row * cellSize + eyeOffsetY,
      eyeSize.width,
      eyeSize.height
    )
    ctx.stroke()
  }
  clearAll() {
    const {ctx, canvas} = this
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    )
  }
  drawFood() {
    const {world, ctx, config} = this
    const {gameOffset, cellSize, colors} = config
    ctx.fillStyle = colors.food
    const {row, col} = this.getCoordFromIndex(world.food)
    const halfCell = cellSize / 2
    const offsetX = gameOffset + col * cellSize
    const offsetY = gameOffset + row * cellSize
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY + halfCell)
    ctx.lineTo(offsetX + halfCell, offsetY)
    ctx.lineTo(offsetX + cellSize, offsetY + halfCell)
    ctx.lineTo(offsetX + halfCell, offsetY + cellSize)
    ctx.lineTo(offsetX, offsetY + halfCell)
    ctx.fill()
  }
  private animationTick(alsoGameTick = false) {
    this.animations = this.animations.filter(anim => !anim.tick(alsoGameTick))
  }
  tick(isGameTick = false) {
    const {world} = this
    const animsRunning = this.animations.length
    isGameTick && world.tick()
    const deadMsg = world.is_dead()
    if (!isGameTick && !animsRunning) return
    this.clearAll()
    this.animationTick()
    this.drawWorld(!!deadMsg)
    this.drawFood()
    if (deadMsg) {
      this.lookDead(deadMsg)
    } else {
      this.drawSnake()
    }
  }
  lookDead(msg: string) {
    if (!this.isDead) {
      for (const [idx, dir] of (this.world.snake() as Snake).body) {
        const {row, col} = this.getCoordFromIndex(idx)
        this.ctx.clearRect(
          this.config.gameOffset + col * this.config.cellSize,
          this.config.gameOffset + row * this.config.cellSize,
          this.config.cellSize,
          this.config.cellSize,
        )
        this.animations.push(new DeathCellAnimation(this, {
          coord: {row, col},
          velocityX: Math.random() * 30 - 15,
          forceY: .5 + Math.random() * 1,
          rotateFactor: Math.random() * 2 - 1,
        }))
      }
    }
    this.isDead = true
    const {ctx, canvas, config: {
      colors
    }} = this
    const padding = 30
    const fontSize = Math.max(canvas.height / 30, 30)
    const textStyles = () => {
      ctx.fillStyle = colors.deathBorder
      ctx.font = `bolder ${fontSize}px Quicksand`
    }
    textStyles()
    const {width, actualBoundingBoxAscent} = ctx.measureText(msg)
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000000"
    ctx.fillRect(
      canvas.width / 2 - width / 2 - padding,
      canvas.height / 2 - actualBoundingBoxAscent / 2 - padding,
      width + 2 * padding,
      actualBoundingBoxAscent + 2 * padding,
    )
    ctx.globalAlpha = 1;
    textStyles()
    ctx.fillText(msg, canvas.width / 2 - width / 2, canvas.height / 2 + actualBoundingBoxAscent / 2)
    canvas.classList.add("dead")
    ctx.font = ''
  }
}
