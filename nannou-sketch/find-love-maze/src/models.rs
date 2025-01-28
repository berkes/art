use std::hash::{Hash, Hasher};

use bertools::Record;
use nannou::color::Hsla;
use nannou::rand::rngs::StdRng;
use nannou::rand::{Rng, SeedableRng};

#[derive(Debug, Clone)]
pub struct Cell {
    pub top_wall: bool,
    pub right_wall: bool,
    pub bottom_wall: bool,
    pub left_wall: bool,
    pub visited: bool,
    pub start: bool,
    pub height: f32,
    pub width: f32,
    pub col: i32,
    pub row: i32,
    pub foreground_color: Hsla,
}

impl Cell {
    pub fn new(col: i32, row: i32, height: f32, width: f32, foreground_color: Hsla) -> Self {
        Self {
            top_wall: true,
            right_wall: true,
            bottom_wall: true,
            left_wall: true,
            visited: false,
            start: false,
            height,
            width,
            col,
            row,
            foreground_color,
        }
    }
}

pub struct Model {
    pub seed: String,
    pub rng: StdRng,
    pub recorder: Option<Record>,
    pub background_color: Hsla,
    pub foreground_color: Hsla,
    pub highlight_color: Hsla,
    pub height: f32,
    pub width: f32,
    pub padding_cells: i32,
    pub cols: i32,
    pub rows: i32,
    pub cells: Vec<Cell>,
    pub stack: Vec<i32>,
    pub current: Option<i32>,
    pub center_icon: Option<Heart>,
    pub border_icon: Option<Heart>,
}

impl Model {
    pub fn new(height: f32, width: f32, seed: String, recorder: Option<Record>) -> Self {
        let default = Self::default();

        // Convert seed String to a u64
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        seed.hash(&mut hasher);
        let seed_n = hasher.finish();

        let mut rng = StdRng::seed_from_u64(seed_n);

        let foreground_color = Hsla::new(
            default.foreground_color.hue,
            default.foreground_color.saturation * rng.gen_range(0.8..1.0), // random slightly less saturated
            default.foreground_color.lightness * rng.gen_range(1.0..1.2), // random Slightly more pastel
            default.foreground_color.alpha,
        );

        let highlight_color = Hsla::new(
            foreground_color.hue,
            foreground_color.saturation * 1.0, // slightly brighter
            foreground_color.lightness,
            foreground_color.alpha,
        );

        let background_color = Hsla::new(
            default.background_color.hue,
            default.background_color.saturation * rng.gen_range(0.6..1.0), // random slightly less saturated
            default.background_color.lightness * rng.gen_range(1.0..1.2),  // random slightly darker
            default.background_color.alpha,
        );

        let cell_height = height / (default.rows + default.padding_cells) as f32;
        let cell_width = width / (default.cols + default.padding_cells) as f32;

        let mut cells = vec![];
        for row in 0..default.rows {
            for col in 0..default.cols {
                cells.push(Cell::new(
                    col,
                    row,
                    cell_height,
                    cell_width,
                    foreground_color,
                ));
            }
        }

        let icon = Some(Heart::new(0, 0, cell_height, highlight_color));

        Self {
            recorder,
            seed: seed.clone(),
            rng: StdRng::seed_from_u64(seed_n),
            foreground_color,
            background_color,
            highlight_color,
            height,
            width,
            cells,
            center_icon: icon,
            ..Self::default()
        }
    }

    pub fn cell_height(&self) -> f32 {
        self.height / (self.rows + self.padding_cells) as f32
    }

    pub fn cell_width(&self) -> f32 {
        self.width / (self.cols + self.padding_cells) as f32
    }

    pub fn index(&self, col: i32, row: i32) -> Option<usize> {
        // Detect borders
        if col < 0 || row < 0 || col > self.cols - 1 || row > self.rows - 1 {
            None
        } else {
            // Return the index
            Some((col + row * self.cols) as usize)
        }
    }

    pub fn cell_at(&self, col: i32, row: i32) -> Option<&Cell> {
        self.index(col, row).map(|index| &self.cells[index])
    }

    pub(crate) fn unvisited_neighbors(&self, col: i32, row: i32) -> Vec<(i32, i32)> {
        let mut neighbors = vec![];
        let directions = vec![
            (0, -1), // top
            (1, 0),  // right
            (0, 1),  // bottom
            (-1, 0), // left
        ];

        for (dx, dy) in directions {
            let new_col = col + dx;
            let new_row = row + dy;

            if let Some(cell) = self.cell_at(new_col, new_row) {
                if !cell.visited {
                    neighbors.push((new_col, new_row));
                }
            }
        }

        neighbors
    }
}

pub struct Heart {
    pub row: i32,
    pub col: i32,
    pub height: f32,
    pub color: Hsla,
}

impl Heart {
    pub fn new(row: i32, col: i32, size: f32, color: Hsla) -> Self {
        Self {
            row,
            col,
            height: size,
            color,
        }
    }
}
