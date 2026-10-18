import {
  almostEqual,
  constrain,
  Drawing,
  Grid,
  map,
  Noise,
  Point,
  Random,
  RoundedPathBuilder,
  Settings,
  type SettingsData,
  Vector,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: Math.random(),
  columns: 60,
  rows: 60,
  innerMargin: 2,
  roundingRadius: 2,
  noiseScale: 0.005,
  bw: false,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);

  let bg;
  if (settings.bw) {
    bg = "#fff";
  } else {
    bg = "#FFF4BF";
  }
  const colors = [
    "#FFBEFB",
    "#DC95FF",
    "#8C56D4",
  ];

  const drawing = new Drawing()
    .withSize(1200, 1200)
    .withMargin(30)
    .withBackgroundColor(bg);
  const canvas = drawing.build();

  const noise = new Noise(settings.seed);
  const rand = new Random(settings.seed);

  const grid = new Grid()
    .withCols(settings.columns)
    .withRows(settings.rows)
    .withPadding(0)
    .withSize(drawing.width, drawing.height);

  const cellWidth = grid.cellWidth;
  const cellHeight = grid.cellHeight;

  const intersections = grid.intersections();
  const movedIntersections = intersections.map((point) => {
    const xOffset = map(
      noise.get(point.x, point.y, settings.noiseScale),
      0,
      1,
      0,
      cellWidth / 1,
    );
    const yOffset = map(
      noise.get(point.x, point.y, settings.noiseScale),
      0,
      1,
      0,
      cellHeight / 1,
    );
    const p = new Point(
      constrain(point.x + xOffset, -drawing.margin, drawing.outerWidth),
      constrain(point.y + yOffset, -drawing.margin, drawing.outerHeight),
    );
    return p;
  });

  grid.cells().forEach((cell) => {
    const point = { x: cell.x, y: cell.y };

    const color = settings.bw ? "none" : rand.pick(colors);
    const strokeColor = settings.bw ? "black" : rand.pick(colors);

    const cornerIdx = {
      topLeft: intersections.findIndex((p) =>
        p.x === point.x && p.y === point.y
      ),
      topRight: intersections.findIndex((p) =>
        almostEqual(p.x, point.x + grid.cellWidth) && p.y === point.y
      ),
      bottomLeft: intersections.findIndex((p) =>
        p.x === point.x && almostEqual(p.y, point.y + grid.cellHeight)
      ),
      bottomRight: intersections.findIndex((p) =>
        almostEqual(p.x, point.x + grid.cellWidth) &&
        almostEqual(p.y, point.y + grid.cellHeight)
      ),
    };

    const i = settings.innerMargin;
    const corners = {
      topLeft: movedIntersections[cornerIdx.topLeft].add(new Vector(i, i)),
      topRight: movedIntersections[cornerIdx.topRight].add(new Vector(-i, i)),
      bottomLeft: movedIntersections[cornerIdx.bottomLeft].add(
        new Vector(i, -i),
      ),
      bottomRight: movedIntersections[cornerIdx.bottomRight].add(
        new Vector(-i, -i),
      ),
    };

    const pathBuilder = new RoundedPathBuilder([
      corners.topLeft,
      corners.topRight,
      corners.bottomRight,
      corners.bottomLeft,
    ]);

    const pathData = pathBuilder.withClosed(true).withRounding(3)
      .withRoundingConstrained(true).build();

    canvas.path(pathData).fill(color).stroke({ width: 1, color: strokeColor });
  });

  return drawing.svg();
}

Vormen(draw, defaultSettings);
