use nannou::geom;
use nannou::lyon;
use nannou::lyon::path::traits::SvgPathBuilder;
use nannou::prelude::*;
use nannou::rand::seq::SliceRandom;
use nannou::rand::thread_rng;

mod models;
use crate::models::Model;
use bertools::do_save;
use bertools::Nannou;

impl Default for Model {
    fn default() -> Self {
        let mut offsets = vec![
            random_range(0.0, 0.2),
            random_range(0.2, 0.4),
            random_range(0.4, 0.6),
            random_range(0.6, 0.8),
        ];
        offsets.shuffle(&mut thread_rng());

        Self {
            background_color: hsla(0.0, 0.0, 1.0, 1.0),
            foreground_color: hsla(0.0, 0.0, 0.0, 1.0),
            angle: 15.0,
            offsets,
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

fn event(app: &App, model: &mut Model, event: Event) {
    match event {
        Event::WindowEvent { id: _id, simple } => {
            if let Some(KeyPressed(Key::S)) = simple {
                do_save(app);
            }
            if let Some(KeyPressed(Key::R)) = simple {
                do_shuffle(model);
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

fn do_shuffle(model: &mut Model) {
    model.offsets.shuffle(&mut thread_rng());
}

impl Nannou for Model {
    fn view(&self, app: &App, draw: &Draw) {
        draw.background().color(self.background_color);
        let height = app.window_rect().h() / 2.0;
        let width = app.window_rect().w() / 2.0;
        let size = height.min(width);
        draw.ellipse().color(self.background_color).w_h(width, height).x_y(0., 0.);

        // Draw the slice
        let slice = self.slice(pt2(0., 0.), self.angle, size);

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

        let _ = (0..(360. / self.angle * 2.) as usize)
            .map(|i| {
                let draw = draw.rotate(deg_to_rad(i as f32 * self.angle * 2.));

                // let draw = draw.line_mode();
                draw.polygon()
                    .events(slice.into_iter())
                    .color(self.foreground_color);
                draw.polygon()
                    .events(mirrored_slice.clone().into_iter())
                    .color(self.foreground_color);
                // draw.polyline().color(LIMEGREEN).events(slice.into_iter());
                // draw.polyline().color(LIMEGREEN).events(mirrored_slice.clone().into_iter());
            })
            .collect::<Vec<_>>();
    }

    fn update(&mut self) {
        // if self.angle >= 22.5 {
        //     self.angle = 0.01;
        // }
        // self.angle += 0.01;
        self.offsets.iter_mut().for_each(|offset| {
            if *offset >= 0.999 {
                *offset = 0.01;
            } else {
                *offset += 0.005;
            }
        });
        // self.offsets.sort_by(f32::total_cmp)
    }
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

        let mut points = vec![a, c, b, a];
        points.push(b.lerp(c, 0.5));

        self.offsets.iter().for_each(|offset| {
            points.push(a.lerp(b, *offset));
            points.push(a.lerp(c, *offset));
        });


        let mut builder = geom::path::Builder::new().with_svg();
        builder.move_to(origin.to_array().into());

        let ctrp1 = pt2(b.x + self.offsets.iter().last().unwrap_or(&0.), b.y + self.offsets[0]);
        let ctrp2 = pt2(c.x + self.offsets.iter().last().unwrap_or(&0.), c.y + self.offsets[0]);

        points.iter().for_each(|point| {
            builder.line_to(point.to_array().into());
            // builder.cubic_bezier_to(
            //     ctrp1.to_array().into(),
            //     ctrp2.to_array().into(),
            //     point.to_array().into(),
            // );
        });

        builder.build()
    }
}
