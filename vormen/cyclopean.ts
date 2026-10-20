import {
  almostEqual,
  constrain,
  Drawing,
  Grid,
  Point,
  Random,
  RoundedPathBuilder,
  Settings,
  type SettingsData,
  Vector,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "cyclopean",
  columns: 8,
  rows: 8,
  innerMargin: 4,
  roundingRadius: 30,
  strokeWidth: 2,
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
    const xOffset = rand.between(-cellWidth / 2, cellWidth / 2);
    const yOffset = rand.between(-cellHeight / 2, cellHeight / 2);
    const p = new Point(
      constrain(point.x + xOffset, 0, drawing.width),
      constrain(point.y + yOffset, 0, drawing.height)
    );
    return p;
  });

  grid.cells().forEach((cell) => {
    const point = { x: cell.x, y: cell.y };

    const color = settings.bw ? "none" : rand.pick(colors);
    const strokeColor = settings.bw ? "black" : rand.pick(colors.filter((c) => c !== color));

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

    for (let i = settings.innerMargin; i <= cell.width / 2; i += settings.innerMargin) {
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

      const bigEnough = [
          corners.topLeft.dist(corners.topRight),
          corners.topLeft.dist(corners.bottomLeft),
          corners.topRight.dist(corners.bottomRight),
          corners.bottomLeft.dist(corners.bottomRight),
          corners.topLeft.dist(corners.bottomRight),
          corners.topRight.dist(corners.bottomLeft),
        ].every((d) => d >= 0);

      const topologyStable = [
        corners.topLeft.x < corners.topRight.x,
        corners.topLeft.y < corners.bottomLeft.y,
        corners.topRight.y < corners.bottomRight.y,
        corners.bottomLeft.x < corners.bottomRight.x,
        ].every((b) => b);

      if (!bigEnough || !topologyStable) {
        continue;
      }

      const pathBuilder = new RoundedPathBuilder([
        corners.topLeft,
        corners.topRight,
        corners.bottomRight,
        corners.bottomLeft,
      ])
      .withClosed(true)
      .withRounding(settings.roundingRadius)
      .withRoundingConstrained(true);

      canvas.path(pathBuilder.build()).fill(color).stroke({ width: settings.strokeWidth, color: strokeColor });
    }
  });

  return drawing.svg();
}

Vormen(draw, defaultSettings);
