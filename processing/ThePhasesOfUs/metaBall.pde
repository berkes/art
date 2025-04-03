class MetaBall implements Mover {
  float r, mass;
  boolean highlight;
  PVector position, velocity, accelleration;
  String name;

  MetaBall(float r, PVector position, String name) {
    this.name = name;
    this.r = r;
    this.position = position;
    this.velocity = new PVector(0, 0);
    this.accelleration = new PVector(0, 0);
    this.mass = r * 0.1;
  }

  float getMass() {
    return this.mass;
  }
  public PVector getPosition() {
    return this.position;
  }
  public PVector getVelocity() {
    return this.velocity;
  }
  public boolean collides(PVector point) {
    return this.position.dist(point) <= r;
  }

  void applyForce(PVector force) {
    if (DEBUG) {
      drawVector(position, force, force.mag() * r*2, color(100, 0, 0));
    }
    PVector appliedAccelleration = PVector.div(force, mass);
    accelleration.add(appliedAccelleration);
  }

  void update() {
    checkEdges();

    velocity.add(accelleration);
    position.add(velocity);
    accelleration.mult(0);
  }

  void stop() {
    this.velocity = new PVector(0, 0);
  }

  void display() {
    if (DEBUG) {
      push();
      noFill();
      stroke(0);
      ellipse(position.x, position.y, r*2, r*2);
      drawVector(position, velocity, r * 2, color(0, 100, 0));
      textAlign(CENTER, CENTER);
      fill(0);
      text(name, position.x, position.y);
      pop();
    }
  }

  String toString() {
    return name;
  }

  private void checkEdges() {
    // Reverse the direction if we hit the edges
    if (position.x > width - r || position.x < r) {
      velocity.x *= -1;
    }
    if (position.y > height - r || position.y < r) {
      velocity.y *= -1;
    }
  }

  private void drawVector(PVector position, PVector dir, float scayl, color c) {
    push();
    translate(position.x, position.y);
    stroke(c);
    strokeWeight(4);
    line(0, 0, dir.x * scayl, dir.y * scayl);
    // A triangle at the end of the vector
    float arrowSize = 7;
    translate(dir.x * scayl, dir.y * scayl);
    rotate(dir.heading() + PI / 2);
    fill(c);
    triangle(-arrowSize / 2, arrowSize, arrowSize / 2, arrowSize, 0, -arrowSize / 2);
    pop();
  }
}
