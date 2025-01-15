use nannou::{color::Hsla, geom::Point2};

pub struct Model {
    pub background_color: Hsla,
    pub stroke_width: f32,
    pub ctrl1: Point2,
    pub ctrl2: Point2,
}
