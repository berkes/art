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
    let file_name = format!(
        "{}{}{}{}",
        saves_location(),
        app.exe_name().unwrap(),
        now.format("%Y-%m-%d-%H-%M-%S"),
        ".png"
    );

    app.main_window().capture_frame(file_name.as_str());
    println!("Saved to file://{}", file_name);
}

pub struct Record {
    pub location: String,
    pub started_at: chrono::DateTime<chrono::Local>,
}
impl Record {
    pub fn new(app: &App) -> Self {
        let now = chrono::offset::Local::now();
        let location = format!("{}{}{}{}/", 
            saves_location(),
            "rec",
            app.exe_name().unwrap(),
            now.format("%Y-%m-%d-%H-%M-%S")
        );
        std::fs::create_dir_all(location.clone()).unwrap();

        Record {
            location,
            started_at: now,
        }
    }

    pub fn record(&self, app: &App) {
        let frame = app.elapsed_frames();
        let file_name = format!("{}{}-{}.png", self.location, app.exe_name().unwrap(), frame);
        app.main_window().capture_frame(file_name.as_str());
    }

    pub fn finish(&self) {
        println!("Saved to file://{}", self.location);
    }
}

pub fn saves_location() -> String {
    std::env::var("SAVES_LOCATION").unwrap_or("../saves/".to_string())
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
