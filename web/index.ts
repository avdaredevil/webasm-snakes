import init, {greet, draw_rect} from "snake_game"

async function main() {
  await init()
  greet("AP-A")
  draw_rect(0, 0, 100, 100)
}

main().catch(e => console.error(e))