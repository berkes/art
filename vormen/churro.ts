import {
  constrain,
  type DrawFunction,
  Drawing,
  Point,
  Random,
  Settings,
  Vector,
  Vormen,
} from "@berkes/vormen";

class BodyPart {
  public center: Point;
  public radius: number;
  public direction: Vector;

  constructor(center: Point, radius: number, direction: Vector) {
    this.center = center;
    this.radius = radius;
    this.direction = direction;
  }

  get pointA(): Point {
    return this.bodyPoints()[0];
  }

  get pointB(): Point {
    return this.bodyPoints()[1];
  }

  next(nextRadius: number, nextDirection: Vector, distance: number): BodyPart {
    const nextCenter = this.center.add(this.direction.scale(distance));
    return new BodyPart(nextCenter, nextRadius, nextDirection);
  }

  // Two points, on the circle, perpendicular to the direction
  private bodyPoints(): Point[] {
    return [
      this.center.add(this.direction.rotate(Math.PI / 2).scale(this.radius)),
      this.center.add(this.direction.rotate(-Math.PI / 2).scale(this.radius)),
    ];
  }
}

const settings = new Settings({
  seed: "123",
  line_width: 2,
  distance: 15,
  radius: 50,
  color_bg: "#800020",
  color_primary: "#F3E6D5",
  color_primary_l: "#FFF9F2",
  color_secondary: "#D45060",
});

const draw: DrawFunction = (settings: Settings) => {
  const drawing = new Drawing()
    .withA4Size()
    .withMargin(20)
    .withBackgroundColor(settings.getString("color_bg"));

  const canvas = drawing.build();

  const rand = new Random();

  const bodies = [
    new BodyPart(
      new Point(70, drawing.getInnerHeight() / 2),
      settings.getInt("radius"),
      new Vector(1, 0),
    ),
  ];

  const topConnectors = [
    bodies[0].pointA,
  ];
  const bottomConnectors = [
    bodies[0].pointB,
  ];

  for (let i = 0; i < 14; i++) {
    const previousBody = bodies[i];
    const newDirection = previousBody.direction.rotate(
      rand.betweenFloat(-Math.PI / 4, Math.PI / 4),
    );
    const nextBody = bodies[i].next(
      settings.getInt("radius"),
      newDirection,
      settings.getInt("distance"),
    );

    // Push onto canvas
    const centerX = constrain(
      nextBody.center.x,
      0 + nextBody.radius,
      drawing.getInnerWidth() - nextBody.radius,
    );
    const centerY = constrain(
      nextBody.center.y,
      0 + nextBody.radius,
      drawing.getInnerHeight() - nextBody.radius,
    );
    nextBody.center = new Point(centerX, centerY);
    bodies.push(nextBody);
    topConnectors.push(nextBody.pointA);
    bottomConnectors.push(nextBody.pointB);
  }

  let dataString = `M ${topConnectors[0].x} ${topConnectors[0].y}`;

  bodies.forEach((body) => {
    canvas.circle(body.radius * 2).center(body.center.x, body.center.y).fill(
      "none",
    ).stroke(settings.getString("color_primary"));
    const top = body.pointA;
    // controlpoint for smooth curve is tangent of the point on the circle and half a radius in opposite direction of the body
    // const controlP = top.add(body.direction.rotate(Math.PI).multiply(settings.getInt("distance")/2));
    // canvas.line(top.x, top.y, controlP.x, controlP.y).stroke("black");
    // canvas.circle(5).center(controlP.x, controlP.y).fill("red");
    // dataString += `S ${controlP.x},${controlP.y},${top.x}, ${top.y}`;
    dataString += `L ${top.x} ${top.y}`;
  });

  dataString += ` L ${bottomConnectors[bottomConnectors.length - 1].x} ${
    bottomConnectors[bottomConnectors.length - 1].y
  }`;

  bodies.reverse().forEach((body) => {
    const bottom = body.pointB;
    dataString += `L ${bottom.x} ${bottom.y}`;
  });
  dataString += " Z";
  console.log(dataString);
  canvas.path(dataString).fill("none").stroke({
    color: settings.getString("color_primary"),
    width: settings.getInt("line_width"),
  });

  return drawing;
};

Vormen(draw, settings);
