import {
  type DrawFunction,
  Drawing,
  Random,
  Settings,
  Vector,
  Vormen,
} from "@berkes/vormen";
import { PathArray, Text } from "@svgdotjs/svg.js";

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

  const canvas = drawing.build();
  const rand = new Random(settings.getString("seed"));

  const cx = drawing.getInnerWidth() / 2;
  const cy = drawing.getInnerHeight() / 2;

  // Draw a hundred points on a circle
  const points = [];
  const radius = drawing.getInnerWidth() / 4;
  for (let i = 0; i < 200; i++) {
    const angle = (i / 200) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(new Vector(x, y));
  }

  pairwise(points).forEach(([a, b]) => {
    const radiusAdjust = rand.between(1, 10);
    const pathOuter = new PathArray([
      "M", a.x, a.y,
      "A", radius, radius * radiusAdjust, 0, 1, 1, b.x, b.y,
    ]);
    canvas
      .path(pathOuter)
      .fill("none")
      .stroke({ color: settings.getString("support"), width: 1 });
  });

  // Close the gap
  const first = points[0];
  const last = points[points.length - 1];
  const pathOuter = new PathArray([
    "M", last.x, last.y,
    "A", radius * 3, radius * 3, 0, 1, 1, first.x, first.y,
  ]);
  canvas
    .path(pathOuter)
    .fill("none")
    .stroke({ color: settings.getString("support"), width: 1 });

  // Sun
  const sunDiameter = (radius * 2) - 90;
  canvas
    .circle(sunDiameter)
    .cx(cx)
    .cy(cy)
    .fill(settings.getString("main"))
    .stroke("none");
  // Dots around the border of the sun
  for (let i = 0; i < 100; i++) {
    const jitter = rand.between(sunDiameter / 4, (sunDiameter / 2) - 5);
    const innerX = Math.cos(i * 2 * Math.PI / 100) * (jitter - 10);
    const innerY = Math.sin(i * 2 * Math.PI / 100) * (jitter - 10);
    const outerX = Math.cos(i * 2 * Math.PI / 100) * (jitter);
    const outerY = Math.sin(i * 2 * Math.PI / 100) * (jitter);

    canvas
      .line(cx, cy, innerX + cx, innerY + cy)
      .stroke({ color: settings.getString("bg"), width: 1 })
    canvas
      .circle(2)
      .cx(outerX + cx)
      .cy(outerY + cy)
      .fill(settings.getString("accent"));
  }
  canvas
    .circle(sunDiameter / 4)
    .cx(cx)
    .cy(cy)
    .fill(settings.getString("bg"))
    .stroke("none");

  // A text across the bottom
  const textX = 30;
  const textY = drawing.getInnerHeight() - 30;
  const text = new Text()
    .text(`Drawing ${rand.seed}`)
    .font({ size: 12, family: "Ubuntu Mono", anchor: "middle", weight: "bold"})
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

  return drawing;
};

Vormen(draw, settings);

function* pairwise<T>(iterable: T[]): Generator<[T, T], void> {
  const iterator = iterable[Symbol.iterator]();
  let a = iterator.next();
  if (a.done) return;
  let b = iterator.next();
  while (!b.done) {
    yield [a.value, b.value];
    a = b;
    b = iterator.next();
  }
}
