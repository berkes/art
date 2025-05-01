const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

const N_AGENTS = 40;

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const sketch = ({ context, width, height }) => {
  const agents = [];

  for (let i = 0; i < N_AGENTS; i++) {
    const x = random.range(0, width);
    const y = random.range(0, height);
    agents.push(new Agent(x, y));
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      for (let j = i + 1; j < agents.length; j++) {
        const otherAgent = agents[j];
        const dist = agent.pos.distance(otherAgent.pos);

        if (dist > 200) continue;

        context.strokeStyle = 'black';
        context.lineWidth = math.mapRange(dist, 0, 200, 12, 1);
        context.beginPath();
        context.moveTo(agents[i].pos.x, agents[i].pos.y);
        context.lineTo(agents[j].pos.x, agents[j].pos.y);
        context.stroke();
      }
    }

    agents.forEach(agent => {
      agent.update();
      agent.draw(context);
      // agent.bounce(width, height);
      agent.wrap(width, height);
    });

  };
};

canvasSketch(sketch, settings);

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  distance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

}

class Agent {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.radius = 10;
  }

  draw(context) {
    context.fillStyle = 'black';
    context.beginPath();
    context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }

  update() {
    this.pos.add(this.vel);
  }

  bounce(width, height) {
    if (this.pos.x < 0 + this.radius || this.pos.x > width - this.radius) {
      this.vel.x *= -1;
    }
    if (this.pos.y < 0 + this.radius || this.pos.y > height - this.radius) {
      this.vel.y *= -1;
    }
  }

  wrap(width, height) {
    if (this.pos.x < 0 - this.radius) {
      this.pos.x = width + this.radius;
    }
    if (this.pos.x > width + this.radius) {
      this.pos.x = 0 - this.radius;
    }
    if (this.pos.y < 0 - this.radius) {
      this.pos.y = height + this.radius;
    }
    if (this.pos.y > height + this.radius) {
      this.pos.y = 0 - this.radius;
    }
  }
}
