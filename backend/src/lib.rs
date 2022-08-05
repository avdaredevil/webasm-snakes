pub mod snake;
use wasm_bindgen::prelude::*;
use web_sys::console;
use rand::Rng;
pub use snake::Snake;


#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
    pub fn setScore(n: usize);
}

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct World {
    pub rows: usize,
    pub cols: usize,
    pub food: usize,
    score: usize,
    snake: Snake,
}

#[wasm_bindgen]
impl World {
    pub fn new(rows: usize, cols: usize) -> Self {
        let mut rng = rand::thread_rng();
        console::log_1(&format!("Snake Game initialized {} {}!", rows, cols).into());
        let snake_size = 1;
        let snake_row = rng.gen_range(0..(rows - snake_size));
        let snake_col = rng.gen_range(0..cols);
        World {
            rows,
            cols,
            food: rng.gen_range(0..(rows * cols)),
            score: 0,
            snake: Snake::new(snake_size, snake_row, snake_col, cols, rows),
        }
    }

    pub fn snake_head(&self) -> usize {
        self.snake.head()
    }
    pub fn is_dead(&self) -> String {
        self.snake.dead_msg.clone()
    }
    pub fn snake(&self) -> JsValue {
        // let serialized_arr = self.snake.body.iter().map(|cell| cell.0).collect::<Vec<usize>>();
        return JsValue::from(JsValue::from_serde(&self.snake).map_err(|e| console::log_1(&format!("{:?}", e).into())).ok());
    }
    pub fn set_direction(&mut self, direction: String) {
        self.snake.set_direction(direction);
    }
    pub fn tick(&mut self) {
        self.snake.tick();
        if self.snake.head() == self.food {
            self.food = rand::thread_rng().gen_range(0..(self.rows * self.cols));
            self.snake.grow();
            self.score += 1;
            setScore(self.score)
        }
    }
}

