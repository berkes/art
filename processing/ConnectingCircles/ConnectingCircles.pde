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
    ellipse(pos.x, pos.y, r*2, r*2);
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

void setup() {
  size(600, 600);
  background(255);
  noFill();
  float r = 50;

  for (int i = 0; i < 10; i++) {
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
}
