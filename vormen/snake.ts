import {
  type DrawFunction,
  Drawing,
  Point,
  Random,
  RoundedPathBuilder,
  Settings,
  type SettingsData,
  StandardSize,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "198400042",
  // color_bg: "black",
  color_fg: "black",
  rounding: 9,
  snap: 12,
  line_width: 1,
};

const draw: DrawFunction = (rawSettings: SettingsData): string => {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withStandardSize(StandardSize.Postcard)
    .withMargin(12);

  const canvas = drawing.build();

  const rand = new Random(settings.seed);
  const startingPoint = new Point(
    rand.between(0, drawing.width),
    rand.between(0, drawing.height),
  );
  let pathBuilder: RoundedPathBuilder = new RoundedPathBuilder([
    startingPoint,
  ])
    .withClosed(true)
    .withRounding(settings.rounding)
    .withRoundingConstrained(true);

  let dir: "x" | "y" = "x";
  for (let i = 1; i < 40; i++) {
    let newPoint;

    const lastPoint = pathBuilder.get(i - 1);
    if (dir === "x") { // A horizontal line
      // A random number to move X between 0 and the width of the canvas
      const upper = drawing.width - lastPoint.x;
      const lower = -lastPoint.x;
      const move = Math.round(rand.between(lower, upper) / settings.snap) *
        settings.snap;
      newPoint = new Point(lastPoint.x + move, lastPoint.y);
      dir = "y";
    } else { // A vertical line
      // A random number to move Y between 0 and the height of the canvas
      const upper = drawing.height - lastPoint.y;
      const lower = -lastPoint.y;
      const move = Math.round(rand.between(lower, upper) / settings.snap) *
        settings.snap;
      newPoint = new Point(lastPoint.x, lastPoint.y + move);
      dir = "x";
    }

    pathBuilder = pathBuilder.push(newPoint);
  }
  // And finally add a point that shares an X with the last point and a Y with the first, so we close the loop in a perpendicular angle
  pathBuilder = pathBuilder.push(
    new Point(pathBuilder.end.x, pathBuilder.start.y),
  );

  const rounding = settings.rounding;
  for (let i = rounding; i <= rounding + 100; i += 10) {
    const data = pathBuilder.withRounding(i).build();
    canvas.path(data).fill("none").stroke({
      color: settings.color_fg,
      width: settings.line_width,
    });
  }

  const text = canvas
    .text(`Snake ${rand.seed}`)
    .font({
      family: "Doto",
      variant: "Medium",
      size: 12,
      anchor: "end",
    })
    .fill("black")
    .ax(drawing.width.toString())
    .ay(drawing.height.toString());
  canvas.add(text);

  return drawing.svg();
};

Vormen(draw, defaultSettings);
