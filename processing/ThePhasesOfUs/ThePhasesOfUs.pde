// Consts for the corner indexes
final int TOP_LEFT = 0;
final int TOP_RIGHT = 1;
final int BOTTOM_LEFT = 2;
final int BOTTOM_RIGHT = 3;

final int N_BALLS = 8;
final int N_CELLS = 10000;

final float[] MS_THRESHOLDS = {0.8, 1.0, 1.3, 1.6, 2.0};

final float G = 6.0;

// final int WIDTH = 800;
// final int HEIGHT = 600;

// INSTA STORY
// final int WIDTH = 1080;
// final int HEIGHT = 1920;

final boolean ONTO_GRID = true;
final boolean SAVE_FRAMES = false;

boolean debug = false;
ArrayList<MetaBall> balls = new ArrayList<MetaBall>();
Grid grid;
Attraction attraction;

void setup() {
  colorMode(HSB, 360, 100, 100);
  // size(1080, 1920, P2D);
  // grid = new Grid(1080, 1920, N_CELLS);
  size(800, 600, P2D);
  grid = new Grid(800, 600, N_CELLS);

  for (int i = 0; i < N_BALLS; i++) {
     float r = random(15, 20);
     PVector position = new PVector(random(r, width-r), random(r, height-r));
     MetaBall ball = new MetaBall(r, position, str(i));
     ball.applyForce(new PVector(random(-1, 1), random(-1, 1)));
     balls.add(ball);
  }
}

void draw() {
  background(360);

  if (attraction != null) {
    attraction.update();
    if (debug) {
      attraction.debug();
    }
  }

  for (MetaBall ball : balls) {
    ball.update();
  }

  if (ONTO_GRID) {
    ArrayList<Float> field = metaBallField();
    grid.update(field);
    
    grid.display();
    if (debug) {
      debug(field);
    }
  }
  
  for (MetaBall ball : balls) {
    ball.display();
    if (debug) {
      ball.debug();
    }
  }

  if (SAVE_FRAMES) {
    saveFrame("frames/####.png");
  }
}

void debug(ArrayList<Float> field) {
    loadPixels();
    for (int i = 0; i < field.size(); i++) {
        float hue = map(field.get(i), 0, 3, 0, 360);
        float sat = 100;// map(field.get(i), 0, 36, 0, 100);
        float bri = 100; //norm(hue, 0, 360) * 100;//norm(field.get(i), 0, 10) * 100; //map(field.get(i), 0, 36, 0, 100);
        float alpha = 120;
        pixels[i] = color(hue, sat, bri, alpha);
    }
    updatePixels();
    grid.debug();
}

void keyPressed() {
  // attract
  if (key == 'a') {
    attraction = pickRandom(balls);
  }
  if (key == 'p') {
    for (MetaBall ball : balls) {
      ball.stop();
    }
  }
  if (key == 'd') {
     debug = !debug;
  }
}

// TODO: We don't need to calculate the field for every pixel, only for the corners of the cells
// So maybe we can make this a getter that accepts a position and returns the value?
ArrayList<Float> metaBallField() {
  ArrayList<Float> matrix = new ArrayList<Float>();
  for (int i = 0; i < width * height; i++) {
    int x = i % width;
    int y = i / width;
    float sum = 0;
    for (MetaBall ball : balls) {
      float d = PVector.dist(new PVector(x, y), ball.getPosition());
      sum += ball.r / d;
    }
    matrix.add(sum);
  }

  return matrix;
}