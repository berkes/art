use nannou::color::Hsla;

pub struct Model {
    pub background_color: Hsla,
    pub tiles: Vec<Tile>,
}

#[derive(Debug)]
pub struct Tile {
    pub line_color: Hsla,
    pub orientation: u8,
    pub resolution: usize,
    pub tile_size: f32,
    pub tile_type: TileType,
}

#[derive(Debug)]
pub enum TileType {
    StraightEdge,
    Chamfered,
    Rounded,
}

impl Tile {
    pub fn new(orientation: u8) -> Self {
        let default = Self::default();
        Self {
            orientation,
            ..default
        }
    }
}
