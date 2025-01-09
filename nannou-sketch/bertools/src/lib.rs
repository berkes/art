use nannou::{App, Draw};
use chrono;

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
