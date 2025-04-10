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
    image(texture, -texture.width/2, -texture.height/2);
    popMatrix();
  }
}

static final float TILE_SIZE = 80.0;
static final String ASSET_PATH = "assets/";

boolean saveFrame = false;

PImage center = null;
ArrayList<Tile> tiles = new ArrayList<Tile>();
ArrayList<PImage> textures = new ArrayList<PImage>();

void setup() {
  size(1000, 1000);

  textures.add(loadTile(1));
  textures.add(loadTile(2));

  center = loadImage(ASSET_PATH + "center.png");
  center.resize(0, int(TILE_SIZE * 2));

  for (PImage t : textures) {
    t.resize(0, int(TILE_SIZE));
  }

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

  noLoop();
}

void draw() {
  background(0);
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

  image(center, center_tile_corner.x - (TILE_SIZE/2), center_tile_corner.y - (TILE_SIZE/2));
}

PImage loadTile(int tileno) {
  return loadImage(ASSET_PATH + "tile_" + tileno +".png");
}

float generateRotation(int x, int y) {
  float noiseVal = noise(x * 10, y * 10);
  int quadrant = int(map(noiseVal, 0.0, 1.0, 0, 4));

  float rotation = quadrant * HALF_PI;
  return rotation;
}

int generateTextureIdx(int x, int y) {
  float noiseVal = noise(x * 10, y * 10);
  int texture_idx = int(map(noiseVal, 0.0, 1.0, 0, textures.size()));
  return texture_idx;
}

void keyPressed() {
  if (key == 's' || key == 'S') {
    String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
    String savePath = System.getenv("SAVES_LOCATION");
    String filePath = savePath + "/NoodleLove-" + dateTime + ".png";
    saveFrame(filePath);
    saveFrame = false;
  }
}
