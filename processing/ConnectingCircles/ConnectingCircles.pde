class MetaBall {
  float r;
  PVector pos, vel;


  MetaBall(float r, PVector pos, PVector vel) {
    this.r = r;
    this.pos = pos;
    this.vel = vel;
  }

  void move() {
    checkEdges();
    pos.add(vel);
  }

  void stop() {
    vel.set(0, 0);
  }

  void display() {
    push();
    noFill();
    stroke(0);
    ellipse(pos.x, pos.y, r*2, r*2);
    pop();
  }

  private void checkEdges() {
    if (pos.x > width - r || pos.x < r) {
      vel.x *= -1;
    }
    if (pos.y > height - r || pos.y < r) {
      vel.y *= -1;
    }
  }
}

ArrayList<MetaBall> balls = new ArrayList<MetaBall>();
float correction = 0.5;

void setup() {
  colorMode(HSB, 360, 100, 100);

  float r = 50;
  size(800, 800, P2D);

  for (int i = 0; i < 10; i++) {
    PVector position = new PVector(random(r, width-r), random(r, height-r));
    PVector velocity = new PVector(random(-3, 3), random(-3, 3)); // Example direction and speed
    balls.add(new MetaBall(r, position, velocity));
  }
}

void draw() {
  background(255);
  for (MetaBall ball : balls) {
    ball.move();
    ball.display();
  }

  ArrayList<Float> field = metaBallField();
  loadPixels();
  for (int i = 0; i < field.size(); i++) {
    float hue = 360;// map(field.get(i), 0, 36, 0, 360);
    float sat = 0;// map(field.get(i), 0, 36, 0, 100);
    float bri = map(field.get(i), 0, 36, 0, 100);
    pixels[i] = color(hue, sat, bri);
  }
  updatePixels();
}

ArrayList<Float> metaBallField() {
  float sizeCorrection = 0.1;
  ArrayList<Float> matrix = new ArrayList<Float>();
  for (int i = 0; i < width * height; i++) {
    int x = i % width;
    int y = i / width;
    float sum = 0;
    for (MetaBall ball : balls) {
      float d = dist(x, y, ball.pos.x, ball.pos.y);
      sum += (ball.r / (d * sizeCorrection));
    }
    matrix.add(sum);
  }

  return matrix;
}
