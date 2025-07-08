use models::TileType;
use nannou::prelude::*;

mod models;
use crate::models::{Model};
use bertools::do_save;
use bertools::Nannou;
use bertools::grid::Grid;

const LINE_FACTOR: f32 = 0.15;

impl Default for Model {
    fn default() -> Self {
        let n_tiles = 4000;
        let tile_height = 10.0;
        let tile_width = 10.0;
        let background_color = hsla(0., 0., 0.04, 1.0);
        Self {
            background_color,
            grid: Grid::new(n_tiles, tile_width, tile_height),
        }
    }
}

fn main() {
    nannou::app(model)
        .update(update)
        .event(event)
        .loop_mode(LoopMode::Wait)
        .run();
}

fn model(app: &App) -> Model {
    let _window = app
        .new_window()
        .title("Divertile")
        .size(2560, 1440)
        .view(view)
        .build()
        .unwrap();

    Model::default()
}

fn event(app: &App, model: &mut Model, event: Event) {
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
        let tile_size = self
            .tiles
            .iter()
            .map(|t| t.tile_size as usize)
            .max()
            .unwrap() as f32;

        // Move to top-left
        let top_left = app.window_rect().top_left();
        let draw = draw.xy(top_left - vec2(tile_size / 2., -tile_size / 2.));

        draw.background().color(self.background_color);
        // Add 2 to make sure we cover the whole window
        let row_size = (app.window_rect().w() / tile_size) + 2.;
        // Add 1 to make sure we cover the whole window
        let max_rows = (app.window_rect().h() / tile_size) + 1.;

        self.tiles
            .chunks(row_size as usize)
            .enumerate()
            .for_each(|(i, row)| {
                if i > max_rows as usize {
                    return;
                }
                // Move the row down one tile
                let draw = draw.y(i as f32 * -tile_size);
                row.iter().enumerate().for_each(|(j, tile)| {
                    // Move the tile to the right
                    let draw = draw.x(j as f32 * tile_size);
                    tile.view(app, &draw);
                });
            });
    }

    fn update(&mut self) {
        self.tiles.iter_mut().for_each(|t| t.update());
    }
}
