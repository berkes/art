pub struct Grid {
    tiles: Vec<&Tile>,
}

impl Grid {
    pub fn new() -> Self {
        Self { tiles: Vec::new() }
    }
}

pub struct Tile {
    pub position: nannou::prelude::Point2,
}
