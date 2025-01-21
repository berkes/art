use bertools::schemes;
use nannou::prelude::*;

mod models;
use crate::models::Model;
use bertools::do_save;
use bertools::Nannou;

impl Default for Model {
    fn default() -> Self {
        Self {
            background_color: schemes::navy()[1],
            foreground_color: schemes::navy()[0],
            default_wave_size: 30.,
        }
    }
}

fn main() {
    nannou::app(model)
        .update(update)
        .event(event)
        .loop_mode(LoopMode::wait())
        .run();
}

fn model(app: &App) -> Model {
    let _window = app
        .new_window()
        .title("Bers wave patterns")
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
    let draw = app.draw();
    model.view(app, &draw);
    draw.to_frame(app, &frame).unwrap();
}

impl Nannou for Model {
    fn view(&self, app: &App, draw: &Draw) {
        draw.background().color(self.background_color);

        let width = app.main_window().rect().w();
        let height = app.main_window().rect().h();

        let rows = (height / self.default_wave_size).round() * 2. + 1.;
        let cols = (width / self.default_wave_size).round() + 4.;

        let y_pts = (-rows as isize)..(rows as isize);
        let x_pts = (-cols as isize / 2)..(cols as isize / 2);

        y_pts.rev().for_each(|i| {
            x_pts.clone().rev().for_each(|j| {
                let foreground_color;
                if random_range(0, 100) < 5 {
                    foreground_color = schemes::navy()[2];
                } else {
                    foreground_color = self.foreground_color;
                }

                let x;
                if i % 2 == 0 {
                    x = j as f32 * self.default_wave_size;
                } else {
                    x = (j as f32 * self.default_wave_size) - (self.default_wave_size / 2.);
                }
                let y = i as f32 * self.default_wave_size / PI;


                draw.ellipse()
                    .x_y(x, y)
                    .radius(self.default_wave_size / 2.)
                    .color(self.background_color)
                    .stroke_color(foreground_color)
                    .stroke_weight(2.0);

                draw.ellipse()
                    .x_y(x, y)
                    .radius(self.default_wave_size / 3.)
                    .color(self.background_color)
                    .stroke_color(foreground_color)
                    .stroke_weight(2.0);

                draw.ellipse()
                    .x_y(x, y)
                    .radius(self.default_wave_size / 6.)
                    .color(self.background_color)
                    .stroke_color(foreground_color)
                    .stroke_weight(2.0);
            });
        });
    }

    fn update(&mut self) {}
}
