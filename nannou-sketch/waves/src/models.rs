use nannou::{color::Hsla, geom::Point2};

pub struct Model {
    pub background_color: Hsla,
    pub foreground_color: Hsla,
    pub default_wave_size: f32,
}

pub struct Wave {
    pub x: f32,
    pub y: f32,
    pub size: f32,
}
