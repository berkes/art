// Consts for the corner indexes
final int TOP_LEFT = 0;
final int TOP_RIGHT = 1;
final int BOTTOM_LEFT = 2;
final int BOTTOM_RIGHT = 3;

final float MS_THRESHOLD = 2.0;

final int N_BALLS = 10;
final int N_CELLS = 10000;

final float G = 1.0;

// final int WIDTH = 800;
// final int HEIGHT = 600;

// INSTA STORY
// final int WIDTH = 1080;
// final int HEIGHT = 1920;

final boolean DEBUG = false;
final boolean SAVE_FRAMES = false;

ArrayList<MetaBall> balls = new ArrayList<MetaBall>();
float correction = 0.5;
Grid grid;
ArrayList<MetaBall> attractingPair = new ArrayList<MetaBall>();
ArrayList<MetaBall> repellingPair  = new ArrayList<MetaBall>();

void setup() {
  colorMode(HSB, 360, 100, 100);
  size(800, 600, P2D);

  grid = new Grid(800, 600, N_CELLS);

  // for (int i = 0; i < N_BALLS; i++) {
  //   float r = random(20, 40);
  //   PVector position = new PVector(random(r, width-r), random(r, height-r));
  //   MetaBall ball = new MetaBall(r, position, str(i));
  //   ball.applyForce(new PVector(random(-1, 1), random(-1, 1)));
  //   balls.add(ball);
  // }
  MetaBall b1 = new MetaBall(50, new PVector(100, 100), "A");
  b1.applyForce(new PVector(1, 1));
  balls.add(b1);
  MetaBall b2 = new MetaBall(55, new PVector(600, 400), "B");
  b2.applyForce(new PVector(-1, -1));
  balls.add(b2);
}

void draw() {
  background(360);

  if (attractingPair.size() == 2) {
    attractingPair.get(0).attract(attractingPair.get(1));
    attractingPair.get(1).attract(attractingPair.get(0));
  }

  if (repellingPair.size() == 2) {
    repellingPair.get(0).repel(repellingPair.get(1));
    repellingPair.get(1).repel(repellingPair.get(0));
  }

  for (MetaBall ball : balls) {
    ball.update();
  }

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
    // pick two random balls and attract them
    int i = (int)random(balls.size());
    int j = (int)random(balls.size());
    MetaBall b1 = balls.get(i);
    MetaBall b2 = balls.get(j);
    if (b1 == b2) {
      return;
    }

    repellingPair = new ArrayList<MetaBall>();
    attractingPair = new ArrayList<MetaBall>();
    attractingPair.add(b1);
    attractingPair.add(b2);
  }
  // repel
  if (key == 'r') {
    repellingPair = new ArrayList<MetaBall>(attractingPair);
    attractingPair = new ArrayList<MetaBall>();
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
