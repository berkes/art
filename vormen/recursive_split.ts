import {
  type DrawFunction,
  Drawing,
  Random,
  Settings,
  Vormen,
} from "@berkes/vormen";
import { G, type Rect, Text } from "@svgdotjs/svg.js";
import { config } from "svgdom";

const settings = new Settings({
  bg: "rgb(69, 6, 147)",
  main: "rgb(140, 0, 255)",
  support: "rgb(255, 63, 127)",
  accent: "rgb(255, 196, 0)",
  maxDepth: 16,
  strokeWidth: 0.5,
});

config
  .setFontDir("./")
  .setFontFamilyMappings({
    Mono: "CutiveMono-Regular.ttf",
  })
  .preloadFonts();

const draw: DrawFunction = (settings: Settings): Drawing => {
  function split(rect: Rect, g: G, depth: number) {
    console.log(depth);
    if (depth <= 0) return;
    const height = Math.abs(Number(rect.height()));
    const width = Math.abs(Number(rect.width()));
    if (Math.min(width, height) < settings.getInt("strokeWidth") * 3) return;

    // split across the shorter axis
    const direction = height > width ? "horizontal" : "vertical";
    // const direction = rand.chance(0.5) ? "horizontal" : "vertical";

    // take a random point between 20% and 80% of the length of the axis
    const min = direction === "horizontal" ? height * 0.2 : width * 0.2;
    const max = direction === "horizontal" ? height * 0.6 : width * 0.7;

    const offset = rand.between(min, max);

    const x: number = Number(rect.x());
    const y: number = Number(rect.y());

    const newHeight = direction === "horizontal" ? height - offset : height;
    const newWidth = direction === "horizontal" ? width : width - offset;

    const newRect = g.rect()
      .x(x)
      .y(y)
      .width(newWidth)
      .height(newHeight)
      .fill(settings.getString("support"))
      .opacity(4 / depth)
      .stroke({
        color: settings.getString("accent"),
        width: settings.getInt("strokeWidth"),
      });

    split(newRect, g, depth - 1);
  }

  const drawing = new Drawing()
    .withSize(1800, 1800)
    // .withA4Size()
    .withMargin(40)
    .withBackgroundColor(settings.getString("bg"));

  const canvas = drawing.build();
  const rand = new Random(settings.getString("seed"));

  const gs = [];
  for (let i = 0; i < 4; i++) {
    const g = new G().id(`rect-${i}`);
    const rect = g.rect(
      drawing.getInnerWidth() / 2,
      drawing.getInnerHeight() / 2,
    )
      .x(drawing.getInnerWidth() / 2)
      .y(drawing.getInnerHeight() / 2)
      .fill(settings.getString("main"))
      .stroke({
        color: settings.getString("main"),
        width: settings.getInt("strokeWidth"),
      });

    split(rect, g, settings.getInt("maxDepth"));
    gs.push(g);
  }

  canvas.add(
    gs[0].clone().x(0).y(0).transform({
      scale: [-1, -1],
      origin: "center",
    }),
  );
  canvas.add(
    gs[1].clone().x(drawing.getInnerWidth() / 2).y(0).transform({
      scale: [1, -1],
      origin: "center",
    }),
  );
  canvas.add(
    gs[2].clone().x(0).y(drawing.getInnerHeight() / 2).transform({
      scale: [-1, 1],
      origin: "center",
    }),
  );
  canvas.add(
    gs[3].clone().x(drawing.getInnerWidth() / 2).y(drawing.getInnerHeight() / 2)
      .transform({
        scale: [1, 1],
        origin: "center",
      }),
  );

  // A text across the bottom
  const textX = 30;
  const textY = drawing.getInnerHeight() - 30;
  const text = new Text()
    .text(`Drawing ${rand.seed}`)
    .font({ size: 12, family: "Mono", anchor: "middle" })
    .fill(settings.getString("accent"))
    .x(textX)
    .y(textY);

  console.log(text.bbox(), text.length());

  canvas
    .rect(text.bbox().width + 12, text.bbox().height + 6)
    .fill(settings.getString("bg"))
    .stroke("none")
    .radius(4)
    .x(textX - 6)
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
