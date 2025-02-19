import java.util.LinkedHashSet;

class Circle {
  float x, y, r, xSpeed, ySpeed;
  int npoints;

  Circle(float x, float y, float r, float xSpeed, float ySpeed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;

    this.npoints = 8;
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
  // LinkedHashSet<PVector> c1Points = c1.getNonOverlappingPoints(c2);
  // LinkedHashSet<PVector> c2Points = c2.getNonOverlappingPoints(c1);
  PVector[] c1Points = c1.getNonOverlappingPoints(c2);
  PVector[] c2Points = c2.getNonOverlappingPoints(c1);

  println("c1Points: " + c1Points.length);
  println("c2Points: " + c2Points.length);

  if (c2.collide(c1)) {
    beginShape();

    PVector[] combinedSet = new PVector[c1Points.length + c2Points.length];
    System.arraycopy(c1Points, 0, combinedSet, 0, c1Points.length);
    System.arraycopy(c2Points, 0, combinedSet, c1Points.length, c2Points.length);
    println("combinedSet: " + combinedSet.length);

    // Start from the first non-null point
    // Then sort the rest of the points in the array according to the distance from the previous point
    for (int i = 0; i < combinedSet.length; i++) {
      if (combinedSet[i] != null) {
        PVector firstPoint = combinedSet[i];
        combinedSet[i] = null;
        curveVertex(firstPoint.x, firstPoint.y);

        for (int j = 0; j < combinedSet.length; j++) {
          if (combinedSet[j] != null) {
            PVector nextPoint = combinedSet[j];
            float minDist = dist(firstPoint.x, firstPoint.y, nextPoint.x, nextPoint.y);
            int minIndex = j;

            for (int k = 0; k < combinedSet.length; k++) {
              if (combinedSet[k] != null) {
                PVector p = combinedSet[k];
                float d = dist(firstPoint.x, firstPoint.y, p.x, p.y);
                if (d < minDist) {
                  minDist = d;
                  minIndex = k;
                }
              }
            }

            curveVertex(combinedSet[minIndex].x, combinedSet[minIndex].y);
            combinedSet[minIndex] = null;
          }
        }
      }
    }

    // for (PVector p : combinedSet) {
    //   if (p != null) {
    //     curveVertex(p.x, p.y);
    //   }
    // }
    // curveVertex(combinedSet[0].x, combinedSet[0].y);
    endShape(CLOSE);
  } else {
    beginShape();
    for (PVector p : c1Points) {
      curveVertex(p.x, p.y);
    }
    // curveVertex(c1Points[0].x, c1Points[0].y);
    endShape(CLOSE);

    beginShape();
    for (PVector p : c2Points) {
      curveVertex(p.x, p.y);
    }
    // curveVertex(c2Points[0].x, c2Points[0].y);
    endShape(CLOSE);
  }
}

