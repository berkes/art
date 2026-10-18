import {
  almostEqual,
  constrain,
  Drawing,
  Grid,
  Point,
  Random,
  RoundedPathBuilder,
  Settings,
  Vector,
  Vormen,
  type SettingsData,
} from "@berkes/vormen";


const defaultSettings = {
  seed: "cyclopedia",
  columns: 8,
  rows: 8,
  innerMargin: 5,
  bw: false,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);

  let bg;
  if (settings.bw) {
    bg = "#fff";
  } else {
    bg =  "#FFF4BF";
  }
  const colors = [
      "#FFBEFB",
      "#DC95FF",
      "#8C56D4"
    ];

  const drawing = new Drawing()
    .withSize(1200,1200)
    .withMargin(20)
    .withBackgroundColor(bg);
  const canvas = drawing.build();

  const grid = new Grid()
    .withCols(settings.columns)
    .withRows(settings.rows)
    .withPadding(0)
    .withSize(drawing.getInnerWidth(), drawing.getInnerHeight());
  const rand = new Random(settings.seed);

  const cellWidth = grid.cellWidth;
  const cellHeight = grid.cellHeight;

  const intersections = grid.intersections();
  const movedIntersections = intersections.map((point) => {
    const xOffset = rand.between(0, cellWidth / 2);
    const yOffset = rand.between(0, cellHeight / 2);
    const p = new Point(constrain(point.x + xOffset, 0, drawing.getInnerWidth()), constrain(point.y + yOffset, 0, drawing.getInnerHeight()));
    return p;
  });

  grid.cells().forEach((cell) => {
    const point = { x: cell.x, y: cell.y };

    const color = settings.bw ? "none" : rand.pick(colors);
    const strokeColor = settings.bw ? "black" : rand.pick(colors);

    const cornerIdx = {
      topLeft: intersections.findIndex((p) => p.x === point.x && p.y === point.y),
      topRight: intersections.findIndex((p) => almostEqual(p.x, point.x + grid.cellWidth) && p.y === point.y),
      bottomLeft: intersections.findIndex((p) => p.x === point.x && almostEqual(p.y, point.y + grid.cellHeight)),
      bottomRight: intersections.findIndex((p) => almostEqual(p.x, point.x + grid.cellWidth) && almostEqual(p.y, point.y + grid.cellHeight)),
    }

    for (let i = settings.innerMargin; i < Math.min(grid.cellWidth / 2.3, grid.cellHeight / 2.3); i += settings.innerMargin) {
      const corners = {
        topLeft: movedIntersections[cornerIdx.topLeft].add(new Vector(i, i)),
        topRight: movedIntersections[cornerIdx.topRight].add(new Vector(-i, i)),
        bottomLeft: movedIntersections[cornerIdx.bottomLeft].add(new Vector(i, -i)),
        bottomRight: movedIntersections[cornerIdx.bottomRight].add(new Vector(-i, -i)),
      };

      const pathBuilder = new RoundedPathBuilder([
        corners.topLeft,
        corners.topRight,
        corners.bottomRight,
        corners.bottomLeft,
      ]);

      const pathData = pathBuilder.withClosed(true).withRounding(Math.min(grid.cellHeight, grid.cellWidth)).withRoundingConstrained(true).build();

      canvas.path(pathData).fill(color).stroke({width: 1, color: strokeColor});
    }
  });

  return drawing.svg();
}

Vormen(draw, defaultSettings)
