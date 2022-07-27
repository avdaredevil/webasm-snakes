use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn greet(name: &str) {
    console::log_1(&"AP".into());
    console::log_2(&"Hello, world &s!".into(), &(name).into());
}

#[wasm_bindgen]
pub fn draw_rect(x: i32, y: i32, width: i32, height: i32) {
    console::log_3(&"draw_rect".into(), &x.into(), &y.into());
    console::log_3(&"draw_rect".into(), &width.into(), &height.into());
}
