// Consts for the corner indexes
final int TOP_LEFT = 0;
final int TOP_RIGHT = 1;
final int BOTTOM_LEFT = 2;
final int BOTTOM_RIGHT = 3;

final float MS_THRESHOLD = 2.0;

// final boolean DEBUG = true;
final boolean DEBUG = false;
final boolean SAVE_FRAMES = false;

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
    if (DEBUG) {
      push();
      noFill();
      fill(0);
      stroke(0);
      ellipse(pos.x, pos.y, r*2, r*2);
      pop();
    }
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

class Grid {
  private int cols, rows;
  ArrayList<Cell> cells;

  Grid(int width, int height, int n_cells) {
    // Cells are always square
    // Calculate the amout of columns and rows based on the amount of cells and the width and height
    int cellSize = (int)sqrt((width * height) / n_cells);
    this.cols = width / cellSize + 1;
    this.rows = height / cellSize + 1;
    this.cells = new ArrayList<Cell>();
    for (int i = 0; i < (cols * rows); i++) {
      PVector pos = new PVector((i % cols) * cellSize, (i / cols) * cellSize);
      cells.add(new Cell(pos, cellSize, cellSize));
    }
  }

  void display() {
    for (Cell cell : cells) {
      push();
      noFill();
      cell.display();
      pop();
    }
  }

  void update(ArrayList<Float> field) {
    for (Cell cell : cells) {
      cell.update(field);
    }
  }
}

class Cell {
  PVector pos;
  int cheight, cwidth;
  // Four values for each corner of the cell
  float[] values;

  Cell(PVector top_left_pos, int width, int height) {
    this.pos = top_left_pos;

    this.cwidth = width;
    this.cheight = height;

    // North, East, South, West values
    this.values = new float[4];
  }

  void display() {
    push();
    fill(0);
    stroke(0);

    if (values[TOP_LEFT] > MS_THRESHOLD) {
      fill(180, 100, 100);
    } else {
      fill(360, 0, 0);
    }
    if (DEBUG) {
      ellipse(pos.x, pos.y, 5, 5);
      rectMode(CORNERS);

      noFill();
      fill(0);
      stroke(0);
      textAlign(LEFT, TOP);
      // text("TL", topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      text(nf(values[TOP_LEFT], 1, 2), topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      textAlign(RIGHT, TOP);
      // text("TR", topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      text(nf(values[TOP_RIGHT], 1, 2), topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      textAlign(LEFT, BOTTOM);
      // text("BL", topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      text(nf(values[BOTTOM_LEFT], 1, 2), topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      textAlign(RIGHT, BOTTOM);
      // text("BR", topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      text(nf(values[BOTTOM_RIGHT], 1, 2), topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);

      // stroke(color(30, 100, 100));
      // rect(topLeft(5).x, topLeft(5).y, bottomRight(5).x, bottomRight(5).y);
      textAlign(CENTER, CENTER);
      text(nf(marchingSquareType(), 3, 0), pos.x, pos.y, bottomRight().x, bottomRight().y);
    }

    // The polygons
    stroke(0);
    fill(color(200, 100, 100));
    strokeWeight(3);
    PVector startp = null;
    PVector endp = null;
    switch (marchingSquareType()) {
      case 0:
      case 15:
        break;
      case 1:
      case 14:
        startp = bottomCenter();
        endp = leftCenter();
        break;
      case 2:
      case 13:
        startp = rightCenter();
        endp = bottomCenter();
        break;
      case 3:
      case 12:
        startp = leftCenter();
        endp = rightCenter();
        break;
      case 4:
      case 11:
        startp = topCenter();
        endp = rightCenter();
        break;
      case 5:
        line(rightCenter().x, rightCenter().y, bottomCenter().x, bottomCenter().y);
        line(topCenter().x, topCenter().y, leftCenter().x, leftCenter().y);
        break;
      case 6:
      case 9:
        startp = topCenter();
        endp = bottomCenter();
        break;
      case 7:
      case 8:
        startp = topCenter();
        endp = leftCenter();
        break;
      case 10:
        line(topCenter().x, topCenter().y, rightCenter().x, rightCenter().y);
        line(bottomCenter().x, bottomCenter().y, leftCenter().x, leftCenter().y);
        break;
      default:
        break;
    }

    if (startp != null && endp != null) {
      line(startp.x, startp.y, endp.x, endp.y);
    }
    pop();
  }

  void update(ArrayList<Float> field) {
    if (isInsideCanvas(topLeft())) {
      this.values[0] = field.get((int)(this.pos.x + this.pos.y * width));
    }
    if (isInsideCanvas(topRight())) {
      this.values[1] = field.get((int)(topRight().x + topRight().y * width));
    }
    if (isInsideCanvas(bottomLeft())) {
      this.values[2] = field.get((int)(bottomLeft().x + bottomLeft().y * width));
    }
    if (isInsideCanvas(bottomRight())) {
      this.values[3] = field.get((int)(bottomRight().x + bottomRight().y * width));
    }
  }

  private int marchingSquareType() {
    int[] corners = new int[4];
    for (int i = 0; i < 4; i++) {
      corners[i] = this.values[i] > MS_THRESHOLD ? 1 : 0;
    }

    int type = corners[TOP_LEFT] * 8 + corners[TOP_RIGHT] * 4 + corners[BOTTOM_RIGHT] * 2 + corners[BOTTOM_LEFT] * 1;
    return type;
  }

  private PVector topCenter() {
    return PVector.add(this.pos, new PVector(this.cwidth/2, 0));
  }
  private PVector rightCenter() {
    return PVector.add(this.pos, new PVector(this.cwidth, this.cheight/2));
  }
  private PVector bottomCenter() {
    return PVector.add(this.pos, new PVector(this.cwidth/2, this.cheight));
  }
  private PVector leftCenter() {
    return PVector.add(this.pos, new PVector(0, this.cheight/2));
  }

  private PVector topLeft(int margin) {
    return PVector.add(this.pos, new PVector(margin, margin));
  }
  private PVector topLeft() {
    return this.pos;
  }
  private PVector topRight(int margin) {
    return PVector.add(this.pos, new PVector(this.cwidth - margin, margin));
  }
  private PVector topRight() {
    return PVector.add(this.pos, new PVector(this.cwidth, 0));
  }
  private PVector bottomLeft(int margin) {
    return PVector.add(this.pos, new PVector(margin, this.cheight - margin));
  }
  private PVector bottomLeft() {
    return new PVector(this.pos.x, this.pos.y + this.cheight);
  }
  private PVector bottomRight(int margin) {
    return PVector.add(this.pos, new PVector(this.cwidth - margin, this.cheight - margin));
  }
  private PVector bottomRight() {
    return new PVector(this.pos.x + this.cwidth, this.pos.y + this.cheight);
  }

  private boolean isInsideCanvas(PVector p) {
    return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
  }
}


ArrayList<MetaBall> balls = new ArrayList<MetaBall>();
float correction = 0.5;
Grid grid;

void setup() {
  colorMode(HSB, 360, 100, 100);

  float r = 80;

  size(1200, 800, P2D);

  grid = new Grid(1200, 800, 200);

  for (int i = 0; i < 5; i++) {
    PVector position = new PVector(random(r, width-r), random(r, height-r));
    PVector velocity = new PVector(random(-3, 3), random(-3, 3)); // Example direction and speed
    balls.add(new MetaBall(r, position, velocity));
  }
}

void draw() {
  background(255);
  for (MetaBall ball : balls) {
    ball.move();
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

// if we press space, draw one frame and stop again
void keyPressed() {
  if (key == ' ') {
    redraw();
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
      float d = dist(x, y, ball.pos.x, ball.pos.y);
      sum += ball.r / d;
    }
    matrix.add(sum);
  }

  return matrix;
}
