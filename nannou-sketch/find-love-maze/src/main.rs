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
        let cols = 0;
        let rows = 0;
        let foreground_color = schemes::navy()[0];
        let background_color = schemes::navy()[1];

        Self {
            background_color,
            foreground_color,
            cols,
            rows,
            height: 0.0,
            width: 0.0,
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
        .loop_mode(LoopMode::rate_fps(60.0))
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

    Model::default().fill(800.0, 800.0, 10, 10)
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
        let draw = draw.translate(pt3(-400.0, -400.0, 0.0));

        draw.background().color(self.background_color);
        self.cells.iter().for_each(|cell| cell.view(app, &draw));
    }

    fn update(&mut self) {
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

        let center = pt2(x + self.width / 2.0, y + self.height / 2.0);

        let color = if self.visited { GRAY } else { WHITE };

        draw.ellipse().xy(center).w_h(10.0, 10.0).color(RED);

        draw.rect()
            .xy(center)
            .w_h(self.width, self.height)
            .color(color);

        if self.top_wall {
            draw.line().start(top).end(right).color(schemes::navy()[0]);
        }
        if self.right_wall {
            draw.line()
                .start(right)
                .end(bottom)
                .color(schemes::navy()[0]);
        }
        if self.bottom_wall {
            draw.line()
                .start(bottom)
                .end(left)
                .color(schemes::navy()[0]);
        }
        if self.left_wall {
            draw.line().start(left).end(top).color(schemes::navy()[0]);
        }
    }

    fn update(&mut self) {}
}
