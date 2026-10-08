import {
  type DrawFunction,
  Drawing,
  PathBuilder,
  Point,
  Random,
  Settings,
  Vormen,
} from "@berkes/vormen";

const settings = new Settings({
  seed: "1234567890B",
  color_bg: "black",
  color_fg: "white",
  rounding: 10,
  snap: 20,
  line_width: 1,
});

const draw: DrawFunction = (settings: Settings) => {
  const drawing = new Drawing()
    .withSize(1200, 1200)
    .withMargin(20)
    .withBackgroundColor(settings.getString("color_bg"));

  const canvas = drawing.build();

  const rand = new Random(settings.getString("seed"));
  const startingPoint = new Point(
    rand.between(0, drawing.getInnerWidth()),
    rand.between(0, drawing.getInnerHeight()),
  );
  const pathBuilder: PathBuilder = new PathBuilder([startingPoint])
    .withClosed(true)
    .withRounding(settings.getInt("rounding"))
    .withRoundingConstrained(true);

  let dir: "x" | "y" = "x";
  for (let i = 1; i < 70; i++) {
    let newPoint;

    const lastPoint = pathBuilder.get(i - 1);
    if (dir === "x") { // A horizontal line
      // A random number to move X between 0 and the width of the canvas
      const upper = drawing.getInnerWidth() - lastPoint.x;
      const lower = -lastPoint.x;
      const move =
        Math.round(rand.between(lower, upper) / settings.getInt("snap")) *
        settings.getInt("snap");
      newPoint = new Point(lastPoint.x + move, lastPoint.y);
      dir = "y";
    } else { // A vertical line
      // A random number to move Y between 0 and the height of the canvas
      const upper = drawing.getInnerHeight() - lastPoint.y;
      const lower = -lastPoint.y;
      const move =
        Math.round(rand.between(lower, upper) / settings.getInt("snap")) *
        settings.getInt("snap");
      newPoint = new Point(lastPoint.x, lastPoint.y + move);
      dir = "x";
    }

    pathBuilder.push(newPoint);
  }
  // And finally add a point that shares an X with the last point and a Y with the first, so we close the loop in a perpendicular angle
  pathBuilder.push(new Point(pathBuilder.end.x, pathBuilder.start.y));

  const rounding = settings.getInt("rounding");
  for (let i = rounding; i <= rounding + 100; i += 10) {
    const data = pathBuilder.withRounding(i).build();
    canvas.path(data).fill("none").stroke({
      color: settings.getString("color_fg"),
      width: settings.getInt("line_width"),
    });
  }

  return drawing;
};

Vormen(draw, settings);
