import { Drawing, Settings, type SettingsData, Vormen } from "@berkes/vormen";
import { Matrix, Rect } from "@svgdotjs/svg.js";

/**
 * A vector or point in 3D space.
 *
 * Frame used throughout:
 *   x grows to the right on screen
 *   y grows DOWN the screen (SVG convention)
 *   z points out of the screen, toward the camera
 */
class Vector3 {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly z: number,
  ) {}

  /** This vector scaled by a factor. */
  scaled(factor: number): Vector3 {
    return new Vector3(this.x * factor, this.y * factor, this.z * factor);
  }

  /** This vector plus another, componentwise. */
  add(other: Vector3): Vector3 {
    return new Vector3(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
    );
  }

  toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}

/**
 * A 3x3 matrix. Used here for rotations, but generic enough for any
 * linear map of 3D space.
 *
 * Stored row by row:
 *
 *   [ m00  m01  m02 ]
 *   [ m10  m11  m12 ]
 *   [ m20  m21  m22 ]
 *
 * A matrix maps vectors: v' = M · v. Each column of M is the image of one
 * axis: column 0 is where (1,0,0) lands, column 1 is where (0,1,0) lands,
 * column 2 is where (0,0,1) lands. That is the same "columns are the basis
 * vectors" rule as the 2D SVG matrix.
 */
class Matrix3 {
  constructor(
    private readonly rows: [
      [number, number, number],
      [number, number, number],
      [number, number, number],
    ],
  ) {}

  /**
   * Matrix product: this · other.
   *
   * Applying the product to a vector is the same as applying `other`
   * first, then `this`. So rotationZ(r).times(rotationY(a)).times(rotationX(p))
   * pitches first and rolls last.
   *
   * Each output cell is a row of `this` dotted with a column of `other`:
   *   result[r][c] = Σ_k this[r][k] * other[k][c]
   */
  times(other: Matrix3): Matrix3 {
    const a = this.rows;
    const b = other.rows;
    return new Matrix3([
      [
        a[0][0] * b[0][0] + a[0][1] * b[1][0] + a[0][2] * b[2][0],
        a[0][0] * b[0][1] + a[0][1] * b[1][1] + a[0][2] * b[2][1],
        a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2] * b[2][2],
      ],
      [
        a[1][0] * b[0][0] + a[1][1] * b[1][0] + a[1][2] * b[2][0],
        a[1][0] * b[0][1] + a[1][1] * b[1][1] + a[1][2] * b[2][1],
        a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2] * b[2][2],
      ],
      [
        a[2][0] * b[0][0] + a[2][1] * b[1][0] + a[2][2] * b[2][0],
        a[2][0] * b[0][1] + a[2][1] * b[1][1] + a[2][2] * b[2][1],
        a[2][0] * b[0][2] + a[2][1] * b[1][2] + a[2][2] * b[2][2],
      ],
    ]);
  }

  /** Apply this matrix to a vector: M · v. */
  applyTo(vector: Vector3): Vector3 {
    const m = this.rows;
    return new Vector3(
      m[0][0] * vector.x + m[0][1] * vector.y + m[0][2] * vector.z,
      m[1][0] * vector.x + m[1][1] * vector.y + m[1][2] * vector.z,
      m[2][0] * vector.x + m[2][1] * vector.y + m[2][2] * vector.z,
    );
  }

  /** Rotation around the x-axis, angle in radians. Tips y toward z. */
  static rotationX(angle: number): Matrix3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix3([[1, 0, 0], [0, c, -s], [0, s, c]]);
  }

  /**
   * Rotation around the y-axis, angle in radians. Tips z toward -x: a
   * positive angle yaws the front face toward screen left, bringing the
   * cube's right face (x=1, normal +x) toward the camera.
   */
  static rotationY(angle: number): Matrix3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix3([[c, 0, -s], [0, 1, 0], [s, 0, c]]);
  }

  /** Rotation around the z-axis, angle in radians. Tips x toward y. */
  static rotationZ(angle: number): Matrix3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix3([[c, -s, 0], [s, c, 0], [0, 0, 1]]);
  }

  /**
   * Compose pitch (x), yaw (y) and roll (z), each in radians, into one
   * matrix. Applied to a vector, yaw happens first around the world Y
   * (screen vertical), then pitch around the world X (screen horizontal),
   * then roll around the world Z (screen plane). Because yaw is around the
   * fixed vertical axis, pitch and yaw never induce a spurious roll into
   * each other. This is the one place where composition order is fixed;
   * change it here if you want a different convention.
   */
  static fromEulerAngles(pitch: number, yaw: number, roll: number): Matrix3 {
    return Matrix3.rotationZ(roll)
      .times(Matrix3.rotationX(pitch))
      .times(Matrix3.rotationY(yaw));
  }
}

/**
 * One face of the cube, in the cube's local coordinates, before any
 * rotation. The cube spans 0..1 on each axis; (0,0,0) is the anchor top
 * corner that the cube's (x, y) screen position refers to.
 *
 *   origin        local corner that maps to the square's local (0,0)
 *   edgeAlongX    3D direction of the square's horizontal edge, length 1
 *   edgeAlongY    3D direction of the square's vertical edge, length 1
 *   normal        outward unit vector, used only for visibility
 *
 * Example, the top face: origin (0,0,0), edgeAlongX (1,0,0),
 * edgeAlongY (0,0,1), normal (0,-1,0). The square's "vertical" edge is
 * the cube's z-axis: the SVG square and the 3D cube have different axes.
 */
class CubeFace {
  constructor(
    readonly name: string,
    readonly origin: Vector3,
    readonly edgeAlongX: Vector3,
    readonly edgeAlongY: Vector3,
    readonly normal: Vector3,
  ) {}

  /**
   * Project this face under a rotation, at a screen position and size.
   *
   * "Projection" here is orthographic: rotate in 3D, keep x and y, drop z.
   * The result is the six values of an SVG matrix(a,b,c,d,e,f) for a
   * 1x1 square:
   *
   *   (a,b) = rotated edgeAlongX, projected, scaled by size
   *   (c,d) = rotated edgeAlongY, projected, scaled by size
   *   (e,f) = rotated origin corner, projected, scaled, plus cube position
   */
  project(rotation: Matrix3, size: number): ProjectedFace {
    const edgeX = rotation.applyTo(this.edgeAlongX);
    const edgeY = rotation.applyTo(this.edgeAlongY);
    const origin = rotation.applyTo(this.origin);
    const rotatedNormal = rotation.applyTo(this.normal);

    return {
      name: this.name,
      // The normal faces the camera when its z component is positive.
      visible: rotatedNormal.z > 0,
      // SVG y grows downward; screen y is the 3D y as-is.
      matrix: new Matrix({
        a: edgeX.x * size,
        b: edgeX.y * size,
        c: edgeY.x * size,
        d: edgeY.y * size,
        e: origin.x * size,
        f: origin.y * size,
      }),
    };
  }
}

/** A cube face after projection: what the SVG layer needs. */
type ProjectedFace = {
  name: string;
  visible: boolean;
  matrix: Matrix;
};

/**
 * A unit cube in local coordinates, one square per face.
 */
class Cube {
  /** All six faces, named by their outward direction. */
  static readonly FACES: CubeFace[] = [
    new CubeFace(
      "top",
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, -1, 0),
    ),
    new CubeFace(
      "right",
      new Vector3(1, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 1, 0),
      new Vector3(1, 0, 0),
    ),
    new CubeFace(
      "front",
      new Vector3(0, 0, 1),
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 1),
    ),
    new CubeFace(
      "left",
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 1, 0),
      new Vector3(-1, 0, 0),
    ),
    new CubeFace(
      "back",
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, -1),
    ),
    new CubeFace(
      "bottom",
      new Vector3(0, 1, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 1, 0),
    ),
  ];

  private readonly rotation: Matrix3;

  constructor(
    /** Orientation, composed once per cube (or shared per orientation). */
    private readonly angleX: number,
    private readonly angleY: number,
    private readonly angleZ: number,
  ) {
    this.rotation = Matrix3.fromEulerAngles(
      degrees(angleX),
      degrees(angleY),
      degrees(angleZ),
    );
  }

  /** Every face, each with its SVG transform and visibility. */
  faces(size: number): ProjectedFace[] {
    return Cube.FACES.map((face) => face.project(this.rotation, size));
  }

  /** Only the faces the camera sees, in draw order. */
  visibleFaces(size: number): ProjectedFace[] {
    return this.faces(size).filter((face) => face.visible);
  }

  /**
   * Project a point in the cube's local coordinates (0..1 per axis) to
   * screen space: rotate, drop z, scale by size. The result is relative
   * to the cube's anchor corner, i.e. what the group translate adds to.
   */
  projectPoint(point: Vector3, size: number): { x: number; y: number } {
    const p = this.rotation.applyTo(point);
    return { x: p.x * size, y: p.y * size };
  }

  /**
   * Screen-space offset that moves local point `from` onto local point
   * `to` under this cube's rotation. For a second cube with the same
   * angles, translating its group by this offset makes its `from` point
   * land exactly on the first cube's `to` point: orthographic projection
   * commutes with translation, so the dropped z only affects depth, not
   * screen position.
   *
   * Example, stairs: offsetBetween(new Vector3(0,0,0), new Vector3(1,1,0))
   * puts the next cube's top-left edge on the previous cube's
   * bottom-right edge.
   */
  offsetBetween(
    from: Vector3,
    to: Vector3,
    size: number,
  ): { x: number; y: number } {
    const a = this.rotation.applyTo(from);
    const b = this.rotation.applyTo(to);
    return { x: (b.x - a.x) * size, y: (b.y - a.y) * size };
  }

  /**
   * The four projected corners of a named face, in order: origin,
   * origin+edgeAlongX, origin+edgeAlongY, origin+edgeAlongX+edgeAlongY.
   * Unlike the face's SVG matrix this is a plain list of screen points,
   * handy for picking attachment edges visually.
   */
  faceCorners(name: string, size: number): { x: number; y: number }[] {
    const face = Cube.FACES.find((f) => f.name === name);
    if (!face) throw new Error(`unknown face: ${name}`);
    const { origin, edgeAlongX, edgeAlongY } = face;
    return [
      this.projectPoint(origin, size),
      this.projectPoint(origin.add(edgeAlongX), size),
      this.projectPoint(origin.add(edgeAlongY), size),
      this.projectPoint(origin.add(edgeAlongX).add(edgeAlongY), size),
    ];
  }
}

const degrees = (d: number) => (d * Math.PI) / 180;

const defaultSettings = {
  "angleX": -30,
  "angleY": 30,
  "angleZ": 0,
  "size": 100,
  "wireframe": false,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing().withSize(1000, 1000).withMargin(20)
    .withBackgroundColor("#fff");

  const rect = new Rect().width(1).height(1).id("face").attr(
    "vector-effect",
    "non-scaling-stroke",
  ).opacity(1.0);
  const drawingWithDefs = drawing.withDefs([rect]);

  const canvas = drawingWithDefs.build();

  const cube = new Cube(settings.angleX, settings.angleY, settings.angleZ);

  // Stairs: each next cube's top-left edge (local x=0, y=0) sits exactly on
  // the previous cube's bottom-right edge (local x=1, y=1). The step is the
  // screen-space projection of the local offset (1,1,0); the z component of
  // the edges cancels because both edges run along z.
  const step = cube.offsetBetween(
    new Vector3(0, 0, 0),
    new Vector3(1, 1, 0),
    settings.size,
  );

  for (let i = 0; i < 3; i++) {
    const cubeG = canvas.group().transform({
      translate: [200 + i * step.x, 200 + i * step.y],
    });
    cube.visibleFaces(settings.size).forEach((face) => {
      const use = cubeG.use("face").transform(face.matrix);
      use.stroke({ color: "black", width: 1 });
      switch (face.name) {
        case "top":
          use.fill("red");
          break;
        case "left":
          use.fill("yellow");
          break;
        case "front":
          use.fill("blue");
          break;
        case "right":
          use.fill("orange");
          break;
        case "back":
          use.fill("purple");
          break;
        case "bottom":
          use.fill("green");
          break;
      }
    });
  }

  return drawing.svg();
}

Vormen(draw, defaultSettings);
