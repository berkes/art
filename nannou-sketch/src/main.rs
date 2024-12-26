extern crate nannou;
use nannou::prelude::*;

fn main() {
    nannou::app(model)
        .update(update)
        .simple_window(view)
        .event(event)
        .run();
}

struct Model {}

fn model(_app: &App) -> Model {
    Model {}
}

fn event(_app: &App, _model: &mut Model, _event: Event) {
}

fn update(_app: &App, _model: &mut Model, _update: Update) {
}

fn view(app: &App, _model: &Model, frame: Frame){
    let draw = app.draw();
    draw.background().color(PINK);
    draw.ellipse().color(LIMEGREEN);
    draw.to_frame(app, &frame).unwrap();
}
