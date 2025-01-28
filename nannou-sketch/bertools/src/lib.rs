use chrono;
use nannou::rand::random_range;
use nannou::{App, Draw};

pub mod schemes;

/// Things that can be drawn on the screen.
pub trait Nannou {
    fn view(&self, app: &App, draw: &Draw);
    fn update(&mut self);
}

pub fn do_save(app: &App) {
    let now = chrono::offset::Local::now();
    let location = std::env::var("SAVES_LOCATION").unwrap_or("../saves/".to_string());

    app.main_window().capture_frame(format!(
        "{}{}{}{}",
        location,
        app.exe_name().unwrap(),
        now.format("%Y-%m-%d-%H-%M-%S"),
        ".png"
    ));
}

pub enum Direction {
    Right,
    Up,
    Left,
    Down,
}

impl Direction {
    pub fn next(&self) -> Direction {
        match self {
            Direction::Right => Direction::Up,
            Direction::Up => Direction::Left,
            Direction::Left => Direction::Down,
            Direction::Down => Direction::Right,
        }
    }

    pub fn random() -> Direction {
        match random_range(0, 4) {
            0 => Direction::Right,
            1 => Direction::Up,
            2 => Direction::Left,
            _ => Direction::Down,
        }
    }
}
