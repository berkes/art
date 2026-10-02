import {
  type DrawFunction,
  Drawing,
  Point,
  Random,
  Settings,
  Vormen,
} from "@berkes/vormen";

const settings = new Settings({
  seed: "1234567890",
  color_bg: "black",
  color_fg: "white",
});

interface Pointy {
  x: number;
  y: number;
}

class PathData {
  private _points: Pointy[];

  constructor(points: Pointy[]) {
    this._points = points;
  }

  push(point: Pointy): PathData {
    this._points.push(point);
    return this;
  }

  get(idx: number): Pointy {
    if (idx < 0 || idx >= this._points.length) {
      throw new Error(
        `Index ${idx} out of bounds: 0..${this._points.length - 1}`,
      );
    }
    return this._points[idx];
  }

  tryGet(idx: number): Pointy | undefined {
    return this._points[idx];
  }

  getCyclic(idx: number): Pointy {
    if (this._points.length <= 0) {
      throw new Error("No points in path");
    }
    if (idx < 0) {
      return this.getCyclic(this._points.length + idx);
    } else if (idx >= this._points.length) {
      return this.getCyclic(idx - this._points.length);
    } else {
      return this.get(idx);
    }
  }

  indexOf(point: Pointy): number {
    return this._points.indexOf(point);
  }

  get points(): Pointy[] {
    return this._points;
  }

  get start(): Pointy {
    return this._points[0]!;
  }

  get end(): Pointy {
    return this._points[this._points.length - 1]!;
  }

  get asDataString(): string {
    let out = `M ${this.start.x} ${this.start.y}`;
    this._points.forEach((point) => {
      out += ` L ${point.x} ${point.y}`;
    });
    return out;
  }
}

const draw: DrawFunction = (settings: Settings) => {
  const drawing = new Drawing()
    .withSize(1080, 1080)
    .withMargin(20)
    .withBackgroundColor(settings.getString("color_bg"));

  const canvas = drawing.build();

  const rand = new Random(settings.getString("seed"));

  const points: PathData = new PathData([
    new Point(
      rand.between(0, drawing.getInnerWidth()),
      rand.between(0, drawing.getInnerHeight()),
    ),
  ]);

  let dir: "x" | "y" = "x";
  for (let i = 1; i < 200; i++) {
    let newPoint;

    const lastPoint = points.get(i - 1);
    if (dir === "x") { // We change the X
      const upper = drawing.getInnerWidth() - lastPoint.x; // We can move at most to the right border
      const lower = -lastPoint.x; // We can move at most to 0
      const move = rand.between(lower, upper);
      newPoint = new Point(lastPoint.x + move, lastPoint.y);
      dir = "y";
    } else { // We change the Y
      const upper = drawing.getInnerHeight() - lastPoint.y;
      const lower = -lastPoint.y;
      const move = rand.between(lower, upper);
      newPoint = new Point(lastPoint.x, lastPoint.y + move);
      dir = "x";
    }

    points.push(newPoint);
  }

  points.points.forEach((point) => {
    const nextPoint = points.tryGet(points.indexOf(point) + 1);
    if (!nextPoint) return;
    canvas.line(point.x, point.y, nextPoint.x, nextPoint.y).stroke({
      color: settings.getString("color_fg"),
      width: 1,
    });
  });

  return drawing;
};

Vormen(draw, settings);
