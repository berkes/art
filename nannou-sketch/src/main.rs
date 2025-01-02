extern crate nannou;
use nannou::{
    noise::{NoiseFn, Perlin},
    prelude::*,
};

const NUM_THINGS: usize = 30000;

fn main() {
    nannou::app(model)
        .update(update)
        .simple_window(view)
        .event(event)
        .run();
}

struct Model {
    things: Vec<Thing>,
    noise: Perlin,
}

struct Thing {
    positions: Vec<Point2>,
}

impl Thing {
    fn new(position: Point2) -> Self {
        Self { positions: vec![position] }
    }
}

fn random_things(app: &App) -> Vec<Thing> {
    (0..NUM_THINGS)
        .map(|_| {
            let x = random_range(app.window_rect().left(), app.window_rect().right());
            let y = random_range(app.window_rect().bottom(), app.window_rect().top());
            Thing::new(pt2(x, y))
        })
        .collect()
}
fn model(app: &App) -> Model {
    let noise = Perlin::new();

    let things = random_things(app);
    Model { things, noise }
}

fn event(_app: &App, _model: &mut Model, _event: Event) { }


fn update(_app: &App, model: &mut Model, _update: Update) {
    let adjust = 0.01;
    for thing in &mut model.things {
        let lastpos = thing.positions.last().unwrap();
        let newpos = pt2(
            lastpos.x + model.noise.get([
                adjust * lastpos.x as f64,
                adjust * lastpos.y as f64,
                0.0,
            ]) as f32,
            lastpos.y + model.noise.get([
                adjust * lastpos.x as f64,
                adjust * lastpos.y as f64,
                1.0,
            ]) as f32,
        );
        thing.positions.push(newpos);
    }
}

fn view(app: &App, model: &Model, frame: Frame) {
    // let window = app.window_rect();
    let draw = app.draw();
    if app.elapsed_frames() == 1 {
        draw.background().color(BLACK);
    }

    for thing in &model.things {
        draw.polyline()
            .weight(1.0)
            .points(thing.positions.iter().cloned())
            .color(WHITE);
    }

    draw.to_frame(app, &frame).unwrap();
}
