use nannou::color::Hsla;

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
}

impl Cell {
    pub fn new(col: i32, row: i32, height: f32, width: f32) -> Self {
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
        }
    }
}

pub struct Model {
    pub background_color: Hsla,
    pub foreground_color: Hsla,
    pub highlight_color: Hsla,
    pub height: f32,
    pub width: f32,
    pub cols: i32,
    pub rows: i32,
    pub cells: Vec<Cell>,
    pub stack: Vec<i32>,
    pub current: Option<i32>,
    pub icon: Option<Heart>,
}

impl Model {
    pub fn new(height: f32, width: f32) -> Self {
        let default = Self::default();
        let cell_height = height / default.rows as f32;
        let cell_width = width / default.cols as f32;

        let mut cells = vec![];

        for row in 0..default.rows {
            for col in 0..default.cols {
                cells.push(Cell::new(col, row, cell_height, cell_width));
            }
        }

        let icon = Some(Heart::new(
            0,
            0,
            height / default.cols as f32,
            default.highlight_color,
        ));

        Self {
            height,
            width,
            cells,
            icon,
            ..Self::default()
        }
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
    pub size: f32,
    pub color: Hsla,
}

impl Heart {
    pub fn new(row: i32, col: i32, size: f32, color: Hsla) -> Self {
        Self {
            row,
            col,
            size,
            color,
        }
    }
}
