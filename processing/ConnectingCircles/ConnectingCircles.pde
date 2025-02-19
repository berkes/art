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
  size(300, 300, P2D);

  for (int i = 0; i < 4; i++) {
    PVector position = new PVector(random(r, width-r), random(r, height-r));
    PVector velocity = new PVector(random(-3, 3), random(-3, 3)); // Example direction and speed
    balls.add(new MetaBall(50, position, velocity));
  }
}

void draw() {
  background(255);
  for (MetaBall ball : balls) {
    ball.move();
    ball.display();
  }

  ArrayList<ArrayList<Float>> field = metaBallField();
  for (ArrayList<Float> row : field) {
    for (Float value : row) {
      push();

      stroke(map(value, 0, 3, 0.0, 360.0), 90, 90);

      point(field.indexOf(row), row.indexOf(value));
      pop();
    }
  }
}

ArrayList<ArrayList<Float>> metaBallField() {
  ArrayList<ArrayList<Float>> matrix = new ArrayList<ArrayList<Float>>();
  for (int x = 0; x < width; x++) {
    matrix.add(new ArrayList<Float>());
    for (int y = 0; y < height; y++) {
      float sum = 0;
      for (MetaBall ball : balls) {
        float d = dist(x, y, ball.pos.x, ball.pos.y);
        sum += (ball.r / d);
      }
      matrix.get(x).add(y, sum);
    }
  }

  return matrix;
}
