use nannou::color::Hsla;

pub struct Model {
    pub background_color: Hsla,
    pub tiles: Vec<Tile>,
}

#[derive(Debug)]
pub struct Tile {
    pub line_color: Hsla,
    pub orientation: f32,
    pub resolution: usize,
    pub tile_size: f32,
}

impl Tile {
    pub fn new(orientation: f32) -> Self {
        let default = Self::default();
        Self {
            orientation,
            ..default
        }
    }
}
