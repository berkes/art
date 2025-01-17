use nannou::{color::Hsla, geom::Point2};

pub struct Model {
    pub background_color: Hsla,
    pub foreground_color: Hsla,
    pub angle: f32,
    pub offsets: Vec<f32>,
    pub centerpiece: Centerpiece,
    pub petals: Vec<Petal>,
}

pub struct Petal {
    pub background_color: Hsla,
    pub foreground_color: Hsla,
    pub start: Point2,
    pub ctrl1: Point2,
    pub ctrl2: Point2,
    pub end: Point2,
}
pub struct Centerpiece {
    pub radius: f32,
    pub background_color: Hsla,
    pub foreground_color: Hsla,
}
