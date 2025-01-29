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
    pub tmp_location: String,
    pub video_location: String,
    pub started_at: chrono::DateTime<chrono::Local>,
}
impl Record {
    pub fn new(app: &App) -> Self {
        let now = chrono::offset::Local::now();
        let unique_name = format!(
            "{}{}",
            app.exe_name().unwrap(),
            now.format("%Y-%m-%d-%H-%M-%S")
        );

        // create a tmp directory
        let os_tmp_dir = std::env::temp_dir();
        let location = os_tmp_dir.join(&unique_name);
        std::fs::create_dir_all(&location).unwrap();

        Record {
            tmp_location: location.to_string_lossy().to_string(),
            video_location: format!("{}/{}{}", saves_location(), unique_name, ".mp4"),
            started_at: now,
        }
    }

    pub fn record(&self, app: &App) {
        // directory should exist
        if !std::path::Path::new(&self.tmp_location).exists() {
            println!(
                "Error: tmp directory does not exist or was removed. Continuing without recording."
            );
            return;
        }

        let file_name = format!(
            "{}/{}{}.png",
            self.tmp_location,
            "frame",
            app.elapsed_frames(),
        );
        app.main_window().capture_frame(file_name.as_str());
    }

    pub fn finish(&self) {
        // Shell out to ffmpeg to create a video
        // ffmpeg -framerate 30 -i %d.png -c:v libx264 -profile:v high -crf 20 -pix_fmt yuv420p output.mp4
        let _out = std::process::Command::new("ffmpeg")
            .arg("-framerate")
            .arg("30")
            .arg("-i")
            .arg(format!("{}/{}%d.png", self.tmp_location, "frame"))
            .arg("-c:v")
            .arg("libx264")
            .arg("-profile:v")
            .arg("high")
            .arg("-crf")
            .arg("20")
            .arg("-pix_fmt")
            .arg("yuv420p")
            .arg(&self.video_location)
            .output()
            .unwrap();

        // remove the tmp directory
        if let Err(e) = std::fs::remove_dir_all(&self.tmp_location) {
            println!("Error removing tmp directory: {}", e);
        }

        println!("Saved to file://{}", self.video_location);
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
