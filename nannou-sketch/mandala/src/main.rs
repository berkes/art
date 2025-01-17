use models::Centerpiece;
use models::Petal;
use nannou::geom;
use nannou::prelude::*;
use nannou::rand::seq::SliceRandom;
use nannou::rand::thread_rng;

mod models;
use crate::models::Model;
use bertools::do_save;
use bertools::Nannou;

impl Default for Model {
    fn default() -> Self {
        let angle = 15.0;
        let mut offsets = vec![
            random_range(0.0, 0.2),
            random_range(0.2, 0.4),
            random_range(0.4, 0.6),
            random_range(0.6, 0.8),
        ];
        offsets.shuffle(&mut thread_rng());

        let centerpiece = Centerpiece::default();
        // let petals = Petal::generate(20);
        let petals = Petal::generate(360 / (2 * angle as usize));

        Self {
            background_color: hsla(0.0, 0.0, 1.0, 1.0),
            foreground_color: hsla(0.0, 0.0, 0.0, 1.0),
            angle,
            offsets,
            centerpiece,
            petals,
        }
    }
}

impl Default for Centerpiece {
    fn default() -> Self {
        Self {
            radius: 120.0,
            background_color: hsla(0.0, 0.0, 1.0, 1.0),
            foreground_color: hsla(0.0, 0.0, 0.0, 1.0),
        }
    }
}

impl Default for Petal {
    fn default() -> Self {
        let zero = pt2(0., 0.);
        Self {
            start: zero,
            ctrl1: zero,
            ctrl2: zero,
            end: zero,
            background_color: hsla(0.0, 0.0, 1.0, 0.6),
            foreground_color: hsla(0.0, 0.0, 0.0, 0.6),
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

    model.petals = Petal::generate(360 / (2 * model.angle as usize));
}

impl Nannou for Model {
    fn view(&self, app: &App, draw: &Draw) {
        draw.background().color(self.background_color);

        // let height = app.window_rect().h() / 2.0;
        // let width = app.window_rect().w() / 2.0;
        // let size = height.min(width);
        // draw.ellipse()
        //     .color(self.background_color)
        //     .w_h(width, height)
        //     .x_y(0., 0.);
        //
        // // Draw the slice
        // let slice = self.slice(pt2(0., 0.), self.angle, size);
        //
        // // mirror the slice
        // let mirrored_slice = slice
        //     .into_iter()
        //     .map(|evt| match evt {
        //         lyon::path::Event::Begin { at } => lyon::path::Event::Begin {
        //             at: pt2(at.x, -at.y).to_array().into(),
        //         },
        //         lyon::path::Event::Line { from, to } => lyon::path::Event::Line {
        //             from: pt2(from.x, -from.y).to_array().into(),
        //             to: pt2(to.x, -to.y).to_array().into(),
        //         },
        //         lyon::path::Event::Cubic {
        //             from,
        //             ctrl1,
        //             ctrl2,
        //             to,
        //         } => lyon::path::Event::Cubic {
        //             from: pt2(from.x, -from.y).to_array().into(),
        //             ctrl1: pt2(ctrl1.x, -ctrl1.y).to_array().into(),
        //             ctrl2: pt2(ctrl2.x, -ctrl2.y).to_array().into(),
        //             to: pt2(to.x, -to.y).to_array().into(),
        //         },
        //         lyon::path::Event::End { last, first, close } => lyon::path::Event::End {
        //             last: pt2(last.x, -last.y).to_array().into(),
        //             first: pt2(first.x, -first.y).to_array().into(),
        //             close,
        //         },
        //         lyon::path::Event::Quadratic { from, ctrl, to } => lyon::path::Event::Quadratic {
        //             from: pt2(from.x, -from.y).to_array().into(),
        //             ctrl: pt2(ctrl.x, -ctrl.y).to_array().into(),
        //             to: pt2(to.x, -to.y).to_array().into(),
        //         },
        //     })
        //     .collect::<Vec<_>>();
        //
        // let _ = (0..(360. / self.angle * 2.) as usize)
        //     .map(|i| {
        //         let draw = draw.rotate(deg_to_rad(i as f32 * self.angle * 2.));
        //
        //         // let draw = draw.line_mode();
        //         draw.polygon()
        //             .events(slice.into_iter())
        //             .color(self.foreground_color);
        //         draw.polygon()
        //             .events(mirrored_slice.clone().into_iter())
        //             .color(self.foreground_color);
        //         // draw.polyline().color(LIMEGREEN).events(slice.into_iter());
        //         // draw.polyline().color(LIMEGREEN).events(mirrored_slice.clone().into_iter());
        //     })
        //     .collect::<Vec<_>>();

        self.petals.iter().enumerate().for_each(|(i, petal)| {
            let draw = draw.rotate(deg_to_rad(2. * self.angle * i as f32));

            petal.view(app, &draw);
        });

        self.centerpiece.view(app, draw);
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
        //
        self.petals.iter_mut().for_each(|petal| {
            petal.update();
        });
    }
}

impl Nannou for Centerpiece {
    fn view(&self, _app: &App, draw: &Draw) {
        let center = pt2(0., 0.);

        draw.rect()
            .w_h(self.radius, self.radius)
            .xy(center)
            .color(self.background_color)
            .stroke_color(self.foreground_color)
            .stroke_weight(1.0);

        draw.ellipse()
            .w_h(self.radius, self.radius)
            .xy(center)
            .color(self.foreground_color);
    }

    fn update(&mut self) {}
}

impl Nannou for Petal {
    fn view(&self, _app: &App, draw: &Draw) {
        let mut builder = geom::path::Builder::new().with_svg();
        builder.move_to(self.start.to_array().into());
        builder.cubic_bezier_to(
            self.ctrl1.to_array().into(),
            self.ctrl2.to_array().into(),
            self.end.to_array().into(),
        );

        let events = builder.build();

        draw.polygon()
            .events(events.iter())
            .color(self.foreground_color);

        // draw.polyline()
        //     .weight(1.0)
        //     .color(self.foreground_color)
        //     .events(events.iter());
        //
        draw.scale_y(-1.0)
            .polygon()
            .events(events.iter())
            .color(self.foreground_color);

        // draw.scale_x(-1.0)
        //     .polyline()
        //     .weight(3.0)
        //     .color(self.foreground_color)
        //     .events(events.iter());

        // draw.scale_x(-1.0)
        //     .polyline()
        //     .weight(1.0)
        //     .color(self.background_color)
        //     .events(events.iter());

        // Debug
        // draw.ellipse().radius(5.0).xy(self.start).color(GREEN);
        // draw.ellipse().radius(5.0).xy(self.ctrl1).color(RED);
        // draw.ellipse().radius(5.0).xy(self.ctrl2).color(DARKRED);
        // draw.ellipse().radius(5.0).xy(self.end).color(BLUE);
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

        let mut points = vec![a, c, b, a];
        points.push(b.lerp(c, 0.5));

        self.offsets.iter().for_each(|offset| {
            points.push(a.lerp(b, *offset));
            points.push(a.lerp(c, *offset));
        });

        let mut builder = geom::path::Builder::new().with_svg();
        builder.move_to(origin.to_array().into());

        let ctrp1 = pt2(
            b.x + self.offsets.iter().last().unwrap_or(&0.),
            b.y + self.offsets[0],
        );
        let ctrp2 = pt2(
            c.x + self.offsets.iter().last().unwrap_or(&0.),
            c.y + self.offsets[0],
        );

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

impl Petal {
    pub fn generate(amount: usize) -> Vec<Petal> {
        let angle = 360. / amount as f32;
        let length = 200.;

        let start = pt2(0., 0.);
        let end = pt2(length, 0.);
        let height = length * deg_to_rad(angle).tan();
        let ctrl1 = pt2(random_range(0., height), random_range(0., height));
        let ctrl2 = pt2(random_range(0., height), random_range(0., height));

        (0..amount)
            .map(|_| Petal {
                start,
                ctrl1,
                ctrl2,
                end,
                ..Petal::default()
            })
            .collect()
    }
}
