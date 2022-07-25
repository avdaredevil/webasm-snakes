use wasm_bindgen::prelude::*;
use web_sys::console::{log_2};

#[wasm_bindgen]
pub fn greet(name: &str) {
    log_2(&"Hello, world {}!".into(), &(name).into());
}
