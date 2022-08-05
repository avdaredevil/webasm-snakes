import {World} from "snake_game"
import {GameConfig} from "./config"


export interface AnimationProps {
  canvas: HTMLCanvasElement
  world: World
  config: GameConfig
}

export class Animation {
  canvas: HTMLCanvasElement
  config: GameConfig
  world: World

  constructor({canvas, config, world}: AnimationProps) {
    this.canvas = canvas
    this.config = config
    this.world = world
  }

  /** A `true` return value means this animation is done */
  tick(isGameTick: boolean) {
    console.error('This animation is a stub and needs to be implemented')
    return true
  }
}

export class DeathCellAnimation extends Animation {
  private x: number
  private y: number
  private tickCt = 0
  private currRotation = 0
  private frictionX: number = .1
  velocityX!: number
  forceY!: number
  rotateFactor!: number
  ctx: CanvasRenderingContext2D

  constructor(env: AnimationProps, animProps: {
    coord: {row: number, col: number},
    velocityX: number,
    forceY: number,
    rotateFactor: number,
  }) {
    super(env)
    this.x = animProps.coord.col * this.config.cellSize + this.config.gameOffset + this.config.cellSize / 2
    this.y = animProps.coord.row * this.config.cellSize + this.config.gameOffset + this.config.cellSize / 2
    this.ctx = this.canvas.getContext("2d")!
    if (animProps.forceY < 0) animProps.forceY *= -1
    Object.assign(this, animProps)
  }
  performRotatedDraw(cb?: () => void) {
    const angle = this.currRotation * Math.PI / 180
    this.ctx.translate(this.x, this.y)
    this.ctx.rotate(angle)
    this.ctx.translate(-this.x, -this.y)
    cb?.()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  clear() {
    const {x, y, config} = this
    const {cellSize} = config
    this.performRotatedDraw(() => {
      this.ctx.clearRect(x - cellSize / 2 - 1, y - cellSize / 2 - 1, cellSize + 2, cellSize + 2)
    })
  }
  draw() {
    const {x, y, currRotation, ctx, config} = this
    const {cellSize, colors} = config

    this.performRotatedDraw(() => {
      // Rotated rectangle
      ctx.fillStyle = colors.snake
      ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize, cellSize)
    })
  }
  updatePosition() {
    const {frictionX, forceY, rotateFactor} = this

    this.velocityX *= (1 - frictionX)
    this.x += this.velocityX
    this.y += forceY * this.tickCt
    this.currRotation += rotateFactor * this.tickCt
  }
  tick(isGameTick: boolean) {
    this.tickCt++
    const {x, y, config} = this
    const {gameOffset} = config
    this.clear()
    this.updatePosition()
    this.draw()

    return y < gameOffset || y > this.canvas.height - gameOffset || x < gameOffset || x > this.canvas.width - gameOffset
  }
}
  