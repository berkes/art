mod models;

use nannou::geom::path::Builder;
use nannou::prelude::*;

use models::Cell;
use models::Heart;
use models::Model;

use bertools::do_save;
use bertools::schemes;
use bertools::Nannou;
use nannou::rand::seq::IteratorRandom;
use nannou::rand::thread_rng;

impl Default for Model {
    fn default() -> Self {
        let cols = 30;
        let rows = 30;
        let foreground_color = *schemes::CHOCOLATE_COSMOS;
        let background_color = *schemes::SANDY_BROWN;
        let highlight_color = foreground_color;

        Self {
            background_color,
            foreground_color,
            highlight_color,
            height: 0.0,
            width: 0.0,
            cols,
            rows,
            padding_cells: 4,
            cells: Vec::default(),
            stack: Vec::default(),
            current: None,
            center_icon: None,
            border_icon: None,
        }
    }
}

fn main() {
    nannou::app(model)
        .update(update)
        .event(event)
        .loop_mode(LoopMode::default())
        .run();
}

fn model(app: &App) -> Model {
    let window_height = 900.0;
    let window_width = 900.0;
    let _window = app
        .new_window()
        .title("Find Love in Chaos")
        .size(window_height as u32, window_width as u32)
        .view(view)
        .build()
        .unwrap();

    Model::new(window_height, window_width)
}

fn event(app: &App, _model: &mut Model, event: Event) {
    match event {
        Event::WindowEvent { id: _id, simple } => {
            if let Some(KeyPressed(Key::S)) = simple {
                do_save(app);
            }
        }
        _ => (),
    }
}

fn update(_app: &App, model: &mut Model, _update: Update) {
    model.update();
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();
    model.view(app, &draw);
    draw.to_frame(app, &frame).unwrap();
}

impl Nannou for Model {
    fn view(&self, app: &App, draw: &Draw) {
        let half_a_window = pt3(self.width / 2.0, self.height / 2.0, 0.0);
        let margin = pt3(
            self.cell_width() * (self.padding_cells / 2) as f32,
            self.cell_height() * (self.padding_cells / 2) as f32,
            0.0,
        );
        let draw = draw.translate(-half_a_window + margin);

        draw.background().color(self.background_color);
        self.cells.iter().for_each(|cell| cell.view(app, &draw));

        self.center_icon
            .iter()
            .for_each(|icon| icon.view(app, &draw));
        self.border_icon
            .iter()
            .for_each(|icon| icon.view(app, &draw));

        if self.current.is_none() {
            app.set_loop_mode(LoopMode::loop_ntimes(0));
        }
    }

    fn update(&mut self) {
        if let Some(current_idx) = self.current {
            let (next_col, next_row) = (current_idx % self.cols, current_idx / self.cols);

            let neighbors = self.unvisited_neighbors(next_col, next_row);

            if !neighbors.is_empty() {
                let (next_col, next_row) = neighbors.iter().choose(&mut thread_rng()).unwrap();
                let next_idx = self.index(*next_col, *next_row).unwrap();

                self.stack.push(current_idx);

                if let Some(next_idx) = self.index(*next_col, *next_row) {
                    // First, get the values we need to compare
                    let current_col = self.cells[current_idx as usize].col;
                    let current_row = self.cells[current_idx as usize].row;
                    let next_col = self.cells[next_idx].col;
                    let next_row = self.cells[next_idx].row;

                    self.cells[next_idx].visited = true;

                    let x = next_col - current_col;
                    let y = next_row - current_row;

                    match (x, y) {
                        (1, 0) => {
                            self.cells[current_idx as usize].right_wall = false;
                            self.cells[next_idx].left_wall = false;
                        }
                        (-1, 0) => {
                            self.cells[current_idx as usize].left_wall = false;
                            self.cells[next_idx].right_wall = false;
                        }
                        (0, 1) => {
                            self.cells[current_idx as usize].bottom_wall = false;
                            self.cells[next_idx].top_wall = false;
                        }
                        (0, -1) => {
                            self.cells[current_idx as usize].top_wall = false;
                            self.cells[next_idx].bottom_wall = false;
                        }
                        _ => (),
                    };
                }

                self.current = Some(next_idx as i32);
            } else if let Some(back) = self.stack.pop() {
                self.current = Some(back);
            } else {
                // Find a random cell at the border
                let border_cell = self
                    .cells
                    .iter()
                    .enumerate()
                    .filter_map(|(idx, cell)| {
                        if cell.col == 0
                            || cell.col == self.cols - 1
                            || cell.row == 0
                            || cell.row == self.rows - 1
                        {
                            Some(idx)
                        } else {
                            None
                        }
                    })
                    .choose(&mut thread_rng());

                // If we found one, find the outer wall and remove it.
                // Draw an icon on the border outside the maze
                let icon_col;
                let icon_row;
                if let Some(idx) = border_cell {
                    let cell = &self.cells[idx].clone();
                    if cell.col == 0 {
                        // left col
                        icon_col = -1;
                        icon_row = cell.row;
                        self.cells[idx].left_wall = false;
                    } else if cell.col == self.cols - 1 {
                        // right col
                        icon_col = self.cols;
                        icon_row = cell.row;
                        self.cells[idx].right_wall = false;
                    } else if cell.row == 0 {
                        // top row
                        icon_col = cell.col;
                        icon_row = -1;
                        self.cells[idx].top_wall = false;
                    } else {
                        // bottom row
                        icon_col = cell.col;
                        icon_row = self.rows;
                        self.cells[idx].bottom_wall = false;
                    };

                    let icon = Heart::new(icon_row, icon_col, cell.height, self.highlight_color);
                    self.border_icon = Some(icon);
                }

                self.current = None;
            }
        } else {
            let start_col = self.cols / 2; // random_range(0, self.cols);
            let start_row = self.rows / 2; // random_range(0, self.rows);
                                           // Put the icon in this start position
            if let Some(icon) = &mut self.center_icon {
                icon.col = start_col;
                icon.row = start_row;
            }
            // Take eight cells around the starting cell and the starting cell itself
            let start_cells = vec![
                (0, 0),
                (1, 0),
                (0, 1),
                (-1, 0),
                (0, -1),
                (1, 1),
                (-1, 1),
                (1, -1),
                (-1, -1),
            ];
            let mut last = start_col + start_row * self.cols;
            for (x, y) in start_cells {
                if let Some(idx) = self.index(start_col + x, start_row + y) {
                    self.cells[idx].start = true;
                    self.cells[idx].visited = true;
                    self.cells[idx].top_wall = false;
                    self.cells[idx].right_wall = false;
                    self.cells[idx].bottom_wall = false;
                    self.cells[idx].left_wall = false;
                    last = idx as i32;
                }
            }

            self.current = Some(last);
        }
    }
}

impl Nannou for Cell {
    fn view(&self, _app: &App, draw: &Draw) {
        let x = self.col as f32 * self.width;
        let y = self.row as f32 * self.height;

        let top = pt2(x, y);
        let right = pt2(x + self.width, y);
        let bottom = pt2(x + self.width, y + self.height);
        let left = pt2(x, y + self.height);

        let stroke_weight = self.width / 2.0;
        let center = pt2(x + self.width / 2.0, y + self.height / 2.0);

        if !self.visited {
            draw.rect()
                .xy(center)
                .w_h(self.width, self.height)
                .color(self.foreground_color)
                .stroke_weight(0.0);
        }

        let draw_line = |draw: &Draw, start: Point2, end: Point2| {
            draw.line()
                .start(start)
                .end(end)
                .color(self.foreground_color)
                .stroke_weight(stroke_weight);

            // Start and End Caps. Somehow the caps_square() method is not working?
            draw.rect()
                .xy(start)
                .w_h(stroke_weight, stroke_weight)
                .color(self.foreground_color)
                .stroke_weight(0.0);
            draw.rect()
                .xy(end)
                .w_h(stroke_weight, stroke_weight)
                .color(self.foreground_color)
                .stroke_weight(0.0);
        };

        if self.top_wall {
            draw_line(draw, top, right);
        }
        if self.right_wall {
            draw_line(draw, right, bottom);
        }
        if self.bottom_wall {
            draw_line(draw, bottom, left);
        }
        if self.left_wall {
            draw_line(draw, left, top);
        }
    }

    fn update(&mut self) {}
}

impl Nannou for Heart {
    fn view(&self, _app: &nannou::App, draw: &nannou::Draw) {
        let mut builder = Builder::new().with_svg();


        // Extract common values
        let size = self.height;
        let half_size = size / 2.0;
        let quarter_size = size / 4.0;

        let default_model = Model::default();
        let x;
        let y;
        // if one of the x and y is -1 or cols + 1 or rows + 1, then it is a border icon
        // In that case, we need to move the icon out with half_size
        if self.col == -1 {
            x = self.col as f32 * self.height - half_size;
            y = self.row as f32 * self.height;
        } else if self.col == default_model.cols {
            x = self.col as f32 * self.height + half_size;
            y = self.row as f32 * self.height;
        } else if self.row == -1 {
            x = self.col as f32 * self.height;
            y = self.row as f32 * self.height - half_size;
        } else if self.row == default_model.rows {
            x = self.col as f32 * self.height;
            y = self.row as f32 * self.height + half_size;
        } else {
            x = self.col as f32 * self.height;
            y = self.row as f32 * self.height;
        }

        let center = pt2(x + half_size, y + half_size);

        let width_adjustment = 0.6;
        let height_adjustment = 0.4 * quarter_size;

        // Control points for the Bézier curves
        let top_center = center + pt2(0.0, quarter_size + height_adjustment);
        let left_control_1 =
            center + pt2(-half_size * width_adjustment, half_size + height_adjustment);
        let left_control_2 = center + pt2(-size, height_adjustment);
        let bottom_center = center + pt2(0.0, -half_size + height_adjustment);
        let right_control_1 = center + pt2(size, height_adjustment);
        let right_control_2 =
            center + pt2(half_size * width_adjustment, half_size + height_adjustment);

        builder.move_to(top_center.to_array().into());

        // Draw the left half of the heart using Bézier curves
        builder.cubic_bezier_to(
            left_control_1.to_array().into(),
            left_control_2.to_array().into(),
            bottom_center.to_array().into(),
        );
        // Draw the right half of the heart using Bézier curves
        builder.cubic_bezier_to(
            right_control_1.to_array().into(),
            right_control_2.to_array().into(),
            top_center.to_array().into(),
        );

        draw.polygon()
            .stroke_weight(1.0)
            .stroke(self.color)
            .color(self.color)
            .events(builder.build().iter());
    }

    fn update(&mut self) {}
}
