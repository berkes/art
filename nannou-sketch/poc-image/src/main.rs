use nannou::prelude::*;

fn main() {
    nannou::app(model).update(update).run();
}

const TILE_SIZE: f32 = 40.0;

struct Model {
    texture: wgpu::Texture,

    tiles: Vec<Tile>,
    currently_hovered_tile: Option<usize>,
}

#[derive(Debug)]
struct Tile {
    id: usize,
    position: Point2,

    rotation: f32,
}

impl Tile {
    fn draw(&self, draw: &Draw, model: &Model) {
        draw.texture(&model.texture)
            .xy(self.position)
            .rotate(self.rotation)
            .w_h(TILE_SIZE, TILE_SIZE);
    }
}

fn model(app: &App) -> Model {
    // Create a new window
    app.new_window()
        .size(1200, 900)
        .mouse_released(mouse_released)
        .mouse_moved(mouse_moved)
        .view(view)
        .build()
        .unwrap();

    // Load the image from the assets directory
    let assets = app.assets_path().unwrap();
    let img_path = assets.join("example.png");

    let texture = wgpu::Texture::from_path(app, img_path).unwrap();

    // divide the screen into tiles of TILE_SIZE. Add one to ensure screen is covered
    let tiles_x = (app.window_rect().w() / TILE_SIZE) as i32 + 1;
    let tiles_y = (app.window_rect().h() / TILE_SIZE) as i32 + 1;

    let mut tiles = Vec::new();

    for x in (-tiles_x / 2)..(tiles_x / 2) {
        for y in (-tiles_y / 2)..(tiles_y / 2) {
            let id = (x * 10 + y) as usize;
            let x = x as f32 * TILE_SIZE;
            let y = y as f32 * TILE_SIZE;
            let position = Point2::new(x, y);
            let rotation = 0.0;
            tiles.push(Tile {
                id,
                position,
                rotation,
            });
        }
    }

    Model {
        texture,
        tiles,
        currently_hovered_tile: None,
    }
}

fn update(_app: &App, _model: &mut Model, _update: Update) {}

fn view(app: &App, model: &Model, frame: Frame) {
    // Clear the frame with a black background
    frame.clear(BLACK);

    // Create a drawing context
    let draw = app.draw();

    // Draw the tiles
    for tile in &model.tiles {
        tile.draw(&draw, &model);
    }

    // Write the drawing to the frame
    draw.to_frame(app, &frame).unwrap();
}

fn mouse_released(app: &App, model: &mut Model, button: MouseButton) {
    let mouse_x = app.mouse.x;
    let mouse_y = app.mouse.y;

    // Find the tile that was clicked
    let tile = model.tiles.iter_mut().find(|tile| {
        let x = tile.position.x - mouse_x;
        let y = tile.position.y - mouse_y;
        x.abs() < TILE_SIZE / 2.0 && y.abs() < TILE_SIZE / 2.0
    });

    if let Some(t) = tile {
        match button {
            MouseButton::Left => t.rotation += PI / 2.0,
            MouseButton::Right => t.rotation -= PI / 2.0,
            _ => (),
        }
    }
}

fn mouse_moved(_app: &App, model: &mut Model, pos: Point2) {
    // Find which tile the mouse is currently hovering over (if any)
    let current_tile_index = model.tiles.iter().position(|tile| {
        let x = tile.position.x - pos.x;
        let y = tile.position.y - pos.y;
        x.abs() < TILE_SIZE / 2.0 && y.abs() < TILE_SIZE / 2.0
    });

    let current_tile_id = current_tile_index.map(|index| model.tiles[index].id);

    // Check if the hovered tile has changed
    if current_tile_id != model.currently_hovered_tile {
        // If we're now hovering over a tile, we're entering it
        if let Some(index) = current_tile_index {
            // Perform rotation only on entry
            model.tiles[index].rotation += PI / 2.0;
        }

        // Update the currently hovered tile
        model.currently_hovered_tile = current_tile_id;
    }
}
