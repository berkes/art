use bertools::schemes;
use nannou::prelude::*;
use nannou::rand::seq::SliceRandom;
use nannou::rand::thread_rng;

mod models;
use crate::models::Model;
use bertools::do_save;
use bertools::Nannou;

impl Default for Model {
    fn default() -> Self {
        Self {
            background_color: schemes::navy()[1],
            foreground_color: schemes::navy()[0],
            at_index: 0,
        }
    }
}

enum Direction {
    Right,
    Up,
    Left,
    Down,
}

impl Direction {
    fn next(&self) -> Direction {
        match self {
            Direction::Right => Direction::Up,
            Direction::Up => Direction::Left,
            Direction::Left => Direction::Down,
            Direction::Down => Direction::Right,
        }
    }
}

struct SquareSpiral {
    current: Point2,
    direction: Direction,
    step_size: f32,
    steps_taken: i32,
    steps_before_turn: i32,
    turns_taken: i32,
}

impl SquareSpiral {
    fn new(center: Point2, step_size: f32) -> Self {
        SquareSpiral {
            step_size,
            current: center,
            direction: Direction::Right,
            steps_taken: 0,
            steps_before_turn: 1,
            turns_taken: 0,
        }
    }
}

impl Iterator for SquareSpiral {
    type Item = Point2;

    fn next(&mut self) -> Option<Self::Item> {
        // Return the current point
        let result = self.current;

        // Move to next position
        match self.direction {
            Direction::Right => self.current.x += self.step_size,
            Direction::Up => self.current.y += self.step_size,
            Direction::Left => self.current.x -= self.step_size,
            Direction::Down => self.current.y -= self.step_size,
        }

        self.steps_taken += 1;

        // Check if we need to turn
        if self.steps_taken == self.steps_before_turn {
            self.direction = self.direction.next();
            self.steps_taken = 0;
            self.turns_taken += 1;

            // Every two turns, increase the distance we need to go
            if self.turns_taken % 2 == 0 {
                self.steps_before_turn += 1;
            }
        }

        Some(result)
    }
}

fn main() {
    nannou::app(model)
        .update(update)
        .event(event)
        .loop_mode(LoopMode::loop_ntimes(0))
        .run();
}

fn model(app: &App) -> Model {
    let _window = app
        .new_window()
        .title("Find Love in Chaos")
        .size(800, 800)
        .view(view)
        .build()
        .unwrap();

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
    let mut visited: Vec<Point2> = Vec::new();
    let draw = app.draw();
    model.view(app, &draw);

    draw.background().color(model.foreground_color);

    let win = app.window_rect();
    let win = win.pad(20.0);

    draw.rect()
        .x_y(0.0, 0.0)
        .w_h(win.w(), win.h())
        .color(model.background_color);

    let mut at = pt2(0.0, 0.0);

    for point in SquareSpiral::new(at, BLOCK_SIZE / 4.0).take(80) {
        visited.push(point);
    }

    at = visited[visited.len() - 1];

    let mut at_index = 0;

    for _i in 0..2000 {
        let mut rand_orientations = ORIENTATIONS;
        rand_orientations.shuffle(&mut thread_rng());

        // INK: find the first orientation
        let towards = rand_orientations.into_iter().find(|orientation| {
            let opt = match *orientation {
                "up" => pt2(at.x, at.y + BLOCK_SIZE),
                "down" => pt2(at.x, at.y - BLOCK_SIZE),
                "left" => pt2(at.x - BLOCK_SIZE, at.y),
                "right" => pt2(at.x + BLOCK_SIZE, at.y),
                _ => pt2(0.0, 0.0),
            };

            if visited.contains(&opt) {
                return false;
            }

            if opt.x < win.left()
                || opt.x > win.right()
                || opt.y < win.bottom()
                || opt.y > win.top()
            {
                return false;
            }

            return true;
        });

        match towards {
            Some(orientation) => {
                let next_point = match orientation {
                    "up" => pt2(at.x, at.y + BLOCK_SIZE),
                    "down" => pt2(at.x, at.y - BLOCK_SIZE),
                    "left" => pt2(at.x - BLOCK_SIZE, at.y),
                    "right" => pt2(at.x + BLOCK_SIZE, at.y),
                    _ => pt2(0.0, 0.0),
                };
                at = next_point;
                at_index = visited.len();
                visited.push(at);
            }
            None => {
                // Backtrack but keep the current point and only if there are visited points
                if at_index > 0 {
                    at_index -= 1;
                    at = visited[at_index];
                    visited.push(at);
                } else {
                    // Pick a random point on the visited list and start from there
                    let random_point = visited.choose(&mut thread_rng()).unwrap();
                    at = *random_point;
                    visited.push(at);
                }
            }
        }
    }

    draw.polyline()
        .weight(BLOCK_SIZE / 2.0)
        .points(visited)
        .color(model.foreground_color);

    draw.to_frame(app, &frame).unwrap();
}

const BLOCK_SIZE: f32 = 40.0;
const ORIENTATIONS: [&str; 4] = ["up", "down", "left", "right"];

impl Nannou for Model {
    fn view(&self, app: &App, draw: &Draw) {}

    fn update(&mut self) {}
}
