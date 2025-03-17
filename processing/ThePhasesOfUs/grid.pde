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
    // if (DEBUG) {
    if (false) {
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
        startp = bottom();
        endp = left();
        break;
      case 2:
      case 13:
        startp = right();
        endp = bottom();
        break;
      case 3:
      case 12:
        startp = left();
        endp = right();
        break;
      case 4:
      case 11:
        startp = top();
        endp = right();
        break;
      case 5:
        line(right().x, right().y, bottom().x, bottom().y);
        line(top().x, top().y, left().x, left().y);
        break;
      case 6:
      case 9:
        startp = top();
        endp = bottom();
        break;
      case 7:
      case 8:
        startp = top();
        endp = left();
        break;
      case 10:
        line(top().x, top().y, right().x, right().y);
        line(bottom().x, bottom().y, left().x, left().y);
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

  private PVector top() {
    return new PVector(topLeft().x + cwidth/2, topLeft().y);
  }
  private PVector right() {
    return new PVector(topRight().x, topRight().y + cheight/2);
  }
  private PVector bottom() {
    return new PVector(bottomLeft().x + cwidth/2, bottomLeft().y);
  }
  private PVector left() {
    return new PVector(topLeft().x, topLeft().y + cheight/2);
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

