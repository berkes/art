use nannou::prelude::*;

mod models;
use crate::models::Model;
use bertools::do_save;
use bertools::Nannou;

impl Default for Model {
    fn default() -> Self {
        Self {
            background_color: hsla(0.0, 0.0, 1.0, 1.0),
            stroke_width: 1.0,
            ctrl1: Point2::new(-200.0, 300.0),
            ctrl2: Point2::new(0.0, -30.0),
        }
    }
}

fn main() {
    nannou::app(model)
        .update(update)
        .event(event)
        .loop_mode(LoopMode::refresh_sync())
        .run();
}

fn model(app: &App) -> Model {
    let _window = app
        .new_window()
        .title("Bers mandala maker")
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
    fn view(&self, _app: &App, draw: &Draw) {
        draw.background().color(self.background_color);

        let start = Point2::new(-200.0, 0.0);
        let end = Point2::new(200.0, 0.0);
        let path = self.bezier_curve(start, self.ctrl1, self.ctrl2, end);
        draw.path()
            .stroke()
            .tolerance(0.001)
            .weight(self.stroke_width)
            .color(BLACK)
            .events(path.iter());

        // Debug: Draw the control points, and the lines to the curve
        draw.ellipse()
            .x_y(self.ctrl1.x, self.ctrl1.y)
            .radius(5.0)
            .color(RED);
        draw.line().start(start).end(self.ctrl1).color(PINK);
        draw.ellipse()
            .x_y(self.ctrl2.x, self.ctrl2.y)
            .radius(5.0)
            .color(RED);
        draw.line().start(end).end(self.ctrl2).color(PINK);
    }

    fn update(&mut self) {}
}

impl Model {
    fn bezier_curve(
        &self,
        start: Point2,
        ctrl1: Point2,
        ctrl2: Point2,
        end: Point2,
    ) -> nannou::geom::Path {
        let mut builder = nannou::geom::path::Builder::new().with_svg();
        builder.move_to(start.to_array().into());
        builder.cubic_bezier_to(
            ctrl1.to_array().into(),
            ctrl2.to_array().into(),
            end.to_array().into(),
        );

        builder.build()
    }
}
