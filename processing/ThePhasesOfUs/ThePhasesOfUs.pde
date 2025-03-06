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

class Grid {
  private int cols, rows;
  ArrayList<Cell> cells;

  Grid(int width, int height, int n_cells) {
    // Cells are always square
    // Calculate the amout of columns and rows based on the amount of cells and the width and height
    int cellSize = (int)sqrt((width * height) / n_cells);
    this.cols = width / cellSize + 1;
    this.rows = height / cellSize + 1;
    // if (this.cols * this.rows != n_cells) {
    //   throw new IllegalArgumentException("The amount of cells must be a square number");
    // }

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

  Cell(PVector pos, int width, int height) {
    this.pos = pos;
    this.cwidth = width;
    this.cheight = height;

    // North, East, South, West values
    this.values = new float[4];
  }

  void display() {
    push();
    fill(0);
    stroke(0);
    // A dot at every corner
    ellipse(pos.x, pos.y, 5, 5);
    text(values[0], pos.x, pos.y + 10);
    // The rectangle
    noFill();
    rect(pos.x, pos.y, this.cwidth, this.cheight);

    pop();
  }

  void update(ArrayList<Float> field) {
    this.values[0] = field.get((int)(this.pos.x + this.pos.y * width));
  }
}


ArrayList<MetaBall> balls = new ArrayList<MetaBall>();
float correction = 0.5;
Grid grid;

void setup() {
  colorMode(HSB, 360, 100, 100);

  float r = 80;

  size(1200, 800, P2D);

  grid = new Grid(1200, 800, 60);
  println(grid);

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
  loadPixels();
  for (int i = 0; i < field.size(); i++) {
    float hue = map(field.get(i), 0, 3, 0, 360);
    float sat = 100;// map(field.get(i), 0, 36, 0, 100);
    float bri = 100; //norm(hue, 0, 360) * 100;//norm(field.get(i), 0, 10) * 100; //map(field.get(i), 0, 36, 0, 100);
    float alpha = 120;
    pixels[i] = color(hue, sat, bri, alpha);
  }
  updatePixels();

  grid.update(field);
  grid.display();

  for (MetaBall ball : balls) {
    ball.display();
  }

  saveFrame("frames/####.png");
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
