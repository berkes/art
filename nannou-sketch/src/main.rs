use std::collections::HashMap;

use nannou::prelude::*;

fn main() {
    nannou::app(model)
        .update(update)
        .simple_window(view)
        .event(event)
        .run();
}

struct Model {
    zigs: Vec<Point2>,
    bumps: HashMap<isize, f32>,
}
fn model(app: &App) -> Model {
    let window = app.window_rect();

    // Scan from top to bottom with a zigzag pattern each 10px in hight
    let lines = 0..window.h() as i32 / GAP as i32;
    let left = window.left();
    let right = window.right();
    let top = round_to_gap(window.top());
    let zigs = lines
        .clone()
        .flat_map(|i| {
            let y_pos = top - round_to_gap(i as f32 * GAP);

            // even lines: left to right one down at left
            if i % 2 == 0 {
                return vec![
                    vec2(left, y_pos),
                    // to right
                    vec2(right, y_pos),
                    // one line down
                    vec2(right, y_pos - GAP),
                ];
            } else {
                // odd lines: right to left one down at right
                return vec![
                    vec2(right, y_pos),
                    // to left
                    vec2(left, y_pos),
                    // one line down
                    vec2(left, y_pos - GAP),
                ];
            }
        })
        .collect::<Vec<_>>();

    let bumps = lines
        .map(|i| {
            let y_pos = top - round_to_gap(i as f32 * GAP);
            let x = random_range(left, right);
            (y_pos as isize, x)
        }).collect::<HashMap<_, _>>();

    Model { zigs, bumps }
}

fn round_to_gap(x: f32) -> f32 {
    (x / GAP).round() * GAP
}

fn event(_app: &App, _model: &mut Model, _event: Event) {}

fn update(app: &App, model: &mut Model, _update: Update) {
    // on a a mouse hover, add a bump to the zigzag at the mouse position
    if app.mouse.buttons.left().is_down() {
        let mouse = app.mouse.position();
        // round to nearest 10.0
        let snap = round_to_gap(mouse.y);
        model.bumps.entry(snap as isize).and_modify(|x| *x = mouse.x).or_insert(mouse.x);
    }
}

const GAP: f32 = 10.0;
const LINE_WIDTH: f32 = 2.0;

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();
    draw.background().color(BLACK);

    draw.polyline()
        .weight(LINE_WIDTH)
        .points(model.zigs.clone())
        .color(WHITE);

    model
        .bumps
        .clone()
        .into_iter()
        .for_each(|(y, x)| {
            let y = y as f32;
            let size = GAP - LINE_WIDTH;
            let half_size = size / 2.0;

            let a = vec2(x - half_size, y);
            let b = vec2(x + half_size, y);
            let c = vec2(x, y + size);
            draw.polyline().weight(LINE_WIDTH).points(vec![a, b, c, a]).color(WHITE);
            draw.polyline().weight(LINE_WIDTH).points(vec![a,b]).color(BLACK);
        });

    draw.to_frame(app, &frame).unwrap();
}
