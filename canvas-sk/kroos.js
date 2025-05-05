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
  dimensions: [2048, 2048],
  animate: true,
};

const params = {
  pondRadius: settings.dimensions[0] / 2,
  pondCenter: new Vector(
    settings.dimensions[0] / 2,
    settings.dimensions[1] / 2,
  ),
  leafSize: [4, 10],
  frogSize: [10, 20],
  nFrogs: 10,
  nLeaves: 8000,
  leafColor: 'hsl(91, 80%, 35%)',
  frogColor: 'hsl(79, 28%, 61%)',
}

const sketch = () => {
  const pond = new Pond(params.pondRadius, params.pondCenter);
  pond.fill(params.nLeaves);
  pond.addFrogs(params.nFrogs);

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1;
    context.strokeStyle = 'black';
 
    pond.update();
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

  update() {
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

    this.frogs.forEach(frog => {
      const nearbyLeaves = this.quadtree.retrieve({
        x: frog.position.x - frog.size,
        y: frog.position.y - frog.size,
        width: frog.size * 2,
        height: frog.size * 2,
      }).map(item => item.leaf);

      frog.update(nearbyLeaves);
    });
    this.leaves.forEach(leaf => {
      const searchArea = {
        x: leaf.position.x - leaf.size,
        y: leaf.position.y - leaf.size,
        width: leaf.size * 2,
        height: leaf.size * 2,
      };
      const nearbyLeaves = this.quadtree.retrieve(searchArea);
      const otherLeaves = nearbyLeaves.map(item => item.leaf);
      leaf.update(otherLeaves);
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

  addFrogs(nFrogs) {
    for (let i = 0; i < nFrogs; i++) {
      const start = this.randomEdgePoint();
      const end = this.randomEdgePoint();
      const frogSize = random.range(params.frogSize[0], params.frogSize[1]);
      const frog = new Frog(start, end, frogSize);
      this.frogs.push(frog);
    }
  }

  randomEdgePoint() {
    const angle = Math.random() * Math.PI * 2;
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
}

class Frog {
  constructor(position, goal, size) {
    this.position = position;
    this.goal = goal;
    this.size = size;

    this.speed = 2;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    context.fillStyle = params.frogColor;
    context.fill();
  }

  update(otherLeaves) {
    const direction = this.goal.subtract(this.position).normalize();
    const distanceToGoal = this.position.distance(this.goal);
    const stepSize = Math.min(this.speed, distanceToGoal);
    const movement = direction.multiply(stepSize);

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
