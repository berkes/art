use nannou::geom;
use nannou::lyon;
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
        // .loop_mode(LoopMode::refresh_sync())
        .loop_mode(LoopMode::Wait)
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
            if let Some(KeyPressed(Key::R)) = simple {}
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

const ANGLE: f32 = 15.;

impl Nannou for Model {
    fn view(&self, _app: &App, draw: &Draw) {
        draw.background().color(self.background_color);

        // Draw the slice
        let slice = self.slice(pt2(0., 0.), ANGLE, 200.0);

        // mirror the slice
        let mirrored_slice = slice
            .into_iter()
            .map(|evt| match evt {
                lyon::path::Event::Begin { at } => lyon::path::Event::Begin {
                    at: pt2(at.x, -at.y).to_array().into(),
                },
                lyon::path::Event::Line { from, to } => lyon::path::Event::Line {
                    from: pt2(from.x, -from.y).to_array().into(),
                    to: pt2(to.x, -to.y).to_array().into(),
                },
                lyon::path::Event::Cubic {
                    from,
                    ctrl1,
                    ctrl2,
                    to,
                } => lyon::path::Event::Cubic {
                    from: pt2(from.x, -from.y).to_array().into(),
                    ctrl1: pt2(ctrl1.x, -ctrl1.y).to_array().into(),
                    ctrl2: pt2(ctrl2.x, -ctrl2.y).to_array().into(),
                    to: pt2(to.x, -to.y).to_array().into(),
                },
                lyon::path::Event::End { last, first, close } => lyon::path::Event::End {
                    last: pt2(last.x, -last.y).to_array().into(),
                    first: pt2(first.x, -first.y).to_array().into(),
                    close,
                },
                lyon::path::Event::Quadratic { from, ctrl, to } => lyon::path::Event::Quadratic {
                    from: pt2(from.x, -from.y).to_array().into(),
                    ctrl: pt2(ctrl.x, -ctrl.y).to_array().into(),
                    to: pt2(to.x, -to.y).to_array().into(),
                },
            })
            .collect::<Vec<_>>();

        let _ = (0..(360./ANGLE) as usize).map(|i| {
            let draw = draw.rotate(deg_to_rad(i as f32 * ANGLE));

            draw.polygon().events(slice.into_iter()).color(STEELBLUE);
            draw.polygon()
                .events(mirrored_slice.clone().into_iter())
                .color(STEELBLUE);
        }).collect::<Vec<_>>();

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
    ) -> nannou::lyon::path::builder::WithSvg<geom::path::Builder> {
        let mut builder = geom::path::Builder::new().with_svg();
        builder.move_to(start.to_array().into());
        builder.cubic_bezier_to(
            ctrl1.to_array().into(),
            ctrl2.to_array().into(),
            end.to_array().into(),
        );
        builder
    }

    fn slice(&self, origin: Point2, angle: f32, length: f32) -> geom::Path {
        //              B
        //
        //   angle (degrees)
        // A  length    C

        let a = origin;
        let c = pt2(origin.x + length, origin.y);
        let b = pt2(c.x, origin.y + (deg_to_rad(angle).tan() * length));

        let ac1 = a.lerp(c, random_range(0., 0.5));
        let ac2 = a.lerp(c, random_range(0.5, 1.0));
        let ab1 = a.lerp(b, random_range(0., 0.5));
        let ab2 = a.lerp(b, random_range(0.5, 1.0));
        let bc1 = b.lerp(c, random_range(0., 0.5));
        let bc2 = b.lerp(c, random_range(0.5, 1.0));

        let mut points = vec![a, b, c, ac1, ac2, ab1, ab2, bc1, bc2];
        points.shuffle(&mut thread_rng());

        // let mut builder = self.bezier_curve(origin, b, b, c);

        let mut builder = geom::path::Builder::new().with_svg();
        builder.move_to(origin.to_array().into());

        points.iter().for_each(|point| {
            builder.line_to(point.to_array().into());
        });

        builder.build()
    }
}
