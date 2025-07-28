public enum Distribution {
  EVEN, NOISE, RANDOM
}

class Tile {
  PVector pos;
  float rotation;
  int texture_idx;

  public Tile(PVector pos, float rotation, int texture_idx) {
    this.pos = pos;
    this.rotation = rotation;
    this.texture_idx = texture_idx;
  }

  void draw() {
    PImage texture = textures.get(texture_idx);

    pushMatrix();
    // First translate to the tile's position
    translate(pos.x, pos.y);
    // Then rotate around this point
    rotate(rotation);
    // Draw the image centered on this position
    // (by offsetting by half the image dimensions)
    translate(-texture.width/2, -texture.height/2);
    image(texture, 0, 0);

    // Draw a rectangle around the image for debugging
    // line color red, line weight 2
    // stroke(255, 0, 0);
    // noFill();
    // strokeWeight(2);
    // rect(0,0, texture.width, texture.height);

    popMatrix();
  }
}

static final float TILE_SIZE = 80.0;
static final String ASSET_PATH = "assets/";

Distribution distribution = Distribution.NOISE;

PImage center = null;
ArrayList<Tile> tiles = new ArrayList<Tile>();
ArrayList<PImage> textures = new ArrayList<PImage>();

// Size:
// 200.6cm by 70.6cm
// @300pdi
// 200.6cm×2.54cm1inch =79.0inches
// 70.6cm×2.54cm1inch =27.8inches
// 79.0inches×300DPI=23700pixels
// 27.8inches×300DPI=8340pixels
//
// In 20 slices: 23700/20 = 1185 pixels per slice
// In 8 columns: 8340/8 = 1042.5 pixels per column
// Adjusted to a multiple of TILE_SIZE: 1200 x 1120

void setup() {
  //size(23700, 8340);
  size(2370, 8340);
  //size(1185, 1042);
  //size(1200, 1120);

  textures.add(loadTile(1));
  textures.add(loadTile(2));

  center = loadImage(ASSET_PATH + "center.png");
  center.resize(0, int(TILE_SIZE * 2));

  for (PImage t : textures) {
    t.resize(0, int(TILE_SIZE));
  }
  noSmooth();
  noLoop();
}

void draw() {
  tiles.clear();
  // divide the screen into tiles of TILE_SIZE. Add one to ensure screen is covered
  float tiles_x = width / TILE_SIZE + 1;
  float tiles_y = height / TILE_SIZE + 1;
  for (int x = 0; x < tiles_x; x++) {
    for (int y = 0; y < tiles_y; y++) {
      PVector pos = new PVector(x * TILE_SIZE, y * TILE_SIZE);
      // 0, 90, 180, 270
      float rotation = generateRotation(x, y);
      int texture_idx = generateTextureIdx(x, y);
      Tile t = new Tile(pos, rotation, texture_idx);
      tiles.add(t);
    }
  }
  background(0);
  // Offset the entire image half a tile to ensure the first col and row is a full tile. Tiles
  // themselves are centered on their position, so this ensures the first tile is shown fully.
  translate(-TILE_SIZE/2, -TILE_SIZE/2);
  for (Tile t : tiles) {
    t.draw();
  }

  // Find a center corner of the grid of tiles
  PVector actual_center = new PVector(width/2, height/2);
  PVector center_tile_corner = null;
  for (Tile t : tiles) {
    if (t.pos.dist(actual_center) < TILE_SIZE) {
      center_tile_corner = t.pos;
      break;
    }
  }
  if (center_tile_corner == null) {
    throw new Error("Could not place a center tile");
  }
  
  // image(center, center_tile_corner.x - (TILE_SIZE/2), center_tile_corner.y - (TILE_SIZE/2));
  saveImage();
  exit();
}

PImage loadTile(int tileno) {
  return loadImage(ASSET_PATH + "tile_" + tileno +".png");
}

float generateRotation(int x, int y) {
  int quadrant = 0;
  if (distribution == Distribution.RANDOM) {
    // Randomly assign a quadrant
    quadrant = int(random(0, 4));
  } else if (distribution == Distribution.EVEN) {
    // Evenly distribute the rotation
    quadrant = x % 4;
  } else if (distribution == Distribution.NOISE) {
    // Use Perlin noise to assign a quadrant
    float noiseVal = noise(x * 10, y * 10);
    quadrant = int(map(noiseVal, 0.0, 1.0, 0, 4));
  }

  float rotation = quadrant * HALF_PI;
  return rotation;
}

int generateTextureIdx(int x, int y) {
  int texture_idx = 0;
  if (distribution == Distribution.RANDOM) {
    // Randomly assign a texture
    texture_idx = int(random(0, textures.size()));
  } else if (distribution == Distribution.EVEN) {
    // Evenly distribute the texture
    texture_idx = x % textures.size();
  } else if (distribution == Distribution.NOISE) {
    // Use Perlin noise to assign a texture
    float noiseVal = noise(x * 10, y * 10);
    texture_idx = int(map(noiseVal, 0.0, 1.0, 0, textures.size()));
  }

  return texture_idx;
}

void saveImage() {
  String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
  String savePath = System.getenv("SAVES_LOCATION");
  String filePath = savePath + "/NoodleLove-" + dateTime + ".png";
  saveFrame(filePath);
}

void keyPressed() {
  if (key == 's' || key == 'S') {
    saveImage();
  }

  if (key == 'r' || key == 'R') {
    // Take the next distribution
    if (distribution == Distribution.EVEN) {
      distribution = Distribution.NOISE;
    } else if (distribution == Distribution.NOISE) {
      distribution = Distribution.RANDOM;
    } else if (distribution == Distribution.RANDOM) {
      distribution = Distribution.EVEN;
    }

    println(distribution);
    redraw();
  }

}
