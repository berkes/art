use nannou::{
    prelude::*,
    rand::{seq::SliceRandom, thread_rng},
};

use bertools::do_save;
use bertools::Nannou;

fn main() {
    nannou::app(model)
        .update(update)
        .simple_window(view)
        .event(event)
        .run();
}

fn model(_app: &App) -> Model {
    Model::default()
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
    // Move to top-left
    let top_left = app.window_rect().top_left();
    let draw = draw.xy(top_left);
    model.view(app, &draw);
    draw.to_frame(app, &frame).unwrap();
}

struct Model {
    background_color: Hsla,
    tiles: Vec<Tile>,
}

#[derive(Debug)]
struct Tile {
    line_color: Hsla,
    orientation: f32,
}

impl Default for Model {
    fn default() -> Self {
        let mut rng = thread_rng();
        let angles = [0., 90., 180., 270.];
        let tiles = (0..N_TILES)
            .map(|_| Tile {
                orientation: *angles.choose(&mut rng).unwrap(),
                line_color: Hsla::new(100., 0.5, 0.1, 1.),
            })
            .collect();
        Self {
            background_color: Hsla::new(200., 0.0, 0.9, 1.),
            tiles,
        }
    }
}

impl Nannou for Model {
    fn view(&self, app: &App, draw: &Draw) {
        draw.background().color(self.background_color);
        let row_size = (app.window_rect().w() / TILE_SIZE) + 1.;
        self.tiles
            .chunks(row_size as usize)
            .enumerate()
            .for_each(|(i, row)| {
                let draw = draw.y(i as f32 * -TILE_SIZE);
                row.iter().enumerate().for_each(|(j, tile)| {
                    let draw = draw.x(j as f32 * TILE_SIZE);
                    tile.view(app, &draw);
                });
            });
    }

    fn update(&mut self) {
        self.tiles.iter_mut().for_each(|t| t.update());
    }
}

const N_TILES: usize = 1000;
const RESOLUTION: usize = 300;
const TILE_SIZE: f32 = 60.;

impl Nannou for Tile {
    fn view(&self, _app: &App, draw: &Draw) {
        let half_tile: f32 = TILE_SIZE / 2.;
        // Move the tile to the left
        // Rotate around the center of the tile
        let draw = draw.rotate(deg_to_rad(self.orientation));

        let ellipse_center = pt2(0., -half_tile);

        let radius = TILE_SIZE / 2.;
        let start_angle = deg_to_rad(0.);
        let end_angle = deg_to_rad(180.);

        let points = (0..=RESOLUTION).map(|i| {
            let t = map_range(i, 0, RESOLUTION, start_angle, end_angle);
            let x = ellipse_center.x + t.cos() * radius;
            let y = ellipse_center.y + t.sin() * radius;

            pt2(x, y)
        });

        draw.polyline()
            .weight(2.)
            .points(points)
            .color(self.line_color);

        draw.ellipse()
            .x_y(ellipse_center.x, ellipse_center.y)
            .radius(TILE_SIZE / 8.)
            .color(LIGHTPINK);
        draw.ellipse()
            .x_y(ellipse_center.x, ellipse_center.y)
            .radius(TILE_SIZE / 16.)
            .color(PINK);

        // draw.polyline()
        //     .weight(2.)
        //     .points(vec![
        //         pt2(ellipse_center.x, ellipse_center.y + radius),
        //         ellipse_center,
        //         pt2(ellipse_center.x + radius, ellipse_center.y),
        //     ])
        //      .color(RED);

        // draw.rect()
        //     .w_h(TILE_SIZE, TILE_SIZE)
        //     .no_fill()
        //     .stroke_color(self.line_color).stroke_weight(2.);
    }

    fn update(&mut self) {
        // self.orientation += 2.;
    }
}
