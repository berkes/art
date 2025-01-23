mod models;

use nannou::prelude::*;

use models::Cell;
use models::Model;

use bertools::do_save;
use bertools::schemes;
use bertools::Nannou;
use nannou::rand::seq::IteratorRandom;
use nannou::rand::thread_rng;

impl Default for Model {
    fn default() -> Self {
        let cols = 40;
        let rows = 40;
        let foreground_color = *schemes::CHOCOLATE_COSMOS;
        let background_color = *schemes::SANDY_BROWN;
        let highlight_color = *schemes::CLARET;

        Self {
            background_color,
            foreground_color,
            highlight_color,
            height: 0.0,
            width: 0.0,
            cols,
            rows,
            cells: Vec::default(),
            stack: Vec::default(),
            current: None,
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
    let window_height = 800.0;
    let window_width = 800.0;
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
        let draw = draw.translate(pt3(-self.height / 2.0, -self.width / 2.0, 0.0));

        draw.background().color(self.background_color);
        self.cells.iter().for_each(|cell| cell.view(app, &draw));

        if self.current.is_none() {
            app.set_loop_mode(LoopMode::loop_once());
        }
    }

    fn update(&mut self) {
        if let Some(current_idx) = self.current {
            self.cells.iter_mut().for_each(|cell| {
                if cell.decay > 0.0 {
                    cell.decay -= 0.1;
                }
            });
            self.cells[current_idx as usize].decay = 1.0;

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
                self.cells.iter_mut().for_each(|cell| {
                    cell.decay = 0.0;
                });
                self.current = None;
            }
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
        let Model {
            foreground_color, ..
        } = Model::default();

        let draw_line = |draw: &Draw, start: Point2, end: Point2| {
            draw.line()
                .start(start)
                .end(end)
                .color(foreground_color)
                .stroke_weight(stroke_weight);
            // Start and End Caps. Somehow the caps_square() method is not working?
            draw.rect()
                .xy(start)
                .w_h(stroke_weight, stroke_weight)
                .color(foreground_color)
                .stroke_weight(0.0);
            draw.rect()
                .xy(end)
                .w_h(stroke_weight, stroke_weight)
                .color(foreground_color)
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
