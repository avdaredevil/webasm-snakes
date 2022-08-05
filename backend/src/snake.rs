use std::vec;

use std::collections::HashSet;
use serde::{Serialize, Deserialize};
use web_sys::console;

#[derive(Serialize, Deserialize, Clone, PartialEq, Copy)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SnakeCell(pub usize, pub Direction);

#[derive(Serialize, Deserialize)]
pub struct Snake {
    row_size: usize,
    num_rows: usize,
    direction: Direction,
    growth_factor: usize,
    cell_pos_set: HashSet<usize>,
    pub dead_msg: String,
    pub body: Vec<SnakeCell>,
}

impl Snake {
    pub fn new(size: usize, row: usize, col: usize, row_size: usize, num_rows: usize) -> Self {
        let mut body = Vec::new();
        let mut cell_pos_set = HashSet::new();
        for i in 0..size {
            let coord = col + (row + i) * row_size;
            body.push(SnakeCell(coord, Direction::Up));
            cell_pos_set.insert(coord);
        }
        Snake {
            body,
            row_size,
            num_rows,
            direction: Direction::Up,
            dead_msg: "".to_string(),
            cell_pos_set,
            growth_factor: 4,
        }
    }
    pub fn head(&self) -> usize {
        self.body[0].0
    }
    pub fn size(&self) -> usize {
        self.body.len()
    }
    pub fn set_direction(&mut self, direction: String) {
        let head = self.body[0].1;
        match direction.as_ref() {
            "up" => {
                if head != Direction::Down {
                    self.direction = Direction::Up;
                }
            }
            "down" => {
                if head != Direction::Up {
                    self.direction = Direction::Down;
                }
            }
            "left" => {
                if head != Direction::Right {
                    self.direction = Direction::Left;
                }
            }
            "right" => {
                if head != Direction::Left {
                    self.direction = Direction::Right;
                }
            }
            _ => {
                console::log_1(&format!("[Backend] Unknown direction {}", direction).into());
            }
        }
    }
    pub fn grow(&mut self) {
        self.growth_factor += 1;
    }
    pub fn tick(&mut self) {
        self.progress_head(self.body[0].to_owned(), self.direction);
    }
    fn progress_head(&mut self, cell: SnakeCell, direction: Direction) {
        if (direction == Direction::Up && cell.0 < self.row_size) || (direction == Direction::Down && cell.0 + self.row_size >= self.row_size * self.num_rows) || (direction == Direction::Left && cell.0 % self.row_size == 0) || (direction == Direction::Left && cell.0 == 0) {
            self.dead_msg = "Died from hitting a wall".to_string();
            console::log_1(&format!("[Backend] Snake out of bounds {} {}", cell.0, self.row_size).into());
            return;
        }
        let next_cell = match direction {
            Direction::Up => SnakeCell(cell.0 - self.row_size, direction),
            Direction::Down => SnakeCell(cell.0 + self.row_size, direction),
            Direction::Left => SnakeCell(cell.0 - 1, direction),
            Direction::Right => SnakeCell(cell.0 + 1, direction),
        };
        if cell.0 < self.row_size && direction == Direction::Up || next_cell.0 >= self.row_size * self.num_rows {
            self.dead_msg = "Died from hitting a wall".to_string();
            console::log_1(&format!("[Backend] Snake out of bounds {} {}", next_cell.0, self.row_size).into());
            return;
        }
        if (direction == Direction::Right && next_cell.0 % self.row_size == 0) || (cell.0 % self.row_size == 0 && direction == Direction::Left) {
            self.dead_msg = "Died from hitting a wall".to_string();
            console::log_1(&format!("[Backend] Snake hit wall {} {}", next_cell.0, self.row_size).into());
            return;
        }
        if self.cell_pos_set.contains(&next_cell.0) {
            self.dead_msg = "Died from eating yourself :P".to_string();
            console::log_1(&format!("[Backend] Snake hit itself {} {}", next_cell.0, self.row_size).into());
            return;
        }
        self.cell_pos_set.insert(next_cell.0);
        let mut new_body = vec![next_cell];
        let cells_to_remove = if self.growth_factor > 0 {0} else {1};
        if cells_to_remove > 0 {
            self.cell_pos_set.remove(&self.body[self.body.len() - 1].0);
        }
        new_body.extend(self.body.iter().take(self.body.len() - cells_to_remove).cloned());
        if self.growth_factor > 0 {
            self.growth_factor -= 1;
        }
        self.body = new_body;
    }
}
