import { Drawing, Point, Settings, type SettingsData, Vormen } from "@berkes/vormen";
import { type Element, G, type StrokeData } from '@svgdotjs/svg.js';

const defaultSettings = {
  "angle": 30,
  "size": 100,
  "wireframe": false,
}
//
// const palette = {
//   light: '#fdfdfd',
//   lightShadow: '#b1b6c9',
//   darkShadow: '#454869',
//   lightBlue: '#00abe3',
//   darkBlue: '#013274',
// }

interface Palette {
  light: string;
  shadow: string,
  dark: string;
}

class IsoBlock {
  private _origin: Point;
  private _angle: number;
  private _size: number;

  constructor(origin: Point, angle: number, size: number) {
    this._origin = origin;
    this._angle = angle;
    this._size = size;
  }

  get origin(): Point {
    return this._origin;
  }

  get topRightFront(): Point {
    return new Point(this._origin.x + this._size + this.hd, this._origin.y + this.vd);
  }

  get bottomLeftFront(): Point {
    return new Point(this._origin.x + this.hd, this._origin.y + this._size + this.vd);
  }

  private get tan(): number {
    return Math.tan(this._angle * Math.PI / 180);
  }

  // Horizontal Depth
  private get hd(): number {
    return (this._size * this.tan) / 2.0;
  }

  // Vertical Depth
  private get vd() {
    return (this._size * this.tan * this.tan) / 2;
  }

  svg(palette: Palette, wireframe: boolean): Element {
    const hd = this.hd;
    const vd = this.vd;
    const { x, y } = this.origin;

    const g = new G().fill("none");
    let stroke: StrokeData = { color: "transparent", width: 0 };
    if (wireframe) {
      stroke  = { color: "black", width: 1 };
    }

    // Back face - only needed for debugging and wireframes
    g
      .rect()
      .x(x)
      .y(y)
      .width(this._size)
      .height(this._size)
      .stroke(stroke);


    // Right face - only needed for debugging and wireframes
    g
      .rect()
      .x(0)
      .y(0)
      .width(hd)
      .height(this._size)
      .transform({ translate: [x + this._size, y], skewY: this._angle, origin: [0, 0] })
      .stroke(stroke);

    // Botton face - only needed for debugging and wireframes
    g
      .rect()
      .x(0)
      .y(0)
      .width(this._size)
      .height(vd)
      .transform({ translate: [x, y + this._size], skewX: 90 - this._angle, origin: [0, 0] })
      .stroke(stroke);

    // Left face
    const left = g
      .rect()
      .x(0)
      .y(0)
      .width(hd)
      .height(this._size)
      .transform({ translate: [x, y], skewY: this._angle, origin: [0, 0] })
      .stroke(stroke);

    if (!wireframe) {
      left.fill(palette.dark);
    }

    // Top face
    const top = g
      .rect()
      .x(0)
      .y(0)
      .width(this._size)
      .height(vd)
      .transform({ translate: [x, y], skewX: 90 - this._angle, origin: [0, 0] })
      .stroke(stroke);
    if (!wireframe) {
      top.fill(palette.light);
    }

    // Front face
    const front = g
      .rect()
      .x(0)
      .y(0)
      .width(this._size)
      .height(this._size)
      .transform({ translate: [x + hd, y + vd], origin: [0, 0] })
      .stroke(stroke);
    if (!wireframe) {
      front.fill(palette.shadow);
    }

    return g;
  }
}

function draw(rawSettings: SettingsData): string {
  const palette: Palette = {
    light: '#eeeeee',
    shadow: '#b1b6c9',
    dark: '#454869',
  }

  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing().withSize(1000,1000).withMargin(20).withBackgroundColor('#fff');
  const canvas = drawing.build();

  let block = new IsoBlock(new Point(0, 0), settings.angle, settings.size);
  canvas.add(block.svg(palette, settings.wireframe));
  let firstInRow = block;

  for (let i = 0; i < 62; i++) {
    if (i % 7 === 0) {
      firstInRow = block;
    }

    let connection;
    if ((i + 1) % 7 === 0) {
      connection = firstInRow.bottomLeftFront
    } else {
      connection = block.topRightFront;
    }
    block = new IsoBlock(connection, settings.angle, settings.size);
    canvas.add(block.svg(palette, settings.wireframe));
  }


  return drawing.svg();
}

Vormen(draw, defaultSettings);
