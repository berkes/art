use nannou::{color::Hsla, geom::Point2};

pub struct Model {
    pub background_color: Hsla,
    pub foreground_color: Hsla,
    pub angle: f32,
    pub offsets: Vec<f32>,
}
