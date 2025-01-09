use nannou::{App, Draw};

/// Things that can be drawn on the screen.
pub trait Nannou {
    fn view(&self, app: &App, draw: &Draw);
    fn update(&mut self);
}
