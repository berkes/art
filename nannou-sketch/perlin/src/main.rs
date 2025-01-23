use nannou::{prelude::*, rand::{seq::SliceRandom, thread_rng}};

fn main() {
    nannou::app(model)
        .update(update)
        .simple_window(view)
        .event(event)
        .run();
}

/// Things that can be drawn on the screen.
trait Nannou {
    fn view(&self, draw: &Draw);
    fn update(&mut self);
}

struct Model {
    bg_color: Srgb<u8>,
    seed_segment: Segment,
}

impl Default for Model {
    fn default() -> Self {
        Self {
            bg_color: Srgb::new(255, 255, 255),
            seed_segment: Segment::new(200.0, 20.0, 10, false),
        }
    }
}

impl Nannou for Model {
    fn update(&mut self) {
        let angles = [0.0, 8.0 / PI,  7.0 / PI, 6.0 / PI];
        for angle in angles {
            self.seed_segment = Segment::new(200.0, angle / PI, 10, false)
        }
    }

    fn view(&self, draw: &Draw) {
        draw.background().color(self.bg_color);
        self.seed_segment.view(draw);
    }
}

/// A simple line segment.
#[derive(Debug, Clone, Copy)]
struct Line {
    start: Point2,
    end: Point2,
}

/// A seed segment that's the seed for a mandala.
#[derive(Debug, Clone)]
struct Segment {
    lines: Vec<Line>,
    connected_points: Vec<Point2>,
}

impl Nannou for Segment {
    fn view(&self, draw: &Draw) {
        for line in &self.lines {
            draw.line()
                .start(line.start)
                .end(line.end)
                .color(BLACK);
        }

        draw.polyline()
            .weight(1.0)
            .points(self.connected_points.iter().cloned())
            .color(GRAY);
    }

    fn update(&mut self) {
        // noop
    }
}

impl Segment {
    fn new(radius: f32, angle: f32, n: usize, keep_grid_points: bool) -> Self {
        let mut lines = Vec::new();
        let mut points = Vec::new();

        for r in 0..=n {
            let factor = r as f32 / n as f32;
            let start = pt2(radius * factor * angle.cos(), radius * factor * angle.sin());
            let end = pt2(radius * factor, 0.0);
            lines.push(Line { start, end });
            points.push(start);
            points.push(end);
        }
        let connected_points = if keep_grid_points {
            points.clone()
        } else {
            points.shuffle(&mut thread_rng());
            points.clone()
        };
        Self {
            lines,
            connected_points,
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
