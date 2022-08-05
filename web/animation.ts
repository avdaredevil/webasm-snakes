import {World} from "snake_game"
import {GameConfig} from "./config"


export interface AnimationProps {
  canvas: HTMLCanvasElement
  world: World
  config: GameConfig
}

export function performRotatedDraw(cb: () => void, {rotationDeg, ctx, anchorPoint}: {
  rotationDeg: number,
  ctx: CanvasRenderingContext2D,
  /** Typically the center of the current shape */
  anchorPoint: {x: number, y: number},
}) {
  const angle = rotationDeg * Math.PI / 180
  ctx.translate(anchorPoint.x, anchorPoint.y)
  ctx.rotate(angle)
  ctx.translate(-anchorPoint.x, -anchorPoint.y)
  cb?.()
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export class Animation {
  canvas: HTMLCanvasElement
  config: GameConfig
  world: World
  ctx: CanvasRenderingContext2D

  constructor({canvas, config, world}: AnimationProps) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.config = config
    this.world = world
  }

  /** A `true` return value means this animation is done */
  tick(isGameTick: boolean) {
    console.error('This animation is a stub and needs to be implemented')
    return true
  }
}

export class FoodRayAnimation extends Animation {
  x!: number
  y!: number
  ticks = 0
  private getGridCoord!: () => {row: number, col: number}
  private angle!: number

  constructor(props: AnimationProps, animProps: {
    getGridCoord: () => {row: number, col: number},
    angle: number,
  }) {
    super(props)
    Object.assign(this, animProps)
    this.setContext(this.getGridCoord())
  }
  setContext(gridCoord: {row: number, col: number}) {
    const {cellSize, gameOffset} = this.config
    this.x = gridCoord.col * cellSize + cellSize / 2 + gameOffset
    this.y = gridCoord.row * cellSize + cellSize / 2 + gameOffset
  }
  tick(isGameTick: boolean) {
    this.ticks++
    const {ctx, config} = this
    const dashScale = config.cellSize / 20
    this.setContext(this.getGridCoord())
    performRotatedDraw(() => {
      ctx.globalAlpha = 0.2
      ctx.strokeStyle = config.colors.food
      ctx.fillStyle = config.colors.food
      ctx.lineWidth = 2
      ctx.setLineDash([4 * dashScale, 8 * dashScale])
      ctx.lineDashOffset = ~~(this.ticks / 4.5) * -dashScale

      ctx.beginPath()
      // ctx.arc(this.x, this.y - 30 * window.apGame.scale, config.cellSize / 8, 0, 2 * Math.PI)
      ctx.moveTo(this.x, this.y - config.cellSize/2 - 4 * dashScale)
      ctx.lineTo(this.x, this.y - config.cellSize/2 - 10 * dashScale)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }, {ctx, anchorPoint: {x: this.x, y: this.y}, rotationDeg: this.angle})
    return false
  }
}

export class DeathCellAnimation extends Animation {
  x: number
  y: number
  private tickCt = 0
  private currRotation = 0
  private frictionX: number = .1
  velocityX!: number
  forceY!: number
  rotateFactor!: number

  constructor(env: AnimationProps, animProps: {
    gridCoord: {row: number, col: number},
    velocityX: number,
    forceY: number,
    rotateFactor: number,
  }) {
    super(env)
    this.x = animProps.gridCoord.col * this.config.cellSize + this.config.gameOffset + this.config.cellSize / 2
    this.y = animProps.gridCoord.row * this.config.cellSize + this.config.gameOffset + this.config.cellSize / 2
    if (animProps.forceY < 0) animProps.forceY *= -1
    Object.assign(this, animProps)
  }
  clear() {
    const {x, y, config} = this
    const {cellSize} = config
    performRotatedDraw(() => {
      this.ctx.clearRect(x - cellSize / 2 - 1, y - cellSize / 2 - 1, cellSize + 2, cellSize + 2)
    }, {anchorPoint: this, rotationDeg: this.currRotation, ctx: this.ctx})
  }
  draw() {
    const {x, y, currRotation, ctx, config} = this
    const {cellSize, colors} = config

    performRotatedDraw(() => {
      // Rotated rectangle
      ctx.fillStyle = colors.snake
      ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize, cellSize)
    }, {anchorPoint: this, rotationDeg: this.currRotation, ctx: this.ctx})
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
  