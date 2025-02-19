class Circle {
  float x, y, r, xSpeed, ySpeed;
  int npoints;

  Circle(float x, float y, float r, float xSpeed, float ySpeed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;

    this.npoints = 12;
  }

  void move() {
    x += xSpeed;
    y += ySpeed;
  }

  void stop() {
    xSpeed = 0;
    ySpeed = 0;
  }

  boolean collide(Circle other) {
    float d = dist(x, y, other.x, other.y);

    return abs(d) < r + other.r;
  }

  boolean atEdge() {
    return x < 0 || x > width || y < 0 || y > height;
  }

  PVector[] getNonOverlappingPoints(Circle other) {
    PVector[] points = new PVector[npoints];
    for (int i = 0; i < npoints; i++) {
      float angle = TWO_PI / npoints * i;
      float sx = x + cos(angle) * r;
      float sy = y + sin(angle) * r;
      PVector p = new PVector(sx, sy);
      if (dist(p.x, p.y, other.x, other.y) > other.r) {
        points[i] = p;
      }
    }
    return points;
  }
}

Circle c1, c2;

void setup() {
  size(600, 600);
  background(255);

  c1 = new Circle(1, 1, 150, 1, 1);
  c2 = new Circle(width - 1, height - 1, 100, -1, -1);
}

void draw() {
  background(255);

  if (c1.atEdge()) {
    c1.stop();
  }
  if (c2.atEdge()) {
    c2.stop();
  }

  c1.move();
  c2.move();
  PVector[] c1Points = c1.getNonOverlappingPoints(c2);
  PVector[] c2Points = c2.getNonOverlappingPoints(c1);

  if (c2.collide(c1)) {
    PVector[] combinedSet = new PVector[c1Points.length + c2Points.length];
    System.arraycopy(c1Points, 0, combinedSet, 0, c1Points.length);
    System.arraycopy(c2Points, 0, combinedSet, c1Points.length, c2Points.length);

    drawShape(combinedSet);
  } else {
    drawShape(c1Points);
    drawShape(c2Points);
  }
  
  saveFrame("frames/####.png");
}

void drawShape(PVector[] points) {
  // Draw the points
  for (PVector point : points) {
    if (point != null) {
      ellipse(point.x, point.y, 5, 5);
    }
  }

  // Draw the smooth curve through the points
  beginShape();
  for (PVector point : points) {
    if (point != null) {
      curveVertex(point.x, point.y);
    }
  }

  // Add additional control points to smooth out the closing edge
  int len = points.length;
  if (len > 2) {
    if (points[len - 1] != null && points[0] != null && points[1] != null) {
      curveVertex(points[0].x, points[0].y);
      curveVertex(points[1].x, points[1].y);
      curveVertex(points[2].x, points[2].y);
    }
  }

  endShape(CLOSE);
}
