use nannou::prelude::*;

fn main() {
    nannou::app(model)
        .update(update)
        .simple_window(view)
        .event(event)
        .run();
}

const NUM_DOTS: usize = 1000;

/// Things that can be drawn on the screen.
trait Nannou {
    fn view(&self, draw: &Draw);
    fn update(&mut self);
}

struct Model {
    bg_color: Srgb<u8>,
    current_bg: usize,
    dots: Vec<Dot>,
}

impl Default for Model {
    fn default() -> Self {
        Self {
            bg_color: HONEYDEW,
            current_bg: usize::default(),
            dots: Model::init_dots(),
        }
    }
}

impl Nannou for Model {
    fn update(&mut self) {
        self.dots.iter_mut().for_each(|d| d.update());
    }

    fn view(&self, draw: &Draw) {
        draw.background().color(self.bg_color);
        self.dots.iter().for_each(|d| d.view(draw));
    }
}

impl Model {
    fn init_dots() -> Vec<Dot> {
        let mut dots = Vec::with_capacity(NUM_DOTS);
        for _ in 0..NUM_DOTS {
            let x = random_range(-500.0, 500.0);
            let y = random_range(-500.0, 500.0);
            dots.push(Dot::new(pt2(x, y)));
        }
        dots
    }
}

/// A circle with a position, radius, and color.
#[derive(Debug, Clone, Copy)]
struct Dot {
    color: Srgb<u8>,
    origin: Point2,
    radius: f32,
    max_radius: f32,
    growth_rate: f32,
}

impl Dot {
    fn new(point: Point2) -> Self {
        Self {
            origin: point,
            ..Default::default()
        }
    }
}

impl Nannou for Dot {
    fn update(&mut self) {
        if self.radius < self.max_radius {
            self.radius += self.growth_rate;
        } else {
            self.radius = 0.0;
        }
    }

    fn view(&self, draw: &Draw) {
        draw.ellipse()
            .x_y(self.origin.x, self.origin.y)
            .radius(self.radius)
            .color(self.color);
    }
}

impl Default for Dot {
    fn default() -> Self {
        Self {
            color: STEELBLUE,
            origin: Point2::default(),
            radius: 10.0,
            max_radius: 200.0,
            growth_rate: 1.0,
        }
    }
}

fn model(_app: &App) -> Model {
    Model::default()
}

fn event(_app: &App, _model: &mut Model, _event: Event) {}

fn update(_app: &App, model: &mut Model, _update: Update) {
    model.update();
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();
    model.view(&draw);
    draw.to_frame(app, &frame).unwrap();
}
