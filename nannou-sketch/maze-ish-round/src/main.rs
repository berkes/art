use nannou::{
    prelude::*,
    rand::{seq::SliceRandom, thread_rng},
};

use bertools::do_save;
use bertools::Nannou;

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
        .title("Bers tile pattern")
        .size(800, 800)
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

            if let Some(KeyPressed(Key::Space)) = simple {
                do_resize(model);
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

fn do_resize(model: &mut Model) {
    let sizes = vec![800., 400., 200., 100., 50., 25.];

    let current_size = model.tiles[0].tile_size;
    let next_size = sizes
        .iter()
        .find(|&&s| s < current_size)
        .unwrap_or(&sizes.first().unwrap());

    model.tiles.iter_mut().for_each(|t| {
        t.tile_size = *next_size;
    });
}

struct Model {
    background_color: Hsla,
    tiles: Vec<Tile>,
}

#[derive(Debug)]
struct Tile {
    line_color: Hsla,
    orientation: f32,
    resolution: usize,
    tile_size: f32,
}

impl Default for Model {
    fn default() -> Self {
        let n_tiles = 3000;

        let mut rng = thread_rng();
        let orientations = [0., 90.];
        let tiles = (0..n_tiles)
            .map(|_| {
                let orientation = orientations.choose(&mut rng).unwrap();
                Tile::new(*orientation)
            })
            .collect();

        Self {
            background_color: hsla(0., 0., 0.92, 1.0),
            tiles,
        }
    }
}

impl Default for Tile {
    fn default() -> Self {
        Self {
            line_color: hsla(210., 0.25, 0.14, 1.0),
            orientation: 0.,
            resolution: 100,
            tile_size: 800.,
        }
    }
}

impl Tile {
    fn new(orientation: f32) -> Self {
        Self {
            orientation,
            ..Self::default()
        }
    }
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

        let row_size = (app.window_rect().w() / tile_size) + 2.; // Add 2 to make sure we cover the whole window
        let max_rows = (app.window_rect().h() / tile_size) + 1.; // Add 1 to make sure we cover the whole window

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

impl Nannou for Tile {
    fn view(&self, _app: &App, draw: &Draw) {
        let half_tile: f32 = self.tile_size / 2.;
        // Move the tile to the left
        // Rotate around the center of the tile
        let draw = draw.rotate(deg_to_rad(self.orientation));

        let bottom_left = pt2(-half_tile, -half_tile);
        let top_right = pt2(half_tile, half_tile);

        let radius = self.tile_size / 2.;
        let start_angle = deg_to_rad(0.);
        let end_angle = deg_to_rad(90.);

        let points = (0..=self.resolution).map(|i| {
            let t = map_range(i, 0, self.resolution, start_angle, end_angle);
            let x = bottom_left.x + t.cos() * radius;
            let y = bottom_left.y + t.sin() * radius;

            pt2(x, y)
        });

        draw.polyline()
            .weight(2.)
            .points(points)
            .color(self.line_color);

        let start_angle = deg_to_rad(180.);
        let end_angle = deg_to_rad(270.);

        let points = (0..=self.resolution).map(|i| {
            let t = map_range(i, 0, self.resolution, start_angle, end_angle);
            let x = top_right.x + t.cos() * radius;
            let y = top_right.y + t.sin() * radius;

            pt2(x, y)
        });

        draw.polyline()
            .weight(2.)
            .points(points)
            .color(self.line_color);
    }

    fn update(&mut self) {}
}
