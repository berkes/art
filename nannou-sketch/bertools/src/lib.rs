use chrono;
use nannou::{App, Draw};

const IMAGE_LOCATION: &str = "../saves/";

/// Things that can be drawn on the screen.
pub trait Nannou {
    fn view(&self, app: &App, draw: &Draw);
    fn update(&mut self);
}

pub fn do_save(app: &App) {
    let now = chrono::offset::Local::now();

    app.main_window().capture_frame(format!(
        "{}{}{}{}",
        IMAGE_LOCATION,
        app.exe_name().unwrap(),
        now.format("%Y-%m-%d-%H-%M-%S"),
        ".png"
    ));
}

pub mod schemes {
    use nannou::color::Hsla;

    pub fn navy() -> [Hsla; 3] {
        [
            Hsla::new(212.0, 0.856, 0.3, 1.0), // #0B498E
            Hsla::new(23.0, 0.25, 0.937, 1.0), // #f3eeeb
            Hsla::new(212.0, 0.856, 0.1, 1.0), // #rgb(4 24 47)
        ]
    }
}
