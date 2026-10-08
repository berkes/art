import {
  type Cell,
  Direction,
  type DrawFunction,
  Drawing,
  Grid,
  Random,
  Settings,
  Vormen,
} from "@berkes/vormen";
import { Text } from "@svgdotjs/svg.js";

class MazeCell {
  public possibleNeighbors = [
    Direction.Up,
    Direction.Right,
    Direction.Down,
    Direction.Left,
  ];
  public readonly cell: Cell;

  constructor(cell: Cell) {
    this.cell = cell;
  }

  get id(): string {
    return this.cell.id;
  }

  toString() {
    return `<Cell ${this.cell.row},${this.cell.col}>`;
  }

  randomNeighbor(rand: Random): MazeCell | undefined {
    while (this.possibleNeighbors.length > 0) {
      const option = rand.pick(this.possibleNeighbors);
      this.possibleNeighbors.splice(this.possibleNeighbors.indexOf(option), 1);

      const neighbor = this.cell.getNeighbor(option);
      if (neighbor) {
        return new MazeCell(neighbor);
      }
    }
  }
}

const settings = new Settings({
  seed: 74729448528,
  bg: "rgb(69, 6, 147)",
  main: "rgb(140, 0, 255)",
  support: "rgb(255, 63, 127)",
  accent: "rgb(255, 196, 0)",
});

const draw: DrawFunction = (settings: Settings): Drawing => {
  const drawing = new Drawing()
    .withSize(1080, 1080)
    .withMargin(0)
    .withBackgroundColor(settings.getString("bg"));

  const grid = new Grid()
    .withCols(6)
    .withRows(6)
    .withSize(drawing.getInnerWidth(), drawing.getInnerHeight());

  const canvas = drawing.build();
  const rand = new Random(settings.getString("seed"));

  // Maze.
  const todo = [...grid.cells().map((c) => new MazeCell(c))];
  const beginCell = todo.shift()!;
  let visitedIdx = 0;
  let currentCell = beginCell;
  const visited = [beginCell];
  const forks: MazeCell[] = [];
  let backTracking: boolean = false;

  let protect = 1000;

  while (todo.length > 0) {
    if (protect-- < 0) throw new Error("Infinite loop detected");

    const possible = currentCell.randomNeighbor(rand);
    if (possible !== undefined) {
      // If we have a possible neighbor, we can move to it.
      if (todo.find((c) => c.id == possible.id)) {
        console.log("Moving to", possible.id);
        // If we were backtracking, we no longer are and we can mark this as a fork
        if (backTracking) {
          backTracking = false;
        }
        currentCell = possible;
        todo.splice(todo.indexOf(currentCell), 1);
        visited.push(currentCell);
        visitedIdx++;
      } else {
        continue;
      }
    } else {
      // No more neighbors, so we must backtrack.
      if (!backTracking) {
        // forks,
      }

      backTracking = true;
      visitedIdx--;
      if (visitedIdx < 0) {
        throw new Error(
          `No more backtracking with ${todo.length} to go: ${todo[0]}`,
        );
      }

      const possible = visited[visitedIdx];
      if (possible !== undefined) {
        currentCell = possible;
        forks.push(currentCell);
      }
    }
  }

  // const forks: MazeCell[] = [];
  // let deadEnd = false;
  let lastFork: MazeCell | undefined;
  visited.forEach((mc, i) => {
    const cell = mc.cell;
    const nextCell = visited[i + 1]?.cell;
    if (!nextCell) return;

    let color = "black";
    if (forks.includes(mc)) {
      color = "blue";
      lastFork = mc;
    }

    canvas.line(cell.centerX, cell.centerY, nextCell.centerX, nextCell.centerY)
      .stroke({ color: color, width: 2, linecap: "round" });
    const offset = i * 6;
    canvas.text(`${i}: ${cell.id}`).font({
      size: 12,
      family: "Ubuntu Mono",
      anchor: "middle",
      weight: "bold",
    }).fill("white").cx(cell.centerX).cy(cell.y + offset);
  });

  // A text across the bottom
  const textX = 30;
  const textY = drawing.getInnerHeight() - 30;
  const text = new Text()
    .text(`Drawing ${rand.seed}`)
    .font({ size: 12, family: "Ubuntu Mono", anchor: "middle", weight: "bold" })
    .fill(settings.getString("accent"))
    .x(textX)
    .y(textY);

  canvas
    .rect(text.bbox().width + 20, text.bbox().height + 8)
    .fill(settings.getString("bg"))
    .stroke("none")
    .radius(4)
    .x(textX - 10)
    .y(textY - 3);
  canvas.add(text);

  canvas.add(grid.toSvg({}));
  return drawing;
};

Vormen(draw, settings);

// function* pairwise<T>(iterable: T[]): Generator<[T, T], void> {
//   const iterator = iterable[Symbol.iterator]();
//   let a = iterator.next();
//   if (a.done) return;
//   let b = iterator.next();
//   while (!b.done) {
//     yield [a.value, b.value];
//     a = b;
//     b = iterator.next();
//   }
// }
