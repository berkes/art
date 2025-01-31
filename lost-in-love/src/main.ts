import p5 from "p5";
import seedrandom from "seedrandom";

const sketch = (p: p5) => {
  let maze: Maze;

  p.setup = () => {
    let rng = seedrandom("romeo - juliet");
    p.createCanvas(900, 900);
    p.colorMode(p.HSL);
    console.log(p.frameRate());
    const colors = new ColorScheme(
      p.color(336, 80, 47, 100),
      p.color(40, 100, 57, 100),
      p.color(336, 80, 47, 100),
      rng,
      p
    );

  maze = new Maze(40, 40, 4, colors, rng, p.width, p.height);
};

p.draw = () => {
  p.background(maze.colors.backgroundColor);
  maze.draw(p);
}
};

new p5(sketch);

class ColorScheme {
  public foregroundColor: p5.Color;
  public backgroundColor: p5.Color;
  public highlightColor: p5.Color;

  constructor(
    private readonly baseForegroundColor: p5.Color,
    private readonly baseBackgroundColor: p5.Color,
    private readonly baseHighlightColor: p5.Color,
    private readonly rng: seedrandom.PRNG,
    private readonly p: p5,
  ) {
    this.foregroundColor = this.randomizeForegroundColor();
    this.backgroundColor = this.randomizeBackgroundColor();
    this.highlightColor = this.randomizeHighlightColor();
  }

  private randomizeForegroundColor(): p5.Color {
    const color = this.baseForegroundColor;
    const newH = this.p.hue(color) * (0.95 + this.rng() * 0.1); // 95-105% of original hue
    const newS = this.p.saturation(color) * (0.8 + this.rng() * 0.2); // 80-100% of original saturation
    const newL = this.p.lightness(color) * (1.0 + this.rng() * 0.4); // 100-120% of original lightness
    return this.p.color(newH, newS, newL);
  }

  private randomizeBackgroundColor(): p5.Color {
    const color = this.baseBackgroundColor;
    const newH = this.p.hue(color) * (0.95 + this.rng() * 0.1); // 95-105% of original hue
    const newS = this.p.saturation(color) * (0.6 + this.rng() * 0.4); // 60-100% of original saturation
    const newL = this.p.lightness(color) * (1.0 + this.rng() * 0.2); // 100-120% of original lightness
    return this.p.color(newH, newS, newL);
  }

  private randomizeHighlightColor(): p5.Color {
    const color = this.baseHighlightColor;
    const newH = this.p.hue(color) * (0.95 + this.rng() * 0.1); // 95-105% of original hue
    const newS = this.p.saturation(color) * (0.8 + this.rng() * 0.2); // 80-100% of original saturation
    const newL = this.p.lightness(color) * (1.0 + this.rng() * 0.2); // 100-120% of original lightness
    return this.p.color(newH, newS, newL);
  }
}

// Cell interface
interface CellInterface {
  topWall: boolean;
  rightWall: boolean;
  bottomWall: boolean;
  leftWall: boolean;
  visited: boolean;
  isStart: boolean;
  col: number;
  row: number;
  width: number;
  height: number;
  colorScheme: ColorScheme;
}

// Main Cell class implementation
class Cell implements CellInterface {
  topWall: boolean = true;
  rightWall: boolean = true;
  bottomWall: boolean = true;
  leftWall: boolean = true;
  visited: boolean = false;
  isStart: boolean = false;

  constructor(
    public col: number,
    public row: number,
    public width: number,
    public height: number,
    public colorScheme: ColorScheme,
  ) { }

  draw(p: p5) {
    const x = this.col * this.width;
    const y = this.row * this.height;

    if (!this.visited) {
      p.push();
      p.strokeWeight(this.width / 2);
      p.stroke(this.colorScheme.foregroundColor);
      p.fill(this.colorScheme.foregroundColor);
      p.rect(x, y, this.width, this.height);
      p.pop();
      return;
    }

    // Draw walls if they exist
    if (this.topWall) {
      this.drawWall(p, x, y, x + this.width, y);
    }
    if (this.rightWall) {
      this.drawWall(p, x + this.width, y, x + this.width, y + this.height);
    }
    if (this.bottomWall) {
      this.drawWall(p, x + this.width, y + this.height, x, y + this.height);
    }
    if (this.leftWall) {
      this.drawWall(p, x, y + this.height, x, y);
    }
  }

  strokeWeight(): number {
    return this.width / 2;
  }

  // Helper function to draw a wall
  drawWall(p5: p5, x1: number, y1: number, x2: number, y2: number) {
    p5.push();
    p5.strokeCap(p5.PROJECT);
    p5.stroke(this.colorScheme.foregroundColor);
    p5.strokeWeight(this.strokeWeight());
    p5.line(x1, y1, x2, y2);
    p5.pop();
  };

  isBorder(totalCols: number, totalRows: number): boolean {
    return this.col === 0 || this.col === totalCols - 1 ||
      this.row === 0 || this.row === totalRows - 1;
  }
}

enum IconPlacement {
  CENTER,
  TOPBORDER,
  RIGHTBORDER,
  BOTTOMBORDER,
  LEFTBORDER
}

// Heart class for icons
class Heart {
  constructor(
    public row: number,
    public col: number,
    public size: number,
    public colorScheme: ColorScheme,
    private readonly placement: IconPlacement = IconPlacement.CENTER
  ) { }

  draw(p5: p5) {
    const size = this.size;
    const halfSize = size / 2;
    const quarterSize = size / 4;

    // For the outer heart, we need to move the center point outwards by half the size
    let x = this.col * size;
    let y = this.row * size;
    if (this.placement != IconPlacement.CENTER) {
      console.debug(this.placement);
      console.debug(this.col, this.row);
    }
    if (this.placement === IconPlacement.TOPBORDER) {
      y = y - halfSize;
    } else if (this.placement === IconPlacement.RIGHTBORDER) {
      x = x + halfSize;
    } else if (this.placement === IconPlacement.BOTTOMBORDER) {
      y = y + halfSize;
    } else if (this.placement === IconPlacement.LEFTBORDER) {
      x = x - halfSize;
    }

    // Center point for the heart
    const centerX = x + halfSize;
    const centerY = y + halfSize;

    // Adjustments from original implementation
    const widthAdjustment = 0.6;
    const heightAdjustment = 0.4 * quarterSize;

    p5.push();
    p5.fill(this.colorScheme.foregroundColor); // NOT highlightColor
    p5.stroke(this.colorScheme.foregroundColor);
    p5.strokeWeight(1);
    p5.beginShape();

    // Top center point
    const topCenterY = centerY - quarterSize - heightAdjustment;
    p5.vertex(centerX, topCenterY);

    // Left curve
    p5.bezierVertex(
      centerX - halfSize * widthAdjustment, centerY - halfSize - heightAdjustment,
      centerX - size, centerY - heightAdjustment,
      centerX, centerY + halfSize - heightAdjustment
    );

    // Right curve
    p5.bezierVertex(
      centerX + size, centerY - heightAdjustment,
      centerX + halfSize * widthAdjustment, centerY - halfSize - heightAdjustment,
      centerX, topCenterY
    );

    p5.endShape(p5.CLOSE);
    p5.pop();
  }
}

// Main Maze class to handle the generation and drawing of the maze
class Maze {
  cells: Cell[] = [];
  stack: number[] = [];
  current: number | null = null;
  centerIcon: Heart | null = null;
  borderIcon: Heart | null = null;

  constructor(
    public readonly cols: number = 0,
    public readonly rows: number = 0,
    public readonly paddingCells: number = 0,
    public readonly colors: ColorScheme,
    private readonly rng: seedrandom.PRNG,
    private readonly width: number = 0,
    private readonly height: number = 0,
  ) {
    this.initializeCells();
  }

  private initializeCells() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.cells.push(new Cell(
          col,
          row,
          this.cellWidth(),
          this.cellHeight(),
          this.colors
        ));
      }
    }
  }

  cellWidth(): number {
    return this.width / (this.cols + this.paddingCells);
  }

  cellHeight(): number {
    return this.height / (this.rows + this.paddingCells);
  }

  index(col: number, row: number): number | null {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) {
      return null;
    }
    return col + row * this.cols;
  }

  draw(p: p5) {
    // Setup the drawing area with translation to account for padding
    const margin = {
      x: this.cellWidth() * (this.paddingCells / 2),
      y: this.cellHeight() * (this.paddingCells / 2)
    };

    p.push();
    p.translate(margin.x, margin.y);

    // Draw all cells
    this.cells.forEach(cell => cell.draw(p));

    // Draw icons if they exist
    this.centerIcon?.draw(p);
    this.borderIcon?.draw(p);

    p.pop();

    if (this.borderIcon) {
      // Stop the animation, the maze is complete
      p.noLoop();
    } else {
      // Update the maze generation
      this.update();
    }
  }

  private update() {
    if (this.current !== null) {
      const currentIdx = this.current;
      const currentCell = this.cells[currentIdx];
      const nextCol = currentIdx % this.cols;
      const nextRow = Math.floor(currentIdx / this.cols);

      const neighbors = this.getUnvisitedNeighbors(nextCol, nextRow);

      if (neighbors.length > 0) {
        // Choose random neighbor
        const [nextCol, nextRow] = this.chooseRandomNeighbor(neighbors);
        const nextIdx = this.index(nextCol, nextRow);

        if (nextIdx !== null) {
          this.stack.push(currentIdx);

          // Mark the next cell as visited
          this.cells[nextIdx].visited = true;

          // Remove walls between current and next
          const dx = nextCol - currentCell.col;
          const dy = nextRow - currentCell.row;

          switch (true) {
            case dx === 1: // Right
              this.cells[currentIdx].rightWall = false;
              this.cells[nextIdx].leftWall = false;
              break;
            case dx === -1: // Left
              this.cells[currentIdx].leftWall = false;
              this.cells[nextIdx].rightWall = false;
              break;
            case dy === 1: // Down
              this.cells[currentIdx].bottomWall = false;
              this.cells[nextIdx].topWall = false;
              break;
            case dy === -1: // Up
              this.cells[currentIdx].topWall = false;
              this.cells[nextIdx].bottomWall = false;
              break;
          }

          this.current = nextIdx;
        }
      } else if (this.stack.length > 0) {
        // Backtrack one item on the stack
        this.current = this.stack.pop() ?? null;
      } else {
        // Maze is complete, create an exit at the border
        const borderCells = this.cells.filter((cell) => {
          return cell.isBorder(this.cols, this.rows);
        });

        if (borderCells.length > 0) {
          const exitCell = this.chooseRandomBorderCell(borderCells);
          let iconCol = exitCell.col;
          let iconRow = exitCell.row;
          let placement = IconPlacement.CENTER;

          // Remove the outer wall and position the heart icon
          if (exitCell.col === 0) {
            exitCell.leftWall = false;
            iconCol = -1;
            iconRow = exitCell.row;
            placement = IconPlacement.LEFTBORDER;
          } else if (exitCell.col === this.cols - 1) {
            exitCell.rightWall = false;
            iconCol = this.cols;
            iconRow = exitCell.row;
            placement = IconPlacement.RIGHTBORDER;
          } else if (exitCell.row === 0) {
            exitCell.topWall = false;
            iconCol = exitCell.col;
            iconRow = -1;
            placement = IconPlacement.TOPBORDER;
          } else {
            exitCell.bottomWall = false;
            iconCol = exitCell.col;
            iconRow = this.rows;
            placement = IconPlacement.BOTTOMBORDER;
          }

          this.borderIcon = new Heart(
            iconRow,
            iconCol,
            this.cellHeight(),
            this.colors,
            placement,
          );
        }

        this.current = null;
      }
    } else {
      // Initialize maze generation from a random center-ish position
      const startCol = this.randomRange(this.cols / 2, this.cols / 4);
      const startRow = this.randomRange(this.rows / 2, this.rows / 4);

      // Update center icon position
      if (!this.centerIcon) {
        this.centerIcon = new Heart(
          startRow,
          startCol,
          this.cellHeight(),
          this.colors
        );
      }

      // Initialize the starting area (3x3 grid of open cells)
      const startCells = [
        [0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]
      ];

      let lastIdx = startCol + startRow * this.cols;

      startCells.forEach(([dx, dy]) => {
        const idx = this.index(startCol + dx, startRow + dy);
        if (idx !== null) {
          const cell = this.cells[idx];
          cell.visited = true;
          cell.isStart = true;
          cell.topWall = false;
          cell.rightWall = false;
          cell.bottomWall = false;
          cell.leftWall = false;
          lastIdx = idx;
        }
      });

      this.current = lastIdx;
    }
  }

  private randomRange(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  private chooseRandomNeighbor(neighbors: [number, number][]): [number, number] {
    return neighbors[Math.floor(this.rng() * neighbors.length)];
  }

  private chooseRandomBorderCell(borderCells: Cell[]): Cell {
    return borderCells[Math.floor(this.rng() * borderCells.length)];
  }

  private getUnvisitedNeighbors(col: number, row: number): [number, number][] {
    const directions = [
      [0, -1], // top
      [1, 0],  // right
      [0, 1],  // bottom
      [-1, 0]  // left
    ];

    return directions
      .map(([dx, dy]) => [col + dx, row + dy] as [number, number])
      .filter(([newCol, newRow]) => {
        const idx = this.index(newCol, newRow);
        return idx !== null && !this.cells[idx].visited;
      });
  }
}
