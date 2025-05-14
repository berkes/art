const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Quadtree = require('@timohausmann/quadtree-js');

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  // Calculate distance between this vector and another
  distance(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Returns a new Vector that is the normalized (unit) version of this vector
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector(0, 0);
    }
    return this.divide(mag);
  }

  drawArrow(context, otherVector) {
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(this.x, this.y);
    context.lineTo(otherVector.x, otherVector.y);

    // arrowhead
    const angle = Math.atan2(otherVector.y - this.y, otherVector.x - this.x);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;
    context.moveTo(otherVector.x, otherVector.y);
    context.lineTo(
      otherVector.x - arrowLength * Math.cos(angle - arrowAngle),
      otherVector.y - arrowLength * Math.sin(angle - arrowAngle),
    );
    context.lineTo(
      otherVector.x - arrowLength * Math.cos(angle + arrowAngle),
      otherVector.y - arrowLength * Math.sin(angle + arrowAngle),
    );
    context.lineTo(otherVector.x, otherVector.y);
    context.fillStyle = 'black';
    context.fill();
    context.stroke();
  }
}

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const params = {
  pondRadius: (settings.dimensions[0] / 2) - (settings.dimensions[0] * 0.1),
  pondCenter: new Vector(
    settings.dimensions[0] / 2,
    settings.dimensions[1] / 2,
  ),
  leafSize: [2, 4],
  frogSize: [10, 20],
  nFrogs: 12,
  nLeaves: 8000,

  continueAfterGoal: false,
  distributionType: 'opposite', // 'random', 'singleOrigin', 'web',  'opposite'

  backgroundColor: 'hsl(255, 100%, 100%)',
  leafColor: 'hsl(91, 80%, 35%)',
  frogColor: 'hsl(255, 100%, 100%)',

  debug: false,
}

const sketch = () => {
  const pond = new Pond(params.pondRadius, params.pondCenter);
  pond.fill(params.nLeaves);

  switch (params.distributionType) {
    case 'random':
      pond.addRandomFrogs(params.nFrogs);
      break;

    case 'singleOrigin':
      pond.addSingleOriginFrogs(params.nFrogs);
      break;

    case 'web':
      pond.addWebFrogs(params.nFrogs);
      break;

    case 'opposite':
      pond.addOppositeFrogs(params.nFrogs);

    default:
  }

  return ({ context, width, height }) => {
    context.fillStyle = params.backgroundColor;
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1;
    context.strokeStyle = 'black';
 
    pond.update(context);
    pond.draw(context);
  };
};

canvasSketch(sketch, settings);


class Pond {
  constructor(radius, center) {
    this.radius = radius;
    this.center = center;
    this.leaves = [];
    this.frogs = [];
    
    this.quadtree = new Quadtree({
      x: center.x - radius,
      y: center.y - radius,
      width: this.radius * 2,
      height: this.radius * 2,
    });
  }

  draw(context) {
    this.leaves.forEach(leaf => {
      leaf.draw(context);
    });
    this.frogs.forEach(frog => {
      frog.draw(context);
    });
  }

  update(context) {
    this.quadtree.clear();

    this.leaves.forEach(leaf => {
      this.quadtree.insert({
        x: leaf.position.x,
        y: leaf.position.y,
        width: leaf.size,
        height: leaf.size,
        leaf: leaf,
      });
    });

    this.frogs.filter(frog => frog.goalReached).forEach(frog => {
      if (!params.continueAfterGoal) return;

      // Give a new random goal
      const goal = this.randomEdgePoint();
      frog.goal = goal;
      frog.goalReached = false;
    });

    this.frogs.forEach(frog => {
      const nearbyLeaves = this.quadtree.retrieve({
        x: frog.position.x - frog.size,
        y: frog.position.y - frog.size,
        width: frog.size * 2,
        height: frog.size * 2,
      }).map(item => item.leaf);

      frog.update(nearbyLeaves, context);
    });

    this.leaves.forEach(leaf => {
      const neabyLeaves = this.quadtree.retrieve({
        x: leaf.position.x - leaf.size,
        y: leaf.position.y - leaf.size,
        width: leaf.size * 2,
        height: leaf.size * 2,
      }).map(item => item.leaf);

      leaf.update(neabyLeaves);
    });
  }

  fill(nLeaves) {
    for (let i = 0; i < nLeaves; i++) {
      const size = random.range(params.leafSize[0], params.leafSize[1]);
      const angle = random.range(0, Math.PI * 2);
      const distance = Math.sqrt(Math.random()) * (this.radius - size);

      const x = this.center.x + distance * Math.cos(angle);
      const y = this.center.y + distance * Math.sin(angle);

      this.leaves.push(new Leaf(new Vector(x, y), size));
    }
  }

  addRandomFrogs(nFrogs) {
    for (let i = 0; i < nFrogs; i++) {
      const start = this.randomEdgePoint();
      const end = this.randomEdgePoint();
      const frogSize = random.range(params.frogSize[0], params.frogSize[1]);
      const frog = new Frog(start, end, frogSize);
      this.frogs.push(frog);
    }
  }

  addSingleOriginFrogs(nFrogs) {
    // Bottom of the circle
    const start = new Vector(this.center.x, this.center.y + this.radius);
    for (let i = 0; i < nFrogs; i++) {
      const end = this.randomEdgePoint([2, 3]);
      const frogSize = random.range(params.frogSize[0], params.frogSize[1]);
      const frog = new Frog(start, end, frogSize);
      this.frogs.push(frog);
    }
  }

  addWebFrogs(nFrogs) {
    const angle = Math.PI * 2 / nFrogs;
    // Pick nFrogs points on the edge of the pond evenly distributed
    let points = [];
    for (let i = 0; i < nFrogs; i++) {
      const x = this.center.x + this.radius * Math.cos(angle * i);
      const y = this.center.y + this.radius * Math.sin(angle * i);
      points.push(new Vector(x, y));
    }
    console.debug(`points`, points);

    // Then add a frog for each line from each point to each other point
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const frogSize = random.range(params.frogSize[0], params.frogSize[1]);
        const frog = new Frog(points[i], points[j], frogSize);
        this.frogs.push(frog);
      }
    }
  }

  addOppositeFrogs(nFrogs) {
    // Pick nFrogs at the bottom half of the pond
    const angle = Math.PI / (nFrogs + 1);
    let starts = [];
    for (let i = 0; i < nFrogs; i++) {
      const pti = angle * (i + 1);
      const x = this.center.x + this.radius * Math.cos(pti);
      const y = this.center.y + this.radius * Math.sin(pti);
      starts.push(new Vector(x, y));
    }

    starts.forEach(start => {
      // Pick a point on the mirrored side of the pond, so same X, but inverted Y
      const end = new Vector(start.x, this.center.y - (start.y - this.center.y));
      console.log(`start`, start);
      console.log(`end`, end);

      const frogSize = random.range(params.frogSize[0], params.frogSize[1]);
      const frog = new Frog(start, end, frogSize);
      this.frogs.push(frog);
    });
  }

  randomEdgePoint(quadrants = [0, 1, 2, 3]) {
    const HALF_PI = Math.PI / 2;

    // Pick a random quadrant
    const quadrant = random.pick(quadrants);
    const angle = random.range(HALF_PI * quadrant, HALF_PI * (quadrant + 1));

    const x = this.center.x + this.radius * Math.cos(angle);
    const y = this.center.y + this.radius * Math.sin(angle);
    return new Vector(x, y);
  }
}

class Leaf {
  constructor(position, size) {
    this.position = position;
    this.size = size;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    context.fillStyle = params.leafColor;
    context.fill();
  }

  update(otherLeaves) {
    // Wants to move away from other leaves
    const force = new Vector(0, 0);
    otherLeaves.forEach(otherLeaf => {
      if (otherLeaf === this) return;

      const distance = this.position.subtract(otherLeaf.position).magnitude();
      if (distance < this.size + otherLeaf.size) {
        const direction = this.position.subtract(otherLeaf.position).divide(distance);
        force.add(direction);

        // Move away from the other leaf
        this.position = this.position.add(direction.multiply(0.8));
      }
    });
  }

  intersects(point, size) {
    const distance = this.position.distance(point);
    return distance < this.size + size;
  }
}

class Frog {
  constructor(position, goal, size) {
    this.position = position;
    this.goal = goal;
    this.size = size;

    this.goalReached = false;
    this.speed = 2;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    context.fillStyle = params.frogColor;
    context.fill();

    if (params.debug) {
      context.fillStyle = 'black';
      context.beginPath();
      context.arc(this.goal.x, this.goal.y, 5, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      this.position.drawArrow(context, this.goal);
      context.stroke();
    }
  }

  update(otherLeaves, context) {
    let intendedDirection = this.goal.subtract(this.position);
    if (intendedDirection.magnitude() < 1.1) {
      this.goalReached = true;

      return;
    }
    intendedDirection = intendedDirection.normalize();

    // Sample three points in front of the frog and check for leaves around this point
    const offset = this.size * 2;
    const left = this.position.add(intendedDirection.multiply(offset).rotate(-Math.PI / 6));
    const right = this.position.add(intendedDirection.multiply(offset).rotate(Math.PI / 6));
    const forward = this.position.add(intendedDirection.multiply(offset));
    const points = [left, right, forward];

    if (params.debug) {
      const fillColors = ['red', 'blue', 'yellow'];
      points.forEach((point, i) => {
        context.fillStyle = fillColors[i];
        context.beginPath();
        context.arc(point.x, point.y, this.size, 0, Math.PI * 2);
        context.fill();
      });
    }

    const leavesAtPoints = points.map(point => {
      return otherLeaves.filter(leaf => {
        return leaf.intersects(point, this.size);
      }).length;
    });

    // if all three are equal, left and forward or right and forward are equal, pick forward.
    // If left and right are equal, pick a random left or right
    const minLeaves = Math.min(...leavesAtPoints);
    const maxLeaves = Math.max(...leavesAtPoints);
    let index;

    if (minLeaves === maxLeaves) { // All three are equal
      index = 2; // pick forward
    }
    else if (leavesAtPoints[1] === leavesAtPoints[2] || leavesAtPoints[0] === leavesAtPoints[2]) { // left and forward or right and forward are equal
      index = 2; // pick forward
    }
    else if (leavesAtPoints[0] === leavesAtPoints[1]) { // left and right are equal
      index = random.rangeFloor(0, 2); // pick a random left or right
    }
    else {
      index = leavesAtPoints.indexOf(minLeaves);
    }

    const direction = points[index].subtract(this.position).normalize();

    const movement = direction.multiply(this.speed);

    this.position = this.position.add(movement);

    otherLeaves.forEach(leaf => {
      const distance = this.position.distance(leaf.position);
      if (distance < this.size + leaf.size) {
        const direction = leaf.position.subtract(this.position).normalize();
        leaf.position = leaf.position.add(direction.multiply(this.speed));
      }
    });
  } 
}
