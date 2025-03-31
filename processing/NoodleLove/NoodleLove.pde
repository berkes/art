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

ArrayList<Tile> tiles = new ArrayList<Tile>();
ArrayList<PImage> textures = new ArrayList<PImage>();

void setup() {
  size(1800, 1200);

  textures.add(loadTile(1));
  textures.add(loadTile(2));

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
      float rotation = int(random(0, 4)) * HALF_PI;
      int texture_idx = int(random(0, textures.size()));
      Tile t = new Tile(pos, rotation, texture_idx);
      tiles.add(t);
    }
  }

  // noLoop();
}

void draw() {
  background(0);
  for (Tile t : tiles) {
    t.draw();
  }

  if (saveFrame) {
    String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
    String savePath = System.getenv("SAVES_LOCATION");
    String filePath = savePath + "/NoodleLove-" + dateTime + ".png";
    saveFrame(filePath);
    saveFrame = false;
  }
}

PImage loadTile(int tileno) {
  return loadImage(ASSET_PATH + "tile_" + tileno +".png");
}

void keyPressed() {
  if (key == 's' || key == 'S') {
    saveFrame = true;
  }
}
