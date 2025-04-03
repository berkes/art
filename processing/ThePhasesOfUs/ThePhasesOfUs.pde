// Consts for the corner indexes
final int TOP_LEFT = 0;
final int TOP_RIGHT = 1;
final int BOTTOM_LEFT = 2;
final int BOTTOM_RIGHT = 3;

final int N_BALLS = 4;
final int N_CELLS = 10000;

final float MS_THRESHOLD = 0.8;

final float G = 6.0;

// final int WIDTH = 800;
// final int HEIGHT = 600;

// INSTA STORY
// final int WIDTH = 1080;
// final int HEIGHT = 1920;

final boolean DEBUG = true;
final boolean ONTO_GRID = false;
final boolean SAVE_FRAMES = false;

ArrayList<MetaBall> balls = new ArrayList<MetaBall>();
Grid grid;
Attraction attraction;

void setup() {
  colorMode(HSB, 360, 100, 100);
  size(1080, 1920, P2D);

  grid = new Grid(1080, 1920, N_CELLS);

  // for (int i = 0; i < N_BALLS; i++) {
  //   float r = random(15, 20);
  //   PVector position = new PVector(random(r, width-r), random(r, height-r));
  //   MetaBall ball = new MetaBall(r, position, str(i));
  //   ball.applyForce(new PVector(random(-1, 1), random(-1, 1)));
  //   balls.add(ball);
  // }
  MetaBall b1 = new MetaBall(50, new PVector(100, 100), "A");
  b1.applyForce(new PVector(2, 7));
  balls.add(b1);
  MetaBall b2 = new MetaBall(55, new PVector(600, 400), "B");
  b2.applyForce(new PVector(-2, -9));
  b2.applyForce(new PVector(-2, -9));
  balls.add(b2);
}

void draw() {
  background(360);

  if (attraction != null) {
    attraction.update();
  }

  for (MetaBall ball : balls) {
    ball.update();
  }

  if (ONTO_GRID) {
    ArrayList<Float> field = metaBallField();
    if (DEBUG) {
      loadPixels();
      for (int i = 0; i < field.size(); i++) {
        float hue = map(field.get(i), 0, 3, 0, 360);
        float sat = 100;// map(field.get(i), 0, 36, 0, 100);
        float bri = 100; //norm(hue, 0, 360) * 100;//norm(field.get(i), 0, 10) * 100; //map(field.get(i), 0, 36, 0, 100);
        float alpha = 120;
        pixels[i] = color(hue, sat, bri, alpha);
      }
      updatePixels();
    }

    grid.update(field);
    grid.display();
  }
  
  for (MetaBall ball : balls) {
    ball.display();
  }

  if (SAVE_FRAMES) {
    saveFrame("frames/####.png");
  }
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
