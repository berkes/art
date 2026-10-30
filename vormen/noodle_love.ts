/**
 * Noodle Love.
 *
 * A grid of round and cross tiles, rotated randomly, with a heart in the
 * center.
 */
import {
  Drawing,
  Grid,
  Random,
  readSvg,
  Settings,
  type SettingsData,
  StandardSize,
  Vormen,
} from "@berkes/vormen";
import { config } from "svgdom";

const defaultSettings = {
  seed: "noodle-love",
  columns: 20,
  rows: 25,
};

config
  .setFontDir("./assets")
  .setFontFamilyMappings({
    "Doto-Medium": "Doto-Medium.ttf",
  })
  .preloadFonts();

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withStandardSize(StandardSize.A4)
    .withMargin(20)
    .withBackgroundColor("#fff");

  const canvas = drawing.build();

  const grid = new Grid()
    .withSize(drawing.width, drawing.height)
    .withCols(settings.columns)
    .withRows(settings.rows)
    .withSquareCells();

  const rand = new Random(settings.seed);
  const tileNames = ["tile_round", "tile_cross"];
  const tiles = tileNames.map((tileName) => {
    const tile = readSvg(`assets/${tileName}.svg`);
    tile.id(tileName);
    return tile;
  });

  const centerTile = readSvg("assets/heart.svg");
  centerTile.id("center-tile");
  canvas.defs().add(centerTile);

  tiles.forEach((tile) => {
    canvas.defs().add(tile);
  });

  grid.cells().forEach((cell) => {
    const tile = canvas.use(tileNames[rand.between(0, tileNames.length - 1)]);
    tile.x(cell.x).y(cell.y).width(cell.width).height(cell.height);
    tile.rotate(rand.between(0, 3) * 90, cell.centerX, cell.centerY);
  });

  // Our center tile is 3 x 2 cells we add our center over the grid at this position
  const centerCell = grid.pickCell(
    Math.floor(settings.columns / 2) - 2,
    Math.floor(settings.rows / 2) - 1,
  )!;
  const centerTileX = centerCell.x;
  const centerTileY = centerCell.y;
  const centerTileWidth = centerCell.width * 3;
  const centerTileHeight = centerCell.height * 2;

  canvas.rect(centerTileWidth, centerTileHeight).x(centerTileX).y(centerTileY)
    .fill("#ffffff");

  canvas.use("center-tile").x(centerTileX).y(centerTileY).width(
    centerTileWidth,
  ).height(
    centerTileHeight,
  );

  const text = canvas
    .text(`Noodle ${rand.seed}`)
    .font({
      family: "Doto",
      variant: "Medium",
      size: 12,
      anchor: "end",
    })
    .fill("black")
    .ax(drawing.width.toString())
    .ay(drawing.height.toString());

  const bbox = text.bbox();
  canvas.rect(bbox.width, bbox.height)
    .x(bbox.x)
    .y(bbox.y)
    .fill("black")
    .radius(4);
  canvas.add(text);

  return drawing.svg();
}

Vormen(draw, defaultSettings);
