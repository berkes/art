use nannou::noise::{BasicMulti, MultiFractal, NoiseFn, Seedable};
use nannou::prelude::*;

fn main() {
    nannou::app(model).update(update).simple_window(view).run();
}

trait Viewable {
    fn view(&self, draw: &Draw, model: &Model, frame: &Frame);
}

struct Model {
    layers: Vec<Layer>,
    background: Rgb<u8>,
}

impl Model {
    fn new(layers: Vec<Layer>) -> Self {
        let background = SKYBLUE;
        Self {
            layers,
            background,
        }
    }
}

impl Viewable for Model {
    fn view(&self, draw: &Draw, model: &Model, frame: &Frame) {
        let win_rect = frame.rect();
        // _model is self, here
        //
        draw.background().color(self.background);

        // The sea with a gradient
        draw.polygon()
            .color(hsl(0.6, 0.5, 0.5))
            .stroke(hsl(0.6, 0.5, 0.5))
            .stroke_weight(1.0)
            .points(vec![
                pt2(win_rect.left(), win_rect.bottom()),
                pt2(win_rect.right(), win_rect.bottom()),
                pt2(win_rect.right(), 0.),
                pt2(win_rect.left(), 0.),
            ]);

        self.layers
            .iter()
            .rev()
            .for_each(|layer| layer.view(draw, model, frame));
    }
}

struct Layer {
    z: u8,
    color: Hsla,
    points: Vec<Point2>,
    point_idx: usize,
    noise: BasicMulti,
}

impl Layer {
    fn new(z: u8, width: usize, height: f32) -> Self {
        let noise = BasicMulti::new();
        let seed = random_range(0, 1000);
        let noise = noise.set_seed(seed);
        let noise = noise.set_octaves(map_range(z as f64, 0.0, 6.0, 6, 4));

        // Make the foreground fill color washed out based on the layer number, z.
        // layer 0 is the closest to the viewer, so it should be the most saturated
        // layer 6 is the farthest from the viewer, so it should be the least saturated
        // let foreground_fill = model.foreground;

        let hue = 210.0; // Blue-ish hue for the mountains
        let saturation = 1.0; // Start fully saturated
        let lightness = 0.3 + 0.5 * (z as f32 / NUM_LAYERS as f32); // Gradually lighten with distance

        let reduction = z as f32 / NUM_LAYERS as f32; // Gradual reduction factor
        let layer_saturation = saturation * (1.0 - reduction); // Scale down saturation

        let alpha = 1.0 - (z as f32 / NUM_LAYERS as f32); // Reduce alpha with distance
        let color = Hsla::new(hue, layer_saturation, lightness, alpha);
        //
        // let color = LinSrgba::new(color.into_rgb().red, color.into_rgb().green, color.into_rgb().blue, alpha);
        let point_idx = 0;

        let mut s = Self {
            z,
            points: vec![],
            point_idx,
            noise,
            color,
        };

        for _i in 0..width {
           s.add_point(height);
        }

        return s;
    }

    fn add_point(&mut self, height: f32) {
        self.point_idx += 1;

        let input_x = self.point_idx as f64 / NOISE_STEP;
        let y = self.noise.get([input_x, 0.]);
        // let perspective = 1. - z as f32 * 100.0;
        let perspective = 0.0;

        let mapped_y = map_range(y, -1.0, 1.0, -(height/2.0) - perspective, height/2.0);
        self.points.push(pt2(self.point_idx as f32, mapped_y as f32));
    }
}

impl Viewable for Layer {
    fn view(&self, draw: &Draw, _model: &Model, frame: &Frame) {
        let win_rect = frame.rect();
        // Draw a polygon from the points to the right edge of the window
        draw.polygon()
            .color(self.color)
            .stroke(self.color)
            .stroke_weight(1.0)
            .points(
                self.points
                    .iter()
                    .cloned()
                    .enumerate()
                    .map(|(i, pt)| {
                        // Move the points to the right by i pixels
                        let x = map_range(
                            i as f32,
                            0.0,
                            win_rect.w(),
                            win_rect.left(),
                            win_rect.right(),
                        );

                        let y = pt.y - self.z as f32 * 10.0;
                        pt2(x, y)
                    })
                    .chain(std::iter::once(pt2(win_rect.right(), win_rect.bottom())))
                    .chain(std::iter::once(pt2(win_rect.left(), win_rect.bottom())))
                    .collect::<Vec<Point2>>(),
            );
    }
}

const NUM_LAYERS: u8 = 9;
const NOISE_STEP: f64 = 500.;
const PERSPECTIVE: f32 = 800.0;

fn model(app: &App) -> Model {
    let win_rect = app.window_rect();
    let layers = (0..NUM_LAYERS)
        .map(|i| {
            // Adjust height based on layer number, so that the farthest layer is shorter and
            // higher up on the screen
            let height = map_range(i as f32, 0.0, NUM_LAYERS as f32, win_rect.h() + PERSPECTIVE, (win_rect.h() * 0.8) + PERSPECTIVE);
            Layer::new(i, win_rect.w() as usize, height)
        })
        .collect();
    Model::new(layers)
}

fn update(app: &App, model: &mut Model, _update: Update) {
    let win_rect = app.window_rect();

    let elapsed_frames = app.elapsed_frames();
    model.layers.iter_mut().for_each(|layer| {
        // Close layers move faster, so they need NUM_LAYERS - z more points than the farthest layer
        // We simply skip NUM_LAYERS - z frames to make the layer move faster
        let frame_interval = BASE_FREQUENCY * FREQUENCY_MULTIPLIER.pow(layer.z as u32);
        if elapsed_frames as usize % frame_interval == 0 {
            layer.add_point(win_rect.h());
        }
        // pop the first point if it's off the screen
        if layer.points.len() > win_rect.w() as usize {
            layer.points.remove(0);
        }
    });
}

const BASE_FREQUENCY: usize = 1;
const FREQUENCY_MULTIPLIER: usize = 2; // Multiplier for each subsequent layer
// fn should_add_point(layer_index: usize, elapsed_frames: usize) -> bool {
//     // Calculate the frame interval for the layer
//     let frame_interval = BASE_FREQUENCY * FREQUENCY_MULTIPLIER.pow(layer_index as u32);
//     // Add a point if the elapsed frames are divisible by the interval
//     elapsed_frames % frame_interval == 0
// }
//

fn view(app: &App, model: &Model, frame: Frame) {
    // set up containing rectangles
    let _win_rect = app.window_rect();
    let draw = app.draw();

    model.view(&draw, model, &frame);

    draw.to_frame(app, &frame).unwrap();
}
