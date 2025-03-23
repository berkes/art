use models::TileType;
use nannou::prelude::*;

mod models;
use crate::models::{Model, Tile};
use bertools::do_save;
use bertools::Nannou;

const LINE_FACTOR: f32 = 0.15;

impl Default for Model {
    fn default() -> Self {
        let n_tiles = 4000;
        let background_color = hsla(0., 0., 0.04, 1.0);
        Self {
            background_color,
            tiles: Tile::n_instances(n_tiles),
        }
    }
}

impl Default for Tile {
    fn default() -> Self {
        Self {
            // line_color: hsla(0., 0.15, 0.14, 1.0),
            line_color: hsla(0.8333, 0.4, 0.5, 1.0),
            orientation: 0,
            tile_size: 800.,
            resolution: 100,
            tile_type: TileType::Rounded,
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

            if let Some(KeyPressed(Key::Space)) = simple {
                do_resize(model);
            }

            if let Some(KeyPressed(Key::R)) = simple {
                model.tiles.iter_mut().for_each(|t| {
                    t.orientation = random_range(0, 2);
                });
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

impl Tile {
    fn n_instances(n: usize) -> Vec<Self> {
        (0..n)
            .map(|_| {
                let orientation = random_range(0, 2);
                let tile = Tile::new(orientation);

                let chance = random_range(0., 100.);
                match chance {
                    0.0..=66.0 => {
                        let mut tile = tile;
                        tile.tile_type = TileType::Rounded;
                        tile
                    }
                    66.0..=77.0 => {
                        let mut tile = tile;
                        tile.tile_type = TileType::Chamfered;
                        tile
                    }
                    _ => {
                        let mut tile = tile;
                        tile.tile_type = TileType::Cross;
                        tile
                    }
                }
            })
            .collect()
    }

    fn halve_circles(tile_size: f32, resolution: usize) -> Vec<Vec<Point2>> {
        let half_tile: f32 = tile_size / 2.;

        let bottom_left = pt2(-half_tile, -half_tile);
        let top_right = pt2(half_tile, half_tile);

        let radius = tile_size / 2.;
        let start_angle = deg_to_rad(0.);
        let end_angle = deg_to_rad(90.);

        let bottom_left_points = (0..=resolution)
            .map(|i| {
                let t = map_range(i, 0, resolution, start_angle, end_angle);
                let x = bottom_left.x + t.cos() * radius;
                let y = bottom_left.y + t.sin() * radius;

                pt2(x, y)
            })
            .collect();

        let start_angle = deg_to_rad(180.);
        let end_angle = deg_to_rad(270.);

        let top_right_points = (0..=resolution)
            .map(|i| {
                let t = map_range(i, 0, resolution, start_angle, end_angle);
                let x = top_right.x + t.cos() * radius;
                let y = top_right.y + t.sin() * radius;

                pt2(x, y)
            })
            .collect();

        vec![bottom_left_points, top_right_points]
    }

    fn chamfered(tile_size: f32, _resolution: usize) -> Vec<Vec<Point2>> {
        let half_tile: f32 = tile_size / 2.;

        let bottom_left_points = vec![
            pt2(0., -half_tile),
            pt2(0., -half_tile / 2.),
            pt2(-half_tile / 2., 0.),
            pt2(-half_tile, 0.),
        ];
        let top_right_points = vec![
            pt2(half_tile, 0.),
            pt2(half_tile / 2., 0.),
            pt2(0., half_tile / 2.),
            pt2(0., half_tile),
        ];

        vec![bottom_left_points, top_right_points]
    }

    fn cross(tile_size: f32, _resolution: usize) -> Vec<Vec<nannou::prelude::Vec2>> {
        let half_tile: f32 = tile_size / 2.;
        let mut points = vec![];
        points.push(vec![pt2(0., half_tile), pt2(0., -half_tile)]);
        points.push(vec![pt2(half_tile, 0.), pt2(-half_tile, 0.)]);
        points
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

impl Nannou for Tile {
    fn view(&self, _app: &App, draw: &Draw) {
        // Rotate around the center of the tile
        let draw = draw.rotate(deg_to_rad(self.orientation as f32 * 90.));
        let lines = match self.tile_type {
            TileType::Rounded => Self::halve_circles(self.tile_size, self.resolution),
            TileType::Chamfered => Self::chamfered(self.tile_size, self.resolution),
            TileType::Cross => Self::cross(self.tile_size, self.resolution),
        };

        let weight = self.tile_size * LINE_FACTOR;
        lines.into_iter().for_each(|points| {
            draw.polyline()
                .weight(weight)
                .points(points.iter().cloned())
                .color(self.line_color);
        });
    }

    fn update(&mut self) {}
}
